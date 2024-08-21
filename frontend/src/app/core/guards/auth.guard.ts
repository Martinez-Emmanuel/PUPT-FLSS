import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth/auth.service';
import { RoleService } from '../services/role/role.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private cookieService: CookieService,
    private authService: AuthService,
    private roleService: RoleService
  ) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    const token = this.authService.getToken();
    const userRole = this.cookieService.get('user_role');
    const expectedRole = next.data['role'];

    if (token) {
      if (
        expectedRole &&
        !this.roleService.hasRequiredRole(userRole, expectedRole)
      ) {
        return this.router.createUrlTree(['/forbidden']);
      }

      if (!this.isLoginRoute(next)) {
        return true;
      }

      return this.roleService.getHomeUrlForRole(userRole);
    } else {
      if (this.isLoginRoute(next)) {
        return true;
      }
      return this.router.createUrlTree(['/login']);
    }
  }

  private isLoginRoute(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.path === 'login';
  }
}
