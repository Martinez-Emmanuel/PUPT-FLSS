import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class SlideshowComponent implements OnChanges {
  @Input() images: string[] = [];
  @Input() currentIndex = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentIndex']) {
    }
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
}
