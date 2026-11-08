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
  const isAuthRequest = request.url.includes('/api/v1/auth/');

  const token = auth.accessToken();
  const authorized =
    token && !isAuthRequest
      ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : request;

  return next(authorized).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        isAuthRequest ||
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
