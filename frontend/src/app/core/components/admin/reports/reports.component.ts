import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, RouterModule, MatSymbolDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Navigate to the default tab (faculty) if no specific route is active
    if (this.route.firstChild === null) {
      this.router.navigate(['faculty'], { relativeTo: this.route });
    }
  }

  onTabChange(event: any) {
    const tabRoutes = ['faculty', 'programs', 'rooms'];
    this.router.navigate([tabRoutes[event.index]], { relativeTo: this.route });
  }
}