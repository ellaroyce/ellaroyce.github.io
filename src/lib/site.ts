// Facts that appear in more than one place.
export const BOOKING_URL = 'https://cal.com/ask-ella/30min';
export const CONTACT_EMAIL = 'ellatiuriumina@gmail.com';
export const CONTACT_PHONE = '+49\u00a0172\u00a06217851';
export const LOCATION = 'München, 80796, Germany';

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Join class names, dropping falsy entries. */
export const cx = (...parts: Array<string | false | null | undefined>): string | undefined =>
  parts.filter(Boolean).join(' ') || undefined;
