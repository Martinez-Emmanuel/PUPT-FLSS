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
  Admin,
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

  admins: Admin[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'adminId', label: 'Admin ID' },
    { key: 'name', label: 'Name' },
    { key: 'password', label: 'Password'},
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index', 
    'adminId', 
    'name', 
    'password',
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
      this.admins = admins;
      this.cdr.markForCheck();
    });
  }

  onSearch(searchTerm: string) {
    this.adminService.getAdmins().subscribe((admins) => {
      this.admins = admins.filter(
        (admin) =>
          admin.adminId.includes(searchTerm) ||
          admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
      this.cdr.markForCheck();
    });
  }

  private getDialogConfig(admin?: Admin): DialogConfig {
    return {
      title: 'Admin',
      isEdit: !!admin,
      fields: [
        {
          label: 'Admin ID',
          formControlName: 'adminId',
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
          options: ['Admin', 'Super Admin'],
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
        this.adminService.addAdmin(result).subscribe((admins) => {
          this.admins = admins;
          this.snackBar.open('Admin added successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
      }
    });
  }

  openEditAdminDialog(admin: Admin) {
    this.selectedAdminIndex = this.admins.indexOf(admin);
    const config = this.getDialogConfig(admin);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedAdminIndex !== null) {
        this.updateAdmin(result);
      }
    });
  }

  updateAdmin(updatedAdmin: any) {
    if (this.selectedAdminIndex !== null) {
      this.admins[this.selectedAdminIndex] = {
        ...this.admins[this.selectedAdminIndex],
        ...updatedAdmin,
      };

      this.adminService
        .updateAdmin(this.selectedAdminIndex, updatedAdmin)
        .subscribe((admins) => {
          this.admins = admins;
          this.snackBar.open('Admin updated successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
    }
  }

  deleteAdmin(admin: Admin) {
    const index = this.admins.indexOf(admin);
    if (index >= 0) {
      this.adminService.deleteAdmin(index).subscribe((admins) => {
        this.admins = admins;
        this.snackBar.open('Admin deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
      });
    }
  }
}