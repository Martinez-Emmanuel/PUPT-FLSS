import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-slideshow',
    templateUrl: './slideshow.component.html',
    styleUrls: ['./slideshow.component.scss'],
    imports: [CommonModule]
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() interval: number = 5000;
  @Output() slideChange = new EventEmitter<number>();

  currentIndex = 0;
  private intervalId: any;

  ngOnInit() {
    this.startSlideshow();
  }

  ngOnDestroy() {
    this.stopSlideshow();
  }

  startSlideshow() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  stopSlideshow() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.slideChange.emit(this.currentIndex);
  }

  goToSlide(index: number) {
    this.currentIndex = index;
    this.slideChange.emit(this.currentIndex);
    this.resetInterval();
  }

  resetInterval() {
    this.stopSlideshow();
    this.startSlideshow();
  }
}