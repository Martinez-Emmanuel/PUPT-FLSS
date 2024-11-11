import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../../../environments/environment.dev';

export interface Room {
  room_id?: number;
  room_code: string;
  location: string;
  floor_level: string;
  room_type: string;
  capacity: number;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
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

  getRooms(): Observable<Room[]> {
    return this.http
      .get<{ success: boolean; message: string; data: Room[] }>(
        `${this.baseUrl}/rooms`,
        { headers: this.getHeaders() }
      )
      .pipe(map((response) => response.data));
  }

  addRoom(room: Room): Observable<Room> {
    return this.http
      .post<{ success: boolean; message: string; data: Room }>(
        `${this.baseUrl}/addRoom`,
        room,
        { headers: this.getHeaders() }
      )
      .pipe(map((response) => response.data));
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http
      .put<{ success: boolean; message: string; data: Room }>(
        `${this.baseUrl}/rooms/${id}`,
        room,
        { headers: this.getHeaders() }
      )
      .pipe(map((response) => response.data));
  }

  deleteRoom(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.baseUrl}/rooms/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
