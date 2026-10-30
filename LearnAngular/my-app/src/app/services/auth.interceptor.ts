import { HttpInterceptorFn } from '@angular/common/http';

const apiPaths = ['/user-session', '/user-logout', '/fashions', '/books'];

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = sessionStorage.getItem('access_token');
  const isApiRequest = apiPaths.some((path) =>
    request.url === path || request.url.startsWith(`${path}/`)
  );

  if (!token || !isApiRequest) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` }
  }));
};
