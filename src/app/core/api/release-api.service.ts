import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type { ReleasePage, ReleaseQuery } from './release.models';

@Injectable({ providedIn: 'root' })
export class ReleaseApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listReleases(query: ReleaseQuery = {}): Observable<ReleasePage> {
    let params = new HttpParams();

    if (query.month) {
      params = params.set('month', query.month);
    }
    if (query.genre) {
      params = params.set('genre', query.genre);
    }
    if (query.type) {
      params = params.set('type', query.type);
    }
    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }

    return this.http.get<ReleasePage>(`${this.baseUrl}/api/v1/releases`, {
      params,
    });
  }
}
