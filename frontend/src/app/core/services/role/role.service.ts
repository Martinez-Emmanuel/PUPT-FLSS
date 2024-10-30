import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  // Define a map of roles to their respective home URLs
  private readonly roleHomeMap: Record<string, string> = {
    faculty: '/faculty',
    admin: '/admin',
    superadmin: '/superadmin',
  };

  constructor(private router: Router) {}

  // Check if the user has the required role
  hasRequiredRole(userRole: string, requiredRole: string): boolean {
    return !requiredRole || userRole === requiredRole;
  }

  // Get home URL based on the user's role
  getHomeUrlForRole(userRole: string): UrlTree {
    // Default to '/home' if the role is not defined in the map
    return this.router.createUrlTree([this.roleHomeMap[userRole] || '/home']);
  }
}
