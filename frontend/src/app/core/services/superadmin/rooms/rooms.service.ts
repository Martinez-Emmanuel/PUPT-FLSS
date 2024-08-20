import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private baseUrl = 'http://127.0.0.1:8000/api';  // Replace with your actual API base URL
  

  constructor(private http: HttpClient) {}

  // Method to create HttpHeaders with Authorization
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  }

  // Get all rooms
  getRooms(): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`, { headers: this.getHeaders() });
  }

  // Add a new room
  addRoom(room: Room): Observable<Room> {
    return this.http.post<{ data: Room }>(`${this.baseUrl}/addRoom`, room, { headers: this.getHeaders() })
      .pipe(map(response => response.data));  // Extract the data from the response
  }

  // Update an existing room
  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http.put<{ data: Room }>(`${this.baseUrl}/rooms/${id}`, room, { headers: this.getHeaders() })
      .pipe(map(response => response.data));  // Extract the data from the response
  }

  // Delete a room
  deleteRoom(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/rooms/${id}`, { headers: this.getHeaders() });
  }
}
