import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, timeout, of } from 'rxjs';

const PRODUCTION_API_ORIGIN = 'https://api.codingtechnyks.com';

function isLocalBrowser() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
}

/**
 * Direct production client-side requests to API backend while ensuring
 * SSR requests never hang or block server response rendering.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
  if (isLocalBrowser()) return next(req);

  // In SSR environment, set a tight timeout so rendering never causes a 504 Gateway Time-out
  if (typeof window === 'undefined') {
    const targetUrl = `${PRODUCTION_API_ORIGIN}${req.url}`;
    return next(req.clone({ url: targetUrl })).pipe(
      timeout(1500),
      catchError(() => of(null as any)),
    );
  }

  return next(req.clone({
    url: `${PRODUCTION_API_ORIGIN}${req.url}`,
  }));
};

