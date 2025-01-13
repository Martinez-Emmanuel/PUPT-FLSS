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
    return this.http
      .get<User[]>(`${this.baseUrl}/getAdmins`)
      .pipe(map((admins) => admins.filter((admin) => admin.role === 'admin')));
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
    return this.http
      .put<{ message: string; updated_fields: string[]; admin: User }>(
        `${this.baseUrl}/updateAdmins/${id}`,
        updatedAdmin
      )
      .pipe(map((response) => response.admin));
  }

  // Generate next admin code
  getNextAdminCode(): Observable<string> {
    return this.getAdmins().pipe(
      map((admins) => {
        const prefix = 'ADM';
        const year = new Date().getFullYear();
        const suffix = 'TG' + year;

        // Filter codes by current year and sort them
        const existingCodes = admins
          .filter(
            (admin) =>
              admin.code.startsWith(prefix) &&
              admin.code.endsWith(year.toString())
          )
          .map((admin) => admin.code)
          .sort((a, b) => {
            // Extract numbers and compare
            const numA = parseInt(a.match(/\d{3}/)?.[0] || '0', 10);
            const numB = parseInt(b.match(/\d{3}/)?.[0] || '0', 10);
            return numB - numA; // Sort in descending order
          });

        if (existingCodes.length === 0) {
          return `${prefix}001${suffix}`;
        }

        // Get the highest number from the sorted codes
        const lastCode = existingCodes[0];
        const match = lastCode.match(/\d{3}/);
        const lastNumber = match ? parseInt(match[0], 10) : 0;
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');

        return `${prefix}${nextNumber}${suffix}`;
      })
    );
  }
}
