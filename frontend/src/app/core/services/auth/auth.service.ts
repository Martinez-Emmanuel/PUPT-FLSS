import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<any> {
    const loginData = {
      faculty_code: username,
      faculty_password: password
    };
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {});
  }
}
