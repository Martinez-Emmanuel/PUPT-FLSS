import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment.dev';

export interface FacultyType {
  faculty_type_id: number;
  faculty_type: string;
  regular_units: number;
  additional_units: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class FacultyTypeService {
  private apiUrl = `${environment.apiUrl}/faculty-types`;

  constructor(private http: HttpClient) {}

  getFacultyTypes(): Observable<FacultyType[]> {
    return this.http.get<FacultyType[]>(this.apiUrl);
  }

  getFacultyType(id: number): Observable<FacultyType> {
    return this.http.get<FacultyType>(`${this.apiUrl}/${id}`);
  }

  createFacultyType(data: Partial<FacultyType>): Observable<FacultyType> {
    return this.http.post<FacultyType>(this.apiUrl, data);
  }

  updateFacultyType(
    id: number,
    data: Partial<FacultyType>
  ): Observable<FacultyType> {
    return this.http.put<FacultyType>(`${this.apiUrl}/${id}`, data);
  }

  deleteFacultyType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
