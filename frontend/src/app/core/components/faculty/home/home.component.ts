import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { fadeAnimation } from '../../../animations/animations';

import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatSymbolDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
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
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
  }

  public logout(): void {
    this.authService.logout().subscribe({
      next: (response) => {
        console.log('Logout successful', response);
        this.clearAllCookies();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout failed', error);
      },
    });
  }

  private loadFacultyInfo(): void {
    this.facultyCode = this.cookieService.get('user_code'); 
    this.facultyName = this.cookieService.get('user_name'); 
    this.facultyType = this.cookieService.get('faculty_type'); 
    this.facultyEmail = this.cookieService.get('faculty_email'); 
  }

  private clearAllCookies(): void {
    this.cookieService.deleteAll('/', '.yourdomain.com');
  }
}
