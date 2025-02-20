import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { environment } from '../../../../../../environments/environment.dev';

export interface User {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  suffix_name: string;
  code: string;
  role: string;
  email: string;
  faculty?: {
    faculty_type: string;
    faculty_units: number;
  };
  status?: string;
}

export interface Faculty {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  suffix_name: string;
  name: string;
  code: string;
  email: string;
  status: string;
  role: string;
  password?: string;
  faculty?: {
    id: number;
    user_id: number;
    faculty_type_id: number;
    fesr_user_id: number | null;
    created_at: string;
    updated_at: string;
    faculty_type: {
      faculty_type_id: number;
      faculty_type: string;
      regular_units: number;
      additional_units: number;
      created_at: string;
      updated_at: string;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getFaculty(): Observable<Faculty[]> {
    return this.http.get<any[]>(`${this.baseUrl}/faculty`).pipe(
      map((users) => {
        if (!Array.isArray(users)) {
          throw new Error('Unexpected response format');
        }

        return users.map((user) => ({
          id: user.id.toString(),
          last_name: user.last_name,
          first_name: user.first_name,
          middle_name: user.middle_name,
          suffix_name: user.suffix_name,
          name: `${user.last_name}, ${user.first_name}${
            user.middle_name ? ' ' + user.middle_name : ''
          }${user.suffix_name ? ' ' + user.suffix_name : ''}`,
          code: user.code,
          email: user.email || '',
          status: user.status || 'Active',
          role: user.role,
          faculty: user.faculty,
        }));
      }),
      catchError((error) => {
        return of([]);
      })
    );
  }

  addFaculty(faculty: Faculty): Observable<Faculty> {
    return this.http.post<Faculty>(`${this.baseUrl}/faculty`, faculty);
  }

  updateFaculty(
    id: string,
    faculty: Omit<Faculty, 'code'>
  ): Observable<Faculty> {
    return this.http.put<Faculty>(`${this.baseUrl}/faculty/${id}`, faculty);
  }
}
