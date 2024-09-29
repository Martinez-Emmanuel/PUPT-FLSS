import { trigger, transition, style, animate, state, query, stagger } from '@angular/animations';

// Anmation 1: Simple Fade - used in route transitions
export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: 1 })),
  ]),
]);

// Animation 2: Slide In - used in mat sidenav
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

// Animation 3: Card Entrance - used for cards
export const cardEntranceAnimation = trigger('cardEntranceAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        stagger('75ms', [
          animate(
            '400ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

export const cardEntranceSide = trigger('cardEntranceSide', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateX(-15px)' }),
        stagger('100ms', [
          animate(
            '400ms ease-out',
            style({ opacity: 1, transform: 'translateX(0)' })
          ),
        ]),
      ],
      { optional: true }
    ),
  ]),
]);

export const pageFloatUpAnimation = trigger('pageFloatUpAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
  ])
]); 