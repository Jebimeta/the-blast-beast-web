import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type { ArticlePage } from '../../core/api/article.models';
import { emptyArticlePage } from '../home/home.resolver';

export interface SearchData {
  q: string;
  page: ArticlePage;
}

export const searchResolver: ResolveFn<SearchData> = (
  route: ActivatedRouteSnapshot,
) => {
  const q = (route.queryParamMap.get('q') ?? '').trim();
  const page = Math.max(Number(route.queryParamMap.get('page')) || 0, 0);

  if (q.length < 2) {
    return of({ q, page: emptyArticlePage });
  }

  return inject(ArticleApiService)
    .searchArticles(q, page)
    .pipe(
      map((result) => ({ q, page: result })),
      catchError(() => of({ q, page: emptyArticlePage })),
    );
};
