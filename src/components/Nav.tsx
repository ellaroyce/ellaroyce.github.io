import { Fragment, useEffect, useRef, useState } from 'react';
import { usePrefs } from '../lib/PrefsContext';
import type { Lang } from '../lib/prefs';
import { cx, prefersReducedMotion } from '../lib/site';
import { Logo } from './Logo';

const SUN = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);
const MOON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
);

const LANGS: Lang[] = ['en', 'de'];

interface NavProps {
  /** `home` shows section links and the mobile menu; `legal` is the compact pill. */
  variant: 'home' | 'legal';
  /** Easter egg: fired when the logo is clicked three times in quick succession. */
  onLogoTripleClick?: () => void;
}

export function Nav({ variant, onLogoTripleClick }: NavProps) {
  const { t, lang, setLang, theme, toggleTheme, href } = usePrefs();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const logo = useRef<SVGSVGElement>(null);
  const clicks = useRef({ count: 0, timer: 0 });
  const isHome = variant === 'home';

  // Border on the pill once the page has scrolled.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Click the logo 3x quickly and the system "recalibrates": the hero core
  // sends a burst of signals and the mark spins once. Skipped under reduced motion.
  const onBrandClick = () => {
    const c = clicks.current;
    c.count += 1;
    window.clearTimeout(c.timer);
    c.timer = window.setTimeout(() => { c.count = 0; }, 600);
    if (c.count < 3) return;
    c.count = 0;
    if (prefersReducedMotion()) return;
    onLogoTripleClick?.();
    const el = logo.current;
    if (el) {
      el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      el.style.transform = 'rotate(360deg)';
      window.setTimeout(() => { el.style.transform = ''; }, 640);
    }
  };

  return (
    <header className={cx('nav', scrolled && 'scrolled')} id="nav">
      <div className={cx('nav__pill', open && 'is-open')}>
        <a
          href={isHome ? '#top' : href('index.html')}
          className="nav__brand"
          aria-label={t('nav.home')}
          onClick={isHome ? onBrandClick : undefined}
        >
          <Logo size={isHome ? 30 : 28} ref={logo} />
          <span className="nav__wordmark">Pruna{'\u00a0'}Secura</span>
        </a>

        {isHome && (
          <nav className={cx('nav__links', open && 'is-open')} id="primary-nav" aria-label={t('nav.primary')}>
            <a href="#work" onClick={() => setOpen(false)}>{t('nav.needs')}</a>
            <a href="#process" onClick={() => setOpen(false)}>{t('nav.how')}</a>
            <a href="#about" onClick={() => setOpen(false)}>{t('nav.about')}</a>
            <a href="#faq" onClick={() => setOpen(false)}>{t('nav.faq')}</a>
          </nav>
        )}

        <div className="nav__controls" style={isHome ? undefined : { marginLeft: 'auto' }}>
          <div className="lang-switch" role="group" aria-label={t('nav.lang')}>
            {LANGS.map((code, i) => (
              <Fragment key={code}>
                {i > 0 && <span className="lang-switch__sep" aria-hidden="true">/</span>}
                <button
                  type="button"
                  className={cx('lang-switch__btn', lang === code && 'is-active')}
                  aria-pressed={lang === code ? 'true' : 'false'}
                  lang={code}
                  onClick={() => setLang(code)}
                >
                  {code.toUpperCase()}
                </button>
              </Fragment>
            ))}
          </div>
          <button
            type="button"
            className="theme-toggle"
            aria-label={t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? SUN : MOON}
          </button>
          {isHome && (
            <button
              type="button"
              className="nav-toggle"
              id="nav-toggle"
              aria-label={t(open ? 'nav.menuClose' : 'nav.menuOpen')}
              aria-expanded={open ? 'true' : 'false'}
              aria-controls="primary-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <span /><span />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
