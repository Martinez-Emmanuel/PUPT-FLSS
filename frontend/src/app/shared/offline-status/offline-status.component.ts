import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';
import { OfflineStatusService } from '../../core/services/offline-status/offline-status.service';
import { slideInOut } from '../../core/animations/animations';

@Component({
  selector: 'app-offline-status',
  imports: [CommonModule, MatSymbolDirective],
  templateUrl: './offline-status.component.html',
  styleUrls: ['./offline-status.component.scss'],
  animations: [slideInOut],
})
export class OfflineStatusComponent {
  private offlineStatusService = inject(OfflineStatusService);

  isOnline = toSignal(this.offlineStatusService.isOnline(), {
    initialValue: true,
  });
}
