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

  // Generate next admin code
  getNextAdminCode(role: string): Observable<string> {
    return this.getAdmins().pipe(
      map(admins => {
        const prefix = role.toLowerCase() === 'superadmin' ? 'SDM' : 'ADM';
        const year = new Date().getFullYear();
        const suffix = 'TG' + year;

        // Filter codes by role prefix and current year
        const existingCodes = admins
          .filter(admin =>
            admin.code.startsWith(prefix) &&
            admin.code.endsWith(year.toString())
          )
          .map(admin => admin.code);

        if (existingCodes.length === 0) {
          return `${prefix}001${suffix}`;
        }

        // Extract the numeric portions and find the highest number
        const numbers = existingCodes.map(code => {
          const match = code.match(/\d{3}/);
          return match ? parseInt(match[0], 10) : 0;
        });

        const maxNumber = Math.max(...numbers);
        const nextNumber = (maxNumber + 1).toString().padStart(3, '0');

        return `${prefix}${nextNumber}${suffix}`;
      })
    );
  }
}