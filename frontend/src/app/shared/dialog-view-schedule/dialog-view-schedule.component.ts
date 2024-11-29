import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';

import { LoadingComponent } from '../loading/loading.component';
import { ScheduleTimelineComponent } from '../schedule-timeline/schedule-timeline.component';

import { fadeAnimation } from '../../core/animations/animations';

interface ScheduleGroup {
  title: string;
  scheduleData: any;
}

interface ViewScheduleDialogData {
  entity: string;
  entityData?: any;
  customTitle?: string;
  academicYear?: string;
  semester?: number;
  scheduleGroups?: ScheduleGroup[];
  generatePdfFunction?: (preview: boolean) => Blob | void; 
  showViewToggle?: boolean;
  exportType?: 'all' | 'single';
}

@Component({
    selector: 'app-dialog-view-schedule',
    imports: [
        CommonModule,
        FormsModule,
        LoadingComponent,
        ScheduleTimelineComponent,
        MatTableModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatIconModule,
    ],
    templateUrl: './dialog-view-schedule.component.html',
    styleUrls: ['./dialog-view-schedule.component.scss'],
    animations: [fadeAnimation]
})
export class DialogViewScheduleComponent implements OnInit {
  title: string = '';
  subtitle: string = '';
  isLoading = true;
  scheduleData: any;
  scheduleGroups?: ScheduleGroup[];
  selectedView: 'table-view' | 'pdf-view' = 'table-view';
  pdfBlobUrl: SafeResourceUrl | null = null;
  showViewToggle: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<DialogViewScheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewScheduleDialogData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initializeScheduleTitle();
  
    if (this.data.entity === 'program') {
      if (this.data.scheduleGroups && this.data.scheduleGroups.length > 0) {
        this.scheduleGroups = this.data.scheduleGroups;
        this.scheduleData = this.flattenScheduleGroups(this.data.scheduleGroups);
        this.generateAndDisplayPdf();
      } else {
        console.warn('No schedule groups available for programs.');
        this.scheduleData = [];
      }
    } else if (this.data.entity === 'faculty' || this.data.entity === 'room') { 
      if (this.data.exportType === 'all') {
        this.scheduleData = this.data.entityData;
        this.generateAndDisplayPdf();
      } else if (Array.isArray(this.data.entityData) && this.data.entityData.length > 0) {
        this.scheduleData = this.data.entityData;
      } else {
        console.warn('No schedules found or invalid data structure:', this.data.entityData);
        this.scheduleData = this.data.entityData || []; 
      }
    }
    this.isLoading = false;
  }
  

  private flattenScheduleGroups(groups: ScheduleGroup[]): any[] {
    const flattenedData: any[] = [];

    groups.forEach((group) => {
        if (Array.isArray(group.scheduleData)) {
            group.scheduleData.forEach((scheduleItem: any) => {
                flattenedData.push({
                    ...scheduleItem,
                    groupTitle: group.title
                });
            });
        }
    });

    return flattenedData;
  }

  private initializeScheduleTitle(): void {
    this.setTitleAndSubtitle();
  }

  private setTitleAndSubtitle(): void {
    const { customTitle, entityData, academicYear, semester } = this.data;

    this.title =
      customTitle ?? entityData?.name ?? entityData?.title ?? 'Schedule';
    this.subtitle =
      academicYear && semester
        ? `For Academic Year ${academicYear}, ${semester}`
        : '';
    this.isLoading = false;
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  onViewChange(view: 'table-view' | 'pdf-view'): void {
    this.selectedView = view;
    if (view === 'pdf-view') {
        this.generateAndDisplayPdf();
    } else {
        this.pdfBlobUrl = null;
    }
  }
  
  generateAndDisplayPdf(): void {
    if (this.data.generatePdfFunction) {
      const pdfBlob = this.data.generatePdfFunction(true);
      if (pdfBlob instanceof Blob) {
        const blobUrl = URL.createObjectURL(pdfBlob);
        this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      } else {
        console.error('generatePdfFunction did not return a Blob.');
        this.pdfBlobUrl = null;
      }
    } else {
      console.error('No generatePdfFunction provided.');
      this.pdfBlobUrl = null;
    }
  }

  downloadPdf(): void {
    if (this.data.generatePdfFunction) {
      const pdfBlob = this.data.generatePdfFunction(false); 

      if (pdfBlob instanceof Blob) {
        const blobUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = blobUrl;

        const academicYear = this.data.academicYear ? this.data.academicYear.replace(/\s+/g, '_') : '';

        const fileName = `${(this.data.customTitle ?? 'schedule').replace(/\s+/g, '_')}_${academicYear}_report.pdf`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(blobUrl);
      } else {
        console.error('Failed to generate a valid Blob for the PDF.');
      }
    } else {
      console.error('No generatePdfFunction provided.');
    }
  }

  trackGroup(index: number, group: ScheduleGroup): any {
    return group ? group.title : undefined;
  }
  
}

