import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private roleHomeMap: { [key: string]: string } = {
    faculty: '/faculty',
    admin: '/admin',
    superadmin: '/superadmin',
  };

  constructor(private router: Router) {}

  hasRequiredRole(userRole: string, requiredRole: string): boolean {
    return !requiredRole || userRole === requiredRole;
  }

  getHomeUrlForRole(userRole: string): UrlTree {
    return this.router.createUrlTree([this.roleHomeMap[userRole] || '/home']);
  }
}
