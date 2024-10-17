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
  faculty_units: string;
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

  // Fetch all admins
  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAdmins`, { headers: this.getHeaders() });
  }

  // Fetch a specific admin by ID
  getAdminById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getAdmins/${id}`, { headers: this.getHeaders() });
  }

  // Add a new admin
  addAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/addAdmins`, admin, { headers: this.getHeaders() });
  }

  // Update an existing admin
  updateAdmin(id: string, updatedAdmin: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/updateAdmins/${id}`, updatedAdmin, {
      headers: this.getHeaders(),
    });
  }

  // Delete an admin by ID
  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteAdmins/${id}`, { headers: this.getHeaders() });
  }
}