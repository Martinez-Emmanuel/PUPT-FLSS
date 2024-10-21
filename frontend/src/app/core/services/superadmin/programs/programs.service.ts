import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';

export interface Curriculum {
  curriculum_id: number;
  curriculum_year: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  program_info: string;
  status: string;
  number_of_years: number;
  curricula: Curriculum[];
  curriculum_years?: string;
}

export interface AddProgramRequest {
  program_code: string;
  program_title: string;
  program_info: string;
  status: string;
  number_of_years: number;
}

export interface UpdateProgramRequest {
  program_code: string;
  program_title: string;
  program_info: string;
  status: string;
  number_of_years: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProgramsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Fetch all programs
  getPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.baseUrl}/programs`);
  }

  // Add a new program
  addProgram(program: AddProgramRequest): Observable<Program> {
    return this.http.post<Program>(`${this.baseUrl}/addProgram`, program, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  // Update an existing program
  updateProgram(
    program_id: number,
    program: UpdateProgramRequest
  ): Observable<Program> {
    const url = `${this.baseUrl}/updateProgram/${program_id}`;
    return this.http.put<Program>(url, program, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    });
  }

  // Delete a program
  deleteProgram(
    program_id: number
  ): Observable<{ message: string; success: boolean }> {
    const url = `${this.baseUrl}/deleteProgram/${program_id}`;
    return this.http.delete<{ message: string; success: boolean }>(url);
  }
}
