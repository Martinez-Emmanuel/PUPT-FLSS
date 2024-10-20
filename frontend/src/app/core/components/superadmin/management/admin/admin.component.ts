import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { AdminService, User } from '../../../../services/superadmin/management/admin/admin.service';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-admin',
  standalone: true,
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
export class AdminComponent implements OnInit {
  adminStatuses = ['Active', 'Inactive'];
  selectedAdminIndex: number | null = null;

  admins: User[] = [];
  isLoading = true;

  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Admin Code' },
    { key: 'name', label: 'Name' },
    { key: 'passwordDisplay', label: 'Password' }, 
    // { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  
  displayedColumns: string[] = [
    'index', 
    'code',
    'name', 
    'passwordDisplay',
    // 'email', 
    'role', 
    'status', 
    'action'
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
  }

  fetchAdmins() {
    this.isLoading = true;
    this.adminService.getAdmins().subscribe({
      next: (admins) => {
        this.admins = admins.map(admin => ({
          ...admin,
          passwordDisplay: '••••••••'
        }));
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.snackBar.open('Error fetching admins. Please try again.', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }
  

  onSearch(searchTerm: string) {
    this.adminService.getAdmins().subscribe((admins) => {
      this.admins = admins.filter(
        (admin) =>
          admin.id.includes(searchTerm) ||  // Search by 'id'
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  private getDialogConfig(admin?: User): DialogConfig {
    return {
      title: 'Admin',
      isEdit: !!admin,
      fields: [
        {
          label: 'Admin Code',  // Display 'Admin Code' in the dialog
          formControlName: 'code',
          type: 'text',
          maxLength: 20,
          required: true,
          disabled: !admin, // disable for new admins, enable for editing
        },
        {
          label: 'Name',
          formControlName: 'name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Password',
          formControlName: 'password',
          type: 'text',
          maxLength: 100,
          required: !admin, // required for new admins, optional for editing
        },
        {
          label: 'Confirm Password',
          formControlName: 'confirmPassword',
          type: 'text',
          maxLength: 100,
          required: !admin, // required for new admins, optional for editing
          confirmPassword: true,
        }, 
        // {
        //   label: 'Email',
        //   formControlName: 'email',
        //   type: 'text',
        //   maxLength: 100,
        //   required: true,
        // },
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
      initialValue: admin 
      ? { ...admin, password: '' } 
      : { status: 'Active' }, // set default status for new admins
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
        // remove the confirmPass field before sending the API
        const { confirmPassword, ...adminData } = result;

        this.adminService.addAdmin(adminData).subscribe({
          next: (newAdmin) => {
          // this.admins.push(newAdmin);
          this.snackBar.open('Admin added successfully', 'Close', {
            duration: 3000,
          });
          this.fetchAdmins();
          // this.cdr.markForCheck();
        },
        error: (error) => {
          this.snackBar.open('Error adding admin. Please try again.', 'Close', {
            duration: 3000,
        });
        console.error('Error adding admin:', error);
      }
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
        this.updateAdmin(admin.id, result);  // Use 'id' for updates
      }
    });
  }
  
  updateAdmin(id: string, updatedAdmin: any) {
    
    // Remove confirmPassword from the update data
    const { confirmPassword, ...adminData } = updatedAdmin;

    // Only include password if it was changed
    if (!adminData.password) {
      delete adminData.password;
    }

    this.adminService.updateAdmin(id, adminData).subscribe({
      next: (updatedAdminResponse) => {
        const index = this.admins.findIndex(admin => admin.id === id);
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
      }
    });
  }

  deleteAdmin(admin: User) {
    const index = this.admins.indexOf(admin);
    if (index >= 0) {
      this.adminService.deleteAdmin(admin.id).subscribe(() => {
        this.admins.splice(index, 1);
        this.snackBar.open('Admin deleted successfully', 'Close', {
          duration: 3000,
        });
        this.fetchAdmins();
        this.cdr.markForCheck();
      });
    }
  }
}  
