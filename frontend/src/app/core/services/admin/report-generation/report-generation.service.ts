import { Injectable } from '@angular/core';

import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { ReportsService } from '../reports/reports.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Faculty {
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  isEnabled: boolean;
  facultyId: number;
  schedules?: any[];
  academicYear?: string;
  semester?: string;
}

interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
  year_levels_selected?: string;
  section_selected?: string;
  academicYear: string;
  semester: string;
}

interface YearLevel {
  year_level: number;
  sections: Section[];
}

interface Section {
  section_name: string;
  schedules: any[];
}

interface Room {
  academicYear: string;
  semester: string;
  roomId: number;
  roomCode: string;
  location: string;
  floorLevel: string;
  capacity: number;
  schedules: any[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportGenerationService {
  private readonly logoUrl =
    'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';

  constructor(private reportsService: ReportsService) {}

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
   * Generate Faculty Schedule Report as a Blob
   */
  generateFacultyReport(): Observable<Blob> {
    return this.reportsService.getFacultySchedulesReport().pipe(
      map((response) => {
        const facultyData: Faculty[] =
          response.faculty_schedule_reports.faculties.map((faculty: any) => ({
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
          }));

        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        facultyData.forEach((faculty, index) => {
          if (index > 0) {
            doc.addPage();
          }

          // Draw header
          let currentY = this.drawHeader(
            doc,
            topMargin,
            pageWidth,
            margin,
            logoSize,
            `${faculty.facultyName} Schedule`,
            this.getAcademicYearSubtitle(faculty)
          );

          // Draw schedule table
          this.drawFacultyScheduleTable(
            doc,
            faculty.schedules ?? [],
            currentY,
            margin,
            pageWidth
          );
        });

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating faculty report:', error);
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
        const programData: Program[] =
          response.programs_schedule_reports.programs.map((program: any) => ({
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
            year_levels_selected: 'All',
            section_selected: 'All',
            academicYear: `${response.programs_schedule_reports.year_start}-${response.programs_schedule_reports.year_end}`,
            semester: this.getSemesterDisplay(
              response.programs_schedule_reports.semester
            ),
          }));

        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        programData.forEach((program, programIndex) => {
          program.year_levels.forEach((yearLevel, yearIndex) => {
            yearLevel.sections.forEach((section, sectionIndex) => {
              if (programIndex > 0 || yearIndex > 0 || sectionIndex > 0) {
                doc.addPage();
              }

              // Draw header
              let currentY = this.drawHeader(
                doc,
                topMargin,
                pageWidth,
                margin,
                logoSize,
                `${program.program_code} - Year ${yearLevel.year_level} - Section ${section.section_name}`,
                this.getAcademicYearSubtitle(program)
              );

              // Draw schedule table
              this.drawProgramScheduleTable(
                doc,
                section.schedules ?? [],
                currentY,
                margin,
                pageWidth
              );
            });
          });
        });

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating programs report:', error);
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
        const roomData: Room[] = response.room_schedule_reports.rooms.map(
          (room: any) => ({
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
          })
        );

        const doc = new jsPDF('landscape', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.width;
        const margin = 10;
        const topMargin = 15;
        const logoSize = 22;

        roomData.forEach((room, index) => {
          if (index > 0) {
            doc.addPage();
          }

          // Draw header
          let currentY = this.drawHeader(
            doc,
            topMargin,
            pageWidth,
            margin,
            logoSize,
            `Room ${room.roomCode} Schedule`,
            this.getAcademicYearSubtitle(room)
          );

          // Draw schedule table
          this.drawRoomScheduleTable(
            doc,
            room.schedules ?? [],
            currentY,
            margin,
            pageWidth
          );
        });

        return doc.output('blob');
      }),
      catchError((error) => {
        console.error('Error generating rooms report:', error);
        return of(new Blob());
      })
    );
  }

  /**
   * Helper method to draw the header
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
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
      pageWidth / 2,
      startY,
      { align: 'center' }
    );

    const logoXPosition = pageWidth / 25 + 25;
    doc.addImage(
      this.logoUrl,
      'PNG',
      logoXPosition,
      startY - 5,
      logoSize,
      logoSize
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
   * Helper method to draw Faculty Schedule Table
   */
  private drawFacultyScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number
  ): void {
    const hasSchedules = scheduleData && scheduleData.length > 0;

    if (!hasSchedules) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No Assigned Schedule', pageWidth / 2, startY + 50, {
        align: 'center',
      });
      return;
    }

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
            // Draw vertical lines
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

