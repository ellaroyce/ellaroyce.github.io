import { renderToString } from 'react-dom/server';
import { PrefsProvider } from './lib/PrefsContext';
import { Datenschutz } from './pages/Datenschutz';
import { Home } from './pages/Home';
import { Impressum } from './pages/Impressum';

// Each page is its own HTML file (/, /impressum.html, /datenschutz.html), so
// the existing URLs keep working and every page is prerendered.
const PAGES = { home: Home, impressum: Impressum, datenschutz: Datenschutz };
export type PageId = keyof typeof PAGES;

/** Used by scripts/prerender.mjs to write each page's HTML at build time. */
export function render(page: PageId): string {
  const Page = PAGES[page];
  return renderToString(
    <PrefsProvider>
      <Page />
    </PrefsProvider>,
  );
}
