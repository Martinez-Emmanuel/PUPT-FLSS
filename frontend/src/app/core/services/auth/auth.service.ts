import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../../environments/environment.dev';
import { environmentOAuth } from '../../../../environments/env.auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private hrisUrl = environmentOAuth.hrisUrl;
  private clientId = environmentOAuth.clientId;
  private clientSecret = environmentOAuth.clientSecret;

  constructor(private http: HttpClient, private cookieService: CookieService) {}

  // ==============================
  // OAuth-based HRIS auth methods
  // ==============================
  checkHrisHealth(): Observable<boolean> {
    return this.http.get(`${this.hrisUrl}/health`).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  hrisLogin(email: string, password: string): Observable<any> {
    const loginData = {
      username: email,
      password: password,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };
    return this.http.post(`${this.hrisUrl}/oauth/token`, loginData);
  }

  validateHrisToken(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.hrisUrl}/oauth/validate`, {}, { headers });
  }

  processFacultyData(facultyData: any, hrisToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/oauth/process-faculty`, {
      faculty_data: facultyData,
      hris_token: hrisToken,
    });
  }

  // ==============================
  // Internal FLSS auth methods
  // ==============================
  flssLogin(email: string, password: string): Observable<any> {
    const loginData = {
      email: email,
      password: password,
    };
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {});
  }

  // ==============================
  // Cookies handling methods
  // ==============================
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
      'user_email',
      user.email,
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
