import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../api/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth
    .ensureSession()
    .pipe(
      map((authenticated) =>
        authenticated
          ? true
          : router.createUrlTree(['/admin/login'], {
              queryParams: { returnUrl: state.url },
            }),
      ),
    );
};
