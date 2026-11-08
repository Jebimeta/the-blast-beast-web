import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type {
  AdminArticleStatus,
  AdminArticleSummary,
} from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';
import { formatShortDate } from '../../../core/format';

const STATUS_LABELS: Record<AdminArticleStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
};

const STATUS_CLASSES: Record<AdminArticleStatus, string> = {
  draft: 'border-line bg-surface-2 text-muted',
  published: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  archived: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

@Component({
  selector: 'app-admin-articles-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin-articles-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminArticlesPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly status = signal<AdminArticleStatus | ''>('');
  protected readonly articles = signal<AdminArticleSummary[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly page = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly totalElements = signal(0);

  protected readonly hasPrev = computed(() => this.page() > 0);
  protected readonly hasNext = computed(() => this.page() + 1 < this.totalPages());

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page.set(0);
        this.load();
      });
  }

  ngOnInit(): void {
    this.load();
  }

  protected changeStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as AdminArticleStatus | '');
    this.page.set(0);
    this.load();
  }

  protected go(page: number): void {
    if (page < 0 || (this.totalPages() > 0 && page >= this.totalPages())) {
      return;
    }
    this.page.set(page);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .listArticles({
        page: this.page(),
        size: 20,
        status: this.status() || undefined,
        q: this.search.value.trim() || undefined,
      })
      .subscribe({
        next: (result) => {
          this.articles.set(result.content);
          this.totalPages.set(result.totalPages);
          this.totalElements.set(result.totalElements);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.error.set(
            problemMessage(error, 'No se pudieron cargar los artículos'),
          );
        },
      });
  }

  protected publish(article: AdminArticleSummary): void {
    this.runAction(
      article,
      this.api.publishArticle(article.id),
      'Artículo publicado',
    );
  }

  protected unpublish(article: AdminArticleSummary): void {
    this.runAction(
      article,
      this.api.unpublishArticle(article.id),
      'Artículo devuelto a borrador',
    );
  }

  protected archive(article: AdminArticleSummary): void {
    this.runAction(article, this.api.archiveArticle(article.id), 'Artículo archivado');
  }

  protected remove(article: AdminArticleSummary): void {
    if (!confirm(`¿Eliminar «${article.title}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    this.runAction(article, this.api.deleteArticle(article.id), 'Artículo eliminado');
  }

  protected statusLabel(status: AdminArticleStatus): string {
    return STATUS_LABELS[status];
  }

  protected statusClass(status: AdminArticleStatus): string {
    return STATUS_CLASSES[status];
  }

  protected date(value: string | null | undefined): string {
    return formatShortDate(value);
  }

  /** Miniatura para el listado: usa la variante `thumb` si existe. */
  protected coverThumb(article: AdminArticleSummary): string | null {
    const cover = article.cover;
    if (!cover) {
      return null;
    }
    return cover.variants?.find((variant) => variant.kind === 'thumb')?.url ?? cover.url;
  }

  private runAction(
    article: AdminArticleSummary,
    action: Observable<unknown>,
    successMessage: string,
  ): void {
    if (this.busyId() !== null) {
      return;
    }
    this.busyId.set(article.id);
    this.error.set(null);
    this.notice.set(null);
    action.subscribe({
      next: () => {
        this.busyId.set(null);
        this.notice.set(successMessage);
        this.load();
      },
      error: (error: unknown) => {
        this.busyId.set(null);
        this.error.set(problemMessage(error, 'La operación no se pudo completar'));
      },
    });
  }
}
