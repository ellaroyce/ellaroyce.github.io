import { StrictMode, type ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { PrefsProvider } from './lib/PrefsContext';
import './fonts/fonts.css';
import './styles/site.css';

/** Attach a page to #root. Shared by the per-page client entries. */
export function mount(page: ReactNode): void {
  const root = document.getElementById('root');
  if (!root) throw new Error('Missing #root');

  const app = (
    <StrictMode>
      <PrefsProvider>{page}</PrefsProvider>
    </StrictMode>
  );

  // Production HTML is prerendered, so React attaches to the existing markup.
  // In development the root is empty and React renders from scratch.
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);

  // Console note for the curious founder who opens dev tools.
  console.log(
    '%cPruna Secura',
    'font:700 20px system-ui;color:#3f78ff',
    '\nSecure by design. Reliable in operation. Book a slot: https://cal.com/ask-ella/30min',
  );
}
