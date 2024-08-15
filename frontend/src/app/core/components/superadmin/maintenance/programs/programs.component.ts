import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { CommonTableComponent } from '../../../../../shared/common-table/common-table.component';
import { TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';

import { Program, ProgramService } from '../../../../services/superadmin/programs/programs.service';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CommonTableComponent,
    TableHeaderComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramsComponent implements OnInit {
  programStatuses = ['Active', 'Inactive'];
  isEdit = false;
  selectedProgramIndex: number | null = null;

  programs: Program[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'program_code', label: 'Program Code' },
    { key: 'program_title', label: 'Program Title' },
    { key: 'program_info', label: 'Program Info' },
    { key: 'program_status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index',
    'program_code',
    'program_title',
    'program_info',
    'program_status',
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private programService: ProgramService
  ) {}

  ngOnInit() {
    this.fetchPrograms();
  }

  fetchPrograms() {
    this.programService.getPrograms().subscribe((programs) => {
      this.programs = programs;
      this.cdr.markForCheck();
    });
  }

  onSearch(searchTerm: string) {
    this.programService.getPrograms().subscribe((programs) => {
      this.programs = programs.filter(
        (program) =>
          program.program_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          program.program_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  private getDialogConfig(program?: Program): DialogConfig {
    return {
      title: 'Program',
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
          formControlName: 'program_status',
          type: 'select',
          options: this.programStatuses,
          required: true,
        },
      ],
      initialValue: program || {},
    };
  }

  openAddProgramDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, { data: config });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.programService.addProgram(result).subscribe((programs) => {
          this.programs = programs;
          this.snackBar.open('Program added successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
      }
    });
  }

  openEditProgramDialog(program: Program) {
    this.selectedProgramIndex = this.programs.indexOf(program);
    const config = this.getDialogConfig(program);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedProgramIndex !== null) {
        this.updateProgram(result);
      }
    });
  }

  updateProgram(updatedProgram: any) {
    if (this.selectedProgramIndex !== null) {
      this.programs[this.selectedProgramIndex] = {
        ...this.programs[this.selectedProgramIndex],
        ...updatedProgram,
      };

      this.programService
        .updateProgram(this.selectedProgramIndex, updatedProgram)
        .subscribe((programs) => {
          this.programs = programs;
          this.snackBar.open('Program updated successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
    }
  }

  deleteProgram(program: Program) {
    const index = this.programs.indexOf(program);
    if (index >= 0) {
      this.programService.deleteProgram(index).subscribe((programs) => {
        this.programs = programs;
        this.snackBar.open('Program deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
      });
    }
  }
}
