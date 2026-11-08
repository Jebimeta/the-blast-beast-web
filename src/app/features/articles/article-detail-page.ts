import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  RESPONSE_INIT,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { formatDate, readingTime } from '../../core/format';
import { SeoService } from '../../core/seo/seo.service';
import type { ArticleDetailData } from './article.resolvers';

@Component({
  selector: 'app-article-detail-page',
  imports: [RouterLink],
  templateUrl: './article-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailPage {
  readonly detail = input.required<ArticleDetailData>();

  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly article = computed(() => this.detail().article);
  protected readonly status = computed(() => this.detail().status);
  protected readonly published = computed(() =>
    formatDate(this.article()?.publishedAt),
  );
  protected readonly updated = computed(() =>
    formatDate(this.article()?.updatedAt),
  );
  protected readonly minutes = computed(() =>
    readingTime(this.article()?.readingMinutes ?? 0),
  );

  /** El detalle usa la variante `hero` (1200 px) para no servir el original. */
  protected readonly coverHero = computed(() => {
    const cover = this.article()?.cover;
    if (!cover) {
      return null;
    }
    return cover.variants?.find((variant) => variant.kind === 'hero')?.url ?? cover.url;
  });

  constructor() {
    effect(() => {
      const article = this.article();
      if (!article) {
        const gone = this.status() === 410;
        if (this.responseInit) {
          this.responseInit.status = gone ? 410 : 404;
        }
        this.seo.apply({
          title: gone
            ? 'Contenido retirado — The Blast Beast'
            : 'Artículo no encontrado — The Blast Beast',
          description: gone
            ? 'Esta noticia existió, pero la redacción la ha archivado.'
            : 'El artículo que buscas no existe o nunca llegó a publicarse.',
          path: this.router.url.split('?')[0],
          noIndex: true,
        });
        return;
      }

      const path = `/articulos/${article.slug}`;
      const title = article.seoTitle ?? `${article.title} — The Blast Beast`;
      const description = article.seoDescription ?? article.excerpt;
      const image = this.coverHero() ?? undefined;

      this.seo.apply({
        title,
        description,
        path,
        type: 'article',
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        author: article.authorName,
        section: article.category.name,
        image,
      });

      this.seo.applyArticleJsonLd({
        title: article.title,
        description,
        path,
        publishedAt: article.publishedAt,
        updatedAt: article.updatedAt,
        author: article.authorName,
        section: article.category.name,
        image,
      });
    });
  }
}
