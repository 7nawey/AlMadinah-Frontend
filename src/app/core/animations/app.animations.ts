import {
  trigger, transition, style, animate, query, stagger, state
} from '@angular/animations';

export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
  ])
]);

export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0 }))
  ])
]);

export const slideIn = trigger('slideIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-30px)' }),
    animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

export const staggerList = trigger('staggerList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('60ms', animate('350ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })))
    ], { optional: true })
  ])
]);

export const cardHover = trigger('cardHover', [
  state('default', style({ transform: 'translateY(0)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' })),
  state('hover', style({ transform: 'translateY(-6px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' })),
  transition('default <=> hover', animate('250ms ease'))
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.9)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' }))
  ])
]);

export const toastAnimation = trigger('toastAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%)' }),
    animate('350ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('250ms ease-in', style({ opacity: 0, transform: 'translateX(100%)' }))
  ])
]);
