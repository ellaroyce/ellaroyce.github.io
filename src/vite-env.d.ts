/// <reference types="vite/client" />

/** Build-time flag: may this build use localStorage / sessionStorage? */
declare const __PERSIST__: boolean;

interface Window {
  /** Written by the inline pre-paint guard in <head>. */
  __prefs?: { theme: 'dark' | 'light'; lang: 'en' | 'de'; introPlayed: boolean };
}
