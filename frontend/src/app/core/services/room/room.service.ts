import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Room {
  room_id?: number;
  room_code: string;
  location: string;
  room_type: string;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private baseUrl = 'http://127.0.0.1:8000/api';
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  getRooms(): Observable<Room[]> {
    const headers = this.createHeaders();
    return this.http.get<Room[]>(`${this.baseUrl}/rooms`, { headers }).pipe(
      tap((rooms) => this.roomsSubject.next(rooms))
    );
  }

  addRoom(room: Room): Observable<Room> {
    const headers = this.createHeaders();
    return this.http.post<Room>(`${this.baseUrl}/addRoom`, room, { headers }).pipe(
      tap((newRoom) => {
        const currentRooms = this.roomsSubject.getValue();
        this.roomsSubject.next([...currentRooms, newRoom]);
      })
    );
  }

  updateRoom(room: Room): Observable<Room> {
    const headers = this.createHeaders();
    return this.http.put<Room>(`${this.baseUrl}/rooms/${room.room_id}`, room, { headers }).pipe(
      tap((updatedRoom) => {
        const currentRooms = this.roomsSubject.getValue();
        const updatedRooms = currentRooms.map((r) =>
          r.room_id === updatedRoom.room_id ? updatedRoom : r
        );
        this.roomsSubject.next(updatedRooms);
      })
    );
  }

  deleteRoom(room_id: number): Observable<void> {
    const headers = this.createHeaders();
    return this.http.delete<void>(`${this.baseUrl}/rooms/${room_id}`, { headers }).pipe(
      tap(() => {
        const currentRooms = this.roomsSubject.getValue();
        const updatedRooms = currentRooms.filter((r) => r.room_id !== room_id);
        this.roomsSubject.next(updatedRooms);
      })
    );
  }
}
