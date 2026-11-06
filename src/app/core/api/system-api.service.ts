import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';

export interface PingResponse {
  status: string;
  app: string;
  version: string;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class SystemApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  ping(): Observable<PingResponse> {
    return this.http.get<PingResponse>(`${this.baseUrl}/api/v1/ping`);
  }
}
