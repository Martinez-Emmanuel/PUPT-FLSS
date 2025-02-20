import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

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
  generatePdfFunction: (preview: boolean) => Blob | void;
  showViewToggle?: boolean;
  exportType?: 'all' | 'single';
  fileName?: string;
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
    MatSymbolDirective,
  ],
  templateUrl: './dialog-view-schedule.component.html',
  styleUrls: ['./dialog-view-schedule.component.scss'],
  animations: [fadeAnimation],
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
    private sanitizer: DomSanitizer,
  ) {
    this.showViewToggle = data.showViewToggle ?? true;
    if (!this.showViewToggle) {
      this.selectedView = 'pdf-view';
    }
  }

  ngOnInit(): void {
    this.initializeScheduleTitle();

    if (this.data.entity === 'program') {
      if (this.data.scheduleGroups && this.data.scheduleGroups.length > 0) {
        this.scheduleGroups = this.data.scheduleGroups;
        this.scheduleData = this.flattenScheduleGroups(
          this.data.scheduleGroups,
        );
        this.generateAndDisplayPdf();
      } else {
        this.scheduleData = [];
      }
    } else if (this.data.entity === 'faculty' || this.data.entity === 'room') {
      if (this.data.exportType === 'all') {
        this.scheduleData = this.data.entityData;
        this.generateAndDisplayPdf();
      } else if (
        Array.isArray(this.data.entityData) &&
        this.data.entityData.length > 0
      ) {
        this.scheduleData = this.data.entityData;
      } else {
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
            groupTitle: group.title,
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
        this.pdfBlobUrl =
          this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl);
      } else {
        this.pdfBlobUrl = null;
      }
    } else {
      this.pdfBlobUrl = null;
    }
  }

  downloadPdf(): void {
    if (!this.data.generatePdfFunction) {
      return;
    }

    const pdfResult = this.data.generatePdfFunction(false);
    if (!(pdfResult instanceof Blob)) {
      return;
    }

    const blobUrl = URL.createObjectURL(pdfResult);
    const a = document.createElement('a');
    a.href = blobUrl;

    const fileName =
      this.data.fileName ??
      this.data.customTitle?.replace(/\s+/g, '_') ??
      'schedule';
    a.download = `${fileName}.pdf`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  trackGroup(index: number, group: ScheduleGroup): any {
    return group ? group.title : undefined;
  }
}
