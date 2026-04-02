import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

// ── URLs that must NOT receive the Authorization header ──────────
// Cloudinary rejects requests that include Authorization in the
// CORS preflight — causes ERR_FAILED with CORS policy block.
// Add any other external APIs called directly from the frontend here.
const PUBLIC_URL_PREFIXES = [
  'https://api.cloudinary.com',
  'https://api.postalpincode.in',
];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  // ── Skip token for external/public URLs ───────────────────────
  const isPublicUrl = PUBLIC_URL_PREFIXES.some(prefix =>
    req.url.startsWith(prefix)
  );

  if (isPublicUrl) {
    return next(req);   // pass through untouched — no Authorization header
  }

  // ── Attach Bearer token for our own backend API calls ─────────
  const tokenService = inject(TokenService);
  const token = tokenService.getToken();

  if (token && !tokenService.isTokenExpired(token)) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};