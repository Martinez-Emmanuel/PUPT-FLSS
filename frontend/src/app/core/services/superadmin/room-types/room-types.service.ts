import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.dev';

export interface RoomType {
  room_type_id: number;
  type_name: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class RoomTypesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoomTypes(): Observable<RoomType[]> {
    return this.http
      .get<{ success: boolean; message: string; data: RoomType[] }>(
        `${this.baseUrl}/room-types`
      )
      .pipe(map((response) => response.data));
  }

  getRoomType(id: number): Observable<RoomType> {
    return this.http
      .get<{ success: boolean; message: string; data: RoomType }>(
        `${this.baseUrl}/room-types/${id}`
      )
      .pipe(map((response) => response.data));
  }

  createRoomType(roomType: Partial<RoomType>): Observable<RoomType> {
    return this.http
      .post<{ success: boolean; message: string; data: RoomType }>(
        `${this.baseUrl}/room-types`,
        roomType
      )
      .pipe(map((response) => response.data));
  }

  updateRoomType(
    id: number,
    roomType: Partial<RoomType>
  ): Observable<RoomType> {
    return this.http
      .put<{ success: boolean; message: string; data: RoomType }>(
        `${this.baseUrl}/room-types/${id}`,
        roomType
      )
      .pipe(map((response) => response.data));
  }

  deleteRoomType(id: number): Observable<void> {
    return this.http
      .delete<{ success: boolean; message: string }>(
        `${this.baseUrl}/room-types/${id}`
      )
      .pipe(
        map(() => void 0),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `,
        error.error
      );
      if (error.status === 422) {
        return throwError(
          () => new Error(error.error.message || 'Error deleting room type')
        );
      }
    }
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
