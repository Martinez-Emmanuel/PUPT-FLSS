import { Component, Inject, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { LoadingComponent } from '../loading/loading.component';

import { fadeAnimation } from '../../core/animations/animations';

interface ExportDialogData {
  exportType: 'all' | 'single';
  entity: string;
  entityData?: any;
  customTitle?: string;
  generatePdfFunction?: (showPreview: boolean) => Blob | void;
}

@Component({
  selector: 'app-dialog-export',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSymbolDirective,
  ],
  templateUrl: './dialog-export.component.html',
  styleUrls: ['./dialog-export.component.scss'],
  animations: [fadeAnimation],
})
export class DialogExportComponent implements OnInit, AfterViewInit {
  title: string = '';
  subtitle: string = '';
  isLoading = true;
  exportType: 'all' | 'single' = 'single';
  pdfBlobUrl: SafeResourceUrl | null = null;

  @ViewChild('pdfIframe') pdfIframe!: ElementRef<HTMLIFrameElement>;

  constructor(
    public dialogRef: MatDialogRef<DialogExportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExportDialogData,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initializeExportData();
  }

  ngAfterViewInit(): void {
    this.handlePdfPreview();
  }

  private initializeExportData(): void {
    this.exportType = this.data.exportType || 'single';
    this.setTitleAndSubtitle();
    this.isLoading = false;
  }

  private setTitleAndSubtitle(): void {
    const { customTitle, entityData } = this.data;

    if (entityData) {
      this.title =
        entityData.name || entityData.title || customTitle || 'Export to PDF';
      this.subtitle = this.getSubtitle(entityData);
    } else {
      this.title = customTitle || 'Export to PDF';
      this.subtitle = '';
    }
  }

  private getSubtitle(entityData: any): string {
    if (entityData.academic_year && entityData.semester_label) {
      return `For Academic Year ${entityData.academic_year}, ${entityData.semester_label}`;
    } else if (entityData.description) {
      return entityData.description;
    }
    return '';
  }

  private handlePdfPreview(): void {
    if (this.data.generatePdfFunction) {
      setTimeout(() => this.renderPdfPreview(), 0);
    }
  }

  private renderPdfPreview(): void {
    const pdfBlob = this.data.generatePdfFunction?.(true);
    if (pdfBlob) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      this.pdfBlobUrl = this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl); 
  
      if (this.pdfIframe?.nativeElement) {
        this.pdfIframe.nativeElement.src = blobUrl; 
      } else {
        console.error('No PDF iframe element found.');
      }
    } else {
      console.error('PDF Blob is undefined or null.');
    }
  }
  
  


  public downloadPdf(): void {
    const pdfBlob = this.data.generatePdfFunction?.(false); 
    if (pdfBlob) {
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${this.title.replace(/ /g, '_').toLowerCase()}_report.pdf`; 
      link.click();
      URL.revokeObjectURL(blobUrl); 
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}