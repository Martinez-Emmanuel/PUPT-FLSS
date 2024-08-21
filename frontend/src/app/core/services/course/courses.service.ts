import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';  // Import CookieService

export interface Course {
  course_id: number; 
  subject_code: string;
  subject_title: string;
  lec_hours: number;
  lab_hours: number;
  total_units: number;
}

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private baseUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private cookieService: CookieService) {} 

  getCourses(): Observable<Course[]> {
    const token = this.cookieService.get('token'); 
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.get<Course[]>(`${this.baseUrl}/courses`, { headers })
      .pipe(catchError(this.handleError));  
  }

  submitPreferences(data: any): Observable<any> {
    const token = this.cookieService.get('token'); 
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log('Submitting to backend:', JSON.stringify(data)); 

    return this.http
      .post(`${this.baseUrl}/submitPreference`, data, { headers })
      .pipe(catchError(this.handleError)); 
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error.message || error);
  }
}
