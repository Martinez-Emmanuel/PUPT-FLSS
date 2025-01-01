import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-custom-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-spinner.component.html',
  styleUrls: ['./custom-spinner.component.scss'],
})
export class CustomSpinnerComponent {
  @Input() type!: 'cube-grid' | 'circular';
  @Input() size: number = 50;
  @Input() color: string = 'white';
  @Input() strokeWidth: number = 4;

  getStyleForCube() {
    return {
      'background-color': this.color,
      'transform-style': 'preserve-3d',
      '-webkit-font-smoothing': 'antialiased',
      '-moz-osx-font-smoothing': 'grayscale',
      transform: 'translateZ(0)',
    };
  }
}
