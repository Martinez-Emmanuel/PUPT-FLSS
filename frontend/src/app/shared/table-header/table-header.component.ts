import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
  ],
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
})
export class TableHeaderComponent {
  @Input() searchLabel = 'Search';
  @Input() addButtonLabel = 'Add';
  @Input() placeholder = 'Search';
  @Input() buttonDisabled = false;

  @Output() search = new EventEmitter<string>();
  @Output() add = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.search.emit(inputElement.value);
  }

  onAdd(): void {
    this.add.emit();
  }

  onExport(): void {
    this.export.emit();
  }
}
