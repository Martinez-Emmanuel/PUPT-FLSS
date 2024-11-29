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
    encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.reportsService.clearAllCaches();

    if (this.route.firstChild === null) {
      this.router.navigate(['faculty'], { relativeTo: this.route });
    }
  }

  onTabChange(event: any) {
    const tabRoutes = ['faculty', 'programs', 'rooms'];
    this.router.navigate([tabRoutes[event.index]], { relativeTo: this.route });
  }
}
