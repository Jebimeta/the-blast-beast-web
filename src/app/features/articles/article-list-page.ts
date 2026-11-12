import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { ArticleCard } from './article-card';
import { GENERAL_CATEGORY_SLUG } from './article.resolvers';
import type { ArticleListData } from './article.resolvers';

@Component({
  selector: 'app-article-list-page',
  imports: [RouterLink, ArticleCard],
  templateUrl: './article-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListPage {
  readonly list = input.required<ArticleListData>();

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly title = computed(
    () => this.list().category?.name ?? 'Todas las noticias',
  );
  protected readonly description = computed(
    () =>
      this.list().category?.description ??
      'Archivo completo de noticias, lanzamientos, conciertos y entrevistas de The Blast Beast.',
  );
  protected readonly hasResults = computed(
    () => this.list().page.content.length > 0,
  );
  protected readonly pageNumber = computed(() => this.list().page.page + 1);
  protected readonly totalPages = computed(() =>
    Math.max(this.list().page.totalPages, 1),
  );

  constructor() {
    effect(() => {
      const category = this.list().category;
      const page = this.list().page.page;
      const isGeneral = category?.slug === GENERAL_CATEGORY_SLUG;
      // «Noticias» muestra el archivo completo: canonicaliza a /articulos para
      // no duplicar la misma lista bajo dos URLs.
      const basePath = isGeneral
        ? '/articulos'
        : category
          ? `/categorias/${category.slug}`
          : '/articulos';
      const path = page > 0 ? `${basePath}?page=${page}` : basePath;
      const title = category ? `${category.name} — The Blast Beast` : 'Todas las noticias — The Blast Beast';

      this.seo.apply({
        title,
        description: this.description(),
        path,
      });

      if (category) {
        this.seo.setFeed(
          isGeneral ? '/feed.xml' : `/categorias/${category.slug}/feed.xml`,
          `${category.name} — The Blast Beast`,
        );
        this.seo.applyBreadcrumbJsonLd([
          { name: 'Inicio', path: '/' },
          { name: category.name, path: basePath },
        ]);
      }
    });
  }

  protected changeSort(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: value, page: null },
    });
  }

  protected goToPage(page: number): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }
}
