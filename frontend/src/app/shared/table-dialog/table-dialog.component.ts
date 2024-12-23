import { Component, Output, EventEmitter, Inject, ChangeDetectionStrategy, ChangeDetectorRef, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core';

import { AdminService } from '../../core/services/superadmin/management/admin/admin.service';
import { TwoDigitInputDirective } from '../../core/imports/two-digit-input.directive';

// Custom date adapter to format dates as "January 1, 2000"
@Injectable()
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  }
}

// Custom date formats
const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'long', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'customInput',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};

export interface DialogFieldConfig {
  label: string;
  formControlName: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'autocomplete'
    | 'date';
  options?: string[] | number[];
  maxLength?: number;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
  filter?: (value: string) => string[];
  confirmPassword?: boolean;
  initialSelection?: string[];
}

export interface DialogConfig {
  customExportOptions?: { all: string; current: string };
  title: string;
  fields: DialogFieldConfig[];
  isEdit: boolean;
  initialValue?: any;
  useHorizontalLayout?: boolean;
  isExportDialog?: boolean;
  isManageList?: boolean;
  academicYearList?: string[];
}

@Component({
  selector: 'app-table-dialog',
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.scss'],
  providers: [
    provideNativeDateAdapter(),
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatRadioModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDatepickerModule,
    TwoDigitInputDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableDialogComponent {
  form!: FormGroup;
  isLoading: boolean = false;
  isExportDialog!: boolean;
  isEditDialog: boolean = false;
  isConflict: boolean = false;
  customExportOptions: { all: string; current: string } | null = null;
  filteredOptions: { [key: string]: (string | number)[] } = {};
  initialFormValues: any;

  @Output() startTimeChange = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private adminService: AdminService,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfig
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.form = this.fb.group({});
    this.isExportDialog = this.data.isExportDialog || false;
    this.customExportOptions = this.data.customExportOptions || null;
    this.isEditDialog = this.data.title === 'Edit Schedule Details';

    if (this.data.isManageList) {
    } else {
      this.initForm();
    }
  }

  private initForm(): void {
    if (this.isExportDialog) {
      this.initExportForm();
    } else {
      this.initRegularForm();
    }

    this.initStartTimeControl();
    this.addDateValidation();
    this.cdr.markForCheck();
  }

  private initExportForm(): void {
    this.form = this.fb.group({
      exportOption: ['all', Validators.required],
    });
  }

  private initRegularForm(): void {
    this.form.reset();
    this.data.fields.forEach(this.addFormControl.bind(this));
    this.initialFormValues = this.form.getRawValue();

    // Add role change listener for admin code generation
    if (this.data.title === 'Admin' && !this.data.isEdit) {
      const roleControl = this.form.get('role');
      const codeControl = this.form.get('code');

      if (roleControl && codeControl) {
        roleControl.valueChanges.subscribe((role) => {
          if (role) {
            this.generateAdminCode(role);
          }
        });

        // Disable the code field for new admins
        codeControl.disable();
      }
    }

    this.handleYearStartChanges();
    this.addYearEndValidator();
    this.trackFormChanges();
  }

  private trackFormChanges(): void {
    this.form.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  private handleYearStartChanges(): void {
    const yearStartControl = this.form.get('yearStart');
    const yearEndControl = this.form.get('yearEnd');

    if (yearStartControl && yearEndControl) {
      yearStartControl.valueChanges.subscribe((yearStart) => {
        if (yearStart && /^\d{4}$/.test(yearStart)) {
          const yearEnd = parseInt(yearStart, 10) + 1;
          yearEndControl.setValue(yearEnd.toString());
          yearEndControl.updateValueAndValidity();
        }
      });
    }
  }

  private addYearEndValidator(): void {
    const yearEndControl = this.form.get('yearEnd');
    if (yearEndControl) {
      yearEndControl.setValidators([
        Validators.required,
        this.yearEndGreaterThanYearStartValidator.bind(this),
      ]);
    }
  }

  private yearEndGreaterThanYearStartValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const yearStart = this.form.get('yearStart')?.value;
    const yearEnd = control.value;

    if (
      yearStart &&
      yearEnd &&
      parseInt(yearEnd, 10) <= parseInt(yearStart, 10)
    ) {
      return { yearEndLessThanYearStart: true };
    }

    return null;
  }

  public hasFormChanged(): boolean {
    // When editing, password fields are not required, so we need to ignore them when checking for changes
    if (this.data.isEdit) {
      const currentValues = { ...this.form.getRawValue() };
      const initialValues = { ...this.initialFormValues };
      delete currentValues.password;
      delete currentValues.confirmPassword;
      delete initialValues.password;
      delete initialValues.confirmPassword;

      return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
    } else {
      // When adding, we need to check all fields
      return (
        JSON.stringify(this.form.getRawValue()) !==
        JSON.stringify(this.initialFormValues)
      );
    }
  }

  private addFormControl(field: DialogFieldConfig): void {
    const validators = this.getValidators(field);
    let initialValue = this.data.initialValue?.[field.formControlName];

    // Modify this section to properly handle array values for multiselect
    if (field.type === 'multiselect') {
      // If initialValue is a string and not empty, convert to array
      if (typeof initialValue === 'string' && initialValue) {
        initialValue = initialValue.split(', ');
      } else if (!Array.isArray(initialValue)) {
        // If not an array and not a string, initialize as empty array
        initialValue = [];
      }
      // Use the provided initial selection if available
      if (field.initialSelection) {
        initialValue = field.initialSelection;
      }
    } else if (field.type === 'date' && initialValue) {
      initialValue = new Date(initialValue);
    }

    // When editing, password fields are not required
    if (
      this.data.isEdit &&
      (field.formControlName === 'password' ||
        field.formControlName === 'confirmPassword')
    ) {
      const control = this.fb.control(initialValue);
      this.form.addControl(field.formControlName, control);
    } else {
      const control = this.fb.control(initialValue, { validators });
      this.form.addControl(field.formControlName, control);
      if (field.confirmPassword) {
        control.setValidators([
          ...validators,
          this.passwordMatchValidator.bind(this),
        ]);
      }
    }

    const formControl = this.form.get(field.formControlName);
    if (formControl) {
      if (field.disabled) {
        formControl.disable();
      }

      if (field.type === 'autocomplete') {
        this.initAutocompleteOptions(field);
      }
    }
  }

  private generateAdminCode(role: string): void {
    const codeControl = this.form.get('code');
    if (codeControl) {
      this.adminService.getNextAdminCode(role).subscribe({
        next: (nextCode) => {
          codeControl.setValue(nextCode);
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error generating admin code:', error);
          // Optionally handle the error (e.g., show a message to the user)
        },
      });
    }
  }

  private initAutocompleteOptions(field: DialogFieldConfig): void {
    this.filteredOptions[field.formControlName] =
      field.options?.map(String) || [];
  }

  private initStartTimeControl(): void {
    const startTimeControl = this.form.get('startTime');
    if (startTimeControl) {
      startTimeControl.valueChanges.subscribe((value) => {
        this.startTimeChange.emit(value);
      });
    }
  }

  public updateEndTimeOptions(newOptions: string[]): void {
    const endTimeFieldConfig = this.data.fields.find(
      (f) => f.formControlName === 'endTime'
    );

    if (endTimeFieldConfig) {
      endTimeFieldConfig.options = newOptions;
      const endTimeControl = this.form.get('endTime');

      if (endTimeControl) {
        endTimeControl.setValue('');
        this.filteredOptions['endTime'] = newOptions;
        this.cdr.markForCheck();
      }
    }
  }

  private getValidators(field: DialogFieldConfig): ValidatorFn[] {
    const validators: ValidatorFn[] = [];

    if (field.required) validators.push(Validators.required);
    if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
    if (field.type === 'text') validators.push(this.noWhitespaceValidator);
    if (field.type === 'number')
      validators.push(Validators.pattern(/^\d{1,2}$/));
    if (field.min !== undefined) validators.push(Validators.min(field.min));
    if (field.max !== undefined) validators.push(Validators.max(field.max));

    if (field.maxLength === 4) {
      validators.push(Validators.minLength(4), Validators.pattern(/^\d{4}$/));
    }

    return validators;
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isWhitespace = typeof value === 'string' && value.trim().length === 0;
    const isValid = !isWhitespace || !value;

    return isValid ? null : { whitespace: true };
  }

  private addDateValidation(): void {
    const startDateControl = this.form.get('startDate');
    const endDateControl = this.form.get('endDate');

    if (startDateControl && endDateControl) {
      startDateControl.valueChanges.subscribe(() => {
        endDateControl.updateValueAndValidity();
      });

      endDateControl.setValidators([
        Validators.required,
        this.endDateValidator.bind(this),
      ]);
    }
  }

  private endDateValidator(control: AbstractControl): ValidationErrors | null {
    const endDate = control.value;
    const startDate = this.form.get('startDate')?.value;

    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      return { endDateBeforeStartDate: true };
    }

    return null;
  }

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = this.form.get('password')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  getErrorMessage(formControlName: string, label: string): string {
    const control = this.form.get(formControlName);
    if (!control) return '';

    if (control.hasError('required')) return `${label} is required.`;
    if (control.hasError('maxlength'))
      return `${label} cannot exceed ${
        control.getError('maxlength').requiredLength
      } characters.`;
    if (control.hasError('minlength'))
      return `${label} must be exactly ${
        control.getError('minlength').requiredLength
      } characters.`;
    if (control.hasError('pattern')) {
      return control.getError('pattern').requiredPattern === '/^\\d{4}$/'
        ? `${label} must be exactly 4 digits.`
        : `${label} must be a number with up to two digits.`;
    }
    if (control.hasError('min'))
      return `${label} must be greater than the minimum value.`;
    if (control.hasError('max'))
      return `${label} cannot exceed the maximum value.`;
    if (control.hasError('whitespace')) return `Your ${label} is invalid.`;
    if (control.hasError('endDateBeforeStartDate'))
      return `End Date cannot be earlier than Start Date.`;
    if (control.hasError('yearEndLessThanYearStart'))
      return `Invalid Year End.`;

    if (control.hasError('passwordMismatch')) return 'Passwords do not match.';

    return '';
  }

  navigateToAcademicYear(): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/academic-years']);
  }

  filterOptions(field: DialogFieldConfig): void {
    const value = this.form.get(field.formControlName)?.value;
    if (field.filter) {
      this.filteredOptions[field.formControlName] = field.filter(value);
    } else {
      this.filteredOptions[field.formControlName] =
        field.options?.filter((option) =>
          String(option).toLowerCase().includes(value.toLowerCase())
        ) || [];
    }
    this.cdr.markForCheck();
  }

  onExport(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.exportOption);
    }
  }

  onSave(): void {
    if (this.form.valid) {
      this.isLoading = true;

      // Enable the code control before saving if it was disabled
      const codeControl = this.form.get('code');
      if (codeControl?.disabled) {
        codeControl.enable();
      }

      const formValue = this.form.getRawValue();

      if (formValue.last_name && formValue.first_name) {
        formValue.name = `${formValue.last_name}, ${formValue.first_name} ${
          formValue.middle_name || ''
        } ${formValue.suffix_name || ''}`.trim();
      }

      const minimumSpinnerDuration = 500;
      const startTime = Date.now();

      this.dialogRef.disableClose = true;

      const dialogClose = () => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = minimumSpinnerDuration - elapsedTime;

        setTimeout(() => {
          this.isLoading = false;
          this.dialogRef.disableClose = false;
          this.dialogRef.close(formValue);
        }, Math.max(remainingTime, 0));
      };

      dialogClose();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onDeleteYear(year: string): void {
    this.dialogRef.close({ deletedYear: year });
  }
}
