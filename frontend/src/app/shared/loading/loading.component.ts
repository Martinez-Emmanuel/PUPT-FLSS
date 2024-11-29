import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-loading',
    imports: [],
    templateUrl: './loading.component.html',
    styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  @Input() showLoadingText = true;
}
