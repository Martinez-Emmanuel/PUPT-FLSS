import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { AuthService } from '../../../services/auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ReportsService } from '../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../animations/animations';

import {
  FullCalendarComponent,
  FullCalendarModule,
} from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LoadingComponent, FullCalendarModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isLoading = true;
  activeYear = '';
  activeSemester = '';
  calendarOptions: CalendarOptions = {};
  events: EventInput[] = [];

  facultyId: string | null = '';
  facultyCode: string | null = '';
  facultyName: string | null = '';
  facultyType: string | null = '';
  facultyEmail: string | null = '';

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private router: Router,
    private cookieService: CookieService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
    this.initializeCalendar();
    this.fetchFacultySchedule();
  }

  ngAfterViewInit(): void {
    this.resizeCalendar();
  }

  private loadFacultyInfo(): void {
    this.facultyCode = this.cookieService.get('user_code');
    this.facultyName = this.cookieService.get('user_name');
    this.facultyId = this.cookieService.get('faculty_id');
    this.facultyType = this.cookieService.get('faculty_type');
    this.facultyEmail = this.cookieService.get('faculty_email');
  }

  private initializeCalendar(): void {
    this.calendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      editable: false,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: 2,
      dayMaxEventRows: 2,
      events: [],
      eventTimeFormat: {
        hour: 'numeric',
        minute: '2-digit',
        meridiem: 'short',
      },
      moreLinkText: (n) => `+${n} more`,
    };
  }

  private fetchFacultySchedule(): void {
    if (this.facultyId) {
      this.reportsService
        .getSingleFacultySchedule(Number(this.facultyId))
        .subscribe({
          next: (response) => {
            this.processScheduleResponse(response);
            this.updateCalendarEvents();
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
            setTimeout(() => this.resizeCalendar(), 0);
          },
          error: (error) => {
            console.error('Error fetching faculty schedule', error);
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
          },
        });
    } else {
      this.isLoading = false;
      this.changeDetectorRef.detectChanges();
    }
  }

  private processScheduleResponse(response: any): void {
    const facultySchedule = response.faculty_schedule;

    this.activeYear = `${facultySchedule.year_start}-${facultySchedule.year_end}`;
    this.activeSemester = `${facultySchedule.semester}${this.getOrdinalSuffix(
      facultySchedule.semester
    )} Semester`;

    if (facultySchedule.is_published === 1) {
      this.events = this.createEventsFromSchedule(facultySchedule);
    } else {
      console.log('Schedule is not published yet.');
      this.events = [];
    }
  }

  private updateCalendarEvents(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEvents();
      calendarApi.addEventSource(this.events);
    } else {
      this.calendarOptions = {
        ...this.calendarOptions,
        events: this.events,
      };
    }
  }

  private resizeCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.updateSize();
    }
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return 'st';
    if (j == 2 && k != 12) return 'nd';
    if (j == 3 && k != 13) return 'rd';
    return 'th';
  }

  private createEventsFromSchedule(facultySchedule: any): EventInput[] {
    const events: EventInput[] = [];
    const startDate = new Date(facultySchedule.start_date);
    const endDate = new Date(facultySchedule.end_date);

    facultySchedule.schedules.forEach((schedule: any) => {
      const dayIndex = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ].indexOf(schedule.day);
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        if (currentDate.getDay() === dayIndex) {
          events.push({
            title: `${schedule.course_details.course_code}`,
            start: `${currentDate.toISOString().split('T')[0]}T${
              schedule.start_time
            }`,
            end: `${currentDate.toISOString().split('T')[0]}T${
              schedule.end_time
            }`,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return events;
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
