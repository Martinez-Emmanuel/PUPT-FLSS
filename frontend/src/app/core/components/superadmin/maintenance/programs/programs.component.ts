import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { Subject, BehaviorSubject, EMPTY } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, catchError, map, finalize, take } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogExportComponent } from '../../../../../shared/dialog-export/dialog-export.component';

import { Program, ProgramsService, AddProgramRequest, UpdateProgramRequest } from '../../../../services/superadmin/programs/programs.service';
import { ReportHeaderService } from '../../../../services/report-header/report-header.service';

import { fadeAnimation } from '../../../../animations/animations';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-programs',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramsComponent implements OnInit, OnDestroy {
  programStatuses = ['Active', 'Inactive'];
  programYears = [1, 2, 3, 4, 5];
  isLoading = true;

  private destroy$ = new Subject<void>();
  private allPrograms: Program[] = [];
  private programsSubject = new BehaviorSubject<Program[]>([]);
  programs$ = this.programsSubject.asObservable();

  columns = [
    { key: 'index', label: '#' },
    { key: 'program_code', label: 'Program Code' },
    { key: 'program_title', label: 'Program Title' },
    { key: 'program_info', label: 'Program Info' },
    { key: 'status', label: 'Status' },
    { key: 'number_of_years', label: 'Years' },
    { key: 'curriculum_years', label: 'Curriculum Year' },
  ];
  displayedColumns: string[] = [
    'index',
    'program_code',
    'program_title',
    'program_info',
    'status',
    'number_of_years',
    'curriculum_years',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Programs',
      key: 'search',
    },
  ];
  searchControl = new FormControl('');

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private programService: ProgramsService,
    private reportHeaderService: ReportHeaderService,
  ) {}

  ngOnInit() {
    this.fetchPrograms();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchPrograms() {
    this.isLoading = true;
    this.programService
      .getPrograms()
      .pipe(
        map((programs) => this.formatPrograms(programs)),
        catchError(() => {
          this.snackBar.open('Failed to load programs.', 'Close', {
            duration: 3000,
          });
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((formattedPrograms: Program[]) => {
        this.allPrograms = formattedPrograms;
        this.programsSubject.next(this.allPrograms);
      });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm: string | null) => {
        const term = searchTerm ? searchTerm.trim().toLowerCase() : '';
        if (term) {
          const filteredPrograms = this.allPrograms.filter(
            (program: Program) =>
              program.program_title.toLowerCase().includes(term) ||
              program.program_code.toLowerCase().includes(term),
          );
          this.programsSubject.next(filteredPrograms);
        } else {
          this.programsSubject.next(this.allPrograms);
        }
      });
  }

  formatPrograms(programs: Program[]): Program[] {
    return programs.map((program) => ({
      ...program,
      curriculum_years: program.curricula
        .map((c) => c.curriculum_year)
        .join(', '),
    }));
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.searchControl.setValue(values['search']);
    }
  }

  getDialogConfig(program?: Program): DialogConfig {
    return {
      title: program ? 'Edit Program' : 'Add Program',
      isEdit: !!program,
      fields: [
        {
          label: 'Program Code',
          formControlName: 'program_code',
          type: 'text',
          maxLength: 15,
          required: true,
        },
        {
          label: 'Program Title',
          formControlName: 'program_title',
          type: 'text',
          maxLength: 100,
          required: true,
        },
        {
          label: 'Program Info',
          formControlName: 'program_info',
          type: 'text',
          maxLength: 255,
          required: true,
        },
        {
          label: 'Program Status',
          formControlName: 'status',
          type: 'select',
          options: this.programStatuses,
          required: true,
        },
        {
          label: 'Years',
          formControlName: 'number_of_years',
          type: 'select',
          options: this.programYears,
          required: true,
        },
      ],
      initialValue: program || {
        status: 'Active',
        number_of_years: 4,
      },
    };
  }

  // ======================
  // CRU Operations
  // ======================

  openAddProgramDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          const addRequest: AddProgramRequest = result;
          this.programService
            .addProgram(addRequest)
            .pipe(
              takeUntil(this.destroy$),
              catchError(() => {
                this.snackBar.open('Failed to add program.', 'Close', {
                  duration: 3000,
                });
                return [];
              }),
            )
            .subscribe((newProgram) => {
              const formattedProgram = this.formatPrograms([newProgram])[0];
              const currentPrograms = this.programsSubject.getValue();
              this.programsSubject.next([...currentPrograms, formattedProgram]);
              this.snackBar.open(
                `Program ${newProgram.program_code} has been added successfully.`,
                'Close',
                { duration: 3000 },
              );
            });
        }
      });
  }

  openEditProgramDialog(program: Program) {
    const config = this.getDialogConfig(program);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.updateProgram(result, program.program_id);
        }
      });
  }

  updateProgram(updatedProgram: UpdateProgramRequest, program_id: number) {
    this.programService
      .updateProgram(program_id, updatedProgram)
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => {
          this.snackBar.open('Failed to update program.', 'Close', {
            duration: 3000,
          });
          return [];
        }),
      )
      .subscribe((program) => {
        const updatedFormattedProgram = this.formatPrograms([program])[0];
        const currentPrograms = this.programsSubject.getValue();
        const updatedPrograms = currentPrograms.map((p) =>
          p.program_id === program_id ? updatedFormattedProgram : p,
        );
        this.programsSubject.next(updatedPrograms);
        this.snackBar.open(
          `Program ${program.program_code} has been updated successfully.`,
          'Close',
          { duration: 3000 },
        );
      });
  }

  deleteProgram(program: Program) {
    this.programService
      .deleteProgram(program.program_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response.success) {
            const currentPrograms = this.programsSubject.getValue();
            const updatedPrograms = currentPrograms.filter(
              (p) => p.program_id !== program.program_id,
            );
            this.programsSubject.next(updatedPrograms);
            this.snackBar.open(
              `Program "${program.program_title}" has been deleted successfully.`,
              'Close',
              { duration: 3000 },
            );
          } else {
            this.snackBar.open(response.message, 'Close', {
              duration: 3000,
            });
          }
        },
        () => {
          this.snackBar.open(
            'Failed to delete program due to a server error.',
            'Close',
            {
              duration: 3000,
            },
          );
        },
      );
  }

  // ======================
  // PDF Generation
  // ======================

  createPdfBlob(): Blob {
    const doc = new jsPDF('p', 'mm', 'legal');
    const margin = 10;
    let currentY = 15;

    try {
      // Add header using the report header service
      this.reportHeaderService
        .addHeader(doc, 'Program Report', currentY)
        .subscribe((newY) => {
          currentY = newY;

          const programs = this.programsSubject.getValue();
          const bodyData = programs.map((program, index) => [
            (index + 1).toString(),
            program.program_code,
            program.program_title,
            program.program_info,
            program.status,
            program.number_of_years.toString(),
            program.curriculum_years,
          ]);

          (doc as any).autoTable({
            startY: currentY,
            head: [
              [
                '#',
                'Program Code',
                'Program Title',
                'Program Info',
                'Status',
                'Years',
                'Curriculum Year',
              ],
            ],
            body: bodyData,
            theme: 'grid',
            headStyles: {
              fillColor: [128, 0, 0],
              textColor: [255, 255, 255],
              fontSize: 9,
            },
            bodyStyles: {
              fontSize: 8,
              textColor: [0, 0, 0],
            },
            styles: {
              lineWidth: 0.1,
              overflow: 'linebreak',
              cellPadding: 2,
            },
            columnStyles: {
              0: { cellWidth: 10 },
              1: { cellWidth: 30 },
              2: { cellWidth: 40 },
              3: { cellWidth: 45 },
              4: { cellWidth: 20 },
              5: { cellWidth: 15 },
              6: { cellWidth: 30 },
            },
            margin: { left: margin, right: margin },
            didDrawPage: (data: any) => {
              currentY = data.cursor.y + 10;
            },
          });
        });

      return doc.output('blob');
    } catch (error) {
      this.snackBar.open('Failed to generate PDF.', 'Close', {
        duration: 3000,
      });
      throw error;
    }
  }

  onExport() {
    this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'Programs',
        customTitle: 'Export All Programs',
        generatePdfFunction: () => {
          return this.createPdfBlob();
        },
        generateFileNameFunction: () => 'pup_taguig_programs_offered.pdf',
      },
    });
  }
}
