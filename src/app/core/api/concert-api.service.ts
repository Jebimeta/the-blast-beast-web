import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type { ConcertFacets, ConcertPage, ConcertQuery } from './concert.models';

@Injectable({ providedIn: 'root' })
export class ConcertApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listConcerts(query: ConcertQuery = {}): Observable<ConcertPage> {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }
    if (query.genre) {
      params = params.set('genre', query.genre);
    }
    if (query.city) {
      params = params.set('city', query.city);
    }
    if (query.band) {
      params = params.set('band', query.band);
    }
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }

    return this.http.get<ConcertPage>(`${this.baseUrl}/api/v1/concerts`, {
      params,
    });
  }

  getFacets(): Observable<ConcertFacets> {
    return this.http.get<ConcertFacets>(`${this.baseUrl}/api/v1/concerts/facets`);
  }
}
