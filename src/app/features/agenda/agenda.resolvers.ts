import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { ConcertApiService } from '../../core/api/concert-api.service';
import type { ConcertDetail, ConcertFacets, ConcertPage } from '../../core/api/concert.models';

export interface AgendaFilters {
  genre: string | null;
  city: string | null;
  band: string | null;
  from: string | null;
  to: string | null;
}

export interface AgendaData {
  page: ConcertPage;
  facets: ConcertFacets;
  filters: AgendaFilters;
}

export interface ConcertDetailData {
  concert: ConcertDetail | null;
  status: number;
}

const PAGE_SIZE = 12;

export const emptyConcertPage: ConcertPage = {
  content: [],
  page: 0,
  size: PAGE_SIZE,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export const emptyConcertFacets: ConcertFacets = {
  genres: [],
  cities: [],
  artists: [],
  days: [],
  earliest: null,
  latest: null,
};

function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 0;
}

function parseText(value: string | null): string | null {
  const text = value?.trim();
  return text ? text : null;
}

function parseDate(value: string | null): string | null {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

export const agendaResolver: ResolveFn<AgendaData> = (route: ActivatedRouteSnapshot) => {
  const api = inject(ConcertApiService);
  const params = route.queryParamMap;
  const filters: AgendaFilters = {
    genre: parseText(params.get('genre')),
    city: parseText(params.get('city')),
    band: parseText(params.get('band')),
    from: parseDate(params.get('from')),
    to: parseDate(params.get('to')),
  };

  return forkJoin({
    page: api
      .listConcerts({
        page: parsePage(params.get('page')),
        size: PAGE_SIZE,
        genre: filters.genre ?? undefined,
        city: filters.city ?? undefined,
        band: filters.band ?? undefined,
        from: filters.from ?? undefined,
        to: filters.to ?? undefined,
      })
      .pipe(catchError(() => of(emptyConcertPage))),
    facets: api.getFacets().pipe(catchError(() => of(emptyConcertFacets))),
  }).pipe(map(({ page, facets }) => ({ page, facets, filters })));
};

export const concertDetailResolver: ResolveFn<ConcertDetailData> = (
  route: ActivatedRouteSnapshot,
) => {
  const slug = route.paramMap.get('slug') ?? '';

  return inject(ConcertApiService)
    .getConcert(slug)
    .pipe(
      map((concert) => ({ concert, status: 200 })),
      catchError((error: { status?: number }) =>
        of({ concert: null, status: error?.status ?? 500 }),
      ),
    );
};
