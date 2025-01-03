import {
  trigger,
  transition,
  style,
  animate,
  state,
  query,
  stagger,
  group,
} from '@angular/animations';

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
    animate(
      '400ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ opacity: 0, transform: 'translateY(20px)' })
    ),
  ]),
]);

export const rowAdditionAnimation = trigger('rowAdditionAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-50px)' }),
    animate(
      '500ms cubic-bezier(0.25, 1, 0.5, 1)',
      style({ opacity: 1, transform: 'translateX(0)' })
    ),
  ]),
]);

export const cardSwipeAnimation = trigger('cardSwipeAnimation', [
  transition(':increment', [
    style({
      transform: 'translateX(20%) translateY(0) scale(0.9)',
      opacity: 0,
      zIndex: 0,
      filter: 'blur(4px)',
    }),
    animate(
      '500ms cubic-bezier(0.23, 1, 0.32, 1)',
      style({
        transform: 'translateX(0) translateY(0) scale(1)',
        opacity: 1,
        zIndex: 1,
        filter: 'blur(0)',
      })
    ),
  ]),
  transition(':decrement', [
    style({
      transform: 'translateX(-20%) translateY(0) scale(0.9)',
      opacity: 0,
      zIndex: 0,
      filter: 'blur(4px)',
    }),
    animate(
      '500ms cubic-bezier(0.23, 1, 0.32, 1)',
      style({
        transform: 'translateX(0) translateY(0) scale(1)',
        opacity: 1,
        zIndex: 1,
        filter: 'blur(0)',
      })
    ),
  ]),
]);

export const showHideFieldsAnimation = trigger('showHideFieldsAnimation', [
  state(
    'visible',
    style({
      opacity: 1,
      height: '*',
      transform: 'translateY(0)',
      overflow: 'hidden',
    })
  ),
  state(
    'hidden',
    style({
      opacity: 0,
      height: '0px',
      transform: 'translateY(-10px)',
      overflow: 'hidden',
    })
  ),
  transition('visible => hidden', [
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
  transition('hidden => visible', [
    animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
  ]),
]);

export const slideTextAnimation = trigger('slideText', [
  state(
    'connecting',
    style({
      transform: 'translateY(0%)',
    })
  ),
  state(
    'redirecting',
    style({
      transform: 'translateY(-100%)',
    })
  ),
  transition('connecting => redirecting', [animate('0.6s ease-in-out')]),
  transition('redirecting => connecting', [animate('0.6s ease-in-out')]),
]);

export const routeAnimation = trigger('routeAnimation', [
  transition('callback => faculty, * => login, login => *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(
      ':enter',
      [
        style({
          transform: 'translateX(50%)',
          opacity: 0,
        }),
      ],
      { optional: true }
    ),
    query(
      ':leave',
      [
        style({
          transform: 'translateX(0)',
          opacity: 1,
        }),
      ],
      { optional: true }
    ),
    group([
      query(
        ':leave',
        [
          animate(
            '600ms cubic-bezier(.72,.11,.23,.99)',
            style({
              transform: 'translateX(-50%)',
              opacity: 0,
            })
          ),
        ],
        { optional: true }
      ),
      query(
        ':enter',
        [
          animate(
            '600ms cubic-bezier(.72,.11,.23,.99)',
            style({
              transform: 'translateX(0)',
              opacity: 1,
            })
          ),
        ],
        { optional: true }
      ),
    ]),
  ]),
  // Default fade animation for other routes
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }),
      ],
      { optional: true }
    ),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':leave',
      [animate('200ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))],
      { optional: true }
    ),
    query(
      ':enter',
      [animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))],
      { optional: true }
    ),
  ]),
]);
