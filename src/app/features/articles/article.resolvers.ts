import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type {
  ArticleDetail,
  ArticlePage,
  ArticleSort,
  ArticleSummary,
  CategoryResponse,
} from '../../core/api/article.models';
import { emptyArticlePage } from '../home/home.resolver';

const PAGE_SIZE = 6;
const VALID_SORTS: readonly ArticleSort[] = ['latest', 'oldest', 'relevance'];

/**
 * «Noticias» es la portada del archivo: muestra todas las publicadas y el
 * resto de secciones (Conciertos, Lanzamientos, Entrevistas) actúan como filtro.
 */
export const GENERAL_CATEGORY_SLUG = 'noticias';

export interface ArticleListData {
  page: ArticlePage;
  categories: CategoryResponse[];
  category: CategoryResponse | null;
  sort: ArticleSort;
}

export interface ArticleDetailData {
  article: ArticleDetail | null;
  status: number;
  related: ArticleSummary[];
}

/** Prioriza banda (3), etiquetas (2) y sección (1) para ordenar las relacionadas. */
function relatedScore(candidate: ArticleSummary, article: ArticleDetail): number {
  const bandSlugs = new Set(article.bands.map((band) => band.slug));
  const tagSlugs = new Set(article.tags.map((tag) => tag.slug));
  let score = 0;
  if (candidate.bands.some((band) => bandSlugs.has(band.slug))) {
    score += 3;
  }
  if (candidate.tags.some((tag) => tagSlugs.has(tag.slug))) {
    score += 2;
  }
  if (candidate.category.slug === article.category.slug) {
    score += 1;
  }
  return score;
}

function publishedTime(value: string): number {
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 0;
}

function parseSort(value: string | null): ArticleSort {
  return VALID_SORTS.includes(value as ArticleSort)
    ? (value as ArticleSort)
    : 'latest';
}

export const articleListResolver: ResolveFn<ArticleListData> = (
  route: ActivatedRouteSnapshot,
) => {
  const api = inject(ArticleApiService);
  const categorySlug = route.paramMap.get('slug') ?? undefined;
  const categoryFilter =
    categorySlug === GENERAL_CATEGORY_SLUG ? undefined : categorySlug;
  const sort = parseSort(route.queryParamMap.get('sort'));
  const page = parsePage(route.queryParamMap.get('page'));

  return forkJoin({
    page: api
      .listArticles({ category: categoryFilter, page, size: PAGE_SIZE, sort })
      .pipe(catchError(() => of(emptyArticlePage))),
    categories: api.listCategories().pipe(catchError(() => of([]))),
  }).pipe(
    map(({ page: articlePage, categories }) => ({
      page: articlePage,
      categories,
      category:
        categories.find((category) => category.slug === categorySlug) ?? null,
      sort,
    })),
  );
};

export const articleDetailResolver: ResolveFn<ArticleDetailData> = (
  route: ActivatedRouteSnapshot,
) => {
  const slug = route.paramMap.get('slug') ?? '';
  const api = inject(ArticleApiService);

  return api.getArticle(slug).pipe(
    switchMap((article) =>
      api.listArticles({ size: 24, sort: 'latest' }).pipe(
        map((page) => {
          const currentTime = publishedTime(article.publishedAt);
          const related = page.content
            .filter((candidate) => candidate.slug !== article.slug)
            .filter(
              (candidate) => publishedTime(candidate.publishedAt) < currentTime,
            )
            .map((candidate) => ({
              candidate,
              score: relatedScore(candidate, article),
            }))
            .sort(
              (a, b) =>
                b.score - a.score ||
                publishedTime(b.candidate.publishedAt) -
                  publishedTime(a.candidate.publishedAt),
            )
            .slice(0, 3)
            .map(({ candidate }) => candidate);

          return { article, status: 200, related };
        }),
        catchError(() => of({ article, status: 200, related: [] })),
      ),
    ),
    catchError((error: { status?: number }) =>
      of({ article: null, status: error?.status ?? 500, related: [] }),
    ),
  );
};
