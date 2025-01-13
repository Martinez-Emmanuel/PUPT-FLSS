import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appTwoDigitInput]',
})
export class TwoDigitInputDirective {
  constructor(private ngControl: NgControl) {}

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Limit input to two digits
    if (value.length > 2) {
      value = value.slice(0, 2);
      this.ngControl.control?.setValue(value);
    }
  }
}
