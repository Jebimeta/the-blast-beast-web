import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ReleaseApiService } from '../../core/api/release-api.service';
import type {
  ReleaseKind,
  ReleasePage,
} from '../../core/api/release.models';
import {
  currentMonth,
  isMonth,
  isReleaseKind,
} from './radar.utils';

export interface RadarData {
  page: ReleasePage;
  month: string;
  genre: string | null;
  type: ReleaseKind | null;
}

export const radarResolver: ResolveFn<RadarData> = (route) => {
  const api = inject(ReleaseApiService);
  const params = route.queryParamMap;
  const requestedMonth = params.get('mes');
  const month = isMonth(requestedMonth) ? requestedMonth : currentMonth();
  const genre = params.get('genero');
  const requestedType = params.get('tipo');
  const type = isReleaseKind(requestedType) ? requestedType : null;

  return api
    .listReleases({
      month,
      genre: genre ?? undefined,
      type: type ?? undefined,
      size: 100,
    })
    .pipe(
      map((page) => ({ page, month: page.month, genre, type })),
      catchError(() =>
        of({ page: emptyReleasePage(month), month, genre, type }),
      ),
    );
};

export function emptyReleasePage(month: string): ReleasePage {
  return {
    content: [],
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
    month,
    genres: [],
    types: [],
  };
}
