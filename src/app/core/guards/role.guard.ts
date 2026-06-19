import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(allowedRoles)) {
      return true;
    }

    if (auth.isAuthenticated()) {
      auth.redirectToHome();
      return false;
    }

    return router.createUrlTree(['/auth/login']);
  };
};
