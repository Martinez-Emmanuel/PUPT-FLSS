import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../../../environments/environment.dev';

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
  last_name: string;
  first_name: string;
  middle_name?: string;
  suffix_name?: string;
  password?: string;
  email: string;
  role: string;
  status: string;
  faculty?: Faculty;
  passwordDisplay?: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch all admins
  getAdmins(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getAdmins`);
  }

  // Fetch a specific admin by ID
  getAdminById(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/getAdmins/${id}`);
  }

  // Add a new admin
  addAdmin(admin: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/addAdmins`, admin);
  }

  // Update an existing admin
  updateAdmin(id: string, updatedAdmin: User): Observable<User> {
    return this.http.put<User>(
      `${this.baseUrl}/updateAdmins/${id}`,
      updatedAdmin
    );
  }

  // Delete an admin by ID
  deleteAdmin(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/deleteAdmins/${id}`);
  }

  // Generate next admin code
  getNextAdminCode(role: string): Observable<string> {
    return this.getAdmins().pipe(
      map((admins) => {
        const prefix = role.toLowerCase() === 'superadmin' ? 'SDM' : 'ADM';
        const year = new Date().getFullYear();
        const suffix = 'TG' + year;

        // Filter codes by role prefix and current year
        const existingCodes = admins
          .filter(
            (admin) =>
              admin.code.startsWith(prefix) &&
              admin.code.endsWith(year.toString())
          )
          .map((admin) => admin.code);

        if (existingCodes.length === 0) {
          return `${prefix}001${suffix}`;
        }

        // Extract the numeric portions and find the highest number
        const numbers = existingCodes.map((code) => {
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
