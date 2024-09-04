import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment.dev';
import { CookieService } from 'ngx-cookie-service';

export interface Faculty {
  id: number;
  user_id: number;
  faculty_email: string;
  faculty_type: string;
  faculty_unit: string;
}

export interface User {
  code: string;
  id: string;
  name: string;
  password?: string;
  email: string;  // This is likely coming from 'faculty_email'
  role: string;
  status: string;
  faculty?: Faculty;  // Add this line to include the faculty object in the User interface
  passwordDisplay?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
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

  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/showAccounts`, { headers: this.getHeaders() }).pipe(
      map((users) => 
        users.filter(user => user.role === 'admin' || user.role === 'superadmin')
      )
    );
  }

  getAdminById(id: string): Observable<User> {  // Use 'id' instead of 'code'
    return this.http.get<User>(`${this.baseUrl}/accounts/${id}`, { headers: this.getHeaders() });
  }

  addAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/addAccount`, admin, { headers: this.getHeaders() });
  }

  updateAdmin(id: string, updatedAdmin: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/updateAccount/${id}`, updatedAdmin, {
      headers: this.getHeaders(),
    });
  }
  

  deleteAdmin(id: string): Observable<void> {  // Use 'id' instead of 'code'
    return this.http.delete<void>(`${this.baseUrl}/deleteAccount/${id}`, { headers: this.getHeaders() });
  }
}