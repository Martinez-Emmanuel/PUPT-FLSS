import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../../../environments/environment.dev';

import { Building } from '../buildings/buildings.service';

export interface Room {
  room_id?: number;
  room_code: string;
  building_id: number;
  building?: Building;
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

  constructor(private http: HttpClient) {}

  getRooms(): Observable<Room[]> {
    return this.http
      .get<{ success: boolean; message: string; data: Room[] }>(
        `${this.baseUrl}/rooms`
      )
      .pipe(map((response) => response.data));
  }

  getFloorLevels(buildingId: number): Observable<number[]> {
    return this.http
      .get<{ success: boolean; data: number[] }>(
        `${this.baseUrl}/rooms/floor-levels/${buildingId}`
      )
      .pipe(map((response) => response.data));
  }

  addRoom(room: Room): Observable<Room> {
    return this.http
      .post<{ success: boolean; message: string; data: Room }>(
        `${this.baseUrl}/addRoom`,
        room
      )
      .pipe(map((response) => response.data));
  }

  updateRoom(id: number, room: Room): Observable<Room> {
    return this.http
      .put<{ success: boolean; message: string; data: Room }>(
        `${this.baseUrl}/rooms/${id}`,
        room
      )
      .pipe(map((response) => response.data));
  }

  deleteRoom(id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/rooms/${id}`
      )
      .pipe(map(() => void 0));
  }
}
