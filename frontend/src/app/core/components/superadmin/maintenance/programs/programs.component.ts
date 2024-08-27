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

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  
  showPreview = false; 

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

  public generatePDF(showPreview: boolean = false): void {
    const doc = new jsPDF('p', 'mm', 'legal') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const logoSize = 22;
    const topMargin = 15;
    let currentY = topMargin;

    // Add the left logo
    const leftLogoUrl = 'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png'; 
    doc.addImage(leftLogoUrl, 'PNG', margin, 10, logoSize, logoSize); 

    // Add the header text with different styles
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFontSize(12);
    doc.text('Gen. Santos Ave. Upper Bicutan, Taguig City', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(15);
    doc.setTextColor(0, 0, 0);
    doc.text('Program Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    // Add the horizontal line below the header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 7; // Move down after the header and line

    const bodyData = this.programs.map((program, index) => [
        (index + 1).toString(),
        program.program_code,
        program.program_title,
        program.program_info,
        program.status,
        program.number_of_years.toString(),
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['#', 'Program Code', 'Program Title', 'Program Info', 'Status', 'Years']],
        body: bodyData,
        theme: 'grid',
        headStyles: {
          fillColor: [128, 0, 0],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        bodyStyles: {
            fontSize: 8, 
            textColor: [0, 0, 0],
        },
        styles: {
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellPadding: 2,
        },
        columnStyles: { 
            0: { cellWidth: 15 },  // # (index)
            1: { cellWidth: 30 },  // Program Code
            2: { cellWidth: 50 },  // Program Title
            3: { cellWidth: 55 },  // Program Info
            4: { cellWidth: 25 },  // Status
            5: { cellWidth: 20 },  // Years
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data: any) => {
            currentY = data.cursor.y + 10;
        },
    });

    // Create the blob and generate the URL before setting the iframe source
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    if (showPreview) {
      this.showPreview = true; 
      setTimeout(() => {
          const iframe = document.getElementById('pdfPreview') as HTMLIFrameElement;

          if (iframe) {
              iframe.src = blobUrl;
          }
      }, 0); 
  } else {
      doc.save('programs_report.pdf');
  }
}

  onExport() {
    this.generatePDF(true);  // Trigger PDF generation with preview
  }

  cancelPreview() {
    this.showPreview = false;  // Hide the preview section
  }

  private getDialogConfig(program?: Program): DialogConfig {
    return {
      title: program ? 'Edit Program' : 'Add Program',
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