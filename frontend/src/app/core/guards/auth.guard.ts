import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('user_role'); // Retrieve the user's role from sessionStorage
    const expectedRole = next.data['role']; // Accessing 'role' using bracket notation
    
    if (token) {
      if (expectedRole && userRole !== expectedRole) {
        console.log(`Role mismatch! User role is ${userRole}, but expected role is ${expectedRole}. Redirecting accordingly.`);


        // Redirection logic based on role
        if (userRole === 'faculty') {
          this.router.navigate(['/faculty']);
        } else if (userRole === 'admin') {
          this.router.navigate(['/admin']);
        } else if (userRole === 'superadmin') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/login']); // Default fallback
        }
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
}
