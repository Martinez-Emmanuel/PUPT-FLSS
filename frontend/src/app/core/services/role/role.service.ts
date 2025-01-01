import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly roleHomeMap: Record<string, string> = {
    faculty: '/faculty',
    admin: '/admin',
    superadmin: '/superadmin',
  };

  constructor(private router: Router) {}

  hasRequiredRole(userRole: string, requiredRole: string): boolean {
    return !requiredRole || userRole === requiredRole;
  }

  getHomeUrlForRole(userRole: string): UrlTree {
    const homeUrl = this.roleHomeMap[userRole] || '/login';
    return this.router.createUrlTree([homeUrl]);
  }
}
