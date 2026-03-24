// ─────────────────────────────────────────────────────────────
// auth.guard.ts
// Protects all /dashboard routes. If a user is not logged in
// (no token or expired token) and tries to access /dashboard,
// they get redirected to /auth/login.
//
// The returnUrl query param preserves where they were trying
// to go — after login they'll be sent back to that page.
// ─────────────────────────────────────────────────────────────

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Not authenticated — redirect to login
  // Preserve the attempted URL so we can redirect after login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};