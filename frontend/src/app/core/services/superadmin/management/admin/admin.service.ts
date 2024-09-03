import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../../environments/environment.dev';
import { CookieService } from 'ngx-cookie-service';

export interface Admin {
  id: string;
  name: string;
  password: string;
  email: string;
  role: string;
  status: string;
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

  getAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.baseUrl}/showAccounts`, { headers: this.getHeaders() }).pipe(
      map((users) =>
        users.filter((user) => user.role === 'admin' || user.role === 'super_admin')
      )
    );
  }

  addAdmin(admin: Admin): Observable<Admin[]> {
    return this.http.post<Admin[]>(`${this.baseUrl}/addAccount`, admin, { headers: this.getHeaders() });
  }

  updateAdmin(index: number, updatedAdmin: Admin): Observable<Admin[]> {
    return this.http.put<Admin[]>(`${this.baseUrl}/updateAccount/${updatedAdmin.id}`, updatedAdmin, { headers: this.getHeaders() });
  }

  deleteAdmin(index: number): Observable<Admin[]> {
    return this.http.delete<Admin[]>(`${this.baseUrl}/deleteAccount/${index}`, { headers: this.getHeaders() });
  }
}
