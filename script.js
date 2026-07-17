// ===========================================================================
// script.js — theme, language, nav, reveals, and small delightful moments.
// The hero animation lives in hero.js. No cinematic intro overlay.
// ===========================================================================

// ---------------------------------------------------------------------------
// Theme toggle — dark is the default; a stored choice always wins.
// ---------------------------------------------------------------------------
(function () {
  const btn = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  const STORE = 'theme';

  let theme = 'dark';
  try {
    const saved = localStorage.getItem(STORE);
    if (saved === 'light' || saved === 'dark') theme = saved;
  } catch (e) {}
  root.setAttribute('data-theme', theme);

  const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';

  function render() {
    if (!btn) return;
    btn.innerHTML = theme === 'dark' ? sun : moon;
    btn.setAttribute('aria-label', 'Switch to ' + (theme === 'dark' ? 'light' : 'dark') + ' mode');
  }
  render();

  if (btn) btn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(STORE, theme); } catch (e) {}
    render();
  });
})();

// ---------------------------------------------------------------------------
// Nav pill: border on scroll
// ---------------------------------------------------------------------------
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ---------------------------------------------------------------------------
// Language switcher (EN / DE) — German is the first-visit default.
// Copy is founder-to-founder: short, direct, a little playful, never juvenile.
// ---------------------------------------------------------------------------
const I18N = {
  de: {
    'a11y.skip': 'Zum Inhalt springen',

    'nav.needs': 'Arbeit',
    'nav.how': 'Ablauf',
    'nav.about': 'Über mich',
    'nav.faq': 'FAQ',

    'hero.eyebrow': 'Dein CIO / CISO auf Zeit',
    'hero.l1': 'Komplexe Systeme.',
    'hero.l2': 'Ruhige Entscheidungen.',
    'hero.lede': 'Deine IT sollte im besten Sinne langweilig sein: sicher gedacht, verlässlich, wenn es zählt, und angenehm, darauf zu bauen. Ich setze das auf und bringe dein Team dahin, es ohne mich zu betreiben.',
    'hero.role': 'Sicher von Anfang an',
    'hero.place': 'München, 80796, Germany · remote in ganz Europa',
    'hero.cta1': '30 Min buchen',
    'hero.cta2': 'Ansehen, was ich löse',
    'hero.hint': 'springt zur Buchung',
    'hero.vizalt': 'Ein animiertes Diagramm aus lose verstreuten Netzwerkknoten, die sich zu geschützten Clustern um einen stabilen Kern zusammenfinden.',
    'hero.leg1': 'Knoten',
    'hero.leg2': 'geschützter Cluster',
    'hero.leg3': 'stabiler Kern',

    'rail.1': 'Jahre IT-, Daten- und KI-Plattformen im großen Maßstab geliefert',
    'rail.2': 'Länder, in denen ich geliefert habe',
    'rail.3': 'Tools abgeschaltet und auf eine Handvoll Plattformen zusammengeführt',
    'rail.4': 'zertifiziert in Enterprise-Architektur & Projektmanagement',

    'work.eyebrow': 'Was meistens brennt',
    'work.title': 'Vier Module, ein System',
    'work.lede': 'Die meisten Gründerinnen und Gründer kommen mit einem brennenden Thema und wollen am Ende alle vier. Sie hängen zusammen, also behandle ich sie als ein System.',

    'svc1.h': 'Architektur',
    'svc1.p': 'Ein klares Zielbild für deine Systeme, Cloud und Daten, dann ein Aufräumen des Bestands. Weniger Tools, klare Verantwortung, eine Architektur, die mit dir wächst statt gegen dich zu arbeiten.',
    'svc2.h': 'Security',
    'svc2.p': 'Sicherheit in der Größe deines Unternehmens, keine Konzern-Checkliste. Ich finde, wo du angreifbar bist, schließe die dringenden Lücken zuerst und mache dich fit für ISO 27001 oder NIS2, ganz ohne Drama.',
    'svc3.h': 'Team',
    'svc3.p': 'Tools betreiben sich nicht von selbst. Ich helfe dir, die richtigen Leute einzustellen, den IT-Alltag aufzusetzen und das Team zu coachen, damit es ohne mich läuft. Klare Rollen, vernünftige Prozesse.',
    'svc5.h': 'Führung auf Abruf',
    'svc5.p': 'Erfahrenes Urteil, wenn du es brauchst: ein Board-Deck zum Gegenchecken, ein Anbietervertrag zum Lesen, eine harte Entscheidung. So viel oder so wenig, wie du brauchst.',

    'engage.eyebrow': 'So läuft das',
    'engage.title': 'Drei Wege rein, eine Arbeitsweise',
    'engage.lede': 'Wir legen den Umfang vorab fest, und ich bleibe nah am Team, solange die Arbeit läuft. Keine vage Stundenabrechnung, kein Foliensatz, der an der Tür übergeben wird.',
    'engage.t1l': 'CIO / CISO auf Zeit',
    'engage.t1d': 'Ein paar Tage im Monat. Ich verantworte deine IT- und Security-Richtung und bleibe nah am Team.',
    'engage.t2l': 'Projekteinsatz',
    'engage.t2d': 'Ein klar umrissenes Stück Arbeit: eine Architektur, ein Security-Review, eine Migration. Fester Umfang, fertig.',
    'engage.t3l': 'Beratung auf Abruf',
    'engage.t3d': 'Auf Abruf für Board-Decks, Anbietergespräche und die großen Entscheidungen.',

    'offer.badge': 'Fang hier an',
    'offer.title': 'Ein IT- & Security-Check',
    'offer.lede': 'Ein fokussierter Blick auf dein Setup: wo die echten Risiken liegen und was zuerst dran ist. Ein entspannter Weg, um zu sehen, wie ich arbeite.',
    'offer.li1': 'Eine ehrliche Einschätzung deiner Architektur und Security',
    'offer.li2': 'Die drei Dinge, die sich zuerst lohnen, und warum',
    'offer.li3': 'Eine kurze schriftliche Zusammenfassung zum Handeln oder Weitergeben',
    'offer.m1': 'Format',
    'offer.m1v': 'Halbtags-Review',
    'offer.m2': 'Für',
    'offer.m2v': 'Start-ups & Mittelstand',
    'offer.m3': 'Honorar',
    'offer.m3v': 'Festpreis, vorab vereinbart',
    'offer.cta': 'Termin buchen',

    'about.eyebrow': 'Über mich',
    'about.title': 'Ich habe das im Konzernmaßstab gemacht. Jetzt für Unternehmen in deiner Größe.',
    'about.bio': 'Ich habe neun Jahre lang IT-, Daten- und KI-Plattformen in über zehn Ländern aufgebaut und skaliert, zuerst als Enterprise-Architektin, dann als anpackende Leiterin. Ich weiß, wie gut in diesem Maßstab aussieht, und was still und leise kaputtgeht.',
    'about.bio2': 'Pruna Secura habe ich gegründet, um dieses Urteil zu kleineren Unternehmen zu bringen. Ich habe über 2.500 Tools auf eine Handvoll strategischer Plattformen zusammengeführt, die Standards für Bau und Sicherheit gesetzt und Teams gecoacht, damit sie die Arbeit nach mir weitertragen. Ich bin anbieterunabhängig und empfehle, was zu dir passt, nicht, was mich bezahlt.',

    'evidence.intro': 'Belege',
    'certs.c1': 'Enterprise-Architektur',
    'certs.c2': 'Projektmanagement',
    'certs.c3': 'Moderne Entwicklung',
    'certs.c4n': 'Doktorandin',
    'certs.c4': 'Angewandte Mathematik',

    'principles.eyebrow': 'Wie ich arbeite',
    'principles.quote': 'Erfahren genug, um das ganze Feld zu sehen, anpackend genug, um es zu richten. Ich sage dir ehrlich, was wirklich zählt, und übergebe keinen Foliensatz, um dann zu verschwinden.',
    'principles.p1t': 'Klartext',
    'principles.p1': 'Kein Fachjargon um seiner selbst willen. Du weißt immer, was ich tue und warum.',
    'principles.p2t': 'Anbieterunabhängig',
    'principles.p2': 'Ich empfehle, was zu deinem Unternehmen passt, nicht, was eine Provision bringt.',
    'principles.p3t': 'Auf Übergabe gebaut',
    'principles.p3': 'Das Ziel ist ein Team, das es ohne mich betreibt, keine Abhängigkeit von mir.',
    'principles.refs': 'Referenzen von Kundinnen und Kunden nenne ich gern auf Anfrage, sobald es passt und beide Seiten zugestimmt haben.',

    'faq.eyebrow': 'Bevor du schreibst',
    'faq.title': 'Gute Fragen',
    'faq.q1': 'Wie fangen wir an?',
    'faq.a1': 'Ein kostenloses Intro-Gespräch, dann meist ein halbtägiger IT- und Security-Check. Du bekommst ein klares Bild und einen Plan, bevor du dich auf mehr festlegst.',
    'faq.q2': 'Arbeitest du remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in München, 80796, Germany und arbeite mit Unternehmen in ganz Europa. Standardmäßig remote, vor Ort, wenn ein Projekt es braucht.',
    'faq.q3': 'Bist du technisch oder eher Strategin?',
    'faq.a3': 'Beides. Ich setze die Strategie fürs Board und gehe mit deinen Entwicklern ins Detail. Ich übergebe keinen Foliensatz und verschwinde dann.',
    'faq.q4': 'Wir sind klein. Brauchen wir das überhaupt?',
    'faq.a4': 'Wenn deine Technik oder Security dich ausbremst oder nachts wachhält, dann ja. Du bekommst erfahrenes Urteil in der Größe, die zu dir passt, ohne Vollzeitstelle.',
    'faq.q5': 'Wie funktioniert die Preisgestaltung?',
    'faq.a5': 'Ein einfacher Umfang, vorab festgelegt: ein einmaliges Review, ein Projekt mit festem Umfang oder ein paar Tage im Monat. Keine Überraschungen, keine vage Stundenabrechnung.',

    'contact.eyebrow': 'Sag Hallo',
    'contact.title': 'Bringen wir deine Technik in Ordnung.',
    'contact.lede': 'Architektur, die dich ausbremst, Security, die dich nachts wachhält, oder einfach jemand Erfahrenes zum Durchdenken? Schnapp dir einen Termin.',
    'contact.cta': '30 Min buchen',
    'contact.ctanote': 'Kostenlos, kein Pitch, klare Antworten.',
    'trust.nda': 'Alles, worüber wir sprechen, bleibt vertraulich. NDA auf Wunsch.',
    'trust.eu': 'Ansässig in München, 80796, Germany. Deine Daten bleiben in der EU.',

    'footer.copy': '© 2026 Pruna Secura · München, 80796, Germany',
    'footer.tag': 'IT-Architektur, Cybersicherheit & Teams für Start-ups und den Mittelstand',
    'footer.imprint': 'Impressum',
    'footer.privacy': 'Datenschutz',

    'legal.back': '← Zurück zur Startseite',

    'imp.title': 'Impressum',
    'imp.h1': 'Angaben gemäß § 5 DDG',
    'imp.provider': 'Diensteanbieterin',
    'imp.addr.label': 'Anschrift',
    'imp.contact.label': 'Kontakt',
    'imp.contact.phone': 'Telefon:',
    'imp.contact.email': 'E-Mail:',
    'imp.vat.h': 'Umsatzsteuer',
    'imp.vat.p': 'Als Kleinunternehmerin im Sinne von § 19 UStG wird keine Umsatzsteuer ausgewiesen.',
    'imp.resp.h': 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
    'imp.disp.h': 'Streitschlichtung',
    'imp.disp.p': 'Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr. Ich bin nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
    'imp.liability.h': 'Haftung für Inhalte',
    'imp.liability.p': 'Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann ich jedoch keine Gewähr übernehmen. Als Diensteanbieterin bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.',
    'imp.links.h': 'Haftung für Links',
    'imp.links.p': 'Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte ich keinen Einfluss habe. Für diese fremden Inhalte kann ich keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets die jeweilige Anbieterin oder der jeweilige Betreiber verantwortlich.',
    'imp.copy.h': 'Urheberrecht',
    'imp.copy.p': 'Die durch die Betreiberin erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.',

    'ds.h1': 'Datenschutzerklärung',
    'ds.intro.h': '1. Datenschutz auf einen Blick',
    'ds.intro.p': 'Der Schutz deiner persönlichen Daten ist mir wichtig. Ich verarbeite deine Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TDDDG). Diese Erklärung informiert dich über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf dieser Website.',
    'ds.ctrl.h': '2. Verantwortliche Stelle',
    'ds.ctrl.p': 'Verantwortlich für die Datenverarbeitung auf dieser Website ist:',
    'ds.host.h': '3. Hosting',
    'ds.host.p': 'Diese Website wird bei GitHub Pages gehostet, einem Dienst der GitHub, Inc. (88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). GitHub kann beim Aufruf der Seite technische Zugriffsdaten (z. B. IP-Adresse, Datum und Uhrzeit) in Server-Logfiles erfassen. Rechtsgrundlage ist das berechtigte Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Für die Übermittlung in die USA stützt sich GitHub auf Standardvertragsklauseln. Weitere Informationen findest du in der Datenschutzerklärung von GitHub.',
    'ds.contactdata.h': '4. Kontaktaufnahme',
    'ds.contactdata.p': 'Wenn du mich per E-Mail oder Telefon kontaktierst, werden deine Angaben zur Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Vertrags) bzw. lit. f (berechtigtes Interesse an der Beantwortung). Ich gebe diese Daten nicht ohne deine Einwilligung weiter und lösche sie, sobald sie für den Zweck nicht mehr erforderlich sind.',
    'ds.storage.h': '5. Lokale Speicherung im Browser',
    'ds.storage.p': 'Diese Website setzt keine Tracking-Cookies ein. Zur Speicherung deiner bevorzugten Sprache und des Farbschemas wird der lokale Speicher deines Browsers (localStorage) verwendet. Diese Daten verbleiben auf deinem Gerät, werden nicht an mich übertragen und können jederzeit über die Einstellungen deines Browsers gelöscht werden.',
    'ds.rights.h': '6. Deine Rechte',
    'ds.rights.p': 'Du hast jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung deiner personenbezogenen Daten. Zudem steht dir ein Beschwerderecht bei einer Aufsichtsbehörde zu. Wende dich dazu an die oben genannten Kontaktdaten.',
    'ds.updated': 'Stand: Juli 2026'
  }
};

