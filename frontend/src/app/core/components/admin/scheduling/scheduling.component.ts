import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

import {
   SchedulingService, Schedule,
    Program, AcademicYear, 
    Semester, YearLevel 
  } from '../../../services/admin/scheduling/scheduling.service';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class SchedulingComponent implements OnInit, OnDestroy {
  schedules: Schedule[] = [];
  selectedProgram = '';
  selectedYear = 1;
  selectedSection = '1';

  activeYear: string = ''; 
  activeSemester: string = ''; 
  
  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = this.initializeHeaderInputFields();
  displayedColumns: string[] = this.initializeDisplayedColumns();

  dayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  timeOptions: string[] = this.generateTimeOptions();
  professorOptions: string[] = [];
  roomOptions: string[] = [];
  academicYearOptions: AcademicYear[] = [];
  semesterOptions: Semester[] = [];
  programs: Program[] = [];
  programOptions: { 
    display: string, id: number, 
    year_levels: { year_level: number, curriculum_id: number, 
    sections: { section_id: number, section_name: string }[] }[] 
  }[] = [];
  yearLevelOptions: { 
    year_level: number, 
    curriculum_id: number, 
    sections: { section_id: number, section_name: string }[] 
  }[] = [];
  sectionOptions: { section_id: number, section_name: string }[] = [];


  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadActiveYearAndSemester();
    this.loadPrograms();  
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadActiveYearAndSemester() {
    this.schedulingService
    .getActiveYearAndSemester()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: ({ activeYear, activeSemester }) => {
        this.activeYear = activeYear;
        this.activeSemester = this.mapSemesterNumberToLabel(activeSemester);  
      },
      error: this.handleError('Error fetching active year and semester'),
    });
  }

  // Helper function to map the semester number to the corresponding label
  private mapSemesterNumberToLabel(semesterNumber: number): string {
    switch (semesterNumber) {
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

  private loadPrograms() {
    this.schedulingService.getActiveYearLevelsCurricula().subscribe((data) => {
      this.programOptions = data.map(program => ({
        display: `${program.program_code} (${program.program_title})`,
        id: program.program_id,
        year_levels: program.year_levels.map((year: YearLevel) => ({
          year_level: year.year_level,
          curriculum_id: year.curriculum_id,
          sections: year.sections 
        }))
      }));
      this.headerInputFields.find
        (field => field.key === 'program')!.options = this.programOptions.map
        (p => p.display);
    });
  }
  
  // private initializeComponent() {
  //   this.schedulingService
  //     .getInitialData()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: ({ academicYears, professors, rooms }) => {
  //         this.academicYearOptions = academicYears.map(
  //           (ay) => ay.year as AcademicYear
  //         );
  //         this.semesterOptions = academicYears[0]?.semesters || [];
  //         this.professorOptions = professors;
  //         this.roomOptions = rooms;
  //         this.loadActiveYearAndSemester();
  //       },
  //       error: this.handleError('Error fetching initial data'),
  //     });
  // }

  // private loadActiveYearAndSemester() {
  //   this.schedulingService
  //     .getActiveYearAndSemester()
  //     .pipe(
  //       takeUntil(this.destroy$),
  //       switchMap(({ activeYear, activeSemester }) => {
  //         this.activeYear = activeYear;
  //         this.activeSemester = activeSemester;
  //         return this.setProgramOptionsForYear(this.activeYear, true);
  //       })
  //     )
  //     .subscribe({
  //       next: () => this.fetchSchedules(),
  //       error: this.handleError('Error fetching active year and semester'),
  //     });
  // }

  // private fetchSchedules() {
  //   if (!this.selectedProgram) return;

  //   this.schedulingService
  //     .getSchedules(
  //       this.selectedProgram,
  //       this.selectedYear,
  //       this.selectedSection,
  //       this.activeYear,
  //       this.activeSemester
  //     )
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (schedules) => (this.schedules = [...schedules]),
  //       error: this.handleError('Error fetching schedules'),
  //     });
  // }

  // private fetchSections(program: string, year: number) {
  //   this.schedulingService
  //     .getSections(program, year)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((sections) => {
  //       this.sectionOptions = sections;
  //       this.headerInputFields.find(
  //         (field) => field.key === 'section'
  //       )!.options = sections;
  //       if (!sections.includes(this.selectedSection)) {
  //         this.selectedSection = sections[0] || '1';
  //       }
  //     });
  // }

  // private updateYearLevels() {
  //   const selectedProgram = this.programs.find(
  //     (p) => p.code === this.selectedProgram
  //   );
  //   this.headerInputFields[1].options = selectedProgram
  //     ? Array.from({ length: selectedProgram.number_of_years }, (_, i) => i + 1)
  //     : [];
  //   this.selectedYear = 1;
  // }

  // private setProgramOptionsForYear(
  //   academicYear: AcademicYear,
  //   initialLoad = false
  // ): Observable<void> {
  //   return this.schedulingService.getProgramsForYear(academicYear).pipe(
  //     takeUntil(this.destroy$),
  //     switchMap((programsForYear) => {
  //       this.programs = programsForYear;
  //       this.headerInputFields[0].options = programsForYear.map((p) => p.code);

  //       if (programsForYear.length > 0) {
  //         this.selectedProgram = programsForYear[0].code;
  //         this.updateYearLevels();
  //         this.fetchSections(this.selectedProgram, this.selectedYear);
  //       }

  //       if (initialLoad) {
  //         this.fetchSchedules();
  //       }

  //       return of();
  //     })
  //   );
  // }

  // private updateSchedule(updatedSchedule: Schedule) {
  //   this.schedulingService
  //     .updateSchedule(updatedSchedule)
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: () => {
  //         this.snackBar.open('Schedule updated successfully', 'Close', {
  //           duration: 3000,
  //         });
  //         this.fetchSchedules();
  //       },
  //       error: this.handleError('Error updating schedule'),
  //     });
  // }

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }

  private initializeHeaderInputFields(): InputField[] {
    return [
      { type: 'select', label: 'Program', key: 'program', options: [] },
      { type: 'select', label: 'Year Level', key: 'yearLevel', options: [] },
      {
        type: 'select',
        label: 'Section',
        key: 'section',
        options: this.sectionOptions,
      },
    ];
  }

  private initializeDisplayedColumns(): string[] {
    return [
      'index',
      'course_code',
      'course_title',
      'lec_hours',
      'lab_hours',
      'units',
      'tuition_hours',
      'day',
      'time',
      'professor',
      'room',
      'action',
    ];
  }

  private generateTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break;
        const time = new Date(2023, 0, 1, hour, minute);
        options.push(
          time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    }
    return options;
  }

  onInputChange(values: { [key: string]: any }) {
    const selectedProgramDisplay = values['program'];
    const selectedYearLevelDisplay = values['yearLevel'];
  
    const selectedProgram = this.programOptions.find(
      p => p.display === selectedProgramDisplay
    );
  
    if (selectedProgram) {
      console.log('Selected Program ID:', selectedProgram.id);
      this.yearLevelOptions = selectedProgram.year_levels;

      console.log('Available Year Levels:', this.yearLevelOptions);

      this.headerInputFields
      .find(field => field.key === 'yearLevel')!
      .options = this.yearLevelOptions.map(
        year => `Year ${year.year_level}`
      );    
    }
  
    // If year level is selected, log the corresponding year level ID
    const selectedYearLevel = this.yearLevelOptions.find
      (year => `Year ${year.year_level}` === selectedYearLevelDisplay);
  
    if (selectedYearLevel) {
      console.log('Selected Year Level:', selectedYearLevel);
  
      // Set the sections based on the selected year level
      this.sectionOptions = selectedYearLevel.sections;
  
      this.headerInputFields.find
        (field => field.key === 'section')!.options = this.sectionOptions.map(
        section => section.section_name
      );
  
      // Log to ensure the correct sections are being displayed
      console.log('Available Sections for Selected Year Level:',
      this.sectionOptions);
    }
  
    // If a section is selected, log the corresponding section ID
    const selectedSectionDisplay = values['section'];
    const selectedSection = this.sectionOptions.find
      (section => section.section_name === selectedSectionDisplay);
  
    if (selectedSection) {
      console.log('Selected Section ID:', selectedSection.section_id);
    }
  }
  
  openEditDialog(element: Schedule) {
    const dialogConfig: DialogConfig = {
      title: 'Edit Schedule Details',
      fields: [
        {
          label: 'Day',
          formControlName: 'day',
          type: 'autocomplete',
          options: this.dayOptions,
          required: true,
        },
        {
          label: 'Start Time',
          formControlName: 'startTime',
          type: 'autocomplete',
          options: this.timeOptions,
          required: true,
        },
        {
          label: 'End Time',
          formControlName: 'endTime',
          type: 'autocomplete',
          options: this.timeOptions,
          required: true,
        },
        {
          label: 'Professor',
          formControlName: 'professor',
          type: 'autocomplete',
          options: this.professorOptions,
          required: true,
        },
        {
          label: 'Room',
          formControlName: 'room',
          type: 'autocomplete',
          options: this.roomOptions,
          required: true,
        },
      ],
      isEdit: true,
      initialValue: {
        day: element.day || '',
        startTime: element.time ? element.time.split(' - ')[0] : '',
        endTime: element.time ? element.time.split(' - ')[1] : '',
        professor: element.professor || '',
        room: element.room || '',
      },
    };
  
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
      autoFocus: false,
    });
  
    dialogRef.componentInstance.startTimeChange.subscribe(
      (startTime: string) => {
      const startIndex = this.timeOptions.indexOf(startTime);
      const validEndTimes = this.timeOptions.slice(startIndex + 1);
      dialogRef.componentInstance.updateEndTimeOptions(validEndTimes);
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedSchedule: Schedule = {
          ...element,
          ...result,
          time: `${result.startTime} - ${result.endTime}`,
        };
        // this.updateSchedule(updatedSchedule);
      }
    });
  }
  

  openActiveYearSemesterDialog() {
    this.schedulingService.getAcademicYears().subscribe(
      (academicYears: AcademicYear[]) => {

      const academicYearOptions = academicYears.map
        ((year: AcademicYear) => year.academic_year); 
  
      const semesterOptions = academicYears[0]?.semesters.map
      ((semester: Semester) => semester.semester_number); 
  
      const fields = [
        {
          label: 'Academic Year',
          formControlName: 'academicYear',
          type: 'select',
          options: academicYearOptions, 
          required: true,
        },
        {
          label: 'Semester',
          formControlName: 'semester',
          type: 'select',
          options: semesterOptions, 
          required: true,
        },
      ];
  
      const initialValue = {
        academicYear: this.activeYear || academicYearOptions[0] || '', 
        semester: this.activeSemester || semesterOptions[0] || '', 
      };
  
      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: {
          title: 'Set Active Year and Semester', 
          fields: fields,
          initialValue: initialValue,
        },
        disableClose: true,
      });

      dialogRef.componentInstance.form.get
        ('academicYear')?.valueChanges.subscribe((selectedYear: string) => {
        const selectedYearObj = academicYears.find
          ((year) => year.academic_year === selectedYear);
        if (selectedYearObj) {
          dialogRef.componentInstance.form.get('semester')?.setValue(null); 
          dialogRef.componentInstance.data.fields[1].options = selectedYearObj
          .semesters.map(
            (semester: Semester) => semester.semester_number
          );
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          const selectedYearObj = academicYears.find
          ((year) => year.academic_year === result.academicYear);
          const selectedSemesterObj = selectedYearObj?.semesters.find
          ((semester) => semester.semester_number === result.semester);
  
          if (selectedYearObj && selectedSemesterObj) {
          this.schedulingService
            .setActiveYearAndSemester
            (selectedYearObj.academic_year_id,
              selectedSemesterObj.semester_id
            ) 
            .pipe(takeUntil(this.destroy$)) 
            .subscribe({
            next: () => {
              this.activeYear = result.academicYear;
              this.activeSemester = result.semester;
              this.snackBar.open(
                'Active year and semester updated successfully', 
                'Close', {
                    duration: 3000,
                  });
            },
            error: this.handleError('Error setting active year and semester'), 
            });
          }
        }
      });
    });
  }
}  