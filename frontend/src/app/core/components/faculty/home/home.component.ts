import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';

import { forkJoin } from 'rxjs';

import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { CookieService } from 'ngx-cookie-service';
import { ReportsService } from '../../../services/admin/reports/reports.service';
import { FacultyNotificationService } from '../../../services/faculty/faculty-notification/faculty-notification.service';

import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import { fadeAnimation, cardEntranceSide } from '../../../animations/animations';

@Component({
  selector: 'app-home',
  imports: [MatSymbolDirective, LoadingComponent, FullCalendarModule, DatePipe],
  providers: [ReportsService, FacultyNotificationService, CookieService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimation, cardEntranceSide],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  isLoading = true;
  calendarOptions: CalendarOptions = {};
  events: EventInput[] = [];

  facultyId: string | null = '';
  facultyCode: string | null = '';
  facultyName: string | null = '';
  facultyType: string | null = '';
  facultyEmail: string | null = '';

  academicYear = '';
  semester = '';
  facultyStatus = {
    preferences_enabled: false,
    schedule_published: false,
    preferences_deadline: null as string | null,
    preferences_start: null as string | null,
  };

  constructor(
    private reportsService: ReportsService,
    private facultyNotifService: FacultyNotificationService,
    private cookieService: CookieService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadFacultyInfo();
    this.initializeCalendar();
    this.loadAllData();
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
   * Loads all necessary data for the faculty home page.
   *
   * This method fetches the faculty's schedule and notifications.
   * It updates the calendar events, academic year, semester, and faculty status.
   * If no faculty ID is available, it sets loading to false and returns early.
   */
  private loadAllData(): void {
    if (!this.facultyId) {
      this.isLoading = false;
      return;
    }

    const scheduleRequest = this.reportsService.getSingleFacultySchedule(
      Number(this.facultyId),
    );
    const notificationsRequest =
      this.facultyNotifService.getFacultyNotifications(Number(this.facultyId));

    forkJoin({
      schedule: scheduleRequest,
      notifications: notificationsRequest,
    }).subscribe({
      next: (response) => {
        // Process schedule data
        this.processScheduleResponse(response.schedule);
        this.updateCalendarEvents();

        // Process notifications data
        this.academicYear = response.notifications.academic_year;
        this.semester = response.notifications.semester;
        this.facultyStatus = response.notifications.faculty_status;

        // Update loading state and trigger change detection
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
        setTimeout(() => this.resizeCalendar(), 0);
      },
      error: (error) => {
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  /**
   * Process the schedule response and set up calendar events.
   * @param response - The schedule data from the back-end.
   */
  private processScheduleResponse(response: any): void {
    const facultySchedule = response.faculty_schedule;

    if (facultySchedule.is_published === 1) {
      this.events = this.createEventsFromSchedule(facultySchedule);
    } else {
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