            // Add new page and redraw headers
            doc.addPage();
            currentY = this.drawHeader(
              doc,
              15,
              pageWidth,
              margin,
              22,
              'Faculty Schedule (Continued)',
              this.getAcademicYearSubtitle(scheduleData[0])
            );

            // Redraw day headers
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
            yPosition = currentY;
            maxYPosition = yPosition;
          }

          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            `${item.program_code} ${item.year_level} - ${item.section_name}`,
            item.room_code,
            `${startTime} - ${endTime}`,
          ];

          // Draw course block
          doc.setFillColor(240, 240, 240);
          doc.rect(xPosition, yPosition, dayColumnWidth, boxHeight, 'F');

          let textYPosition = yPosition + 5;
          courseContent.forEach((line: string, index: number) => {
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont('helvetica', index <= 1 ? 'bold' : 'normal');

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

    // Draw vertical lines
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
   * Helper method to draw Program Schedule Table
   */
  private drawProgramScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number
  ): void {
    const hasSchedules = scheduleData && scheduleData.length > 0;

    if (!hasSchedules) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No Assigned Schedule', pageWidth / 2, startY + 50, {
        align: 'center',
      });
      return;
    }

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
            // Draw vertical lines
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

            // Add new page and redraw headers
            doc.addPage();
            currentY = this.drawHeader(
              doc,
              15,
              pageWidth,
              margin,
              22,
              'Program Schedule (Continued)',
              this.getAcademicYearSubtitle(scheduleData[0])
            );

            // Redraw day headers
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
            yPosition = currentY;
            maxYPosition = yPosition;
          }

          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            `${item.faculty_name}`,
            item.room_code,
            `${startTime} - ${endTime}`,
          ];

          // Draw course block
          doc.setFillColor(240, 240, 240);
          doc.rect(xPosition, yPosition, dayColumnWidth, boxHeight, 'F');

          let textYPosition = yPosition + 5;
          courseContent.forEach((line: string, index: number) => {
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont('helvetica', index <= 1 ? 'bold' : 'normal');

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

    // Draw vertical lines
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
   * Helper method to draw Room Schedule Table
   */
  private drawRoomScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number
  ): void {
    const hasSchedules = scheduleData && scheduleData.length > 0;

    if (!hasSchedules) {
      doc.setFontSize(20);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(128, 128, 128);
      doc.text('No Assigned Schedule', pageWidth / 2, startY + 50, {
        align: 'center',
      });
      return;
    }

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
            // Draw vertical lines
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

            // Add new page and redraw headers
            doc.addPage();
            currentY = this.drawHeader(
              doc,
              15,
              pageWidth,
              margin,
              22,
              'Room Schedule (Continued)',
              this.getAcademicYearSubtitle(scheduleData[0])
            );

            // Redraw day headers
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
            yPosition = currentY;
            maxYPosition = yPosition;
          }

          const startTime = this.formatTime(item.start_time);
          const endTime = this.formatTime(item.end_time);
          const courseContent = [
            item.course_details.course_code,
            item.course_details.course_title,
            `${item.program_code} ${item.year_level} - ${item.section_name}`,
            `${item.faculty_name}`,
            `${startTime} - ${endTime}`,
          ];

          // Draw course block
          doc.setFillColor(240, 240, 240);
          doc.rect(xPosition, yPosition, dayColumnWidth, boxHeight, 'F');

          let textYPosition = yPosition + 5;
          courseContent.forEach((line: string, index: number) => {
            doc.setTextColor(0);
            doc.setFontSize(9);
            doc.setFont('helvetica', index <= 1 ? 'bold' : 'normal');

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

    // Draw vertical lines
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
   * Helper method to format time from "HH:MM" to "H:MM AM/PM"
   */
  private formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  }

  /**
   * Helper method to convert time to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Helper method to get semester display string
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
   * Helper method to get academic year subtitle
   */
  private getAcademicYearSubtitle(entity: Faculty | Program | Room): string {
    if ('academicYear' in entity && 'semester' in entity) {
      return `For Academic Year ${entity.academicYear}, ${entity.semester}`;
    }
    return '';
  }

  /**
   * Helper method to draw a generic schedule table
   * (Can be extended for other report types if needed)
   */
  private drawGenericScheduleTable(
    doc: jsPDF,
    scheduleData: any[],
    startY: number,
    margin: number,
    pageWidth: number,
    entityType: 'faculty' | 'program' | 'room'
  ): void {
    /* Implementation can be similar to the specific tables above
     This is a placeholder for potential future use
     */
  }
}
