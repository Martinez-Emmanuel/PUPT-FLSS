import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import {
  TableDialogComponent,
  DialogConfig,
} from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';

import {
  AdminService,
  User,
} from '../../../../services/superadmin/management/admin/admin.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  adminStatuses = ['Active', 'Inactive'];
  selectedAdminIndex: number | null = null;

  admins: User[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Admin Code' },  // Display 'Admin Code' as per requirement
    { key: 'name', label: 'Name' },
    { key: 'passwordDisplay', label: 'Password' }, 
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  
  displayedColumns: string[] = [
    'index', 
    'code',    // 'Admin Code'
    'name', 
    'passwordDisplay',
    'email', 
    'role', 
    'status', 
    'action'
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
        email: admin.faculty?.faculty_email || '',
        passwordDisplay: '••••••••'
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
          maxLength: 10,
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
          required: true,
        },
        {
          label: 'Email',
          formControlName: 'email',
          type: 'text',
          maxLength: 100,
          required: true,
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
      initialValue: admin || { status: 'Active' },
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
    // Prepare data for update request
    const adminData: any = {
      name: updatedAdmin.name,
      role: updatedAdmin.role,
      password: updatedAdmin.password || null,  // Only include password if updated
    };
  
    if (adminData.password === null) {
      delete adminData.password;  // Remove password if it wasn't updated
    }
  
    // Handle faculty-specific data if the role is 'faculty'
    if (updatedAdmin.role === 'faculty') {
      adminData.faculty_email = updatedAdmin.email;  // faculty_email comes from 'email'
      adminData.faculty_type = updatedAdmin.faculty_type;
      adminData.faculty_unit = updatedAdmin.faculty_unit;
    }
  
    // Send update request to the backend
    this.adminService.updateAdmin(id, adminData).subscribe((updatedAdminResponse) => {
      const index = this.admins.findIndex(admin => admin.id === id);  // Find by 'id'
  
      if (index !== -1) {
        this.admins[index] = {
          ...updatedAdminResponse,
          passwordDisplay: '••••••••',  // Masked password in UI
          email: updatedAdminResponse.faculty?.faculty_email || '',  // Use faculty email if available
        };
      }
  
      this.snackBar.open('Admin updated successfully', 'Close', {
        duration: 3000,
      });
  
      this.cdr.markForCheck();
    });
  }
  

  deleteAdmin(admin: User) {
    const index = this.admins.indexOf(admin);
    if (index >= 0) {
      this.adminService.deleteAdmin(admin.id).subscribe(() => {  // Use 'id' for deletion
        this.admins.splice(index, 1);
        this.snackBar.open('Admin deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
      });
    }
  }
}
