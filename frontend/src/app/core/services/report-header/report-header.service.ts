import { Injectable } from '@angular/core';

import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { LogoCacheService } from '../cache/logo-cache.service';

import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class ReportHeaderService {
  private readonly UNIVERSITY_NAME =
    'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG CAMPUS';
  private readonly ADDRESS = 'Gen. Santos Ave. Upper Bicutan, Taguig City';
  private readonly MAROON_COLOR: [number, number, number] = [128, 0, 0];

  private readonly GOVT_LOGO_SIZE = 20;
  private readonly UNIV_LOGO_SIZE = 18;

  constructor(private logoCacheService: LogoCacheService) {}

  /**
   * Adds a standardized header to a PDF document
   * @param doc The jsPDF document instance
   * @param title The title to display in the header
   * @param currentY The current Y position (will be updated)
   * @param subtitle Optional subtitle to display below the title but before the line
   * @returns Observable<number> The new Y position after adding the header
   */
  public addHeader(
    doc: jsPDF,
    title: string,
    currentY: number = 15,
    subtitle?: string,
  ): Observable<number> {
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = currentY;

    return combineLatest([
      this.logoCacheService.universityLogo$,
      this.logoCacheService.governmentLogo$,
    ]).pipe(
      map(([universityLogo, governmentLogo]) => {
        currentY = topMargin;

        // Add University Logo (left)
        if (universityLogo) {
          doc.addImage(
            universityLogo,
            'PNG',
            margin,
            currentY - 5,
            this.UNIV_LOGO_SIZE,
            this.UNIV_LOGO_SIZE,
          );
        }

        // Add Government Logo (right)
        if (governmentLogo) {
          doc.addImage(
            governmentLogo,
            'PNG',
            pageWidth - margin - this.GOVT_LOGO_SIZE,
            currentY - 5,
            this.GOVT_LOGO_SIZE,
            this.GOVT_LOGO_SIZE,
          );
        }

        // Add University Name
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(
          this.MAROON_COLOR[0],
          this.MAROON_COLOR[1],
          this.MAROON_COLOR[2],
        );
        doc.text(this.UNIVERSITY_NAME, pageWidth / 2, currentY, {
          align: 'center',
        });
        currentY += 5;

        // Add Address
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(this.ADDRESS, pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // Add Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 5;

        // Add subtitle if provided
        if (subtitle) {
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
          currentY += 5;
        }

        // Add Separator Line
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 7;

        return currentY;
      }),
    );
  }
}
