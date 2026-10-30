import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.restoreSession().pipe(
    map((response) =>
      response.user
        ? true
        : router.createUrlTree(['/login-auth'], {
            queryParams: { returnUrl: state.url },
          })
    ),
    catchError(() =>
      of(
        router.createUrlTree(['/login-auth'], {
          queryParams: { returnUrl: state.url },
        })
      )
    )
  );
};
