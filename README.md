# prunasecura.ai

Website of Pruna Secura (Ella Türümina): a React + TypeScript app built with
Vite, prerendered to static HTML and hosted on GitHub Pages at
[www.prunasecura.ai](https://www.prunasecura.ai/).

## Develop

Requires Node 20.19 or newer.

```bash
npm install
npm run dev        # local dev server with hot reload
npm run build      # type-check, build and prerender into dist/
npm run preview    # serve dist/ locally
```

`npm run dev` and `npm run build` first run `npm run fonts`, which downloads
the General Sans webfont from Fontshare into `src/fonts/` (gitignored). The
Fontshare licence allows self-hosting but not redistributing the files, so they
are fetched at build time rather than committed. The result is cached; the
download only happens once per checkout.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site
and publishes `dist/` to GitHub Pages.

One-time setup: in the repository settings under Pages, set
**Build and deployment -> Source** to **GitHub Actions**. Until then GitHub
Pages would serve the unbuilt source files. The custom domain is kept in
`public/CNAME`.

## Where things live

| Path | What |
| --- | --- |
| `index.html`, `impressum.html`, `datenschutz.html` | One HTML entry per page: `<head>` metadata, structured data, and the mount point. The URLs are unchanged from the static site. |
| `src/content/en.ts`, `src/content/de.ts` | All copy. `en.ts` defines the keys; `de.ts` is type-checked against it, so a missing translation fails the build. |
| `src/pages/` | `Home`, `Impressum`, `Datenschutz`. |
| `src/components/` | One component per page section, plus `Nav`, `Footer`, `Reveal`, `MissionRail`. |
| `src/engines/` | The canvas animations (hero map, launch intro, scroll flight) and the scroll journey. Plain JavaScript modules with a `mount…()`/`destroy()` API, wrapped by a component each. |
| `src/lib/` | Language/theme preferences, scroll-reveal observer, shared constants (booking link, contact details). |
| `src/styles/site.css` | The stylesheet, design tokens at the top. |
| `public/` | Files copied as-is: `CNAME`, `robots.txt`, `sitemap.xml`, Google site verification. |
| `scripts/` | `fetch-fonts.mjs` (see above) and `prerender.mjs`. |

## How it renders

- **Prerendered.** `npm run build` renders every page to HTML
  (`scripts/prerender.mjs`), so search engines, link previews and visitors
  without JavaScript get the full content. React then hydrates it.
- **Language.** The prerendered HTML is English. German is the default for
  first-time visitors and is applied before the first paint; the choice is
  remembered in `localStorage`.
- **No third-party requests.** Fonts, GSAP and Lenis are bundled and served
  from the site's own domain.
- **Motion.** The intro plays once per session, and all animation is reduced
  to static frames under `prefers-reduced-motion`.

## Common edits

- **Change copy:** edit the key in `src/content/en.ts` and `src/content/de.ts`.
- **Change the booking link or contact details:** `src/lib/site.ts`. The
  structured data in `index.html` repeats the booking link.
- **Add a section:** add a component in `src/components/`, its copy keys in
  both content files, and place it in `src/pages/Home.tsx`. Give the section an
  `id` and add it to `MISSION_STAGES` in `src/engines/mission.js` if it should
  be a stop on the scroll journey.
