import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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
  private storageUrl = environment.apiUrl.replace('/api', '/storage');

  constructor(private http: HttpClient) {}

  getAllLogos(): Observable<Logo[]> {
    return this.http
      .get<Logo[]>(this.apiUrl)
      .pipe(map((logos) => logos.map((logo) => this.addImageUrl(logo))));
  }

  getLogo(type: string): Observable<Logo> {
    return this.http
      .get<Logo>(`${this.apiUrl}/details/${type}`)
      .pipe(map((logo) => this.addImageUrl(logo)));
  }

  uploadLogo(type: string, file: File): Observable<Logo> {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('logo', file);

    return this.http
      .post<Logo>(`${this.apiUrl}/upload`, formData)
      .pipe(map((logo) => this.addImageUrl(logo)));
  }

  deleteLogo(type: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${type}`);
  }

  private addImageUrl(logo: Omit<Logo, 'url'>): Logo {
    const timestamp = new Date().getTime();
    return {
      ...logo,
      url: `${this.storageUrl}/${logo.file_path}?t=${timestamp}`,
    };
  }
}
