import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { fadeAnimation} from '../../../../animations/animations';

import { Program, ProgramsService } from '../../../../services/superadmin/programs/programs.service';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramsComponent implements OnInit {
  programStatuses = ['active', 'inactive'];
  programYears = [1, 2, 3, 4, 5];
  isEdit = false;
  selectedProgramIndex: number | null = null;

  programs: Program[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'program_code', label: 'Program Code' },
    { key: 'program_title', label: 'Program Title' },
    { key: 'program_info', label: 'Program Info' },
    { key: 'status', label: 'Status' },
    { key: 'number_of_years', label: 'Years' },
  ];

  displayedColumns: string[] = [
    'index',
    'program_code',
    'program_title',
    'program_info',
    'status',
    'number_of_years',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Programs',
      key: 'search'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private programService: ProgramsService
  ) {}

  ngOnInit() {
    this.fetchPrograms();
  }

  fetchPrograms() {
    this.programService.getPrograms().subscribe((programs) => {
      this.programs = programs;
      console.log(this.programs);
      this.cdr.markForCheck();
    });
  }

  onInputChange(values: {[key: string]: any}) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
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

  onExport(exportOption?: 'all' | 'current') {
    if (exportOption === 'current') {
      console.log('Exporting this item only to PDF');
      // TODO: Implement logic here
    } else {
      console.log('Exporting all to PDF');
      // TODO: Implement logic here
    }
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
          formControlName: 'status',
          type: 'select',
          options: this.programStatuses,
          required: true,
        },
        {
          label: 'Years',
          formControlName: 'number_of_years',
          type: 'select',
          options: this.programYears,
          required: true,
        },
      ],
      initialValue: program || {
        status: 'Active',
        number_of_years: '4',
      },
    };
  }

  openAddProgramDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.programService.addProgram(result).subscribe((newProgram) => {
          this.programs.push(newProgram);
          this.snackBar.open('Program added successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
          this.fetchPrograms();
        });
      }
    });
  }

  openEditProgramDialog(program: Program) {
    this.selectedProgramIndex = this.programs.indexOf(program);
    const config = this.getDialogConfig(program);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedProgramIndex !== null) {
        this.updateProgram(result);
      }
    });
  }

  updateProgram(updatedProgram: any) {
    if (this.selectedProgramIndex !== null) {
      const selectedProgram = this.programs[this.selectedProgramIndex];
      this.programService
        .updateProgram(selectedProgram.program_id, updatedProgram)
        .subscribe((program) => {
          this.programs[this.selectedProgramIndex!] = program;  // Use non-null assertion operator
          this.snackBar.open('Program updated successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
          this.fetchPrograms();
        });
    }
  }

  deleteProgram(program: Program) {
    const index = this.programs.indexOf(program);
    if (index >= 0) {
      this.programService.deleteProgram(program.program_id).subscribe(() => {
        this.programs.splice(index, 1);
        this.snackBar.open('Program deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
        this.fetchPrograms();
      });
    }
  }
}
