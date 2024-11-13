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
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  getToken(): string {
    return this.cookieService.get('token');
  }

  setToken(token: string, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    this.cookieService.set('token', token, expiryDate, '/', '', true, 'Strict');
  }

  setUserInfo(user: any, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    this.cookieService.set(
      'user_id',
      user.id,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'user_name',
      user.name,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'user_code',
      user.code,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'user_role',
      user.role,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );

    if (user.faculty) {
      this.cookieService.set(
        'faculty_id',
        user.faculty.faculty_id,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
      this.cookieService.set(
        'faculty_email',
        user.faculty.faculty_email,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
      this.cookieService.set(
        'faculty_type',
        user.faculty.faculty_type,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
      this.cookieService.set(
        'faculty_units',
        user.faculty.faculty_units,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
    }
  }

  clearCookies(): void {
    this.cookieService.deleteAll('/');
  }
}
