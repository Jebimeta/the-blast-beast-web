import { DOCUMENT } from '@angular/common';
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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, debounceTime, distinctUntilChanged, forkJoin, of, switchMap } from 'rxjs';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type {
  AdminArticleDetail,
  AdminArticleStatus,
  ArticleRevision,
  ArticleWriteRequest,
  BandResponse,
  CategoryAdmin,
  MediaAsset,
  SocialSummaryPlatform,
  SocialSummarySource,
  TagResponse,
} from '../../../core/api/admin.models';
import { problemMessage } from '../../../core/api/problem';

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

interface SocialPlatformConfig {
  key: SocialSummaryPlatform;
  label: string;
  limit: number;
}

const SOCIAL_PLATFORMS: readonly SocialPlatformConfig[] = [
  { key: 'x', label: 'X', limit: 280 },
  { key: 'facebook', label: 'Facebook', limit: 600 },
  { key: 'instagram', label: 'Instagram', limit: 800 },
  { key: 'whatsapp', label: 'WhatsApp', limit: 400 },
];

const EMPTY_SOCIAL_TEXTS: Record<SocialSummaryPlatform, string> = {
  x: '',
  facebook: '',
  instagram: '',
  whatsapp: '',
};

@Component({
  selector: 'app-article-editor-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './article-editor-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleEditorPage implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  protected readonly articleId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly publishing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly preview = signal('');
  protected readonly previewLoading = signal(false);
  protected readonly revisions = signal<ArticleRevision[]>([]);
  protected readonly revisionsLoading = signal(false);
  protected readonly showRevisions = signal(false);
  protected readonly categories = signal<CategoryAdmin[]>([]);
  protected readonly bands = signal<BandResponse[]>([]);
  protected readonly tags = signal<TagResponse[]>([]);
  protected readonly media = signal<MediaAsset[]>([]);
  protected readonly status = signal<AdminArticleStatus>('draft');
  protected readonly slug = signal('');
  protected readonly publicSlug = signal('');
  protected readonly lastSavedAt = signal<Date | null>(null);
  protected readonly dirty = signal(false);
  protected readonly socialSource = signal<SocialSummarySource | null>(null);
  protected readonly socialTexts = signal<Record<SocialSummaryPlatform, string>>({
    ...EMPTY_SOCIAL_TEXTS,
  });
  protected readonly socialLoading = signal(false);
  protected readonly socialError = signal<string | null>(null);
  protected readonly copiedPlatform = signal<SocialSummaryPlatform | null>(null);
  protected readonly socialPlatforms = SOCIAL_PLATFORMS;

  private suppressDirty = false;

  protected readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    slug: ['', [Validators.maxLength(160)]],
    excerpt: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    bodyMd: ['', [Validators.required, Validators.minLength(10)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
    bandIds: [[] as number[]],
    tagIds: [[] as number[]],
    coverMediaId: this.formBuilder.control<number | null>(null),
    seoTitle: ['', [Validators.maxLength(200)]],
    seoDescription: ['', [Validators.maxLength(320)]],
    canonicalUrl: ['', [Validators.maxLength(500)]],
  });

  protected readonly isNew = computed(() => this.articleId() === null);
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.status()]);
  protected readonly statusClass = computed(() => STATUS_CLASSES[this.status()]);
  protected readonly lastSavedLabel = computed(() => {
    const date = this.lastSavedAt();
    return date
      ? date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      : '';
  });

  constructor() {
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.suppressDirty) {
          this.dirty.set(true);
        }
      });

    this.form.controls.bodyMd.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((bodyMd) => this.updatePreview(bodyMd));

    this.form.valueChanges
      .pipe(debounceTime(2500), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (
          this.articleId() !== null &&
          this.dirty() &&
          this.form.valid &&
          !this.saving() &&
          !this.loading()
        ) {
          this.save(true);
        }
      });
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const rawId = params.get('id');
        const id = rawId ? Number(rawId) : null;
        this.initialize(Number.isFinite(id) ? id : null);
      });
  }

  protected save(silent = false): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFormStart();
      return;
    }
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    if (!silent) {
      this.error.set(null);
      this.notice.set(null);
    }

    const id = this.articleId();
    const request = this.buildRequest();
    const save$ = id
      ? this.api.updateArticle(id, request)
      : this.api.createArticle(request);

    save$.subscribe({
      next: (article) => {
        this.saving.set(false);
        this.lastSavedAt.set(new Date());
        this.applyArticle(article);
        if (id === null) {
          void this.router.navigate(['/admin/articulos', article.id], {
            replaceUrl: true,
          });
        }
        if (!silent) {
          this.notice.set('Borrador guardado');
        }
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(problemMessage(error, 'No se pudo guardar el artículo'));
      },
    });
  }

  protected publish(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.scrollToFormStart();
      return;
    }
    if (this.publishing()) {
      return;
    }

    this.publishing.set(true);
    this.error.set(null);
    this.notice.set(null);

    const id = this.articleId();
    const request = this.buildRequest();
    const save$ = id
      ? this.api.updateArticle(id, request)
      : this.api.createArticle(request);

    save$
      .pipe(switchMap((article) => this.api.publishArticle(article.id)))
      .subscribe({
        next: (article) => {
          this.publishing.set(false);
          this.lastSavedAt.set(new Date());
          this.applyArticle(article);
          if (id === null) {
            void this.router.navigate(['/admin/articulos', article.id], {
              replaceUrl: true,
            });
          }
          this.notice.set('Artículo publicado');
        },
        error: (error: unknown) => {
          this.publishing.set(false);
          this.error.set(problemMessage(error, 'No se pudo publicar el artículo'));
        },
      });
  }

  protected unpublish(): void {
    const id = this.articleId();
    if (id === null) {
      return;
    }
    this.runStatusAction(this.api.unpublishArticle(id), 'Artículo devuelto a borrador');
  }

  protected archive(): void {
    const id = this.articleId();
    if (id === null) {
      return;
    }
    this.runStatusAction(this.api.archiveArticle(id), 'Artículo archivado');
  }

  protected remove(): void {
    const id = this.articleId();
    if (id === null) {
      return;
    }
    if (!confirm('¿Eliminar este artículo? Esta acción no se puede deshacer.')) {
      return;
    }
    this.api.deleteArticle(id).subscribe({
      next: () => {
        void this.router.navigate(['/admin/articulos']);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, 'No se pudo eliminar el artículo'));
      },
    });
  }

  protected toggleRevisions(): void {
    const next = !this.showRevisions();
    this.showRevisions.set(next);
    if (next) {
      this.loadRevisions();
    }
  }

  protected scrollToSocial(): void {
    this.document
      .getElementById('social-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected restore(revision: ArticleRevision): void {
    const id = this.articleId();
    if (id === null) {
      return;
    }
    if (!confirm(`¿Restaurar la versión «${revision.title}»?`)) {
      return;
    }
    this.api.restoreRevision(id, revision.id).subscribe({
      next: (article) => {
        this.applyArticle(article);
        this.notice.set('Revisión restaurada');
        this.loadRevisions();
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, 'No se pudo restaurar la revisión'));
      },
    });
  }

  protected coverFor(id: number | null): MediaAsset | undefined {
    return id === null ? undefined : this.media().find((asset) => asset.id === id);
  }

  /** La previsualización de portada usa la variante `thumb` si existe. */
  protected coverPreview(asset: MediaAsset): string {
    return asset.variants.find((variant) => variant.kind === 'thumb')?.url ?? asset.url;
  }

  protected revisionDate(value: string): string {
    return new Date(value).toLocaleString('es-ES', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  protected generateSocialSummary(): void {
    const id = this.articleId();
    if (id === null || this.socialLoading()) {
      return;
    }

    this.socialLoading.set(true);
    this.socialError.set(null);
    this.copiedPlatform.set(null);
    this.api.generateSocialSummary(id).subscribe({
      next: (response) => {
        this.socialLoading.set(false);
        this.socialSource.set(response.source);
        this.socialTexts.set({ ...response.variants });
      },
      error: (error: unknown) => {
        this.socialLoading.set(false);
        this.socialError.set(problemMessage(error, 'No se pudo generar el resumen'));
      },
    });
  }

  protected socialText(platform: SocialSummaryPlatform): string {
    return this.socialTexts()[platform];
  }

  protected updateSocialText(platform: SocialSummaryPlatform, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.socialTexts.update((texts) => ({ ...texts, [platform]: value }));
  }

  protected copySocialText(platform: SocialSummaryPlatform): void {
    const text = this.socialText(platform).trim();
    if (!text) {
      return;
    }
    if (!navigator.clipboard) {
      this.socialError.set('Este navegador no permite copiar al portapapeles');
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.socialError.set(null);
        this.copiedPlatform.set(platform);
        setTimeout(() => {
          if (this.copiedPlatform() === platform) {
            this.copiedPlatform.set(null);
          }
        }, 2000);
      })
      .catch(() => this.socialError.set('No se pudo copiar el texto'));
  }

  protected socialShareUrl(platform: SocialSummaryPlatform): string {
    const text = this.socialText(platform).trim();
    if (!text || platform === 'instagram') {
      return '';
    }
    if (platform === 'facebook') {
      const url = this.shareArticleUrl();
      return url
        ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        : '';
    }
    if (platform === 'x') {
      return `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  private scrollToFormStart(): void {
    this.document
      .getElementById('article-form')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private shareArticleUrl(): string {
    const canonical = this.form.controls.canonicalUrl.value.trim();
    if (canonical) {
      return canonical;
    }
    const slug = this.publicSlug() || this.form.controls.slug.value.trim();
    if (!slug) {
      return '';
    }
    const origin = this.document.location?.origin ?? '';
    return `${origin}/articulos/${slug}`;
  }

  private resetSocialSummary(): void {
    this.socialSource.set(null);
    this.socialTexts.set({ ...EMPTY_SOCIAL_TEXTS });
    this.socialLoading.set(false);
    this.socialError.set(null);
    this.copiedPlatform.set(null);
  }

  private initialize(id: number | null): void {
    this.articleId.set(id);
    this.loading.set(true);
    this.error.set(null);
    this.notice.set(null);
    this.resetSocialSummary();

    forkJoin({
      categories: this.api.listCategories(),
      bands: this.api.listBands(),
      tags: this.api.listTags(),
      media: this.api.listMedia(0, 50),
      article: id === null ? of(null) : this.api.getArticle(id),
    }).subscribe({
      next: ({ categories, bands, tags, media, article }) => {
        this.categories.set(categories);
        this.bands.set(bands);
        this.tags.set(tags);
        this.media.set(media.content);
        if (article) {
          this.applyArticle(article);
          this.loadRevisions();
        } else {
          this.resetForNew();
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(problemMessage(error, 'No se pudo cargar el artículo'));
      },
    });
  }

  private applyArticle(article: AdminArticleDetail): void {
    this.suppressDirty = true;
    this.form.patchValue({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      bodyMd: article.bodyMd,
      categoryId: article.category.id,
      bandIds: article.bands.map((band) => band.id),
      tagIds: article.tags.map((tag) => tag.id),
      coverMediaId: article.cover?.id ?? null,
      seoTitle: article.seoTitle ?? '',
      seoDescription: article.seoDescription ?? '',
      canonicalUrl: article.canonicalUrl ?? '',
    });
    this.status.set(article.status);
    this.slug.set(article.slug);
    this.publicSlug.set(article.slug);
    this.preview.set(article.bodyHtml);
    this.dirty.set(false);
    this.suppressDirty = false;
  }

  private resetForNew(): void {
    this.suppressDirty = true;
    this.form.reset({
      title: '',
      slug: '',
      excerpt: '',
      bodyMd: '',
      categoryId: this.categories()[0]?.id ?? 0,
      bandIds: [],
      tagIds: [],
      coverMediaId: null,
      seoTitle: '',
      seoDescription: '',
      canonicalUrl: '',
    });
    this.status.set('draft');
    this.slug.set('');
    this.publicSlug.set('');
    this.preview.set('');
    this.revisions.set([]);
    this.lastSavedAt.set(null);
    this.dirty.set(false);
    this.suppressDirty = false;
  }

  private buildRequest(): ArticleWriteRequest {
    const value = this.form.getRawValue();
    return {
      title: value.title.trim(),
      slug: value.slug.trim() || null,
      excerpt: value.excerpt.trim(),
      bodyMd: value.bodyMd,
      categoryId: Number(value.categoryId),
      bandIds: (value.bandIds ?? []).map(Number),
      tagIds: (value.tagIds ?? []).map(Number),
      coverMediaId: value.coverMediaId === null ? null : Number(value.coverMediaId),
      seoTitle: value.seoTitle.trim() || null,
      seoDescription: value.seoDescription.trim() || null,
      canonicalUrl: value.canonicalUrl.trim() || null,
    };
  }

  private updatePreview(bodyMd: string): void {
    if (!bodyMd || !bodyMd.trim()) {
      this.preview.set('');
      return;
    }
    this.previewLoading.set(true);
    this.api.previewMarkdown(bodyMd).subscribe({
      next: (response) => {
        this.preview.set(response.bodyHtml);
        this.previewLoading.set(false);
      },
      error: () => {
        this.previewLoading.set(false);
      },
    });
  }

  private loadRevisions(): void {
    const id = this.articleId();
    if (id === null) {
      return;
    }
    this.revisionsLoading.set(true);
    this.api.listRevisions(id).subscribe({
      next: (revisions) => {
        this.revisions.set(revisions);
        this.revisionsLoading.set(false);
      },
      error: () => {
        this.revisionsLoading.set(false);
      },
    });
  }

  private runStatusAction(action: Observable<AdminArticleDetail>, message: string): void {
    this.error.set(null);
    this.notice.set(null);
    action.subscribe({
      next: (article) => {
        this.applyArticle(article);
        this.notice.set(message);
      },
      error: (error: unknown) => {
        this.error.set(problemMessage(error, 'La operación no se pudo completar'));
      },
    });
  }
}
