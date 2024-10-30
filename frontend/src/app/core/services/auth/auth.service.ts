// auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../environments/environment.dev';
import * as CryptoJS from 'crypto-js';
import { catchError } from 'rxjs/operators';

export enum UserRole {
  Faculty = 'faculty',
  Admin = 'admin',
  SuperAdmin = 'superadmin',
}

export interface UserInfo {
  id: number;
  name: string;
  code: string;
  role: UserRole;
  faculty?: {
    faculty_id: number;
    faculty_email: string;
    faculty_type: string;
    faculty_units: string;
  };
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: UserInfo;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private secretKey = environment.encryptionKey; 

  // Define cookie options for better security
  private cookieOptions = {
    path: '/',
    secure: environment.production, // Use secure cookies in production
    sameSite: 'Lax' as 'Lax' | 'Strict' | 'None',
    // httpOnly cannot be set via JavaScript; it's set on the server side
  };

  constructor(private http: HttpClient, private cookieService: CookieService) {}


  login(code: string, password: string): Observable<LoginResponse> {
    const loginData = { code, password };
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, loginData).pipe(
      catchError(this.handleError)
    );
  }

  logout(): Observable<any> {
    const token = this.getDecryptedToken();
    if (!token) {
      // If there's no token, simply clear cookies and return an error
      this.clearCookies();
      return throwError('No token found');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.post(`${this.baseUrl}/logout`, {}, { headers }).pipe(
      catchError((error) => {
        // Even if logout fails, clear cookies
        this.clearCookies();
        return throwError(error);
      })
    );
  }


  setToken(token: string, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    const encryptedToken = this.encryptData(token);
    this.cookieService.set('token', encryptedToken, {
      ...this.cookieOptions,
      expires: expiryDate,
    });
  }

  getToken(): string {
    const encryptedToken = this.cookieService.get('token');
    return this.decryptData(encryptedToken);
  }

  setUserInfo(user: UserInfo, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    const userInfoString = JSON.stringify(user);
    const encryptedUserInfo = this.encryptData(userInfoString);
    this.cookieService.set('user_info', encryptedUserInfo, {
      ...this.cookieOptions,
      expires: expiryDate,
    });
  }


  getUserInfo(): UserInfo | null {
    const encryptedUserInfo = this.cookieService.get('user_info');
    if (!encryptedUserInfo) {
      return null;
    }
    const decryptedData = this.decryptData(encryptedUserInfo);
    try {
      return JSON.parse(decryptedData) as UserInfo;
    } catch (error) {
      console.error('Failed to parse user info:', error);
      return null;
    }
  }


  clearCookies(): void {
    this.cookieService.delete('token', '/');
    this.cookieService.delete('user_info', '/');
  }


  private encryptData(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.secretKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return '';
    }
  }


  private decryptData(data: string): string {
    if (!data) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(data, this.secretKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  }


  private getDecryptedToken(): string {
    return this.getToken();
  }


  private handleError(error: any): Observable<never> {
    console.error('AuthService error:', error);
    return throwError(error);
  }
}
