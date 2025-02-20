import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.dev';

export interface Logo {
  id: number;
  type: 'university' | 'government';
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class LogoService {
  public apiUrl = `${environment.apiUrl}/logos`;

  constructor(private http: HttpClient) {}

  getAllLogos(): Observable<Logo[]> {
    return this.http.get<Logo[]>(this.apiUrl).pipe(catchError(() => of([])));
  }

  getLogo(type: string): Observable<Logo | null> {
    return this.http
      .get<Logo>(`${this.apiUrl}/details/${type}`)
      .pipe(catchError(() => of(null)));
  }

  uploadLogo(type: string, file: File): Observable<Logo> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('logo', file);

    return this.http.post<Logo>(`${this.apiUrl}/upload`, formData);
  }

  deleteLogo(type: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${type}`);
  }
}
