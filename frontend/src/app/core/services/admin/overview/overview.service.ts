import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class OverviewService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  sendEmails(): Observable<any> {
    const url = `${this.baseUrl}/faculties/send-emails`;
    return this.http.post(url, {});
  }
}
