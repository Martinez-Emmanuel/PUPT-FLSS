import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { catchError, debounceTime, distinctUntilChanged, of, Subject, takeUntil, interval, firstValueFrom } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { FacultyService, Faculty } from '../../../../services/superadmin/management/faculty/faculty.service';
import { HrisHealthService } from '../../../../services/health/hris-health.service';
import { FacultyTypeService, FacultyType } from '../../../../services/superadmin/management/faculty/faculty-type.service';

import { fadeAnimation } from '../../../../animations/animations';

interface Column {
  key: string;
  label: string;
  template?: TemplateRef<any>;
}

@Component({
  selector: 'app-faculty',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
    MatProgressSpinnerModule,
    MatSymbolDirective,
  ],
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyComponent implements OnInit, OnDestroy, AfterViewInit {
  facultyStatuses = ['Active', 'Inactive'];
  facultyTypes: FacultyType[] = [];
  selectedFacultyIndex: number | null = null;

  @ViewChild('facultyTypeTemplate') facultyTypeTemplate!: TemplateRef<any>;
  @ViewChild('facultyUnitsTemplate') facultyUnitsTemplate!: TemplateRef<any>;

  faculty: Faculty[] = [];
  filteredFaculty: Faculty[] = [];
  isLoading = true;
  isHrisHealthy = false;

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  columns: Column[] = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Faculty Code' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'faculty_type', label: 'Type' },
    { key: 'faculty_units', label: 'Units Assigned' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index',
    'code',
    'name',
    'email',
    'faculty_type',
    'faculty_units',
    'status',
    'action',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'search',
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private facultyService: FacultyService,
    private hrisHealthService: HrisHealthService,
    private router: Router,
    private facultyTypeService: FacultyTypeService,
  ) {}

  ngOnInit() {
    this.loadFacultyTypes();
    this.fetchFaculty();
    this.setupSearch();
    this.setupHrisHealthCheck();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    const facultyTypeColumn = this.columns.find(
      (col) => col.key === 'faculty_type',
    );
    if (facultyTypeColumn) {
      facultyTypeColumn.template = this.facultyTypeTemplate;
    }

    const facultyUnitsColumn = this.columns.find(
      (col) => col.key === 'faculty_units',
    );
    if (facultyUnitsColumn) {
      facultyUnitsColumn.template = this.facultyUnitsTemplate;
    }
    this.cdr.detectChanges();
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.onSearch(searchTerm || '');
      });
  }

  /**
   * Handles the search input and filters the faculty accordingly.
   * @param searchTerm The term entered by the user in the search field.
   */
  onSearch(searchTerm: string) {
    const lowerSearch = searchTerm.toLowerCase();

    if (!lowerSearch) {
      this.filteredFaculty = [...this.faculty];
    } else {
      this.filteredFaculty = this.faculty.filter(
        (faculty) =>
          faculty.code.toLowerCase().includes(lowerSearch) ||
          faculty.name.toLowerCase().includes(lowerSearch) ||
          faculty.email.toLowerCase().includes(lowerSearch) ||
          faculty.faculty?.faculty_type?.faculty_type
            ?.toLowerCase()
            .includes(lowerSearch) ||
          faculty.status.toLowerCase().includes(lowerSearch) ||
          (
            (faculty.faculty?.faculty_type?.regular_units ?? 0) +
            (faculty.faculty?.faculty_type?.additional_units ?? 0)
          )
            .toString()
            .includes(lowerSearch),
      );
    }
    this.cdr.markForCheck();
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.searchControl.setValue(values['search']);
    }
  }

  /**
   * Fetches the list of faculty members from the service.
   * Initializes both faculty and filteredFaculty arrays.
   */
  fetchFaculty() {
    this.isLoading = true;
    this.facultyService
      .getFaculty()
      .pipe(
        catchError((error) => {
          console.error('Error fetching faculty:', error);
          this.snackBar.open(
            'Error fetching faculty. Please try again.',
            'Close',
            { duration: 3000 },
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe((faculty) => {
        console.log('Fetched faculty:', faculty); // Debug log
        this.faculty = faculty;
        this.filteredFaculty = [...this.faculty];
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Configures the dialog for adding or editing faculty.
   * @param faculty Optional Faculty object for editing.
   * @returns DialogConfig object.
   */
  private getDialogConfig(faculty?: Faculty): DialogConfig {
    const baseFields: DialogFieldConfig[] = [
      {
        label: 'Faculty Code',
        formControlName: 'code',
        type: 'text',
        maxLength: 12,
        required: true,
        disabled: !!faculty,
      },
      {
        label: 'Last Name',
        formControlName: 'last_name',
        type: 'text',
        maxLength: 50,
        required: true,
      },
      {
        label: 'First Name',
        formControlName: 'first_name',
        type: 'text',
        maxLength: 50,
        required: true,
      },
      {
        label: 'Middle Name',
        formControlName: 'middle_name',
        type: 'text',
        maxLength: 50,
        required: false,
      },
      {
        label: 'Suffix Name',
        formControlName: 'suffix_name',
        type: 'text',
        maxLength: 50,
        required: false,
      },
      {
        label: 'Email',
        formControlName: 'email',
        type: 'text',
        maxLength: 100,
        required: true,
      },
      {
        label: 'Type',
        formControlName: 'faculty_type_id',
        type: 'select',
        options: [
          {
            value: 'configure',
            label: 'Configure faculty types...',
            metadata: {
              isConfig: true,
              icon: 'settings',
            },
          },
          ...this.facultyTypes.map((type) => ({
            value: type.faculty_type_id,
            label: type.faculty_type,
          })),
        ],
        required: true,
      },
      {
        label: 'Status',
        formControlName: 'status',
        type: 'select',
        options: this.facultyStatuses.map((status) => ({
          value: status,
          label: status,
        })),
        required: true,
      },
    ];

    // Add password fields only when creating a new faculty
    const passwordFields: DialogFieldConfig[] = !faculty
      ? [
          {
            label: 'Password',
            formControlName: 'password',
            type: 'text',
            maxLength: 100,
            required: true,
          },
          {
            label: 'Confirm Password',
            formControlName: 'confirmPassword',
            type: 'text',
            maxLength: 100,
            required: true,
            confirmPassword: true,
          },
        ]
      : [];

    return {
      title: faculty ? 'Edit Faculty' : 'Add Faculty',
      isEdit: !!faculty,
      fields: [...baseFields, ...passwordFields],
      initialValue: faculty
        ? {
            code: faculty.code,
            last_name: faculty.last_name,
            first_name: faculty.first_name,
            middle_name: faculty.middle_name,
            suffix_name: faculty.suffix_name,
            email: faculty.email,
            faculty_type_id: faculty.faculty?.faculty_type_id,
            status: faculty.status,
          }
        : undefined,
    };
  }

  /**
   * Handles the faculty type configuration option in the dialog.
   * @param dialogRef The dialog reference to handle.
   */
  private handleFacultyTypeConfig(dialogRef: any) {
    const dialogAfterOpened$ = dialogRef.afterOpened();
    dialogAfterOpened$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const form = dialogRef.componentInstance.form;
      const facultyTypeControl = form.get('faculty_type_id');

      if (facultyTypeControl) {
        const facultyTypeIdControl = form.get('faculty_type_id');
        if (facultyTypeIdControl) {
          facultyTypeIdControl.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe((value: string) => {
              if (value === 'configure') {
                dialogRef.close();
                this.router.navigate(['/superadmin/faculty/types']);
              }
            });
        }
      }
    });
  }

  /**
   * Opens the dialog to add a new faculty member.
   */
  openAddFacultyDialog() {
    if (this.isHrisHealthy) {
      this.snackBar.open(
        'Faculty details can only be added in HRIS when the system is online. Please add faculty in HRIS.',
        'Close',
        { duration: 5000 },
      );
      return;
    }

    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    this.handleFacultyTypeConfig(dialogRef);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.role = 'faculty';
        this.facultyService
          .addFaculty(result)
          .pipe(
            catchError((error) => {
              console.error('Error adding faculty:', error);
              this.snackBar.open(
                'Error adding faculty. Please try again.',
                'Close',
                { duration: 3000 },
              );
              return of(null);
            }),
          )
          .subscribe((newFaculty) => {
            if (newFaculty) {
              this.snackBar.open('Faculty added successfully', 'Close', {
                duration: 3000,
              });
              this.fetchFaculty();
            }
          });
      }
    });
  }

  /**
   * Opens the dialog to edit an existing faculty member.
   * @param faculty The faculty member to edit.
   */
  openEditFacultyDialog(faculty: Faculty) {
    if (this.isHrisHealthy) {
      this.snackBar.open(
        'Faculty details can only be modified in HRIS when the system is online. Please make changes in HRIS.',
        'Close',
        { duration: 5000 },
      );
      return;
    }

    this.selectedFacultyIndex = this.faculty.indexOf(faculty);
    const config = this.getDialogConfig(faculty);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    this.handleFacultyTypeConfig(dialogRef);

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedFacultyIndex !== null) {
        this.updateFaculty(result);
      }
    });
  }

  /**
   * Updates an existing faculty member.
   * @param updatedFaculty The updated faculty data.
   */
  updateFaculty(updatedFaculty: Faculty) {
    if (
      this.selectedFacultyIndex !== null &&
      this.selectedFacultyIndex !== undefined
    ) {
      const selectedFaculty = this.faculty[this.selectedFacultyIndex];
      if (selectedFaculty && selectedFaculty.id) {
        const facultyId = selectedFaculty.id;
        updatedFaculty.role = 'faculty';

        // Check if the password field contains the masked value ('********') or is empty.
        // If so, do not include it in the update payload.
        if (
          updatedFaculty.password === '********' ||
          !updatedFaculty.password
        ) {
          delete updatedFaculty.password;
        }

        this.facultyService
          .updateFaculty(facultyId, updatedFaculty)
          .pipe(
            catchError((error) => {
              console.error('Error updating faculty:', error);
              this.snackBar.open(
                'Error updating faculty. Please try again.',
                'Close',
                { duration: 3000 },
              );
              return of(null);
            }),
          )
          .subscribe((updatedFacultyResponse) => {
            if (updatedFacultyResponse) {
              this.snackBar.open('Faculty updated successfully', 'Close', {
                duration: 3000,
              });
              this.fetchFaculty();
            }
          });
      }
    }
  }

  /**
   * Sets up an interval to periodically check the health of the HRIS system.
   */
  private setupHrisHealthCheck() {
    this.checkHrisHealth();

    interval(30000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkHrisHealth();
      });
  }

  /**
   * Checks the health of the HRIS system and updates the `isHrisHealthy` flag.
   * Marks the component for change detection.
   */
  private checkHrisHealth() {
    this.cdr.markForCheck();

    this.hrisHealthService
      .checkHealth()
      .pipe(
        takeUntil(this.destroy$),
        catchError(() => of(false)),
      )
      .subscribe((isHealthy) => {
        this.isHrisHealthy = isHealthy;
        this.cdr.markForCheck();
      });
  }

  sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  getFacultyTypeClass(facultyType: string): Record<string, boolean> {
    const type = facultyType.toLowerCase();
    return {
      'full-time': type.includes('full-time'),
      designee: type.includes('designee'),
      'part-time': type.includes('part-time'),
      temporary: type.includes('temporary'),
    };
  }

  async loadFacultyTypes(): Promise<void> {
    try {
      this.facultyTypes = await firstValueFrom(
        this.facultyTypeService.getFacultyTypes(),
      );
    } catch (error) {
      this.snackBar.open('Error loading faculty types', 'Close', {
        duration: 3000,
      });
    }
  }
}
