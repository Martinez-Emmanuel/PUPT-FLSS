import { MatSymbolDirective } from './mat-symbol.directive';
import { ElementRef } from '@angular/core';

describe('MatSymbolDirective', () => {
  it('should create an instance', () => {
    const mockElementRef = {} as ElementRef; // Mock or create a proper instance if needed
    const directive = new MatSymbolDirective(mockElementRef);
    expect(directive).toBeTruthy();
  });
});
