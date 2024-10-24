import { Injectable } from '@angular/core';

import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ReportsService } from '../reports/reports.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root',
})
export class ReportGenerationService {
  constructor(private reportsService: ReportsService) {}

  /**
   * Generate Faculty Schedule Report as a Blob
   */
  generateFacultyReport(): Observable<Blob> {
    return this.reportsService.getFacultySchedulesReport().pipe(
      map((response) => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        const faculties = response.faculty_schedule_reports.faculties.map(
          (faculty: any) => ({
            facultyName: faculty.faculty_name,
            facultyCode: faculty.faculty_code,
            facultyType: faculty.faculty_type,
            facultyUnits: faculty.assigned_units,
            isEnabled: faculty.is_published === 1,
            facultyId: faculty.faculty_id,
            schedules: faculty.schedules || [],
            academicYear: `${response.faculty_schedule_reports.year_start}-${response.faculty_schedule_reports.year_end}`,
            semester: this.getSemesterDisplay(
              response.faculty_schedule_reports.semester
            ),
          })
        );

        faculties.forEach(
          (faculty: { facultyName: any; schedules: any }, index: number) => {
            if (index > 0) {
              doc.addPage();
            }

            let currentY = this.drawHeader(
              doc,
              topMargin,
              pageWidth,
              margin,
              logoSize,
              `${faculty.facultyName} Schedule`,
              this.getAcademicYearSubtitle(faculty)
            );

            this.drawScheduleTable(
              doc,
              faculty.schedules ?? [],
              currentY,
              margin,
              pageWidth
            );
          }
        );

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating Faculty Report:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Generate Programs Schedule Report as a Blob
   */
  generateProgramsReport(): Observable<Blob> {
    return this.reportsService.getProgramSchedulesReport().pipe(
      map((response) => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        const programs = response.programs_schedule_reports.programs.map(
          (program: any) => ({
            program_id: program.program_id,
            program_code: program.program_code,
            program_title: program.program_title,
            year_levels: program.year_levels.map((yl: any) => ({
              year_level: yl.year_level,
              sections: yl.sections.map((sec: any) => ({
                section_name: sec.section_name,
                schedules: sec.schedules,
              })),
            })),
            academicYear: `${response.programs_schedule_reports.year_start}-${response.programs_schedule_reports.year_end}`,
            semester: this.getSemesterDisplay(
              response.programs_schedule_reports.semester
            ),
          })
        );

        programs.forEach(
          (program: {
            year_levels: any[];
            program_code: any;
            academicYear: any;
            semester: any;
          }) => {
            program.year_levels.forEach(
              (yearLevel: { sections: any[]; year_level: any }) => {
                yearLevel.sections.forEach(
                  (section: { section_name: any; schedules: any }) => {
                    doc.addPage();

                    let currentY = this.drawHeader(
                      doc,
                      topMargin,
                      pageWidth,
                      margin,
                      logoSize,
                      `${program.program_code} - Year ${yearLevel.year_level} - Section ${section.section_name}`,
                      `For Academic Year ${program.academicYear}, ${program.semester}`
                    );

                    this.drawScheduleTable(
                      doc,
                      section.schedules ?? [],
                      currentY,
                      margin,
                      pageWidth
                    );
                  }
                );
              }
            );
          }
        );

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating Programs Report:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Generate Rooms Schedule Report as a Blob
   */
  generateRoomsReport(): Observable<Blob> {
    return this.reportsService.getRoomSchedulesReport().pipe(
      map((response) => {
        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        const rooms = response.room_schedule_reports.rooms.map((room: any) => ({
          roomId: room.room_id,
          roomCode: room.room_code,
          location: room.location,
          floorLevel: room.floor_level,
          capacity: room.capacity,
          schedules: room.schedules,
          academicYear: `${response.room_schedule_reports.year_start}-${response.room_schedule_reports.year_end}`,
          semester: this.getSemesterDisplay(
            response.room_schedule_reports.semester
          ),
        }));

        rooms.forEach(
          (room: { roomCode: any; schedules: any }, index: number) => {
            if (index > 0) {
              doc.addPage();
            }

            let currentY = this.drawHeader(
              doc,
              topMargin,
              pageWidth,
              margin,
              logoSize,
              `Room ${room.roomCode} Schedule`,
              this.getAcademicYearSubtitle(room)
            );

            this.drawScheduleTable(
              doc,
              room.schedules ?? [],
              currentY,
              margin,
              pageWidth
            );
          }
        );

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating Rooms Report:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Generate all selected reports and return an array of { type: string; blob: Blob; }
   */
  generateSelectedReports(selections: {
    faculty: boolean;
    programs: boolean;
    rooms: boolean;
  }): Observable<{ type: string; blob: Blob }[]> {
    const reportObservables: { type: string; observable: Observable<Blob> }[] =
      [];

    if (selections.faculty) {
      reportObservables.push({
        type: 'faculty',
        observable: this.generateFacultyReport(),
      });
    }

    if (selections.programs) {
      reportObservables.push({
        type: 'programs',
        observable: this.generateProgramsReport(),
      });
    }

    if (selections.rooms) {
      reportObservables.push({
        type: 'rooms',
        observable: this.generateRoomsReport(),
      });
    }

    if (reportObservables.length === 0) {
      return of([]);
    }

    const observablesWithType = reportObservables.map((r) =>
      r.observable.pipe(map((blob) => ({ type: r.type, blob })))
    );

    return forkJoin(observablesWithType).pipe(
      catchError((error) => {
        console.error('Error generating selected reports:', error);
        return of([]);
      })
    );
  }

  /**
   * Helper to draw the header on the PDF
   */
  private drawHeader(
    doc: jsPDF,
    startY: number,
    pageWidth: number,
    margin: number,
    logoSize: number,
    title: string,
    subtitle: string
  ): number {
    const logoUrl =
      'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
    const logoXPosition = pageWidth / 25 + 25;
    doc.addImage(logoUrl, 'PNG', logoXPosition, startY - 5, logoSize, logoSize);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
      pageWidth / 2,
      startY,
      { align: 'center' }
    );

    let currentY = startY + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'Gen. Santos Ave. Upper Bicutan, Taguig City',
      pageWidth / 2,
      currentY,
      { align: 'center' }
    );

    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    if (subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    return currentY;
  }

  /**
   * Helper to draw the schedule table on the PDF
   */
  private drawScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number
  ): void {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayColumnWidth = (pageWidth - margin * 2) / days.length;
    const pageHeight = doc.internal.pageSize.height;
    const maxContentHeight = pageHeight - margin;

    let currentY = startY;
    let maxYPosition = currentY;

    const startNewPage = () => {
      doc.addPage();
      currentY = this.drawHeader(
        doc,
        15,
        pageWidth,
        margin,
        22,
        '', // Title depends on the report
        '' // Subtitle depends on the report
      );

      // Draw day headers on new page
      days.forEach((day, index) => {
        const xPosition = margin + index * dayColumnWidth;
        doc.setFillColor(128, 0, 0);
        doc.setTextColor(255, 255, 255);
        doc.rect(xPosition, currentY, dayColumnWidth, 10, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(day, xPosition + dayColumnWidth / 2, currentY + 7, {
          align: 'center',
        });
      });

      currentY += 12;
      return currentY;
    };

    // Draw day headers
    days.forEach((day, index) => {
      const xPosition = margin + index * dayColumnWidth;
      doc.setFillColor(128, 0, 0);
      doc.setTextColor(255, 255, 255);
      doc.rect(xPosition, currentY, dayColumnWidth, 10, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(day, xPosition + dayColumnWidth / 2, currentY + 7, {
        align: 'center',
      });
    });

    currentY += 12;

    // Process each day's schedule
    days.forEach((day, dayIndex) => {
      const xPosition = margin + dayIndex * dayColumnWidth;
      let yPosition = currentY;

      const daySchedule = scheduleData
        .filter((item: any) => item.day === day)
        .sort(
          (a: any, b: any) =>
            this.timeToMinutes(a.start_time) - this.timeToMinutes(b.start_time)
        );

      if (daySchedule.length > 0) {
        daySchedule.forEach((item: any) => {
          const boxHeight = 35;
          if (yPosition + boxHeight > maxContentHeight) {
            days.forEach((_, i) => {
              const lineX = margin + i * dayColumnWidth;
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.5);
              doc.line(lineX, startY, lineX, maxYPosition);
            });
            doc.line(
              pageWidth - margin,
              startY,
              pageWidth - margin,
              maxYPosition
            );

            yPosition = startNewPage();
            maxYPosition = yPosition;
          }

          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            item.section_name
              ? `${item.section_name} - ${item.program_code}`
              : item.faculty_name,
            `${startTime} - ${endTime}`,
          ];

          // Draw course block
          doc.setFillColor(240, 240, 240);
          doc.rect(xPosition, yPosition, dayColumnWidth, boxHeight, 'F');

          let textYPosition = yPosition + 5;
          courseContent.forEach((line: string, index) => {
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont(
              index <= 1 ? 'helvetica' : 'helvetica',
              index <= 1 ? 'bold' : 'normal'
            );

            const wrappedLines = doc.splitTextToSize(line, dayColumnWidth - 10);
            wrappedLines.forEach((wrappedLine: string) => {
              doc.text(wrappedLine, xPosition + 5, textYPosition);
              textYPosition += 5;
            });

            if (index === courseContent.length - 1) {
              const timeTextWidth = doc.getTextWidth(line);
              doc.setDrawColor(0, 0, 0);
              doc.setLineWidth(0.2);
              doc.line(
                xPosition + 5,
                textYPosition - 4,
                xPosition + 5 + timeTextWidth,
                textYPosition - 4
              );
            }
          });

          yPosition += boxHeight + 5;
          if (yPosition > maxYPosition) {
            maxYPosition = yPosition;
          }
        });
      }
    });

    // Draw vertical lines and bottom line
    days.forEach((_, i) => {
      const lineX = margin + i * dayColumnWidth;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(lineX, startY, lineX, maxYPosition);
    });
    doc.line(pageWidth - margin, startY, pageWidth - margin, maxYPosition);
    doc.line(margin, maxYPosition, pageWidth - margin, maxYPosition);
  }

  /**
   * Helper function to format time
   */
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Helper function to convert time to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper function to get semester display
   */
  private getSemesterDisplay(semester: number): string {
    switch (semester) {
      case 1:
        return '1st Semester';
      case 2:
        return '2nd Semester';
      case 3:
        return 'Summer Semester';
      default:
        return 'Unknown Semester';
    }
  }

  /**
   * Helper function to get academic year subtitle
   */
  private getAcademicYearSubtitle(data: any): string {
    return `For Academic Year ${data.academicYear}, ${data.semester}`;
  }
}
