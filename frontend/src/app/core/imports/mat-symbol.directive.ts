import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[mat-symbol]',
})
export class MatSymbolDirective implements OnInit, OnChanges {
  @Input('mat-symbol') name: string = '';
  @Input() variant: 'outlined' | 'rounded' = 'rounded';
  @Input() fill: boolean = true;
  @Input() weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' =
    '400';
  @Input() grade: '-25' | '0' | '200' = '0';
  @Input() size: '20px' | '24px' | '40px' | '48px' = '24px';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.updateIcon();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.updateIcon();
  }

  private updateIcon() {
    const element = this.el.nativeElement;
    element.classList.add(`material-symbols-${this.variant}`);
    element.textContent = this.name;
    element.style.fontVariationSettings = `
      'FILL' ${this.fill ? 1 : 0},
      'wght' ${this.weight},
      'GRAD' ${this.grade},
      'opsz' ${this.size.replace('px', '')}
    `;
  }
}
