import { Component, Output, EventEmitter, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';

import { TwoDigitInputDirective } from '../../core/imports/two-digit-input.directive';

export interface DialogFieldConfig {
  label: string;
  formControlName: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'autocomplete';
  options?: string[] | number[];
  maxLength?: number;
  required?: boolean;
  min?: number;
  max?: number;
  hint?: string;
  disabled?: boolean;
  filter?: (value: string) => string[];
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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
    MatIconModule,
    TwoDigitInputDirective,
  ],
})
export class TableDialogComponent {
  form!: FormGroup;
  isExportDialog!: boolean;
  customExportOptions: { all: string; current: string } | null = null;
  filteredOptions: { [key: string]: (string | number)[] } = {};

  @Output() startTimeChange = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private cdr: ChangeDetectorRef,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfig
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.form = this.fb.group({});
    this.isExportDialog = this.data.isExportDialog || false;
    this.customExportOptions = this.data.customExportOptions || null;

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
  }

  private addFormControl(field: DialogFieldConfig): void {
    const validators = this.getValidators(field);
    const initialValue = this.data.initialValue?.[field.formControlName] || '';
    const control = this.fb.control(initialValue, { validators });

    if (field.disabled) {
      control.disable();
    }

    this.form.addControl(field.formControlName, control);

    if (field.type === 'autocomplete') {
      this.initAutocompleteOptions(field);
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

  updateEndTimeOptions(newOptions: string[]): void {
    const endTimeField = this.data.fields.find(
      (f) => f.formControlName === 'endTime'
    );
    if (endTimeField) {
      endTimeField.options = newOptions;
      this.cdr.markForCheck();
    }
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const isWhitespace = typeof value === 'string' && value.trim().length === 0;
    const isValid = !isWhitespace || !value;
    
    return isValid ? null : { whitespace: true };
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
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onDeleteYear(year: string): void {
    this.dialogRef.close({ deletedYear: year });
  }
}