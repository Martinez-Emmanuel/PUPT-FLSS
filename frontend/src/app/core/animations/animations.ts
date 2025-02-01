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

export const fadeAnimation = trigger('fadeAnimation', [
  transition('* <=> *', [
    style({ opacity: 0 }),
    animate('500ms ease-out', style({ opacity: '*' })), // previously 1
  ]),
]);

export const slideInAnimation = trigger('slideInAnimation', [
  state(
    'void',
    style({
      transform: 'translateX(-100%)',
      opacity: 0,
    }),
  ),
  transition('void => *', animate('750ms cubic-bezier(0.16, 1, 0.3, 1)')),
  transition('* => void', animate('750ms cubic-bezier(0.7, 0, 0.84, 0)')),
]);

export const cardEntranceAnimation = trigger('cardEntranceAnimation', [
  transition('* <=> *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        stagger('75ms', [
          animate(
            '400ms ease-out',
            style({ opacity: 1, transform: 'translateY(0)' }),
          ),
        ]),
      ],
      { optional: true },
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
            style({ opacity: 1, transform: 'translateX(0)' }),
          ),
        ]),
      ],
      { optional: true },
    ),
  ]),
]);

export const pageFloatUpAnimation = trigger('pageFloatUpAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(
      '400ms ease-out',
      style({ opacity: 1, transform: 'translateY(0)' }),
    ),
  ]),
  transition(':leave', [
    animate(
      '300ms ease-in',
      style({ opacity: 0, transform: 'translateY(20px)' }),
    ),
  ]),
]);

export const rowAdditionAnimation = trigger('rowAdditionAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-50px)' }),
    animate(
      '500ms cubic-bezier(0.25, 1, 0.5, 1)',
      style({ opacity: 1, transform: 'translateX(0)' }),
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
      }),
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
      }),
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
    }),
  ),
  state(
    'hidden',
    style({
      opacity: 0,
      height: '0px',
      transform: 'translateY(-10px)',
      overflow: 'hidden',
    }),
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
    }),
  ),
  state(
    'redirecting',
    style({
      transform: 'translateY(-100%)',
    }),
  ),
  transition('connecting => redirecting', [animate('0.6s ease-in-out')]),
  transition('redirecting => connecting', [animate('0.6s ease-in-out')]),
]);

// Shared animation constants
export const defaultRouteStyles = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
} as const;

export const routeSlideAnimation = [
  style({ position: 'relative' }),
  query(':enter, :leave', [style(defaultRouteStyles)], { optional: true }),
  query(
    ':enter',
    [
      style({
        transform: 'translateX(50%)',
        opacity: 0,
      }),
    ],
    { optional: true },
  ),
  query(
    ':leave',
    [
      style({
        transform: 'translateX(0)',
        opacity: 1,
      }),
    ],
    { optional: true },
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
          }),
        ),
      ],
      { optional: true },
    ),
    query(
      ':enter',
      [
        animate(
          '600ms cubic-bezier(.72,.11,.23,.99)',
          style({
            transform: 'translateX(0)',
            opacity: 1,
          }),
        ),
      ],
      { optional: true },
    ),
  ]),
];

export const routeFadeAnimation = [
  style({ position: 'relative' }),
  query(':enter, :leave', [style(defaultRouteStyles)], { optional: true }),
  query(':enter', [style({ opacity: 0 })], { optional: true }),
  query(
    ':leave',
    [animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 0 }))],
    { optional: true },
  ),
  query(
    ':enter',
    [animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 }))],
    { optional: true },
  ),
];

export const routeAnimation = trigger('routeAnimation', [
  // When navigating FROM login page (to any other route)
  transition('login => *', routeSlideAnimation),

  // When navigating FROM callback to faculty
  transition('callback => faculty', routeSlideAnimation),

  // When logging out (navigating from main routes to login)
  transition(
    'faculty => login, admin => login, superadmin => login',
    routeSlideAnimation,
  ),

  // For all other routes going to login, use simple fade
  transition('* => login', routeFadeAnimation),

  // Default animation for other routes
  transition('* <=> *', routeFadeAnimation),
]);

export const fabAnimation = trigger('fabAnimation', [
  state(
    'show',
    style({
      transform: 'translateY(0)',
      opacity: 1,
    }),
  ),
  state(
    'hide',
    style({
      transform: 'translateY(100%)',
      opacity: 0,
    }),
  ),
  transition('show => hide', [animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')]),
  transition('hide => show', [animate('250ms cubic-bezier(0.0, 0.0, 0.2, 1)')]),
]);

export const slideUpDown = trigger('slideUpDown', [
  state(
    'void',
    style({
      transform: 'translateY(100%)',
    }),
  ),
  state(
    '*',
    style({
      transform: 'translateY(0)',
    }),
  ),
  transition('void => *', [animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')]),
  transition('* => void', [animate('600ms cubic-bezier(0.2, 0.0, 0.0, 1)')]),
]);
