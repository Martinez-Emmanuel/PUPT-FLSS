import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { MaterialComponents } from '../../../../imports/material.component';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

interface Program {
  program_code: string;
  program_title: string;
  program_info: string;
  program_status: string;
}

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    MaterialComponents,
    CommonModule,
    MatSymbolDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgramsComponent implements OnInit {
  @ViewChild('addEditProgramDialog') addEditProgramDialog!: TemplateRef<any>;
  addProgramForm!: FormGroup;
  programStatuses = ['Active', 'Inactive'];
  isAddProgramDialogOpen = false;
  isEdit = false;
  selectedProgramIndex: number | null = null;

  programs: Program[] = [
    {
      program_code: 'BSA-TG',
      program_title: 'Bachelor of Science in Accountancy',
      program_info:
        'This program focuses on financial accounting, management accounting, auditing, and taxation.',
      program_status: 'Active',
    },
    {
      program_code: 'BSEE-TG',
      program_title: 'Bachelor of Science in Electronics Engineering',
      program_info:
        'This program focuses on the design, development, and testing of electronic devices and systems.',
      program_status: 'Active',
    },
    {
      program_code: 'BSME-TG',
      program_title: 'Bachelor of Science in Mechanical Engineering',
      program_info:
        'This program focuses on the design, manufacturing, and maintenance of mechanical systems.',
      program_status: 'Active',
    },
    {
      program_code: 'BSIT-TG',
      program_title: 'Bachelor of Science in Information Technology',
      program_info:
        'This program focuses on computer science and information technology.',
      program_status: 'Active',
    },
    {
      program_code: 'BSBA-MM-TG',
      program_title:
        'Bachelor of Science in Business Administration Major in Marketing Management',
      program_info:
        'This program focuses on marketing principles, consumer behavior, and market research.',
      program_status: 'Active',
    },
    {
      program_code: 'BSBA-HRM-TG',
      program_title:
        'Bachelor of Science in Business Administration Major in Human Resource Management',
      program_info:
        'This program focuses on employee recruitment, training, development, and performance management.',
      program_status: 'Active',
    },
    {
      program_code: 'BSED-ENG-TG',
      program_title:
        'Bachelor of Science in Secondary Education Major in English',
      program_info:
        'This program focuses on teaching English language and literature to secondary level students.',
      program_status: 'Active',
    },
    {
      program_code: 'BSED-MATH-TG',
      program_title: 'Bachelor of Science in Secondary Education Major in Math',
      program_info:
        'This program focuses on teaching mathematics to secondary level students.',
      program_status: 'Active',
    },
    {
      program_code: 'BSOA-LT-TG',
      program_title:
        'Bachelor of Science in Office Administration Major in Legal Transcription',
      program_info:
        'This program focuses on legal transcription, document formatting, and legal terminology.',
      program_status: 'Active',
    },
    {
      program_code: 'DOMT-LOM-TG',
      program_title:
        'Diploma in Office Management Technology with Specialization in Legal Office Management',
      program_info:
        'This program focuses on legal office procedures, document management, and legal support services.',
      program_status: 'Active',
    },
    {
      program_code: 'DICT-TG',
      program_title: 'Diploma in Communication Information Technology',
      program_info:
        'This program focuses on computer networks, software applications, and digital communication.',
      program_status: 'Active',
    },
  ];

  dataSource = new MatTableDataSource<Program>([]);
  displayedColumns: string[] = [
    'num',
    'program_code',
    'program_title',
    'program_info',
    'program_status',
    'action',
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initAddProgramForm();
    this.dataSource.data = this.programs;
  }

  initAddProgramForm() {
    this.addProgramForm = this.formBuilder.group({
      program_code: ['', Validators.required],
      program_title: ['', Validators.required],
      program_info: ['', Validators.required],
      program_status: ['Active', Validators.required],
    });
  }

  openAddProgramDialog() {
    this.isEdit = false;
    this.initAddProgramForm();
    this.isAddProgramDialogOpen = true;
    this.dialog.open(this.addEditProgramDialog, {
      width: '250px',
    });
  }

  openEditProgramDialog(program: Program) {
    this.isEdit = true;
    this.selectedProgramIndex = this.programs.indexOf(program);
    this.addProgramForm.patchValue(program);
    this.isAddProgramDialogOpen = true;
    this.dialog.open(this.addEditProgramDialog, {
      width: '250px',
    });
  }

  closeDialog() {
    this.isAddProgramDialogOpen = false;
    this.dialog.closeAll();
  }

  addProgram() {
    if (this.addProgramForm.valid) {
      const newProgram = this.addProgramForm.value;
      this.programs.push(newProgram);
      this.dataSource.data = this.programs;
      this.closeDialog();
      this.snackBar.open('Program added successfully', 'Close', {
        duration: 3000,
      });
    }
  }

  updateProgram() {
    if (this.addProgramForm.valid && this.selectedProgramIndex !== null) {
      const updatedProgram = this.addProgramForm.value;
      this.programs[this.selectedProgramIndex] = updatedProgram;
      this.dataSource.data = this.programs;
      this.closeDialog();
      this.snackBar.open('Program updated successfully', 'Close', {
        duration: 3000,
      });
    }
  }

  deleteProgram(program: Program) {
    const index = this.programs.indexOf(program);
    if (index >= 0) {
      this.programs.splice(index, 1);
      this.dataSource.data = this.programs;
      this.snackBar.open('Program deleted successfully', 'Close', {
        duration: 3000,
      });
    }
  }
}
