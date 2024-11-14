import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { CookieService } from 'ngx-cookie-service';

export const AuthHeaderInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('token');

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq);
};
