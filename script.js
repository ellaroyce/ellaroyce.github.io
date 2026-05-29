// Theme toggle
(function () {
  const t = document.querySelector('[data-theme-toggle]');
  const r = document.documentElement;
  let d = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  r.setAttribute('data-theme', d);
  const sun = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  const moon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  function render() { if (t) t.innerHTML = d === 'dark' ? sun : moon; }
  render();
  if (t) t.addEventListener('click', () => {
    d = d === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', d);
    t.setAttribute('aria-label', 'Switch to ' + (d === 'dark' ? 'light' : 'dark') + ' mode');
    render();
  });
})();

// Header shadow on scroll
(function () {
  const h = document.getElementById('header');
  const onScroll = () => h.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// ---------------------------------------------------------------------------
// Language switcher (EN / DE)
// ---------------------------------------------------------------------------
const I18N = {
  de: {
    'nav.how': 'So funktioniert es',
    'nav.ready': 'EU-KI-Bereitschaft',
    'nav.needs': 'Was Sie brauchen',
    'nav.about': 'Über mich',
    'nav.faq': 'FAQ',
    'nav.cta': 'Kostenloses Gespräch',

    'hero.eyebrow': 'KI-Governance · Architektur · Umsetzung',
    'hero.title': 'Vom Prototyp in die Produktion, <span class="accent">konform mit dem EU AI Act.</span>',
    'hero.lede': 'Die meisten KI-Projekte bleiben irgendwo zwischen einer guten Demo und einem Produkt stecken, das man wirklich ausliefern kann. Genau über diese Lücke bringe ich sie, und zwar im Einklang mit der EU-KI-Verordnung. Am Ende steht KI, der Ihre Prüfer, Ihre Technik und Ihr Vorstand vertrauen.',
    'hero.for': 'Für regulierte Unternehmen in Europa, deren KI schon im Einsatz ist oder kurz davorsteht.',
    'hero.cta1': 'Kostenloses 20-Min-Gespräch',
    'hero.cta2': 'Sind Sie bereit für den AI Act?',

    'funnel.s1tag': 'Wo die meisten Teams feststecken',
    'funnel.s1': 'Vielversprechende Pilotprojekte, die nie live gehen',
    'funnel.s2tag': 'Was ich beitrage',
    'funnel.s2': 'Governance und Produktions-Engineering',
    'funnel.s3': 'Ein Produkt, konform mit dem EU AI Act',
    'funnel.payoff': 'Was das dem Unternehmen bringt',
    'funnel.o1': 'Weniger Störungen',
    'funnel.o2': 'Geringere Betriebskosten',
    'funnel.o3': 'Weniger Handarbeit',
    'funnel.o4': 'Schneller zum Nutzen',

    'strip.1': 'EU-KI-Verordnung-Bereitschaft',
    'strip.2': 'Governance für Hochrisiko-Systeme',
    'strip.3': 'MLOps & Modell-Lebenszyklus',
    'strip.4': 'Enterprise- & Datenarchitektur',
    'strip.5': 'Vom Pilot zum Produkt',
    'strip.6': 'Souveräne & Healthcare-KI',

    'ready.eyebrow': 'Die Frage, die jeder Vorstand stellt',
    'ready.title': 'Sind Sie bereit für die EU-KI-Regulierung?',
    'ready.lede': 'Die zentralen Pflichten der EU-KI-Verordnung gelten ab August 2026, die Anforderungen an Hochrisiko-Systeme kommen schrittweise bis 2028 dazu. KI ist derzeit das am schnellsten wachsende Beratungsfeld in Deutschland. Trotzdem fehlt vielen Unternehmen eine wirklich ausgereifte KI-Governance. Sobald Ihre KI Kunden, Sicherheit oder regulierte Daten berührt, läuft die Uhr bereits.',
    'ready.ref': 'Der vollständige Text: <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener">Verordnung (EU)&nbsp;2024/1689</a>',
    'ready.stat1': 'bis die zentralen Pflichten der EU-KI-Verordnung greifen (2. Aug. 2026).',
    'ready.stat2': 'Höchststrafe vom weltweiten Jahresumsatz bei den schwersten Verstößen.',
    'ready.stat3num': '~3 von 4',
    'ready.stat3': 'deutsche Unternehmen haben keine voll entwickelten KI-Governance-Strukturen (Red Hat / Censuswide, 2026).',

    'needs.eyebrow': 'Wo ich helfe',
    'needs.title': 'Was meine Kunden brauchen',
    'needs.lede': 'Die meisten Teams haben Data Scientists, die sich mit Regulierung nicht auskennen, Juristen, die keinen Code lesen, und Architekten, die am Ende nicht für das Ergebnis geradestehen. Meine Kunden brauchen jemanden, der alle drei Perspektiven gleichzeitig abdeckt.',

    'svc1.h': '„Wir müssen schnell EU-KI-Act-konform werden.“',
    'svc1.tag': 'Am dringendsten',
    'svc1.p': 'Risikoklassifizierung, Konformitätsdokumentation, die Gestaltung der menschlichen Aufsicht und MLOps-Audit-Trails: eine belastbare Governance-Grundlage, bevor die Frist greift.',
    'svc2.h': '„Unsere KI-Tools sind zersplittert und uneinheitlich.“',
    'svc2.p': 'Der Weg vom Wildwuchs einzelner Tools hin zu strategischen Plattformen: eine klare KI-Zielarchitektur für Organisationen, die in verstreuten Werkzeugen und Eigenbauten den Überblick verlieren.',
    'svc3.h': '„Unsere Pilotprojekte erreichen nie die Produktion.“',
    'svc3.p': 'Liegengebliebene Proof-of-Concepts in eine akzeptierte, überwachte Produktion überführen, mit messbarer Wirkung auf die Marge statt nur einem Modell im Notebook.',
    'svc4.h': '„Wir arbeiten mit Healthcare- oder sicherheitskritischer KI.“',
    'svc4.p': 'Genau das Feld, in dem ein Hintergrund in klinischer Forschung und ein sicheres Gespür für die DSGVO zum echten Vorteil werden: MedTech, Life Sciences und sicherheitskritische KI.',

    'engage.title': 'Zusammenarbeitsmodelle',
    'engage.t1l': 'Advisor',
    'engage.t1d': '~1 Tag/Woche. Strategie, Governance-Aufsicht, Vorstandsbereitschaft.',
    'engage.t2l': 'Umsetzungspartnerin',
    'engage.t2d': '~2 Tage/Woche. Aktive Umsetzung an der Seite Ihres Teams.',
    'engage.t3l': 'Interne KI-Verantwortliche',
    'engage.t3d': '~3 Tage/Woche. Volle Governance-Verantwortung im regulierten Umfeld.',
    'engage.t4l': 'Readiness-Sprint zum AI Act',
    'engage.t4d': 'Festgelegtes Assessment: Risikoklassifizierung, Gap-Analyse, Roadmap.',

    'offer.badge': 'Hier starten',
    'offer.title': 'Readiness-Assessment zur EU-KI-Verordnung',
    'offer.lede': 'Ein zweiwöchiges Projekt mit festem Umfang, das Ihrem Vorstand genau zeigt, wo Sie stehen und was als Nächstes ansteht. Ganz ohne langfristige Bindung.',
    'offer.li1': 'Risikoklassifizierung Ihrer KI-Systeme nach der Verordnung',
    'offer.li2': 'Gap-Analyse gegenüber Hochrisiko-Pflichten & Dokumentation',
    'offer.li3': 'Eine priorisierte, vorstandsreife Compliance-Roadmap',
    'offer.m1': 'Zeitrahmen',
    'offer.m1v': '~2 Wochen',
    'offer.m2': 'Format',
    'offer.m2v': 'Fester Umfang & Honorar',
    'offer.cta': 'Assessment buchen',

    'about.tag': 'Modellierung auf PhD-Niveau × Enterprise-Architektur × EU-KI-Verordnung',
    'about.eyebrow': 'Über mich',
    'about.title': 'Seit über zehn Jahren bringe ich KI aus der Forschung in echte, regulierte Produkte.',
    'about.lede': 'Ich denke Modell, Architektur und Regulierung zusammen und habe Modelle in zwei der am stärksten regulierten Bereiche tatsächlich in den Einsatz gebracht: in sicherheitskritischen Industriediensten und in der Gesundheitsforschung.',
    'about.s1': 'Jahre Skalierung von KI- & Datenplattformen',
    'about.s2': 'Länder, in denen geliefert wurde',
    'about.s3': 'geleitete KI- & Analytics-Initiativen',

    'proof.n1': 'Weniger<br>Störungen',
    'proof.p1': 'MLOps-, Monitoring- und Robustheitsstandards über 20+ KI-Initiativen gesetzt, um Produktionsbereitstellungen verlässlich zu machen.',
    'proof.n2': 'Niedrigere<br>Betriebskosten',
    'proof.p2': 'Verstreute Tools zu strategischen, cloud-fähigen Plattformen zusammengeführt und so die Betriebskosten messbar gesenkt.',
    'proof.n3': 'Weniger<br>Handarbeit',
    'proof.p3': 'Ein globales KPI- & Dashboard-Framework über Projekte in 10+ Ländern aufgebaut und den Reporting-Aufwand gesenkt.',
    'proof.n4': 'Schneller<br>zum Wert',
    'proof.p4': 'Den Weg vom Prototyp in die Produktion verkürzt, mit echter Akzeptanz und Wirkung auf die Marge statt Modellen, die im Notebook liegen bleiben.',

    'creds.intro': 'Gestützt auf',
    'creds.l1': '3 Software-Patente',
    'creds.l2': 'Ausgezeichnete KI-Umsetzung',
    'creds.l3': 'Google Generative AI Leader',
    'creds.l4': 'Anthropic- & Databricks-zertifiziert',

    'whyme.eyebrow': 'Warum fraktional',
    'whyme.title': 'Erfahren, nah an der Umsetzung und mit echten Modellen im Einsatz, zu einem Bruchteil dessen, was eine große Beratung kostet.',
    'whyme.lede': 'Eine große Beratung schickt eine Präsentation und ein Juniorteam. Bei mir bekommen Sie jemanden mit Erfahrung, der KI im regulierten Umfeld selbst gebaut und gesteuert hat, sich in Ihr Team einarbeitet und für das Ergebnis geradesteht. Ohne Overhead, ohne lange Einarbeitung und ohne Festanstellung.',

    'quote.text': '„Unser Modell hing ein Jahr lang im Pilotbetrieb fest, weil niemand das Risiko freigeben wollte. Sie hat es entlang der EU-KI-Verordnung eingeordnet, die Lücken in Dokumentation und Monitoring geschlossen, und nach sechs Wochen hatten wir das interne Audit bestanden. Danach ging es live.“',
    'quote.name': 'Leiter Data Science',
    'quote.role': 'Regulierte Industrie · Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie beginnt eine Zusammenarbeit?',
    'faq.a1': 'Mit einem 20-minütigen Gespräch, in dem ich Ihre KI-Landschaft und Ihren Zeitplan kennenlerne. Die meisten Kunden starten danach mit dem Readiness-Assessment zur EU-KI-Verordnung. Es hat einen festen Umfang, nimmt der großen Entscheidung den Druck und gibt dem Vorstand ein klares Bild, bevor man sich auf eine längere Zusammenarbeit festlegt.',
    'faq.q2': 'Arbeiten Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in Deutschland und arbeite mit regulierten Unternehmen in ganz Europa. Standardmäßig remote, für wichtige Workshops und Vorstandssitzungen aber gerne auch vor Ort, wenn es hilft.',
    'faq.q3': 'Mit welchen Organisationen arbeiten Sie?',
    'faq.a3': 'Mit regulierten und sicherheitskritischen Unternehmen in Europa, deren KI bereits läuft oder kurz davorsteht: Industriedienste, MedTech, Life Sciences und ähnliche Branchen, in denen Prüfer, Ingenieure und Vorstand dem System vertrauen müssen.',
    'faq.q4': 'Wie ist eine Zusammenarbeit aufgesetzt und beauftragt?',
    'faq.a4': 'Entweder projektbasiert oder als fraktionale Zusammenarbeit (etwa ein bis drei Tage pro Woche), mit festem Umfang und Honorar statt Stundenabrechnung. Das ist für beide Seiten sauber und passt gut zu den üblichen deutschen Vertragsformen.',
    'faq.q5': 'Was unterscheidet Sie von einer großen Beratung?',
    'faq.a5': 'Sie bekommen jemanden mit Erfahrung, der KI in regulierten Bereichen selbst gebaut, in den Einsatz gebracht und gesteuert hat. Keine reine Präsentation und kein ständig wechselndes Juniorteam, sondern jemand, der mit anpackt, für das Ergebnis geradesteht und das zu einem Bruchteil der Kosten.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'KI, die den Prüfer <span class="accent">und den GuV-Review besteht.</span>',
    'contact.lede': 'Vielleicht bereiten Sie sich auf die EU-KI-Verordnung vor. Vielleicht haben Sie Piloten, die es nie ganz in die Produktion geschafft haben. So oder so: Geben Sie mir 20 Minuten, und wir finden heraus, wie gut für Sie aussieht.',
    'contact.cta1': 'Kostenloses 20-Min-Gespräch →',
    'contact.cta2': 'Auf LinkedIn vernetzen',
    'contact.email': 'Lieber E-Mail? ellatiuriumina@gmail.com',

    'footer.copy': '© 2026 Ella Türümina · Erlangen, Deutschland',
    'footer.email': 'E-Mail',
    'footer.tag': 'Fraktionale KI-Governance- & Architekturberatung'
  }
};

(function () {
  const STORE = 'lang';
  // Cache the original English content the first time we touch each node.
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
    if (typeof window.__renderCountdown === 'function') window.__renderCountdown();
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

  // Mobile nav dropdown so the site outline is reachable on phones
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  if (navToggle && primaryNav) {
    const setOpen = (open) => {
      primaryNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    navToggle.addEventListener('click', () => setOpen(!primaryNav.classList.contains('is-open')));
    primaryNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  }
})();

// EU AI Act countdown (target: 2 Aug 2026)
(function () {
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date('2026-08-02T00:00:00Z').getTime();
  function tick() {
    const lang = window.__lang || 'en';
    const diff = target - Date.now();
    if (diff <= 0) { el.textContent = lang === 'de' ? 'Jetzt in Kraft' : 'Now in force'; return; }
    const days = Math.floor(diff / 86400000);
    el.textContent = days + (lang === 'de' ? ' Tage' : ' days');
  }
  window.__renderCountdown = tick;
  tick();
  setInterval(tick, 60000);
})();

// Reveal on scroll
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
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
