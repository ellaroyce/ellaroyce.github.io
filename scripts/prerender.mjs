// Prerenders every page into dist/ after `vite build`, so the HTML that GitHub
// Pages serves already contains the content (search engines, link previews and
// visitors without JavaScript get the real page, not an empty shell).
import { readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = { home: 'index.html', impressum: 'impressum.html', datenschutz: 'datenschutz.html' };
const SLOT = '<!--app-html-->';

const { render } = await import(pathToFileURL(join(ROOT, 'dist-ssr', 'entry-server.js')).href);

for (const [page, file] of Object.entries(PAGES)) {
  const path = join(ROOT, 'dist', file);
  const html = await readFile(path, 'utf8');
  if (!html.includes(SLOT)) throw new Error(`${file}: missing ${SLOT} placeholder`);
  const markup = render(page);
  if (markup.length < 500) throw new Error(`${file}: prerender produced almost no markup`);
  await writeFile(path, html.replace(SLOT, () => markup));
  console.log(`prerender: ${file} (${Math.round(markup.length / 1024)} kB of markup)`);
}

await rm(join(ROOT, 'dist-ssr'), { recursive: true, force: true });
