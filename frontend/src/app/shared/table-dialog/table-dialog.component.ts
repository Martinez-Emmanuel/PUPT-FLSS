import {
  Component,
  Output,
  EventEmitter,
  Inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
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
import { provideNativeDateAdapter } from '@angular/material/core';

import { AdminService } from '../../core/services/superadmin/management/admin/admin.service';
import { TwoDigitInputDirective } from '../../core/imports/two-digit-input.directive';

export interface DialogFieldConfig {
  label: string;
  formControlName: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'autocomplete' | 'date';
  options?: string[] | number[];
  maxLength?: number;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
  filter?: (value: string) => string[];
  confirmPassword?: boolean; 
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
  standalone: true,
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.scss'],
  providers: [provideNativeDateAdapter()],
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
        roleControl.valueChanges.subscribe(role => {
          if (role) {
            this.generateAdminCode(role);
          }
        });

        // Disable the code field for new admins
        codeControl.disable();
      }
    }

    this.trackFormChanges();
  }

  private trackFormChanges(): void {
    this.form.valueChanges.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  public hasFormChanged(): boolean {
    return (
      JSON.stringify(this.form.getRawValue()) !==
      JSON.stringify(this.initialFormValues)
    );
  }

  private addFormControl(field: DialogFieldConfig): void {
    const validators = this.getValidators(field);
    let initialValue = this.data.initialValue?.[field.formControlName] || '';

    if (field.type === 'date' && initialValue) {
      initialValue = new Date(initialValue);
    }

    const control = this.fb.control(initialValue, { validators });

    if (field.disabled) {
      control.disable();
    }

    this.form.addControl(field.formControlName, control);

    if (field.type === 'autocomplete') {
      this.initAutocompleteOptions(field);
    }
    
    if (field.confirmPassword) {
      control.setValidators([...validators, this.passwordMatchValidator.bind(this)]);
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
        }
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
  
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = this.form.get('password')?.value;
    const confirmPassword = control.value;
    return password === confirmPassword ? null : {passwordMismatch: true};
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

    if (control.hasError('passwordMismatch')) return 'Passwords do not match.'; //added

    return '';
  }

  navigateToAcademicYear(): void {
    this.dialogRef.close();
    this.router.navigate(['/admin/scheduling/academic-year']);
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

      const formValue = this.form.value;
      
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
