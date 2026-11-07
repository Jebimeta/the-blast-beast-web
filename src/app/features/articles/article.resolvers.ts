import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type {
  ArticleDetail,
  ArticlePage,
  ArticleSort,
  CategoryResponse,
} from '../../core/api/article.models';
import { emptyArticlePage } from '../home/home.resolver';

const PAGE_SIZE = 6;
const VALID_SORTS: readonly ArticleSort[] = ['latest', 'oldest', 'relevance'];

export interface ArticleListData {
  page: ArticlePage;
  categories: CategoryResponse[];
  category: CategoryResponse | null;
  sort: ArticleSort;
}

export interface ArticleDetailData {
  article: ArticleDetail | null;
  status: number;
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
  const sort = parseSort(route.queryParamMap.get('sort'));
  const page = parsePage(route.queryParamMap.get('page'));

  return forkJoin({
    page: api
      .listArticles({ category: categorySlug, page, size: PAGE_SIZE, sort })
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

  return inject(ArticleApiService)
    .getArticle(slug)
    .pipe(
      map((article) => ({ article, status: 200 })),
      catchError((error: { status?: number }) =>
        of({ article: null, status: error?.status ?? 500 }),
      ),
    );
};