(function () {
  const STORE = 'lang';
  const nodes = document.querySelectorAll('[data-i18n], [data-i18n-html]');
  nodes.forEach(n => {
    if (n.hasAttribute('data-i18n-html')) n.dataset.en = n.innerHTML;
    else n.dataset.en = n.textContent;
  });

  function apply(lang) {
    const dict = lang === 'de' ? I18N.de : null;
    nodes.forEach(n => {
      const key = n.getAttribute('data-i18n-html') || n.getAttribute('data-i18n');
      const isHtml = n.hasAttribute('data-i18n-html');
      let val;
      if (lang === 'en') val = n.dataset.en;
      else val = (dict && dict[key] != null) ? dict[key] : n.dataset.en;
      if (isHtml) n.innerHTML = val; else n.textContent = val;
    });
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-lang-set]').forEach(b => {
      const on = b.getAttribute('data-lang-set') === lang;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    window.__lang = lang;
  }

  // Default to German on first visit; honour a saved choice on return.
  let initial = 'de';
  try {
    const saved = localStorage.getItem(STORE);
    if (saved === 'de' || saved === 'en') initial = saved;
  } catch (e) {}

  document.querySelectorAll('[data-lang-set]').forEach(b => {
    b.addEventListener('click', () => {
      const lang = b.getAttribute('data-lang-set');
      apply(lang);
      try { localStorage.setItem(STORE, lang); } catch (e) {}
    });
  });

  window.__applyLang = apply;
  apply(initial);

  // Mobile nav dropdown
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const pill = document.querySelector('.nav__pill');
  if (navToggle && primaryNav) {
    const setOpen = (open) => {
      primaryNav.classList.toggle('is-open', open);
      if (pill) pill.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setOpen(!primaryNav.classList.contains('is-open')));
    primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }
})();

