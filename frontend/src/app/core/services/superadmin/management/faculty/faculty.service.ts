import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment.dev';
import { CookieService } from 'ngx-cookie-service';

export interface User {
  id: string;
  name: string;
  code: string;
  role: string;
  faculty?: {
    faculty_email: string;
    faculty_type: string;
    faculty_units: number;
  };
  status?: string; // Adjust if status is actually part of the response
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  faculty_email: string;
  faculty_type: string;
  faculty_units: number;
  status: string; // You might need to add this on the backend if you require it
  role: string;
  password?: string;  // Make password optional
}

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  private getHeaders(): HttpHeaders {
    const token = this.cookieService.get('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getFaculty(): Observable<Faculty[]> {
    return this.http.get<User[]>(`${this.baseUrl}/showAccounts`, { headers: this.getHeaders() }).pipe(
      map((users) => {
        if (!Array.isArray(users)) {
          throw new Error('Unexpected response format');
        }
  
        // Filter users by role (done in backend, so this is optional)
        return users
          .filter((user) => user.role === 'faculty')
          .map((user) => ({
            id: user.id.toString(),
            name: user.name,
            code: user.code,
            faculty_email: user.faculty?.faculty_email || '',
            faculty_type: user.faculty?.faculty_type || '',
            faculty_units: user.faculty?.faculty_units ?? 0,
            status: user.status || 'Active',
            role: user.role,
          }));
      }),
      catchError((error) => {
        console.error('Error fetching faculty:', error);
        return of([]); // Return an empty array on error
      })
    );
  }
  
  
  

  addFaculty(faculty: Faculty): Observable<Faculty> {
    return this.http.post<Faculty>(`${this.baseUrl}/addAccount`, faculty, { headers: this.getHeaders() });
  }
  
  
  updateFaculty(id: string, faculty: Omit<Faculty, 'code'>): Observable<Faculty> {
    return this.http.put<Faculty>(`${this.baseUrl}/updateAccount/${id}`, faculty, { headers: this.getHeaders() });
  }
  
  
  
  
  deleteFaculty(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteAccount/${id}`, { headers: this.getHeaders() });
  }
  
  
}
