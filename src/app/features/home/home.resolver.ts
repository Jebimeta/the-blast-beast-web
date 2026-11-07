import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type {
  ArticlePage,
  ArticleSummary,
  CategoryResponse,
} from '../../core/api/article.models';

export interface HomeData {
  featured: ArticleSummary[];
  latest: ArticlePage;
  categories: CategoryResponse[];
}

export const emptyArticlePage: ArticlePage = {
  content: [],
  page: 0,
  size: 0,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export const homeResolver: ResolveFn<HomeData> = () => {
  const api = inject(ArticleApiService);

  return forkJoin({
    featured: api.listFeaturedArticles().pipe(catchError(() => of([]))),
    latest: api
      .listArticles({ size: 6, sort: 'latest' })
      .pipe(catchError(() => of(emptyArticlePage))),
    categories: api.listCategories().pipe(catchError(() => of([]))),
  });
};
