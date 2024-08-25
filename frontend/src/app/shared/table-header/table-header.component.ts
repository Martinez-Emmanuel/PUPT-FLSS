import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

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
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
  ],
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
})
export class TableHeaderComponent {
  @Input() inputFields: InputField[] = [];
  @Input() addButtonLabel = 'Add';
  @Input() addIconName = 'add';
  @Input() buttonDisabled = false;
  @Input() showExportButton = true;
  @Input() showExportDialog = false;
  @Input() showAddButton = true;
  @Input() selectedValues: { [key: string]: any } = {};
  @Input() customExportOptions: { all: string; current: string } | null = null;

  @Input() searchLabel = 'Search'; //temp

  @Output() inputChange = new EventEmitter<{ [key: string]: any }>();
  @Output() add = new EventEmitter<void>();
  @Output() export = new EventEmitter<'all' | 'current' | undefined>();

  @Output() search = new EventEmitter<string>(); //temp

  form: FormGroup;

  constructor(private fb: FormBuilder, private dialog: MatDialog) {
    this.form = this.fb.group({});
  }

  ngOnInit() {
    this.inputFields.forEach((field) => {
      this.form.addControl(
        field.key,
        this.fb.control(this.selectedValues[field.key] || '')
      );
    });
    this.form.valueChanges.subscribe((value) => {
      this.inputChange.emit(value);
    });
  }

  onAdd(): void {
    this.add.emit();
  }

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
}
