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
  selectedTabIndex = 0;
  private tabRoutes = ['faculty', 'programs', 'rooms'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportsService: ReportsService,
  ) {}

  ngOnInit() {
    this.reportsService.clearAllCaches();

    if (this.route.firstChild === null) {
      this.router.navigate(['faculty'], { relativeTo: this.route });
    } else {
      const currentPath = this.route.firstChild?.snapshot.url[0]?.path;
      const tabIndex = this.tabRoutes.indexOf(currentPath);
      if (tabIndex !== -1) {
        this.selectedTabIndex = tabIndex;
      }
    }
  }

  onTabChange(event: any) {
    this.router.navigate([this.tabRoutes[event.index]], {
      relativeTo: this.route,
    });
  }
}
