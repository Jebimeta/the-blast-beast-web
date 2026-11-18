import {
  HttpContextToken,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

const AUTH_RETRIED = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Login, refresco y logout no llevan Bearer (ni deben reintentar con refresco).
  // El resto de /api/v1/auth/** sí: /me y /password exigen el access token.
  const isPublicAuthRequest =
    request.url.includes('/api/v1/auth/login') ||
    request.url.includes('/api/v1/auth/refresh') ||
    request.url.includes('/api/v1/auth/logout');

  const token = auth.accessToken();
  const authorized =
    token && !isPublicAuthRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isPublicAuthRequest ||
        request.context.get(AUTH_RETRIED)
      ) {
        return throwError(() => error);
      }

      return auth.refresh().pipe(
        switchMap((user) => {
          if (!user) {
            if (router.url.startsWith('/admin') && !router.url.startsWith('/admin/login')) {
              void router.navigate(['/admin/login'], {
                queryParams: { returnUrl: router.url },
              });
            }
            return throwError(() => error);
          }

          const freshToken = auth.accessToken();
          return next(
            request.clone({
              context: request.context.set(AUTH_RETRIED, true),
              setHeaders: freshToken ? { Authorization: `Bearer ${freshToken}` } : {},
            }),
          );
        }),
      );
    }),
  );
};
