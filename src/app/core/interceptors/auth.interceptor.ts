// ─────────────────────────────────────────────────────────────
// auth.interceptor.ts
// Automatically attaches the Bearer JWT token to every outgoing
// HTTP request. Without this, every service and component would
// need to manually build HttpHeaders — this eliminates that.
//
// Angular 19 uses functional interceptors (HttpInterceptorFn)
// instead of class-based ones. Register it in app.config.ts.
// ─────────────────────────────────────────────────────────────

import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  // Only attach token if one exists and is not expired
  if (token && !tokenService.isTokenExpired(token)) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  // No token or expired — pass request through unchanged
  // The backend will return 401 and the error interceptor handles it
  return next(req);
};