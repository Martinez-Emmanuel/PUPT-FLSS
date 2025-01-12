import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';

export interface Building {
  building_id: number;
  building_name: string;
  floor_levels: number;
}

@Injectable({
  providedIn: 'root',
})
export class BuildingsService {
  private apiUrl = `${environment.apiUrl}/buildings`;

  constructor(private http: HttpClient) {}

  getBuildings(): Observable<Building[]> {
    return this.http.get<Building[]>(this.apiUrl);
  }

  getBuilding(id: number): Observable<Building> {
    return this.http.get<Building>(`${this.apiUrl}/${id}`);
  }

  createBuilding(building: Partial<Building>): Observable<Building> {
    return this.http.post<Building>(this.apiUrl, building);
  }

  updateBuilding(
    id: number,
    building: Partial<Building>
  ): Observable<{ message: string; success: boolean; data: Building }> {
    return this.http.put<{ message: string; success: boolean; data: Building }>(
      `${this.apiUrl}/${id}`,
      building
    );
  }

  deleteBuilding(
    id: number
  ): Observable<{ message: string; success: boolean }> {
    return this.http.delete<{ message: string; success: boolean }>(
      `${this.apiUrl}/${id}`
    );
  }
}
