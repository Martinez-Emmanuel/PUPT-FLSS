import { Component, OnInit } from '@angular/core';
import { MaterialComponents } from '../../../imports/material.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialComponents],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  facultyCode: string | null = '';
  facultyName: string | null = '';
  facultyType: string | null = '';
  facultyEmail: string | null = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) {
    // For debugging because I don't have a logout button yet
    (window as any).homeComponent = this;
  }

  ngOnInit(): void {
    // Retrieve faculty information from cookies using the correct keys
    this.facultyCode = this.cookieService.get('user_code'); 
    this.facultyName = this.cookieService.get('user_name'); 
    this.facultyType = this.cookieService.get('faculty_type'); 
    this.facultyEmail = this.cookieService.get('faculty_email'); 

  }

  logout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        this.clearAllCookies();
        this.router.navigate(['/login']); 
      },
      error => {
        console.error('Logout failed', error);
        // Optionally handle error (e.g., show an error message)
      }
    );
  }

  private clearAllCookies() {
    // Clear all cookies
    this.cookieService.deleteAll('/', '.yourdomain.com'); // Make sure to include the path and domain if necessary
  }
}