// ---------------------------------------------------------------------------
// Reveal on scroll (respects prefers-reduced-motion via CSS fallback)
// ---------------------------------------------------------------------------
(function () {
  const els = document.querySelectorAll('.reveal');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const sibs = [...e.target.parentElement.querySelectorAll('.reveal')];
        e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 4) * 70 + 'ms';
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
})();

// ---------------------------------------------------------------------------
// Count-up for proof stats — numbers assemble themselves, matching the
// "loose things self-organise into something solid" idea of the hero.
// ---------------------------------------------------------------------------
(function () {
  const nums = document.querySelectorAll('.stat__num[data-count]');
  if (!nums.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;

  const fmt = (n) => n.toLocaleString(window.__lang === 'de' ? 'de-DE' : 'en-US');
  const run = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const dur = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = fmt(target) + suffix;
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach((n) => io.observe(n));
})();

// ---------------------------------------------------------------------------
// Easter egg 1 — the "/" key focuses the intro CTA, like a command palette.
// A tiny nod to product-culture keyboard shortcuts. Non-blocking, a11y-safe.
// ---------------------------------------------------------------------------
(function () {
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const cta = document.querySelector('.hero__actions .btn--primary');
    if (cta) {
      e.preventDefault();
      cta.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      cta.focus({ preventScroll: true });
      cta.classList.add('btn--ping');
      setTimeout(() => cta.classList.remove('btn--ping'), 700);
    }
  });
})();

// ---------------------------------------------------------------------------
// Easter egg 2 — click the logo mark 3× quickly and the system "recalibrates":
// the hero core sends a burst of signals. Purely delightful, discoverable,
// and skipped entirely under reduced motion.
// ---------------------------------------------------------------------------
(function () {
  const brand = document.querySelector('.nav__brand');
  if (!brand) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let clicks = 0, timer = null;
  brand.addEventListener('click', () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 600);
    if (clicks >= 3) {
      clicks = 0;
      if (!reduce && typeof window.__prunaBurst === 'function') window.__prunaBurst();
      const logo = brand.querySelector('.nav__logo');
      if (logo && !reduce) {
        logo.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        logo.style.transform = 'rotate(360deg)';
        setTimeout(() => { logo.style.transform = ''; }, 640);
      }
    }
  });
})();

// Console note for the curious founder who opens dev tools.
try {
  // eslint-disable-next-line no-console
  console.log('%cPruna Secura', 'font:700 20px system-ui;color:#3f78ff', '\nSecure by design. Reliable in operation. Book a slot: https://cal.com/ask-ella/30min');
} catch (e) {}
