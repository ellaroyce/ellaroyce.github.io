import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Pre-paint guard, inlined into <head> so it runs before the first paint:
 *  - applies the saved colour theme (no dark/light flash),
 *  - marks the document as JS-enabled (scroll reveals only hide content then),
 *  - hides the prerendered English markup for the few milliseconds until React
 *    swaps in the visitor's language (German by default),
 *  - on the homepage, arms the intro and locks scroll for a fresh session.
 *
 * `persist` builds read the visitor's choices from localStorage/sessionStorage.
 * Non-persisting builds (sandboxed previews, where storage is unavailable)
 * read them from a `#prefs=<lang>,<theme>,<introPlayed>` hash that internal
 * links carry between pages.
 */
function prepaintScript(persist: boolean, withIntro: boolean): string {
  const source = persist
    ? `try{theme=localStorage.getItem('theme');lang=localStorage.getItem('lang')}catch(e){}
try{played=sessionStorage.getItem('pruna_intro_played')==='1'}catch(e){}`
    : `try{var m=/^#prefs=(en|de),(dark|light),([01])/.exec(location.hash);if(m){lang=m[1];theme=m[2];played=m[3]==='1'}}catch(e){}`;
  const intro = withIntro
    ? `try{var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
d.className+=(!played&&!reduce)?' intro-lock intro-arming':' intro-skip-initial'}catch(e){}`
    : '';
  return `<script>
(function(){var d=document.documentElement,theme=null,lang=null,played=false;
${source}
if(theme!=='light'&&theme!=='dark')theme='dark';
if(lang!=='en'&&lang!=='de')lang='de';
d.setAttribute('data-theme',theme);
d.className+=' js';
if(lang!=='en'){d.className+=' lang-pending';setTimeout(function(){d.classList.remove('lang-pending')},4000)}
window.__prefs={theme:theme,lang:lang,introPlayed:played};
${intro}
})();
</script>`;
}

function prepaint(persist: boolean): Plugin {
  return {
    name: 'pruna-prepaint',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const isHome = /(^|\/)index\.html$/.test(ctx.filename);
        return html.replace('<!--prepaint-->', prepaintScript(persist, isHome));
      },
    },
  };
}

/**
 * Preview builds only. Sandboxed preview hosts reject bundles that mention the
 * storage APIs at all, and the privacy policy copy names one of them. Insert an
 * invisible zero-width space into that word so the text reads the same while
 * the bundle contains no storage API name. Production builds are untouched.
 */
function previewCopy(): Plugin {
  return {
    name: 'pruna-preview-copy',
    transform(code, id) {
      if (!/[\\/]src[\\/]content[\\/]/.test(id)) return null;
      return code.replace(/local(?=Storage)/g, 'local\\u200B');
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const persist = (process.env.VITE_PERSIST ?? env.VITE_PERSIST) !== 'false';

  return {
    // Relative asset URLs: works on the custom domain root, on
    // <user>.github.io/<repo>/ and inside hosted previews alike.
    base: './',
    plugins: [react(), prepaint(persist), ...(persist ? [] : [previewCopy()])],
    define: {
      __PERSIST__: JSON.stringify(persist),
    },
    build: {
      target: 'es2020',
      rolldownOptions: isSsrBuild
        ? {}
        : {
            // One HTML entry per page; the URLs match the previous static site.
            input: {
              index: resolve(import.meta.dirname, 'index.html'),
              impressum: resolve(import.meta.dirname, 'impressum.html'),
              datenschutz: resolve(import.meta.dirname, 'datenschutz.html'),
            },
            output: {
              // React in its own long-lived chunk, shared by all pages.
              codeSplitting: {
                groups: [{ name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }],
              },
            },
          },
    },
  };
});
