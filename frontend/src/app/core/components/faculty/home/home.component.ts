import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { CookieService } from 'ngx-cookie-service';
import { ReportsService } from '../../../services/admin/reports/reports.service';
import { FacultyNotificationService, Notification } from '../../../services/faculty/faculty-notification/faculty-notification.service';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import { fadeAnimation, cardEntranceSide } from '../../../animations/animations';

@Component({
    selector: 'app-home',
    imports: [MatSymbolDirective, LoadingComponent, FullCalendarModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    animations: [fadeAnimation, cardEntranceSide]
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

  notifications: Notification[] = [];

  constructor(
    private reportsService: ReportsService,
    private facultyNotifService: FacultyNotificationService,
    private cookieService: CookieService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
    this.initializeCalendar();
    this.fetchFacultySchedule();
    this.fetchNotifications();
  }

  ngAfterViewInit(): void {
    this.resizeCalendar();
  }

  /**
   * Load faculty information from cookies.
   */
  private loadFacultyInfo(): void {
    this.facultyCode = this.cookieService.get('user_code');
    this.facultyName = this.cookieService.get('user_name');
    this.facultyId = this.cookieService.get('faculty_id');
    this.facultyType = this.cookieService.get('faculty_type');
    this.facultyEmail = this.cookieService.get('user_email');
  }

  /**
   * Initialize the calendar with default options.
   */
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

  /**
   * Fetch faculty schedule from the back-end.
   */
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

  /**
   * Fetch notifications from the back-end.
   */
  private fetchNotifications(): void {
    this.facultyNotifService.getFacultyNotifications().subscribe({
      next: (response) => {
        this.notifications = response.notifications.map(notification => ({
          faculty_notifications_id: notification.faculty_notifications_id,
          faculty_id: notification.faculty_id,
          message: notification.message,
          created_at: notification.created_at,
          updated_at: notification.updated_at,
          is_read: notification.is_read,
          timestamp: new Date(notification.created_at).toLocaleString()
        }));
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching notifications', error);
      },
    });
  }

  /**
   * Process the schedule response and set up calendar events.
   * @param response - The schedule data from the back-end.
   */
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

  /**
   * Update calendar events based on the fetched schedule.
   */
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

  /**
   * Resize the calendar to fit the container.
   */
  private resizeCalendar(): void {
    if (this.calendarComponent && this.calendarComponent.getApi()) {
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.updateSize();
    }
  }

  /**
   * Get ordinal suffix for the semester number.
   * @param num - The semester number.
   * @returns The ordinal suffix as a string.
   */
  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }

  /**
   * Create calendar events from the faculty schedule.
   * @param facultySchedule - The schedule data.
   * @returns An array of EventInput objects.
   */
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
          const dateStr = currentDate.toISOString().split('T')[0];
          events.push({
            title: `${schedule.course_details.course_code}`,
            start: `${dateStr}T${schedule.start_time}`,
            end: `${dateStr}T${schedule.end_time}`,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    return events;
  }
}
