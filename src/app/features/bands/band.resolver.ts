import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type { BandDetail } from '../../core/api/article.models';

export interface BandData {
  band: BandDetail | null;
  status: number;
}

export const bandResolver: ResolveFn<BandData> = (
  route: ActivatedRouteSnapshot,
) => {
  const slug = route.paramMap.get('slug') ?? '';

  return inject(ArticleApiService)
    .getBand(slug)
    .pipe(
      map((band) => ({ band, status: 200 })),
      catchError((error: { status?: number }) =>
        of({ band: null, status: error?.status ?? 500 }),
      ),
    );
};
