import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface Faculty {
  facultyId: string;
  name: string;
  email: string;
  type: string;  // Part-Time, Full-Time, Regular
  unitsAssigned: number;
  status: string;  // Active, Inactive
}

@Injectable({
  providedIn: 'root',
})
export class FacultyService {
  private facultySubject = new BehaviorSubject<Faculty[]>([
    {
      facultyId: 'FA1234TG2024',
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      type: 'Full-Time',
      unitsAssigned: 25,
      status: 'Active',
    },
    {
      facultyId: 'FA5678TG2024',
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      type: 'Part-Time',
      unitsAssigned: 10,
      status: 'Inactive',
    },
    {
      facultyId: 'FA1135TG2024',
      name: 'Emman Martinez',
      email: 'emmanmartinez@gmail.com',
      type: 'Full-Time',
      unitsAssigned: 25,
      status: 'Active',
    },
    {
      facultyId: 'FA0090TG2024',
      name: 'Adrian Naoe',
      email: 'naoe.adrianb@gmail.com',
      type: 'Regular',
      unitsAssigned: 30,
      status: 'Active',
    },
    {
      facultyId: 'FA0369TG2024',
      name: 'Kyla Malaluan',
      email: 'kyla.malaluan@gmail.com',
      type: 'Part-Time',
      unitsAssigned: 20,
      status: 'Inactive',
    },
  ]);

  getFaculty(isEditMode: boolean = false): Observable<Faculty[]> {
    if (isEditMode) {
      return of(this.facultySubject.getValue()); // Return full email for editing
    }
    const facultyWithMaskedEmails = this.facultySubject.getValue().map(faculty => ({
      ...faculty,
      email: this.maskEmail(faculty.email),
    }));
    return of(facultyWithMaskedEmails);
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (localPart.length > 2) {
      return `${localPart[0]}${'*'.repeat(localPart.length - 2)}${localPart[localPart.length - 1]}@${domain}`;
    }
    return email; // Fallback if email is too short
  }

  addFaculty(
    faculty: Faculty
  ): Observable<Faculty[]> {
    const facultyList = this.facultySubject.getValue();
    this.facultySubject.next([...facultyList, faculty]);
    return of(this.facultySubject.getValue());
  }

  updateFaculty(
    index: number, 
    updatedFaculty: Faculty
  ): Observable<Faculty[]> {
    const facultyList = this.facultySubject.getValue();
    facultyList[index] = updatedFaculty;
    this.facultySubject.next([...facultyList]);
    return of(this.facultySubject.getValue());
  }

  deleteFaculty(
    index: number
  ): Observable<Faculty[]> {
    const facultyList = this.facultySubject.getValue();
    facultyList.splice(index, 1);
    this.facultySubject.next([...facultyList]);
    return of(this.facultySubject.getValue());
  }
}