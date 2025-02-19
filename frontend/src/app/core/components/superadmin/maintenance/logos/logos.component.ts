import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { DialogGenericComponent } from '../../../../../shared/dialog-generic/dialog-generic.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { LogoService, Logo } from '../../../../services/logo/logo.service';
import { LogoCacheService } from '../../../../services/cache/logo-cache.service';

import { fadeAnimation } from '../../../../animations/animations';

type LogoType = 'university' | 'government';

@Component({
  selector: 'app-logos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSymbolDirective,
    MatTooltipModule,
    LoadingComponent,
  ],
  templateUrl: './logos.component.html',
  styleUrls: ['./logos.component.scss'],
  animations: [fadeAnimation],
})
export class LogosComponent implements OnInit {
  @ViewChild('universityInput') universityInput!: ElementRef<HTMLInputElement>;
  @ViewChild('governmentInput') governmentInput!: ElementRef<HTMLInputElement>;

  isLoading = true;

  private static readonly LOGO_TYPES = {
    UNIVERSITY: 'university' as LogoType,
    GOVERNMENT: 'government' as LogoType,
  } as const;

  private static readonly MAX_FILENAME_LENGTH = 100;
  private static readonly MAX_FILE_SIZE = 1024 * 1024;
  private static readonly ALLOWED_FILE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/jpg',
  ] as const;

  private static readonly SNACKBAR_DURATION = {
    SHORT: 3000,
    LONG: 5000,
  } as const;

  private static readonly LOGO_DISPLAY_NAMES: Record<LogoType, string> = {
    university: 'University logo',
    government: 'Government brand',
  } as const;

  universityLogo: Logo | null = null;
  governmentLogo: Logo | null = null;

  constructor(
    public logoService: LogoService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private logoCacheService: LogoCacheService,
  ) {}

  ngOnInit(): void {
    this.loadLogos();
  }

  private loadLogos(): void {
    this.logoService.getAllLogos().subscribe({
      next: (logos) => {
        this.universityLogo =
          logos.find(
            (logo) => logo.type === LogosComponent.LOGO_TYPES.UNIVERSITY,
          ) || null;
        this.governmentLogo =
          logos.find(
            (logo) => logo.type === LogosComponent.LOGO_TYPES.GOVERNMENT,
          ) || null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading logos:', error);
        this.showErrorMessage(
          'Unable to load logos. Please try refreshing the page.',
        );
        this.isLoading = false;
      },
    });
  }

  triggerFileInput(type: string): void {
    const input =
      type === LogosComponent.LOGO_TYPES.UNIVERSITY
        ? this.universityInput
        : this.governmentInput;
    input.nativeElement.click();
  }

  onFileSelected(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const validationError = this.validateFile(file);

    if (validationError) {
      this.showErrorMessage(validationError);
      input.value = '';
      return;
    }

    this.uploadLogo(file, type, input);
  }

  private uploadLogo(file: File, type: string, input: HTMLInputElement): void {
    this.logoService.uploadLogo(type, file).subscribe({
      next: (logo) => {
        this.handleSuccessfulUpload(type, logo);
      },
      error: (error) => {
        this.handleUploadError(error, type);
        input.value = '';
      },
    });
  }

  private handleSuccessfulUpload(type: string, logo: Logo): void {
    if (type === LogosComponent.LOGO_TYPES.UNIVERSITY) {
      this.universityLogo = logo;
    } else {
      this.governmentLogo = logo;
    }

    this.logoCacheService.refreshCache(type as LogoType);

    this.showSuccessMessage(
      `${
        LogosComponent.LOGO_DISPLAY_NAMES[type as LogoType]
      } uploaded successfully!`,
    );
  }

  private handleUploadError(error: any, type: string): void {
    const errorMessage = this.extractErrorMessage(error, type);
    this.showErrorMessage(`${errorMessage} Please try again.`);
    console.error('Error uploading logo:', error);
  }

  private extractErrorMessage(error: any, type: string): string {
    if (error.error?.errors) {
      if (error.error.errors.logo) return error.error.errors.logo[0];
      if (error.error.errors.type) return error.error.errors.type[0];
    }
    return `Failed to upload ${LogosComponent.LOGO_DISPLAY_NAMES[
      type as LogoType
    ].toLowerCase()}`;
  }

  private validateFile(file: File): string | null {
    if (file.name.length > LogosComponent.MAX_FILENAME_LENGTH) {
      return `Filename too long! Please rename your file to be shorter than
        ${LogosComponent.MAX_FILENAME_LENGTH} characters.`;
    }

    if (file.size > LogosComponent.MAX_FILE_SIZE) {
      return 'Image too large! Please select a file smaller than 1MB.';
    }

    if (!LogosComponent.ALLOWED_FILE_TYPES.includes(file.type as any)) {
      return 'Invalid file type! Please upload a JPG or PNG image.';
    }

    return null;
  }

  confirmDelete(type: string): void {
    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: 'Confirm Deletion',
        content: `Are you sure you want to remove this
          ${LogosComponent.LOGO_DISPLAY_NAMES[type as LogoType].toLowerCase()}?
          This action cannot be undone.`,
        actionText: 'Delete',
        cancelText: 'Cancel',
        action: 'delete',
      },
      panelClass: 'dialog-base',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteLogo(type);
      }
    });
  }

  private deleteLogo(type: string): void {
    this.logoService.deleteLogo(type).subscribe({
      next: () => {
        this.handleSuccessfulDeletion(type);
      },
      error: (error) => {
        this.handleDeletionError(error, type);
      },
    });
  }

  private handleSuccessfulDeletion(type: string): void {
    if (type === LogosComponent.LOGO_TYPES.UNIVERSITY) {
      this.universityLogo = null;
    } else {
      this.governmentLogo = null;
    }

    this.logoCacheService.refreshCache(type as LogoType);

    this.showSuccessMessage(
      `${
        LogosComponent.LOGO_DISPLAY_NAMES[type as LogoType]
      } removed successfully!`,
    );
  }

  private handleDeletionError(error: any, type: string): void {
    this.showErrorMessage(
      `Unable to remove ${LogosComponent.LOGO_DISPLAY_NAMES[
        type as LogoType
      ].toLowerCase()}. Please try again.`,
    );
    console.error('Error removing logo:', error);
  }

  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: LogosComponent.SNACKBAR_DURATION.SHORT,
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: LogosComponent.SNACKBAR_DURATION.LONG,
    });
  }
}
