import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private router: Router) {}

  hasRequiredRole(userRole: string, requiredRole: string): boolean {
    return userRole === requiredRole;
  }

  getHomeUrlForRole(userRole: string): UrlTree {
    switch (userRole) {
      case 'faculty':
        return this.router.createUrlTree(['/faculty']);
      case 'admin':
        return this.router.createUrlTree(['/admin']);
      case 'superadmin':
        return this.router.createUrlTree(['/superadmin']);
      default:
        return this.router.createUrlTree(['/home']);
    }
  }
}
