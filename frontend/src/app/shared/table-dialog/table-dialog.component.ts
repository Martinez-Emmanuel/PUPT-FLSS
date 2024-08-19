import { Component, Inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


export interface DialogFieldConfig {
  label: string;
  formControlName: string;
  type: 'text' | 'number' | 'select';
  options?: string[] | number[];
  maxLength?: number;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface DialogConfig {
  title: string;
  fields: DialogFieldConfig[];
  isEdit: boolean;
  initialValue?: any;
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
  ],
})
export class TableDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TableDialogComponent>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: DialogConfig
  ) {
    this.form = this.fb.group({});
    this.initForm();
  }

  initForm() {
    this.form.reset(); // Reset the form to ensure no residual data
    this.data.fields.forEach((field) => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.maxLength)
        validators.push(Validators.maxLength(field.maxLength));
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));

      const initialValue = this.data.initialValue
        ? this.data.initialValue[field.formControlName]
        : '';
      this.form.addControl(
        field.formControlName,
        this.fb.control(initialValue, validators)
      );
    });
    this.cdr.markForCheck();
  }

  getErrorMessage(formControlName: string, label: string): string {
    if (this.form.get(formControlName)?.hasError('required')) {
      return `${label} is required.`;
    }
    if (this.form.get(formControlName)?.hasError('maxlength')) {
      return `${label} cannot exceed the maximum length.`;
    }
    if (this.form.get(formControlName)?.hasError('min')) {
      return `${label} must be greater than the minimum value.`;
    }
    if (this.form.get(formControlName)?.hasError('max')) {
      return `${label} cannot exceed the maximum value.`;
    }
    return '';
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
