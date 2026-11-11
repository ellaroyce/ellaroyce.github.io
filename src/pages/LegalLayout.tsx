import type { ReactNode } from 'react';
import { Footer } from '../components/Footer';
import { Nav } from '../components/Nav';
import { usePrefs } from '../lib/PrefsContext';

/** Shared shell for the legal pages: compact nav, article, footer. */
export function LegalLayout({ children }: { children: ReactNode }) {
  const { t, href } = usePrefs();
  return (
    <>
      <a href="#main" className="skip-link">{t('a11y.skip')}</a>
      <Nav variant="legal" />
      <main id="main">
        <article className="legal">
          <a href={href('index.html')} className="legal__back">{t('legal.back')}</a>
          {children}
        </article>
      </main>
      <Footer />
    </>
  );
}
