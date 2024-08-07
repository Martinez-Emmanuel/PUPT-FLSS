import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, throwError } from 'rxjs';

export interface Course {
  course_id: number; // Add course_id
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
  private baseUrl = 'http://127.0.0.1:8000/api'; // Replace with your backend URL

  constructor(private http: HttpClient) {}

  getCourses(): Observable<Course[]> {
    const token = sessionStorage.getItem('token'); // Assume token is stored in session storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    return this.http.get<Course[]>(`${this.baseUrl}/courses`, { headers });
  }

  submitPreferences(data: any): Observable<any> {
    const token = sessionStorage.getItem('token'); // Assume token is stored in session storage
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    console.log('Submitting to backend:', JSON.stringify(data)); // Add logging here

    return this.http
      .post(`${this.baseUrl}/submitPreference`, data, { headers })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred', error);
    return throwError(error.message || error);
  }
}
