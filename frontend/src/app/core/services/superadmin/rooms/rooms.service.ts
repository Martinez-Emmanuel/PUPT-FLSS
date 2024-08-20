import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';  // Import CookieService

export interface Room {
  room_id?: number;
  room_code: string;
  location: string;
  floor: string;
  room_type: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private baseUrl = 'http://127.0.0.1:8000/api'; 
  
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
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`, { headers: this.getHeaders() });
  }

  addRoom(room: Room): Observable<Room> {
    return this.http.post<{ data: Room }>(`${this.baseUrl}/addRoom`, room, { headers: this.getHeaders() })
      .pipe(map(response => response.data));  
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<{ data: Room }>(`${this.baseUrl}/rooms/${id}`, room, { headers: this.getHeaders() })
      .pipe(map(response => response.data));  
  }

  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rooms/${id}`, { headers: this.getHeaders() });
  }
}
