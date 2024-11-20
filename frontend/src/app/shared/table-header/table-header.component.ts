import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TableDialogComponent } from '../../shared/table-dialog/table-dialog.component';

export interface InputField {
  type: 'text' | 'select' | 'date' | 'number';
  label: string;
  placeholder?: string;
  options?: any[];
  key: string;
}

@Component({
    selector: 'app-table-header',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatRippleModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatTooltipModule,
    ],
    templateUrl: './table-header.component.html',
    styleUrls: ['./table-header.component.scss']
})
export class TableHeaderComponent implements OnInit, OnChanges {
  @Input() inputFields: InputField[] = [];
  @Input() addButtonLabel = 'Add';
  @Input() addIconName = 'add';
  @Input() buttonDisabled = false;
  @Input() showExportButton = true;
  @Input() showExportDialog = false;
  @Input() showAddButton = true;
  @Input() showActiveYearAndSem = false;
  @Input() showButtons = true;
  @Input() selectedValues: { [key: string]: any } = {};
  @Input() customExportOptions: { all: string; current: string } | null = null;
  @Input() searchLabel = 'Search';
  @Input() activeYear = '';
  @Input() activeSemester = '';
  @Input() tooltipMessage = '';

  @Output() add = new EventEmitter<void>();
  @Output() inputChange = new EventEmitter<{ [key: string]: any }>();
  @Output() export = new EventEmitter<'all' | 'current' | undefined>();
  @Output() search = new EventEmitter<string>();
  @Output() activeYearSemClick = new EventEmitter<void>();
  @Output() addAcademicYear = new EventEmitter<void>();

  form: FormGroup;
  previousAcademicYear: string = '';

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputFields'] || changes['selectedValues']) {
      this.initializeForm();
    }
  }

  /**
   * Initialize the form controls based on input fields and selected values.
   */
  private initializeForm() {
    this.form = this.fb.group({});
    this.inputFields.forEach((field) => {
      const initialValue =
        this.selectedValues[field.key] !== undefined
          ? this.selectedValues[field.key]
          : '';
      this.form.addControl(field.key, this.fb.control(initialValue));

      if (field.key === 'academicYear') {
        this.previousAcademicYear = initialValue;
      }
    });

    this.form.valueChanges.subscribe((value) => {
      if ('search' in value) {
        this.search.emit(value['search']);
      }

      if ('academicYear' in value) {
        const currentValue = value['academicYear'];
        if (currentValue === '__add__') {
          this.addAcademicYear.emit();
          this.form
            .get('academicYear')
            ?.setValue(this.previousAcademicYear, { emitEvent: false });
        } else {
          this.previousAcademicYear = currentValue;
          this.inputChange.emit(value);
        }
      } else {
        this.inputChange.emit(value);
      }
    });
  }

  /**
   * Emit add event when Add button is clicked.
   */
  onAdd(): void {
    this.add.emit();
  }

  /**
   * Emit export event when Export button is clicked.
   */
  onExport(): void {
    if (this.showExportDialog) {
      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: {
          isExportDialog: true,
          customExportOptions: this.customExportOptions,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.export.emit(result);
        }
      });
    } else {
      this.export.emit(undefined);
    }
  }

  /**
   * Emit event when Active Year & Semester is clicked.
   */
  onActiveYearSemClick(): void {
    this.activeYearSemClick.emit();
  }

  /**
   * Clear the search input and emit the change.
   * @param key - The form control key to clear.
   */
  onClearSearch(key: string): void {
    this.form.get(key)?.setValue('');
    this.inputChange.emit(this.form.value);
    if (key === 'search') {
      this.search.emit('');
    }
  }
}
