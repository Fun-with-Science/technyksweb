import { HttpInterceptorFn } from '@angular/common/http';

const PRODUCTION_API_ORIGIN = 'https://api.codingtechnyks.com';

function isLocalBrowser() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
}

/**
 * Keep local development on the Angular proxy, but send production API
 * requests to the separately deployed NestJS application. Without this,
 * `/api/...` is requested from the frontend Hostinger site and is handled by
 * its SPA/static route instead of the API process.
 */
export const apiUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api')) return next(req);
  if (isLocalBrowser()) return next(req);

  return next(req.clone({
    url: `${PRODUCTION_API_ORIGIN}${req.url}`,
  }));
};
