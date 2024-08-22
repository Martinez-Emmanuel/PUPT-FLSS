import { trigger, transition, style, animate, state } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);

export const slideInAnimation = trigger('slideInAnimation', [
  state(
    'void',
    style({
      transform: 'translateX(-100%)',
      opacity: 0,
    })
  ),
  state(
    '*',
    style({
      transform: 'translateX(0)',
      opacity: 1,
    })
  ),
  transition('void => *', animate('750ms cubic-bezier(0.16, 1, 0.3, 1)')),
  transition('* => void', animate('750ms cubic-bezier(0.7, 0, 0.84, 0)')),
]);

