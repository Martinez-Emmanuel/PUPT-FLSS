import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { RoleService } from '../services/role/role.service';

@Injectable({
  providedIn: 'root',
})
export class UnauthGuard implements CanActivate {
  constructor(
    private cookieService: CookieService,
    private roleService: RoleService
  ) {}

  canActivate(): boolean | UrlTree {
    const token = this.cookieService.get('token');
    if (token) {
      const userRole = this.cookieService.get('user_role') || '';
      return this.roleService.getHomeUrlForRole(userRole);
    }
    return true;
  }
}
