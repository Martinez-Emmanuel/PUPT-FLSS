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
      // User is authenticated

      if (this.isLoginRoute(next)) {
        // If authenticated and trying to access login page, redirect to unauthenticated page
        return this.redirectToUnauthenticated();
      }

      if (expectedRole && userRole !== expectedRole) {
        // If role does not match the expected role, redirect to unauthenticated page
        return this.redirectToUnauthenticated();
      }

      // Role matches or no role restriction
      console.log('Role match or no role restriction. Access granted.');
      return true;

    } else {
      // User is not authenticated
      console.log('No token found. Redirecting to login.');
      // Redirect to login if the user is not authenticated
      return this.router.createUrlTree(['/login']);
    }
  }

  private isLoginRoute(route: ActivatedRouteSnapshot): boolean {
    return route.routeConfig?.path === 'login'; // Adjust the 'login' path as per your routing configuration
  }

  private redirectToUnauthenticated(): UrlTree {
    console.log('Redirecting to unauthenticated page.');
    return this.router.createUrlTree(['/unauthenticated']);
  }
}
