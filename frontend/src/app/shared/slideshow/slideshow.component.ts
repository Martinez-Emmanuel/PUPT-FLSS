import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subject, takeUntil, concatMap, from } from 'rxjs';

import { ImagePreloadService, ImageLoadState } from '../../core/services/image/image-preload.service';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss'],
  imports: [CommonModule],
  host: {
    '[class.slideshow-loading]': 'isLoading',
  },
})
export class SlideshowComponent implements OnInit, OnDestroy {
  @Input() images: string[] = [];
  @Input() interval: number = 5000;
  @Output() slideChange = new EventEmitter<number>();

  currentIndex = 0;
  isLoading = true;
  imageStates: ImageLoadState[] = [];
  private intervalId: any;
  private destroy$ = new Subject<void>();
  private readonly PRELOAD_COUNT = 2;

  constructor(
    private imagePreloadService: ImagePreloadService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.initializeImageStates();
    this.preloadInitialImages();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopSlideshow();
  }

  private initializeImageStates() {
    this.imageStates = this.images.map((url) => ({
      url,
      loaded: false,
      error: false,
    }));
  }

  private preloadInitialImages() {
    // Preload first image and start slideshow when ready
    this.imagePreloadService
      .preloadImage(this.images[0])
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: ImageLoadState) => {
        this.imageStates[0] = state;
        if (state.loaded) {
          this.isLoading = false;
          this.startSlideshow();
          this.preloadNextImages();
        }
        this.cdr.detectChanges();
      });
  }

  private preloadNextImages() {
    const nextIndexes = this.getNextIndexesToPreload();
    from(nextIndexes)
      .pipe(
        concatMap((index) =>
          this.imagePreloadService.preloadImage(this.images[index])
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((state) => {
        const index = this.images.indexOf(state.url);
        this.imageStates[index] = state;
        this.cdr.detectChanges();
      });
  }

  private getNextIndexesToPreload(): number[] {
    const indexes: number[] = [];
    for (let i = 1; i <= this.PRELOAD_COUNT; i++) {
      const index = (this.currentIndex + i) % this.images.length;
      if (!this.imageStates[index].loaded) {
        indexes.push(index);
      }
    }
    return indexes;
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
    this.preloadNextImages();
  }

  goToSlide(index: number) {
    if (this.imageStates[index].loaded) {
      this.currentIndex = index;
      this.slideChange.emit(this.currentIndex);
      this.resetInterval();
      this.preloadNextImages();
    }
  }

  resetInterval() {
    this.stopSlideshow();
    this.startSlideshow();
  }
}
