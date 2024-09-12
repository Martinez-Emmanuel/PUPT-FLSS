import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';
import { CurriculumService } from '../../../services/superadmin/curriculum/curriculum.service';
import { YearLevel,Program, SchedulingService } from '../../../services/admin/scheduling/scheduling.service';

// interface Program {
//   program_id: number;
//   program_code: string;
//   program_title: string;
//   year_levels: number;
//   sections: { [yearLevel: string]: number };
//   curriculums: { [yearLevel: string]: string };
// }

type AcademicYear = string;

@Component({
  selector: 'app-academic-year',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './academic-year.component.html',
  styleUrls: ['./academic-year.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class AcademicYearComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  // academicYearOptions: AcademicYear[] = [];
  academicYearOptions: { academic_year_id: number; academic_year: string }[] = [];
  selectedAcademicYear = '';
  selectedAcademicYearId: number | null = null;  // Initialize with null or 0
  // Add this to store the academic year ID
  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = [
    {
      type: 'select',
      label: 'Academic Year',
      key: 'academicYear',
      options: [],
    },
  ];

  displayedColumns: string[] = [
    'index',
    'program_code',
    'program_title',
    'year_levels',
    'sections',
    'action',
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private schedulingService: SchedulingService,
    private curriculumService: CurriculumService // Add this line
  ) {}

  ngOnInit() {
    this.loadAcademicYears();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAcademicYears() {
    this.schedulingService.getAcademicYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe((academicYears) => {
        // Map the backend response to an array of objects with academic_year_id and academic_year
        this.academicYearOptions = academicYears.map((ay) => ({
          academic_year_id: ay.academic_year_id,   // ID from the backend
          academic_year: ay.academic_year          // Displayed string like '2023-2024'
        }));
  
        // Update dropdown options in headerInputFields by extracting just the academic_year
        this.headerInputFields[0].options = this.academicYearOptions.map(ay => ay.academic_year);
      });
  }
  


  fetchProgramsForAcademicYear(academicYear: string) {
    // Find the academic year object based on the selected academic year string
    const selectedYear = this.academicYearOptions.find(
      (year) => year.academic_year === academicYear
    );
  
    if (!selectedYear) {
      return; // Exit early if no matching year is found
    }
    
    this.selectedAcademicYearId = selectedYear.academic_year_id;  // Assign the ID

    // Call the backend service to fetch the programs for the selected academic year
    this.schedulingService.fetchProgramDetailsByAcademicYear({ academic_year_id: selectedYear.academic_year_id })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response.programs) {
          // Update the programs array with fetched data
          this.programs = response.programs.map((program: any) => ({
            program_id: program.program_id,
            program_code: program.program_code,
            program_title: program.program_title,
            year_levels: program.year_levels,  // Make sure this is an array
            sections: this.getSectionsByProgram(program)
          }));
        }
      }, error => {
        console.error("Error fetching program details: ", error);
        // Handle error scenario here
      });
  }
  

  
  

  getSectionsByProgram(program: any): { [yearLevel: string]: number } {
    const sections: { [yearLevel: string]: number } = {};
    program.year_levels.forEach((yearLevel: any) => {
      sections[yearLevel.year_level] = yearLevel.number_of_sections;
    });
    return sections;
  }
  

  // private getCurriculumsByProgram(
  //   programCode: string,
  //   numberOfYears: number
  // ): { [yearLevel: string]: string } {
  //   const curriculums: { [yearLevel: string]: string } = {};
  //   this.schedulingService
  //     .getActiveYearAndSemester()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe(({ activeYear }) => {
  //       const mapping =
  //         this.schedulingService['mockData'].curriculumMapping[activeYear]?.[
  //           programCode
  //         ];
  //       for (let year = 1; year <= numberOfYears; year++) {
  //         curriculums[year.toString()] = mapping ? mapping[year] : '2022';
  //       }
  //     });
  //   return curriculums;
  // }

  // private addNewAcademicYear(newAcademicYear: string): void {
  //   this.academicYearOptions.push(newAcademicYear);
  //   this.headerInputFields[0].options = [...this.academicYearOptions];
  //   this.selectedAcademicYear = newAcademicYear;
  // }

  // private removeAcademicYear(year: string): void {
  //   this.academicYearOptions = this.academicYearOptions.filter(
  //     (y) => y !== year
  //   );
  //   this.headerInputFields[0].options = [...this.academicYearOptions];
  //   this.selectedAcademicYear = this.academicYearOptions.length
  //     ? this.academicYearOptions[0]
  //     : '';
  // }

  // filterProgramsByAcademicYear(academicYear: AcademicYear) {
  //   this.schedulingService
  //     .getAcademicYears()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((academicYears) => {
  //       const selectedYearData = academicYears.find(
  //         (ay) => ay.year === academicYear
  //       );

  //       if (selectedYearData) {
  //         const programCodes = selectedYearData.programs;

  //         this.schedulingService
  //           .getPrograms()
  //           .pipe(takeUntil(this.destroy$))
  //           .subscribe((programs) => {
  //             const programsForYear = programs.filter((program) =>
  //               programCodes.includes(program.code)
  //             );

  //             this.programs = programsForYear.map((program) => ({
  //               program_code: program.code,
  //               program_title: program.title,
  //               year_levels: program.number_of_years,
  //               sections: this.getSectionsByProgram(
  //                 program.code,
  //                 program.number_of_years
  //               ),
  //               curriculums: this.getCurriculumsByProgram(
  //                 program.code,
  //                 program.number_of_years
  //               ),
  //             }));
  //           });
  //       }
  //     });
  // }

  onInputChange(values: { [key: string]: any }) {
    if (values['academicYear']) {
      this.selectedAcademicYear = values['academicYear'];
      // Fetch programs associated with the selected academic year
      this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
    }
  }
  
  
  onManageYearLevels(program: Program) {
    const fields: DialogFieldConfig[] = [];

    console.log('Fetched Program ID:', program.program_id);
  
    // Fetch curriculum options from the backend
    this.curriculumService.getCurricula().subscribe((curricula) => {
      const curriculumOptions = curricula.map((curriculum) => curriculum.curriculum_year);
  
      // Ensure program.year_levels is an array
      if (!Array.isArray(program.year_levels)) {
        console.error('Expected year_levels to be an array, but got:', program.year_levels);
        return;
      }
  
      // Loop through the year_levels array to dynamically create fields
      program.year_levels.forEach((yearLevelObj: YearLevel, index: number) => {
        const yearLevel = yearLevelObj.year_level;
        const yearLevelKey = `yearLevel${yearLevel}`;
        const curriculumKey = `curriculumVersion${yearLevel}`;
  
        // Add a text field for the year level (disabled since it's static)
        fields.push({
          label: `Year Level ${yearLevel}`,
          formControlName: yearLevelKey,
          type: 'text',
          required: true,
          disabled: true,
        });
  
        // Add a select field for the curriculum year with populated options
        fields.push({
          label: `Curriculum Year`,
          formControlName: curriculumKey,
          type: 'select',
          options: curriculumOptions,
          required: true,
        });
      });
  
      // Initial values for the dialog, pre-filled with the program's year levels
      const initialValue = fields.reduce((acc, field) => {
        if (field.type === 'text') {
          acc[field.formControlName] = field.label.replace('Year Level ', '');
        } else if (field.type === 'select') {
          const yearLevel = parseInt(field.formControlName.replace('curriculumVersion', ''), 10);
  
          // Safely access year_levels and make sure it is an array
          if (Array.isArray(program.year_levels)) {
            const yearLevelObj = program.year_levels.find((yl) => yl.year_level === yearLevel);
  
            // Pre-fill the curriculum year for each year level
            acc[field.formControlName] = yearLevelObj ? yearLevelObj.curriculum_year : '';
          }
        }
        return acc;
      }, {} as { [key: string]: any });
  
      // Open dialog with fields and initial values
      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: {
          title: `Manage ${program.program_code} Year Levels`,
          fields,
          isEdit: true,
          initialValue,
          useHorizontalLayout: true,
        },
        disableClose: true,
      });
  
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (!Array.isArray(program.year_levels)) {
            console.error('Expected year_levels to be an array after dialog close.');
            return;
          }
  
          // Update the year_levels with the selected curriculum years
          const updatedYearLevels = program.year_levels.map((yearLevelObj) => {
            const curriculumKey = `curriculumVersion${yearLevelObj.year_level}`;
            const selectedCurriculumYear = result[curriculumKey];
  
            // Find matching curriculum by curriculum_year
            const matchingCurriculum = curricula.find((c) => c.curriculum_year === selectedCurriculumYear);
  
            return {
              ...yearLevelObj,
              curriculum_year: selectedCurriculumYear, // Update with the selected curriculum year
              curriculum_id: matchingCurriculum ? matchingCurriculum.curriculum_id : yearLevelObj.curriculum_id, // If matching curriculum found, use its ID, otherwise retain existing one
            };
          });
  
          // Ensure selectedAcademicYearId exists and is valid
          if (this.selectedAcademicYearId != null) {
            this.schedulingService
              .updateYearLevelsCurricula(this.selectedAcademicYearId, program.program_id, updatedYearLevels)
              .subscribe(
                (response) => {
                  this.snackBar.open('Year levels updated successfully!', 'Close', { duration: 3000 });
                  this.fetchProgramsForAcademicYear(this.selectedAcademicYear); // Refresh the data
                },
                (error) => {
                  console.error('Failed to update year levels:', error);
                }
              );
          } else {
            console.error('selectedAcademicYearId is null or undefined.');
          }
        }
      });
    });
  }
  
  
  

  onManageSections(program: Program) {
    // const fields: DialogFieldConfig[] = [];

    // for (let i = 0; i < program.year_levels; i++) {
    //   const yearLevelKey = `yearLevel${i + 1}`;
    //   const sectionsKey = `numberOfSections${i + 1}`;

    //   fields.push({
    //     label: `Year Level ${i + 1}`,
    //     formControlName: yearLevelKey,
    //     type: 'text',
    //     required: true,
    //     disabled: true,
    //   });

    //   fields.push({
    //     label: `Number of Sections`,
    //     formControlName: sectionsKey,
    //     type: 'number',
    //     required: true,
    //     min: 1,
    //   });
    // }

    // const initialValue = fields.reduce((acc, field) => {
    //   if (field.type === 'text') {
    //     acc[field.formControlName] = `${parseInt(
    //       field.formControlName.replace('yearLevel', '')
    //     )}`;
    //   } else if (field.type === 'number') {
    //     const yearLevelIndex = field.formControlName.replace(
    //       'numberOfSections',
    //       ''
    //     );
    //     acc[field.formControlName] = program.sections[yearLevelIndex] || 1;
    //   }
    //   return acc;
    // }, {} as { [key: string]: any });

    // const dialogRef = this.dialog.open(TableDialogComponent, {
    //   data: {
    //     title: `Manage ${program.program_code} Sections`,
    //     fields,
    //     isEdit: true,
    //     initialValue,
    //     useHorizontalLayout: true,
    //   },
    //   disableClose: true,
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     for (let i = 0; i < program.year_levels; i++) {
    //       const sectionsKey = `numberOfSections${i + 1}`;
    //       program.sections[(i + 1).toString()] = result[sectionsKey];
    //     }
    //     this.programs = [...this.programs];
    //     this.snackBar.open('Sections updated successfully!', 'Close', {
    //       duration: 3000,
    //     });
    //   }
    // });
  }

  onRemoveProgram(element: Program) {
    const dialogData: DialogData = {
      title: 'Confirm Delete',
      content:
        'Are you sure you want to delete this? This action cannot be undone.',
      actionText: 'Delete',
      cancelText: 'Cancel',
      action: 'Delete',
    };

    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Delete') {
        this.programs = this.programs.filter((p) => p !== element);
        this.snackBar.open('Program deleted successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  openAddAcademicYearDialog(): void {
    const dialogConfig: DialogConfig = {
      title: 'Add Academic Year',
      fields: [
        {
          label: 'Year Start',
          formControlName: 'yearStart',
          type: 'text',
          required: true,
          maxLength: 4,
        },
        {
          label: 'Year End',
          formControlName: 'yearEnd',
          type: 'text',
          required: true,
          maxLength: 4,
        },
      ],
      isEdit: false,
      useHorizontalLayout: true,
      initialValue: { yearStart: '', yearEnd: '' },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.yearStart && result.yearEnd) {
        if (
          this.isValidYear(result.yearStart) &&
          this.isValidYear(result.yearEnd)
        ) {
          const newAcademicYear = `${result.yearStart} - ${result.yearEnd}`;
          // this.addNewAcademicYear(newAcademicYear);
          this.snackBar.open('New academic year added successfully!', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open(
            'Invalid year format. Please enter valid 4-digit years.',
            'Close',
            {
              duration: 3000,
            }
          );
        }
      }
    });
  }

  private isValidYear(year: string): boolean {
    return (
      /^\d{4}$/.test(year) && parseInt(year) > 1900 && parseInt(year) < 2100
    );
  }

  openManageAcademicYearDialog(): void {
    const dialogConfig: DialogConfig = {
      title: 'Manage Academic Years',
      isManageList: true,
      //academicYearList: [...this.academicYearOptions],
      fields: [],
      isEdit: false,
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.deletedYear) {
        // this.removeAcademicYear(result.deletedYear);
        this.snackBar.open('Academic year removed successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
    };
  }
}
