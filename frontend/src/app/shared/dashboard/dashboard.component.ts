import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard-container">
      <h1>Welcome back {{ facultyCode }} {{ facultyName }} {{ facultyType }}</h1>
      <p>Please update your "{{ facultyEmail }}"</p>
      <button (click)="onLogout()">Log-out</button>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class DashboardComponent implements OnInit {
  facultyCode: string | null = '';
  facultyName: string | null = '';
  facultyType: string | null = '';
  facultyEmail: string | null = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.facultyCode = sessionStorage.getItem('faculty_code');
    this.facultyName = sessionStorage.getItem('faculty_name');
    this.facultyType = sessionStorage.getItem('faculty_type');
    this.facultyEmail = sessionStorage.getItem('faculty_email');

     // Check if token has expired
   const expiresAt = sessionStorage.getItem('expires_at');
   if (expiresAt) {
     const expirationTime = new Date(expiresAt).getTime() - new Date().getTime();
     if (expirationTime <= 0) {
       this.onLogout();
     } else {
       // Set a timeout to automatically log the user out when the token expires
       setTimeout(() => {
         this.onLogout();
       }, expirationTime);
     }
   } else {
    // If there is no token, redirect to login
    this.router.navigate(['/login']);
  }

  }

  onLogout() {
    this.authService.logout().subscribe(
      response => {
        console.log('Logout successful', response);
        sessionStorage.clear();
        this.router.navigate(['/login']);
      },
      error => {
        console.error('Logout failed', error);
      }
    );
  }
}