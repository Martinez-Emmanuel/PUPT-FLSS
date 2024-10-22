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
}

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOverviewDetails(): Observable<OverviewDetails> {
    return this.http.get<OverviewDetails>(
      `${this.baseUrl}/overview-details`
    );
  }

  sendEmails(): Observable<any> {
    const url = `${this.baseUrl}/faculties/send-emails`;
    return this.http.post(url, {});
  }
}
