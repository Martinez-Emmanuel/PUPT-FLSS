import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private cookieService: CookieService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Retrieve the token and user role from cookies
    const token = this.cookieService.get('token');
    const userRole = this.cookieService.get('user_role'); // Retrieve the user's role from cookies
    const expectedRole = next.data['role']; // Accessing 'role' using bracket notation

    if (token) {
      if (!expectedRole || this.isLoginRoute(next)) {
        // If no specific role is expected or trying to access the login page, redirect to dashboard
        this.redirectToDashboard(userRole);
        return false; // Prevent navigation to login or other non-dashboard routes
      }

      if (userRole !== expectedRole) {
        console.log(`Role mismatch! User role is ${userRole}, but expected role is ${expectedRole}. Redirecting accordingly.`);
        this.redirectToDashboard(userRole);
        return false;
      }

      console.log('Role match or no role restriction. Access granted.');
      return true;

    } else {
      console.log('No token found. Redirecting to login.');
      // Redirect to login if the user is not authenticated
      this.router.navigate(['/login']);
      return false;
    }
  }

  private isLoginRoute(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.path === 'login'; // Adjust the 'login' path as per your routing configuration
  }

  private redirectToDashboard(userRole: string): void {
    // Redirection logic based on role
    if (userRole === 'faculty') {
      this.router.navigate(['/faculty']);
    } else if (userRole === 'admin') {
      this.router.navigate(['/admin']);
    } else if (userRole === 'superadmin') {
      this.router.navigate(['/superadmin']);
    } else {
      this.router.navigate(['/dashboard']); // Default fallback to a general dashboard
    }
  }
}
