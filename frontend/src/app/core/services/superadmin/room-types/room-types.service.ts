import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment.dev';

export interface RoomType {
  room_type_id: number;
  type_name: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class RoomTypesService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRoomTypes(): Observable<RoomType[]> {
    return this.http
      .get<ApiResponse<RoomType[]>>(`${this.baseUrl}/room-types`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  getRoomType(id: number): Observable<RoomType> {
    return this.http
      .get<ApiResponse<RoomType>>(`${this.baseUrl}/room-types/${id}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  createRoomType(
    roomType: Partial<RoomType>
  ): Observable<ApiResponse<RoomType>> {
    return this.http
      .post<ApiResponse<RoomType>>(`${this.baseUrl}/room-types`, roomType)
      .pipe(catchError(this.handleError));
  }

  updateRoomType(
    id: number,
    roomType: Partial<RoomType>
  ): Observable<ApiResponse<RoomType>> {
    return this.http
      .put<ApiResponse<RoomType>>(`${this.baseUrl}/room-types/${id}`, roomType)
      .pipe(catchError(this.handleError));
  }

  deleteRoomType(id: number): Observable<ApiResponse<void>> {
    return this.http
      .delete<ApiResponse<void>>(`${this.baseUrl}/room-types/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Something bad happened; please try again later.';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = error.error?.message || errorMessage;
    }

    console.error('An error occurred:', error);
    return throwError(() => new Error(errorMessage));
  }
}
