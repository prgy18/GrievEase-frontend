// ─────────────────────────────────────────────────────────────
// app.config.ts
// Key change: provideHttpClient(withInterceptors([authInterceptor]))
// This registers the interceptor globally — every HttpClient call
// in the entire app automatically gets the Bearer token attached.
// ─────────────────────────────────────────────────────────────

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // withInterceptors([]) registers functional interceptors globally.
    // The authInterceptor runs on EVERY outgoing HTTP request.
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};