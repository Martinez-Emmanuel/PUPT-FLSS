import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
import { LoadingComponent } from '../loading/loading.component';
import { PreferencesService } from '../../core/services/faculty/preference/preferences.service';
import { fadeAnimation } from '../../core/animations/animations';

interface ExportDialogData {
  exportType: 'all' | 'single';
  entity: string;
  entityData?: any;
  customTitle?: string;
}

@Component({
  selector: 'app-dialog-export',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-export.component.html',
  styleUrls: ['./dialog-export.component.scss'],
  animations: [fadeAnimation],
})
export class DialogExportComponent implements OnInit {
  title: string = '';
  subtitle: string = '';
  isLoading = true;
  exportType: 'all' | 'single' = 'single';

  constructor(
    private preferencesService: PreferencesService,
    public dialogRef: MatDialogRef<DialogExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData
  ) {}

  ngOnInit(): void {
    this.exportType = this.data.exportType || 'single';
    this.exportType === 'single'
      ? this.setTitleForSingleExport()
      : this.setTitleForAllExport();
    this.fetchAcademicYearAndSemester();
  }

  setTitleForSingleExport(): void {
    const { entity, entityData } = this.data;
    if (entity === 'faculty') {
      this.title = `Prof. ${entityData.facultyName}`;
    } else if (entity === 'program') {
      this.title = `Program: ${entityData.programName}`;
    } else if (entity === 'room') {
      this.title = `Room: ${entityData.roomName}`;
    }
  }

  setTitleForAllExport(): void {
    const { entity, customTitle } = this.data;
    this.title =
      customTitle ||
      `Export All ${entity.charAt(0).toUpperCase() + entity.slice(1)} to PDF`;
  }

  fetchAcademicYearAndSemester(): void {
    this.preferencesService.getPreferences().subscribe((response) => {
      const firstFaculty = response.preferences[0];
      const activeSemester = firstFaculty?.active_semesters[0];
      if (activeSemester) {
        this.subtitle = `For Academic Year: ${activeSemester.academic_year}, ${activeSemester.semester_label}`;
      }
      this.isLoading = false;
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
