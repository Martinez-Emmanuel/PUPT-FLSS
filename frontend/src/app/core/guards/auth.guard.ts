import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../services/auth/auth.service';
import { RoleService } from '../services/role/role.service';
import { UserRole } from '../services/auth/auth.service';

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

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = this.authService.getToken();
    const userInfo = this.authService.getUserInfo();

    if (!token) {
      // Redirect to login if no token is found
      return this.isLoginRoute(next)
        ? true
        : this.router.createUrlTree(['/login']);
    }

    if (!userInfo) {
      // If user info is not retrievable, clear cookies and redirect to login
      this.authService.clearCookies();
      return this.router.createUrlTree(['/login']);
    }

    const userRole = userInfo.role;
    const expectedRole = next.data['role'] as UserRole;

    // Check if the user has the required role
    if (expectedRole && !this.roleService.hasRequiredRole(userRole, expectedRole)) {
      return this.router.createUrlTree(['/forbidden']);
    }

    // If the user tries to access the login route while authenticated, redirect to their role-based home page
    return this.isLoginRoute(next)
      ? this.roleService.getHomeUrlForRole(userRole)
      : true;
  }

  private isLoginRoute(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.path === 'login';
  }
}
