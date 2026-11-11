import {
  createContext, useCallback, useContext, useEffect, useLayoutEffect, useState,
  type ReactNode,
} from 'react';
import { en, type CopyKey } from '../content/en';
import { de } from '../content/de';
import {
  PRERENDERED, onIntroPlayed, pageHref, readPrefs, saveLang, saveTheme,
  type Lang, type PageFile, type Prefs, type Theme,
} from './prefs';

interface PrefsValue extends Prefs {
  setLang(lang: Lang): void;
  toggleTheme(): void;
  /** Copy for a key in the active language. */
  t(key: CopyKey): string;
  /** Link to another page of the site. */
  href(file: PageFile): string;
}

const PrefsContext = createContext<PrefsValue | null>(null);

// useLayoutEffect on the client (apply before paint), plain effect on the server.
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function PrefsProvider({ children }: { children: ReactNode }) {
  // The first render must match the prerendered HTML (English, dark). The
  // visitor's real preferences are applied in a layout effect, i.e. before the
  // browser paints, so there is no visible language or theme flash.
  const [prefs, setPrefs] = useState<Prefs>(PRERENDERED);
  const [ready, setReady] = useState(false);
  const [, bump] = useState(0);

  useIsoLayoutEffect(() => {
    setPrefs(readPrefs());
    setReady(true);
  }, []);

  useIsoLayoutEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.setAttribute('lang', prefs.lang);
    root.setAttribute('data-theme', prefs.theme);
    root.classList.remove('lang-pending');
  }, [ready, prefs]);

  // Cross-page links carry the "intro played" flag in preview builds.
  useEffect(() => onIntroPlayed(() => bump((n) => n + 1)), []);

  const setLang = useCallback((lang: Lang) => {
    saveLang(lang);
    setPrefs((p) => (p.lang === lang ? p : { ...p, lang }));
  }, []);

  const toggleTheme = useCallback(() => {
    setPrefs((p) => {
      const theme: Theme = p.theme === 'dark' ? 'light' : 'dark';
      saveTheme(theme);
      return { ...p, theme };
    });
  }, []);

  const dict = prefs.lang === 'de' ? de : en;
  const value: PrefsValue = {
    ...prefs,
    setLang,
    toggleTheme,
    t: useCallback((key: CopyKey) => dict[key], [dict]),
    href: (file) => pageHref(file, prefs, ready),
  };

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsValue {
  const value = useContext(PrefsContext);
  if (!value) throw new Error('usePrefs must be used inside <PrefsProvider>');
  return value;
}
