import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

import { MatTabsModule } from '@angular/material/tabs';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { ReportsService } from '../../../services/admin/reports/reports.service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, MatTabsModule, RouterModule, MatSymbolDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ReportsComponent implements OnInit {
  tabs: { label: string; route: string; icon: string }[] = [
    { label: 'Faculty', route: 'faculty', icon: 'person' },
    { label: 'Programs', route: 'programs', icon: 'school' },
    { label: 'Rooms', route: 'rooms', icon: 'meeting_room' },
  ];
  selectedTabIndex = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportsService: ReportsService,
  ) {}

  ngOnInit() {
    this.reportsService.clearAllCaches();

    if (this.route.firstChild === null) {
      this.router.navigate([this.tabs[0].route], { relativeTo: this.route });
    } else {
      const currentPath = this.route.firstChild.snapshot.url[0]?.path;
      const tabIndex = this.tabs.findIndex((tab) => tab.route === currentPath);
      if (tabIndex !== -1) {
        this.selectedTabIndex = tabIndex;
      }
    }
  }

  onTabChange(event: any) {
    this.router.navigate([this.tabs[event.index].route], {
      relativeTo: this.route,
    });
  }
}
