import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface OverviewDetails {
  activeAcademicYear: string;
  activeSemester: string;
  activeFacultyCount: number;
  activeProgramsCount: number;
  activeCurricula: Array<{
    curriculum_id: number;
    curriculum_year: string;
  }>;
  preferencesProgress: number;
  schedulingProgress: number;
  roomUtilization: number;
  publishProgress: number;
  preferencesSubmissionEnabled: boolean;
  facultyWithSchedulesCount: number;
  global_deadline: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOverviewDetails(): Observable<OverviewDetails> {
    return this.http.get<OverviewDetails>(`${this.baseUrl}/overview-details`);
  }

  sendScheduleEmail(): Observable<any> {
    const url = `${this.baseUrl}/email-all-faculty-schedule`;
    return this.http.post(url, {});
  }

  toggleAllSchedules(is_published: boolean): Observable<any> {
    return this.http.post(`${this.baseUrl}/toggle-all-schedule`, {
      is_published,
    });
  }
}
