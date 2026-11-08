import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, shareReplay, tap } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type { AuthResponse, AuthUser, LoginRequest } from './admin.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly userSignal = signal<AuthUser | null>(null);
  private refreshRequest?: Observable<AuthUser | null>;

  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenSignal() !== null);

  accessToken(): string | null {
    return this.accessTokenSignal();
  }

  login(email: string, password: string): Observable<AuthUser> {
    const body: LoginRequest = { email, password };
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/api/v1/auth/login`, body, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        map((response) => response.user),
      );
  }

  refresh(): Observable<AuthUser | null> {
    if (this.refreshRequest) {
      return this.refreshRequest;
    }
    this.refreshRequest = this.http
      .post<AuthResponse>(`${this.baseUrl}/api/v1/auth/refresh`, {}, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setSession(response)),
        map((response) => response.user),
        catchError(() => {
          this.clear();
          return of(null);
        }),
        finalize(() => {
          this.refreshRequest = undefined;
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.refreshRequest;
  }

  ensureSession(): Observable<boolean> {
    if (this.accessTokenSignal()) {
      return of(true);
    }
    return this.refresh().pipe(map((user) => user !== null));
  }

  logout(): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/api/v1/auth/logout`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(undefined)),
        finalize(() => this.clear()),
      );
  }

  clear(): void {
    this.accessTokenSignal.set(null);
    this.userSignal.set(null);
  }

  private setSession(response: AuthResponse): void {
    this.accessTokenSignal.set(response.accessToken);
    this.userSignal.set(response.user);
  }
}
