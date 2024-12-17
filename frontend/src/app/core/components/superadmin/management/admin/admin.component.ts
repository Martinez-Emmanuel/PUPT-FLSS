import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { AdminService, User } from '../../../../services/superadmin/management/admin/admin.service';

import { fadeAnimation } from '../../../../animations/animations';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit, OnDestroy {
  adminStatuses = ['Active', 'Inactive'];
  selectedAdminIndex: number | null = null;

  admins: User[] = [];
  filteredAdmins: User[] = [];
  isLoading = true;
  
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Admin Code' },
    { key: 'fullName', label: 'Name' },
    { key: 'passwordDisplay', label: 'Password' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index',
    'code',
    'fullName',
    'passwordDisplay',
    'role',
    'status',
    'action',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Admin',
      key: 'search',
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    this.fetchAdmins();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchAdmins() {
    this.isLoading = true;
    this.adminService
      .getAdmins()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (admins) => {
          this.admins = admins.map((admin) => ({
            ...admin,
            fullName: `${admin.last_name}, ${admin.first_name} ${
              admin.middle_name ?? ''
            } ${admin.suffix_name ?? ''}`,
            passwordDisplay: '••••••••',
          }));
          this.filteredAdmins = [...this.admins];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.snackBar.open(
            'Error fetching admins. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((searchTerm) => {
        this.onSearch(searchTerm || '');
      });
  }

  onSearch(searchTerm: string) {
    const lowerSearch = searchTerm.toLowerCase();

    if (!lowerSearch) {
      this.filteredAdmins = [...this.admins];
    } else {
      this.filteredAdmins = this.admins.filter(
        (admin) =>
          admin.code.toLowerCase().includes(lowerSearch) ||
          admin.fullName.toLowerCase().includes(lowerSearch) ||
          admin.role.toLowerCase().includes(lowerSearch) ||
          admin.status.toLowerCase().includes(lowerSearch)
      );
    }
    this.cdr.markForCheck();
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
  }

  private getDialogConfig(admin?: User): DialogConfig {
    return {
      title: 'Admin',
      isEdit: !!admin,
      fields: [
        {
          label: 'Admin Code',
          formControlName: 'code',
          type: 'text',
          maxLength: 20,
          required: true,
          disabled: !!admin,
        },
        {
          label: 'Last Name',
          formControlName: 'last_name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'First Name',
          formControlName: 'first_name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Middle Name',
          formControlName: 'middle_name',
          type: 'text',
          maxLength: 50,
        },
        {
          label: 'Suffix',
          formControlName: 'suffix_name',
          type: 'text',
          maxLength: 50,
        },
        {
          label: 'Email',
          formControlName: 'email',
          type: 'text',
          maxLength: 100,
          required: true,
        },
        {
          label: 'Password',
          formControlName: 'password',
          type: 'text',
          maxLength: 100,
          required: !admin,
        },
        {
          label: 'Confirm Password',
          formControlName: 'confirmPassword',
          type: 'text',
          maxLength: 100,
          required: !admin,
          confirmPassword: true,
        },
        {
          label: 'Role',
          formControlName: 'role',
          type: 'select',
          options: ['admin', 'superadmin'],
          required: true,
        },
        {
          label: 'Status',
          formControlName: 'status',
          type: 'select',
          options: this.adminStatuses,
          required: true,
        },
      ],
      initialValue: admin ? { ...admin, password: '' } : { status: 'Active' },
    };
  }

  openAddAdminDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const { confirmPassword, ...adminData } = result;
        const { name, ...rest } = adminData;

        this.adminService.addAdmin(rest).subscribe({
          next: (newAdmin) => {
            this.snackBar.open('Admin added successfully', 'Close', {
              duration: 3000,
            });
            this.fetchAdmins();
          },
          error: (error) => {
            this.snackBar.open(
              'Error adding admin. Please try again.',
              'Close',
              {
                duration: 3000,
              }
            );
            console.error('Error adding admin:', error);
          },
        });
      }
    });
  }

  openEditAdminDialog(admin: User) {
    const config = this.getDialogConfig(admin);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Check if role has changed
        if (result.role !== admin.role) {
          // Get new admin code based on new role
          this.adminService.getNextAdminCode(result.role).subscribe({
            next: (newCode) => {
              const updatedAdmin = {
                ...result,
                code: newCode,
              };
              this.updateAdmin(admin.id, updatedAdmin);
            },
            error: (error) => {
              this.snackBar.open(
                'Error generating new admin code. Please try again.',
                'Close',
                {
                  duration: 3000,
                }
              );
              console.error('Error generating admin code:', error);
            },
          });
        } else {
          this.updateAdmin(admin.id, result);
        }
      }
    });
  }

  updateAdmin(id: string, updatedAdmin: any) {
    const { confirmPassword, ...adminData } = updatedAdmin;

    // Only include password if it was changed
    if (!adminData.password) {
      delete adminData.password;
    }

    this.adminService.updateAdmin(id, adminData).subscribe({
      next: (updatedAdminResponse) => {
        const index = this.admins.findIndex((admin) => admin.id === id);
        if (index !== -1) {
          this.admins[index] = {
            ...updatedAdminResponse,
            passwordDisplay: '••••••••',
          };
        }

        this.snackBar.open('Admin updated successfully', 'Close', {
          duration: 3000,
        });
        this.fetchAdmins();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.snackBar.open('Error updating admin. Please try again.', 'Close', {
          duration: 3000,
        });
        console.error('Error updating admin:', error);
      },
    });
  }

  deleteAdmin(admin: User) {
    const index = this.admins.indexOf(admin);
    if (index >= 0) {
      this.adminService.deleteAdmin(admin.id).subscribe(
        () => {
          this.snackBar.open('Admin deleted successfully', 'Close', {
            duration: 3000,
          });
          this.fetchAdmins();
          this.cdr.markForCheck();
        },
        (error) => {
          this.snackBar.open(
            'Error deleting admin. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
          console.error('Error deleting admin:', error);
        }
      );
    }
  }
}
