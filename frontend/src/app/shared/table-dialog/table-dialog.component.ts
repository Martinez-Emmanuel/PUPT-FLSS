import { Component, Output, EventEmitter, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

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
  filter?: (value: string) => string[]; // Add this line
}

export interface DialogConfig {
  customExportOptions?: null;
  title: string;
  fields: DialogFieldConfig[];
  isEdit: boolean;
  initialValue?: any;
  isExportDialog?: boolean;
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
    MatAutocompleteModule, // Add this line
    TwoDigitInputDirective,
  ],
})
export class TableDialogComponent {
  form: FormGroup;
  isExportDialog: boolean;
  customExportOptions: { all: string; current: string } | null = null;
  filteredOptions: { [key: string]: (string | number)[] } = {};

  @Output() startTimeChange = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfig
  ) {
    this.form = this.fb.group({});
    this.isExportDialog = data.isExportDialog || false;
    this.customExportOptions = data.customExportOptions || null;
    this.initForm();
  }

  initForm() {
    if (this.isExportDialog) {
      this.form = this.fb.group({
        exportOption: ['all', Validators.required],
      });
    } else {
      this.form.reset();
      this.data.fields.forEach((field) => {
        const validators = [];
        if (field.required) validators.push(Validators.required);
        if (field.maxLength)
          validators.push(Validators.maxLength(field.maxLength));
        if (field.type === 'text') validators.push(this.noWhitespaceValidator);
        if (field.type === 'number')
          validators.push(Validators.pattern(/^\d{1,2}$/));
        if (field.min !== undefined) validators.push(Validators.min(field.min));
        if (field.max !== undefined) validators.push(Validators.max(field.max));
  
        const initialValue = this.data.initialValue
          ? this.data.initialValue[field.formControlName]
          : '';
        const control = this.fb.control(initialValue, validators);
  
        // Set the control as disabled if specified
        if (field.disabled) {
          control.disable();
        }
  
        this.form.addControl(field.formControlName, control);
  
        // Initialize filtered options for autocomplete fields
        if (field.type === 'autocomplete') {
          this.filteredOptions[field.formControlName] = field.options?.map(option => String(option)) || [];
        }
      });
    }
  
    // Add valueChanges subscription for startTime
    const startTimeControl = this.form.get('startTime');
    if (startTimeControl) {
      startTimeControl.valueChanges.subscribe(value => {
        this.startTimeChange.emit(value);
      });
    }
    this.cdr.markForCheck();
  }
  
  updateEndTimeOptions(newOptions: string[]) {
    const endTimeField = this.data.fields.find(f => f.formControlName === 'endTime');
    if (endTimeField) {
      endTimeField.options = newOptions;
      this.cdr.markForCheck();
    }
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace || !control.value;
    return isValid ? null : { whitespace: true };
  }

  getErrorMessage(formControlName: string, label: string): string {
    const control = this.form.get(formControlName);
    if (control?.hasError('required')) {
      return `${label} is required.`;
    }
    if (control?.hasError('maxlength')) {
      return `${label} cannot exceed ${
        control.getError('maxlength').requiredLength
      } characters.`;
    }
    if (control?.hasError('min')) {
      return `${label} must be greater than the minimum value.`;
    }
    if (control?.hasError('max')) {
      return `${label} cannot exceed the maximum value.`;
    }
    if (control?.hasError('pattern')) {
      return `${label} must be a number with up to two digits.`;
    }
    if (control?.hasError('whitespace')) {
      return `Your ${label} is invalid.`;
    }
    return '';
  }

  filterOptions(field: DialogFieldConfig) {
    const value = this.form.get(field.formControlName)?.value;
    if (field.filter) {
      this.filteredOptions[field.formControlName] = field.filter(value);
    } else {
      this.filteredOptions[field.formControlName] = field.options?.filter(option =>
        String(option).toLowerCase().includes(value.toLowerCase())
      ) || [];
    }
    this.cdr.markForCheck();
  }
  

  onExport() {
    if (this.form.valid) {
      const exportOption = this.form.value.exportOption;
      this.dialogRef.close(exportOption);
    }
  }

  onSave() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
