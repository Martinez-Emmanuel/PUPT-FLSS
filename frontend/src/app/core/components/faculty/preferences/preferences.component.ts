import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MaterialComponents } from '../../../imports/material.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { ThemeService } from '../../../services/theme/theme.service';
import { TimeFormatPipe } from '../../../pipes/time-format/time-format.pipe';
import { TimeSelectionDialogComponent } from '../../../../shared/time-selection-dialog/time-selection-dialog.component';

interface Subject {
  code: string;
  title: string;
  lightColor: string;
  darkColor: string;
  lec: number;
  lab: number;
  units: number;
}

interface TableData {
  subjectCode: string;
  subjectTitle: string;
  lec: number;
  lab: number;
  units: number;
  preferredDay: string;
  preferredTime: string;
}

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [
    MaterialComponents,
    CommonModule,
    TimeSelectionDialogComponent,
    TimeFormatPipe,
  ],
  templateUrl: './preferences.component.html',
  styleUrl: './preferences.component.scss',
})
export class PreferencesComponent implements OnInit, OnDestroy {
  subjects: Subject[] = [
    {
      code: 'COMP20133',
      title: 'Web Development',
      lightColor: '#FFE5E5',
      darkColor: '#3D2626',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'COMP20134',
      title: 'Database Systems',
      lightColor: '#E5FFE5',
      darkColor: '#263D26',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP20135',
      title: 'Data Structures and Algorithms',
      lightColor: '#E5E5FF',
      darkColor: '#26263D',
      lec: 3,
      lab: 0,
      units: 3,
    },
    {
      code: 'COMP20136',
      title: 'Software Engineering',
      lightColor: '#FFFFE5',
      darkColor: '#3D3D26',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'COMP20137',
      title: 'Computer Networks',
      lightColor: '#FFE5FF',
      darkColor: '#3D263D',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP20138',
      title: 'Artificial Intelligence',
      lightColor: '#E5FFFF',
      darkColor: '#263D3D',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'COMP20139',
      title: 'Machine Learning',
      lightColor: '#F0E5FF',
      darkColor: '#322639',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'COMP20140',
      title: 'Computer Graphics',
      lightColor: '#E5FFF0',
      darkColor: '#263932',
      lec: 2,
      lab: 2,
      units: 4,
    },
    {
      code: 'COMP20141',
      title: 'Strategic Business Analysis with Contemporary Issues and Trends',
      lightColor: '#FFF0E5',
      darkColor: '#3D3226',
      lec: 3,
      lab: 1,
      units: 4,
    },
    {
      code: 'COMP20142',
      title:
        'Technology for Teaching and Learning 2 - Instrumentation and Technology in Mathematics',
      lightColor: '#E5F0FF',
      darkColor: '#263239',
      lec: 3,
      lab: 1,
      units: 4,
    },
  ];

  displayedColumns: string[] = [
    'action',
    'num',
    'subjectCode',
    'subjectTitle',
    'lec',
    'lab',
    'units',
    'preferredDay',
    'preferredTime',
  ];
  tableData: TableData[] = [];
  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  isDarkMode: boolean = false;
  private themeSubscription!: Subscription;
  dataSource: MatTableDataSource<TableData>;

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<TableData>([]);
  }

  ngOnInit() {
    this.themeSubscription = this.themeService.isDarkTheme$.subscribe(
      (isDark) => {
        this.isDarkMode = isDark;
      }
    );
  }

  ngOnDestroy() {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  getSubjectColor(subject: Subject): string {
    return this.isDarkMode ? subject.darkColor : subject.lightColor;
  }

  addSubjectToTable(subject: Subject) {
    const newTableData: TableData = {
      subjectCode: subject.code,
      subjectTitle: subject.title,
      lec: subject.lec,
      lab: subject.lab,
      units: subject.units,
      preferredDay: '',
      preferredTime: '',
    };
    this.dataSource.data = [...this.dataSource.data, newTableData];
    this.cdr.detectChanges();
  }

  removeSubject(subjectCode: string) {
    this.dataSource.data = this.dataSource.data.filter(
      (subject) => subject.subjectCode !== subjectCode
    );
    this.cdr.detectChanges();
  }

  onDayChange(element: TableData, event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const newDay = selectElement.value;

    const updatedData = this.dataSource.data.map((item) => {
      if (item.subjectCode === element.subjectCode) {
        return { ...item, preferredDay: newDay };
      }
      return item;
    });
    this.dataSource.data = updatedData;
    this.cdr.detectChanges();
  }

  openTimeDialog(element: TableData): void {
    const [startTime, endTime] = element.preferredTime
      ? element.preferredTime.split(' - ')
      : ['', ''];

    const dialogRef = this.dialog.open(TimeSelectionDialogComponent, {
      width: '250px',
      data: { startTime, endTime },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        element.preferredTime = result;
        this.cdr.detectChanges();
      }
    });
  }
  getFormattedTime(time: string): string {
    return time ? time : 'Select time';
  }
}
