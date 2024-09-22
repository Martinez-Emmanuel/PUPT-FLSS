import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';

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
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  adminStatuses = ['active', 'inactive'];
  selectedAdminIndex: number | null = null;

  admins: User[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Admin Code' },  // Display 'Admin Code' as per requirement
    { key: 'name', label: 'Name' },
    { key: 'passwordDisplay', label: 'Password' }, 
    // { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  
  displayedColumns: string[] = [
    'index', 
    'code',    // 'Admin Code'
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
    this.adminService.getAdmins().subscribe((admins) => {
      this.admins = admins.map(admin => ({
        ...admin,
        // email: admin.email || '',  // Email comes from faculty_email if it exists
        passwordDisplay: '••••••••' // Mask password in UI
      }));
      this.cdr.markForCheck();
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
          required: false,
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
      initialValue: admin ? { ...admin, password: '' } : {},
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
        this.adminService.addAdmin(result).subscribe((newAdmin) => {
          this.admins.push(newAdmin);
          this.snackBar.open('Admin added successfully', 'Close', {
            duration: 3000,
          });
          this.fetchAdmins();
          this.cdr.markForCheck();
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
    const adminData: any = {
      name: updatedAdmin.name,
      role: updatedAdmin.role,
      status: updatedAdmin.status,
    };
  
    // Include the password only if it is not empty
    if (updatedAdmin.password) {
      adminData.password = updatedAdmin.password;
    }
  
    this.adminService.updateAdmin(id, adminData).subscribe((updatedAdminResponse) => {
      const index = this.admins.findIndex(admin => admin.id === id);
  
      if (index !== -1) {
        this.admins[index] = {
          ...updatedAdminResponse,
          passwordDisplay: '••••••••',  // Keep showing the masked password in the table
          email: updatedAdminResponse.faculty?.faculty_email || '',
        };
      }
  
      this.snackBar.open('Admin updated successfully', 'Close', {
        duration: 3000,
      });
      this.fetchAdmins();
      this.cdr.markForCheck();
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
