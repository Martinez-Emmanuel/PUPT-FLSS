import { Component, OnInit } from '@angular/core';
import { MaterialComponents } from '../../../imports/material.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

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

  constructor(private authService: AuthService, private router: Router) {
    // For debugging because i dont have logout button yet
    (window as any).homeComponent = this;
  }

  ngOnInit(): void {
    this.facultyCode = sessionStorage.getItem('faculty_code');
    this.facultyName = sessionStorage.getItem('faculty_name');
    this.facultyType = sessionStorage.getItem('faculty_type');
    this.facultyEmail = sessionStorage.getItem('faculty_email');
  }

  logout() {
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
