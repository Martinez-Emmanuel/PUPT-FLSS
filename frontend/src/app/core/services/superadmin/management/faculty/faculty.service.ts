import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment.dev';
import { CookieService } from 'ngx-cookie-service';

export interface Faculty {
  id: string;
  name: string;
  faculty_email: string;
  type: string;
  unitsAssigned: number;
  status: string;
  role: string; 
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
    return this.http.get<Faculty[]>(`${this.baseUrl}/showAccounts`, { headers: this.getHeaders() }).pipe(
      map((users) =>
        users.filter((user) => user.role === 'faculty')
      )
    );
  }

  addFaculty(faculty: Faculty): Observable<Faculty[]> {
    return this.http.post<Faculty[]>(`${this.baseUrl}/addAccount`, faculty, { headers: this.getHeaders() });
  }

  updateFaculty(index: number, updatedFaculty: Faculty): Observable<Faculty[]> {
    return this.http.put<Faculty[]>(`${this.baseUrl}/updateAccount/${updatedFaculty.id}`, updatedFaculty, { headers: this.getHeaders() });
  }

  deleteFaculty(index: number): Observable<Faculty[]> {
    return this.http.delete<Faculty[]>(`${this.baseUrl}/deleteAccount/${index}`, { headers: this.getHeaders() });
  }
}
