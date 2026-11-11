// Visitor preferences: language, colour theme and "intro already played".
//
// Persisting builds (production) keep them in localStorage / sessionStorage,
// exactly like the previous static site. Non-persisting builds (sandboxed
// previews, where storage is unavailable) keep them in memory and pass them
// between pages in the URL hash.
//
// Reading happens once, in the inline pre-paint guard in <head> (see
// vite.config.ts), which hands the result over as `window.__prefs`.

export type Lang = 'en' | 'de';
export type Theme = 'dark' | 'light';
export type PageFile = 'index.html' | 'impressum.html' | 'datenschutz.html';

export interface Prefs {
  lang: Lang;
  theme: Theme;
}

/** What the prerendered HTML contains. React hydrates against this. */
export const PRERENDERED: Prefs = { lang: 'en', theme: 'dark' };

// First-visit defaults: German copy, dark theme.
const memory = { lang: 'de' as Lang, theme: 'dark' as Theme, introPlayed: false };
let loaded = false;
const introListeners = new Set<() => void>();

function load(): void {
  if (loaded || typeof window === 'undefined') return;
  loaded = true;
  const seed = window.__prefs;
  if (seed) {
    memory.lang = seed.lang;
    memory.theme = seed.theme;
    memory.introPlayed = seed.introPlayed;
  }
}

export function readPrefs(): Prefs {
  load();
  return { lang: memory.lang, theme: memory.theme };
}

export function saveLang(lang: Lang): void {
  load();
  memory.lang = lang;
  if (__PERSIST__) {
    try { localStorage.setItem('lang', lang); } catch { /* storage blocked */ }
  }
}

export function saveTheme(theme: Theme): void {
  load();
  memory.theme = theme;
  if (__PERSIST__) {
    try { localStorage.setItem('theme', theme); } catch { /* storage blocked */ }
  }
}

export function introPlayed(): boolean {
  load();
  return memory.introPlayed;
}

export function markIntroPlayed(): void {
  load();
  memory.introPlayed = true;
  if (__PERSIST__) {
    try { sessionStorage.setItem('pruna_intro_played', '1'); } catch { /* storage blocked */ }
  }
  introListeners.forEach((fn) => fn());
}

export function onIntroPlayed(fn: () => void): () => void {
  introListeners.add(fn);
  return () => { introListeners.delete(fn); };
}

/**
 * Link to another page of the site. Production builds return the plain file
 * name. Non-persisting builds append the current preferences once the app is
 * live (`carry`), so language and theme survive the navigation.
 */
export function pageHref(file: PageFile, prefs: Prefs, carry: boolean): string {
  if (__PERSIST__ || !carry) return file;
  return `${file}#prefs=${prefs.lang},${prefs.theme},${memory.introPlayed ? 1 : 0}`;
}
