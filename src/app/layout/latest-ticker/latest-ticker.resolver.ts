import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type { ArticleSummary } from '../../core/api/article.models';

/**
 * Últimas noticias para la cinta de «Última hora». Se resuelve antes de
 * renderizar cada sección para que la cinta llegue ya pintada en el HTML del
 * SSR (sin saltos de layout al hidratar).
 */
export const latestTickerResolver: ResolveFn<ArticleSummary[]> = () =>
  inject(ArticleApiService)
    .listArticles({ size: 5, sort: 'latest' })
    .pipe(
      map((page) => page.content),
      catchError(() => of([])),
    );
