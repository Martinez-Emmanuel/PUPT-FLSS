import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Admin {
  adminId: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private adminsSubject = new BehaviorSubject<Admin[]>([
    {
      adminId: 'SPA11234TG',
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Super Admin',
      status: 'Active',
    },
    {
      adminId: 'ADM55678TG',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      role: 'Admin',
      status: 'Inactive',
    },
    {
      adminId: 'ADM78910TG',
      name: 'Adrian Naoe',
      email: 'naoe.adrianb@gmail.com',
      role: 'Admin',
      status: 'Active',
    },
    {
      adminId: 'SPA47910TG',
      name: 'Kyla Malaluan',
      email: 'malaluankyla@gmail.com',
      role: 'Super Admin',
      status: 'Active',
    },
    {
      adminId: 'ADM00765TG',
      name: 'Alice Guo',
      email: 'alice123@gmail.com',
      role: 'Admin',
      status: 'Inactive',
    },
  ]);

  getAdmins(): Observable<Admin[]> {
    return this.adminsSubject.asObservable();
  }

  addAdmin(admin: Admin): Observable<Admin[]> {
    const admins = this.adminsSubject.getValue();
    this.adminsSubject.next([...admins, admin]);
    return of(this.adminsSubject.getValue());
  }

  updateAdmin(index: number, updatedAdmin: Admin): Observable<Admin[]> {
    const admins = this.adminsSubject.getValue();
    admins[index] = updatedAdmin;
    this.adminsSubject.next([...admins]);
    return of(this.adminsSubject.getValue());
  }

  deleteAdmin(index: number): Observable<Admin[]> {
    const admins = this.adminsSubject.getValue();
    admins.splice(index, 1);
    this.adminsSubject.next([...admins]);
    return of(this.adminsSubject.getValue());
  }
}