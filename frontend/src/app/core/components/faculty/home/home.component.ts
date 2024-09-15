import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { fadeAnimation } from '../../../animations/animations';

import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatSymbolDirective, FullCalendarModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
})
export class HomeComponent implements OnInit {
  activeYear = '2024-2025';
  activeSemester = '1st Semester';
  calendarOptions: any;

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
    this.initializeCalendar();
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      initialView: 'dayGridMonth',
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: [],
      dateClick: this.handleDateClick.bind(this),
    };
  }

  private loadFacultyInfo(): void {
    this.facultyCode = this.cookieService.get('user_code');
    this.facultyName = this.cookieService.get('user_name');
    this.facultyType = this.cookieService.get('faculty_type');
    this.facultyEmail = this.cookieService.get('faculty_email');
  }

  private handleDateClick(arg: any): void {
    alert('Date clicked: ' + arg.dateStr);
  }

  private clearAllCookies(): void {
    this.cookieService.deleteAll('/', '.yourdomain.com');
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
}
