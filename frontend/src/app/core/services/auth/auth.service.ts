import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  login(code: string, password: string): Observable<any> {
    const loginData = {
      code: code,
      password: password,
    };
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }

  logout(): Observable<any> {
    const token = this.cookieService.get('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.baseUrl}/logout`, {}, { headers });
  }

  setToken(token: string, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    this.cookieService.set('token', token, expiryDate, '/');
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  setUserInfo(user: any, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    this.cookieService.set('user_id', user.id, expiryDate, '/');
    this.cookieService.set('user_name', user.name, expiryDate, '/');
    this.cookieService.set('user_code', user.code, expiryDate, '/');
    this.cookieService.set('user_role', user.role, expiryDate, '/');

    if (user.faculty) {
      this.cookieService.set(
        'faculty_id',
        user.faculty.faculty_id,
        expiryDate,
        '/'
      );
      this.cookieService.set(
        'faculty_email',
        user.faculty.faculty_email,
        expiryDate,
        '/'
      );
      this.cookieService.set(
        'faculty_type',
        user.faculty.faculty_type,
        expiryDate,
        '/'
      );
      this.cookieService.set(
        'faculty_unit',
        user.faculty.faculty_unit,
        expiryDate,
        '/'
      );
    }
  }

  clearCookies(): void {
    this.cookieService.deleteAll('/');
  }
}
