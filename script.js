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
    'nav.ready': 'EU-KI-Bereitschaft',
    'nav.needs': 'Was Sie brauchen',
    'nav.about': 'Über mich',
    'nav.faq': 'FAQ',
    'nav.cta': 'Gespräch buchen',

    'hero.eyebrow': 'KI-Governance · Architektur · Umsetzung — Erlangen, Deutschland',
    'hero.title': 'Vom Prototyp in die Produktion, <span class="accent">konform by Design.</span>',
    'hero.lede': 'Ich bringe steckengebliebene KI-Prototypen in konforme, akzeptierte und margenpositive Produkte — als Brücke zwischen Modell, Architektur und EU&nbsp;KI-Verordnung, damit regulierte europäische Unternehmen KI ausliefern, der Prüfer, Ingenieure und der Vorstand vertrauen.',
    'hero.for': 'Für regulierte europäische Unternehmen mit KI in — oder kurz vor — der Produktion.',
    'hero.cta1': '20-Min-Erstgespräch buchen',
    'hero.cta2': 'Sind Sie KI-Act-bereit?',

    'flow.proto': 'Prototyp',
    'flow.protoSub': 'Ein Modell im Notebook',
    'flow.prod': 'Produktion',
    'flow.prodSub': 'Überwacht, akzeptiert, skaliert',
    'flow.compliant': 'Konformes Produkt',
    'flow.compliantSub': 'Besteht Prüfung & GuV-Review',

    'strip.1': 'EU-KI-Verordnung-Bereitschaft',
    'strip.2': 'Governance für Hochrisiko-Systeme',
    'strip.3': 'MLOps & Modell-Lebenszyklus',
    'strip.4': 'Enterprise- & Datenarchitektur',
    'strip.5': 'Vom Pilot zum Produkt',
    'strip.6': 'Souveräne & Healthcare-KI',

    'ready.eyebrow': 'Die Frage, die jeder Vorstand stellt',
    'ready.title': 'Sind Sie bereit für die EU-KI-Regulierung?',
    'ready.lede': 'Die allgemeinen Pflichten der EU-KI-Verordnung gelten ab August 2026, die Hochrisiko-Anforderungen folgen schrittweise bis 2028. KI ist das am schnellsten wachsende Segment der deutschen Beratung — dennoch fehlt fast drei von vier Unternehmen eine ausgereifte KI-Governance. Wenn Ihre KI Kunden, Sicherheit oder regulierte Daten berührt, läuft die Uhr bereits.',
    'ready.stat1': 'bis die zentralen Pflichten der EU-KI-Verordnung greifen (2. Aug. 2026).',
    'ready.stat2': 'Höchststrafe vom weltweiten Jahresumsatz bei den schwersten Verstößen.',
    'ready.stat3num': '~3 von 4',
    'ready.stat3': 'deutsche Unternehmen haben noch keine voll entwickelte KI-Governance.',

    'needs.eyebrow': 'Wo ich helfe',
    'needs.title': 'Was meine Kunden brauchen',
    'needs.lede': 'Die meisten Teams haben Data Scientists, die keine Regulierung lesen, Juristen, die keinen Code lesen, und Architekten, die keine Ergebnisse verantworten. Meine Kunden brauchen jemanden, der auf allen drei Stühlen zugleich sitzt.',

    'svc1.h': '„Wir müssen schnell EU-KI-Act-konform werden.“',
    'svc1.tag': 'Am dringendsten',
    'svc1.p': 'Risikoklassifizierung, Konformitätsdokumentation, Gestaltung der menschlichen Aufsicht und MLOps-Audit-Trails — eine belastbare Governance-Position, bevor die Frist greift.',
    'svc2.h': '„Unsere KI-Tools sind zersplittert und uneinheitlich.“',
    'svc2.p': 'Das Playbook „von Tool-Wildwuchs zu strategischen Plattformen“ — eine kohärente KI-Zielarchitektur für Organisationen, die in fragmentierten Tools und Ad-hoc-Eigenbauten versinken.',
    'svc3.h': '„Unsere Pilotprojekte erreichen nie die Produktion.“',
    'svc3.p': 'Steckengebliebene Proofs-of-Concept in akzeptierte, überwachte Produktion bringen — mit messbarem Margeneffekt, nicht nur ein Modell im Notebook.',
    'svc4.h': '„Wir arbeiten mit Healthcare- oder sicherheitskritischer KI.“',
    'svc4.p': 'Die Nische, in der ein klinischer Forschungshintergrund und DSGVO-native Instinkte zum echten Wettbewerbsvorteil werden — MedTech, Life Sciences und sicherheitskritische KI.',

    'engage.title': 'Zusammenarbeitsmodelle',
    'engage.t1l': 'Advisor',
    'engage.t1d': '~1 Tag/Woche. Strategie, Governance-Aufsicht, Vorstandsbereitschaft.',
    'engage.t2l': 'Operating Partner',
    'engage.t2d': '~2 Tage/Woche. Aktive Umsetzung an der Seite Ihres Teams.',
    'engage.t3l': 'Embedded AI Officer',
    'engage.t3d': '~3 Tage/Woche. Volle Governance-Verantwortung im regulierten Umfeld.',
    'engage.t4l': 'KI-Act-Readiness-Sprint',
    'engage.t4d': 'Festgelegtes Assessment: Risikoklassifizierung, Gap-Analyse, Roadmap.',

    'offer.badge': 'Hier starten',
    'offer.title': 'EU-KI-Verordnung Readiness-Assessment',
    'offer.lede': 'Ein zweiwöchiges Engagement mit festem Umfang, das Ihrem Vorstand genau zeigt, wo Sie stehen und was als Nächstes zu tun ist — ohne offenes Retainer.',
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
    'about.title': 'Ein Jahrzehnt, in dem ich KI aus der Forschung in regulierte, reale Produkte gebracht habe.',
    'about.lede': 'Ich verbinde Modell, Architektur und Regulierung — und ich habe Modelle in zwei der am stärksten regulierten Bereiche ausgeliefert: sicherheitskritische Industriedienstleistungen und Gesundheitsforschung.',
    'about.s1': 'Jahre Skalierung von KI- & Datenplattformen',
    'about.s2': 'Länder, in denen geliefert wurde',
    'about.s3': 'geleitete KI- & Analytics-Initiativen',

    'proof.n1': 'Weniger<br>Störungen',
    'proof.p1': 'MLOps-, Monitoring- und Robustheitsstandards über 20+ KI-Initiativen gesetzt, um Produktionsbereitstellungen verlässlich zu machen.',
    'proof.n2': 'Niedrigere<br>Betriebskosten',
    'proof.p2': 'Fragmentierte Tools zu strategischen, cloud-fähigen Plattformen konsolidiert — mit messbar reduzierten Betriebskosten.',
    'proof.n3': 'Weniger<br>Handarbeit',
    'proof.p3': 'Ein globales KPI- & Dashboard-Framework über Projekte in 10+ Ländern aufgebaut und den Reporting-Aufwand gesenkt.',
    'proof.n4': 'Schneller<br>zum Wert',
    'proof.p4': 'Prototyp-zu-Produktion-Zyklen verkürzt — mit Akzeptanz und Margeneffekt statt Modellen im Notebook.',

    'creds.intro': 'Gestützt auf',
    'creds.l1': 'Doktorandin, Mathematik in den Lebenswissenschaften (FAU Erlangen)',
    'creds.l2': 'MSc Informatik, cum laude',
    'creds.l3': 'ArchiMate-zertifiziert · IPMA Level D',
    'creds.l4': 'Google Generative AI Leader · Anthropic- & Databricks-zertifiziert',
    'creds.l5': 'Q1-Publikationen · 3 Software-Patente · ausgezeichnete KI-Umsetzung',
    'creds.l6': 'Englisch C2 · Deutsch B2 · Russisch Muttersprache',

    'whyme.eyebrow': 'Warum fraktional',
    'whyme.title': 'Senior, hands-on und hat die Modelle tatsächlich ausgeliefert — zu einem Bruchteil einer großen Beratung.',
    'whyme.lede': 'Eine große Beratung schickt ein Foliendeck und ein Juniorteam. Ich bringe eine erfahrene Operatorin, die KI im regulierten Umfeld gebaut und gesteuert hat, sich in Ihr Team einbettet und das Ergebnis verantwortet — ohne den Overhead, die Einarbeitung oder die Festanstellung.',

    'quote.text': '„Unser Modell steckte ein Jahr im Pilotbetrieb fest, weil niemand das Risiko freigeben konnte. Sie hat es auf die EU-KI-Verordnung abgebildet, die Lücken in Dokumentation und Monitoring geschlossen, und wir haben das interne Audit in sechs Wochen bestanden — dann ging es live.“',
    'quote.name': 'Leiter Data Science',
    'quote.role': 'Regulierte Industrie · Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie beginnt eine Zusammenarbeit?',
    'faq.a1': 'Mit einem 20-minütigen Erstgespräch, um Ihre KI-Landschaft und Ihren Zeitplan zu verstehen. Die meisten Kunden starten dann mit dem EU-KI-Verordnung Readiness-Assessment mit festem Umfang, das die größere Entscheidung entschärft und dem Vorstand vor jedem Retainer ein klares Bild gibt.',
    'faq.q2': 'Arbeiten Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich bin in Deutschland ansässig und arbeite mit regulierten Unternehmen in ganz Europa — remote als Standard, vor Ort für wichtige Workshops und Vorstandssitzungen, wenn es hilft.',
    'faq.q3': 'Mit welchen Organisationen arbeiten Sie?',
    'faq.a3': 'Regulierte und sicherheitskritische europäische Unternehmen mit KI in oder nahe der Produktion — Industriedienstleistungen, MedTech, Life Sciences und ähnliche Branchen, in denen Prüfer, Ingenieure und Vorstand dem System vertrauen müssen.',
    'faq.q4': 'Wie werden Engagements strukturiert und beauftragt?',
    'faq.a4': 'Projektbasiert oder als fraktionaler Retainer (etwa ein bis drei Tage pro Woche), zu festem Umfang und Honorar statt Stundenabrechnung — sauber für beide Seiten und gut geeignet für deutsche Vertragsnormen.',
    'faq.q5': 'Was unterscheidet Sie von einer großen Beratung?',
    'faq.a5': 'Sie bekommen eine erfahrene Operatorin, die KI in regulierten Bereichen selbst gebaut, deployed und gesteuert hat — kein Foliendeck und kein rotierendes Juniorteam. Hands-on, ergebnisverantwortlich und zu einem Bruchteil der Kosten.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'KI, die den Prüfer <span class="accent">und den GuV-Review besteht.</span>',
    'contact.lede': 'Wenn Sie ein reguliertes europäisches Unternehmen sind, das sich auf die EU-KI-Verordnung vorbereitet — oder auf KI-Piloten sitzt, die nie in die Produktion kamen — lassen Sie uns in einem 20-minütigen Gespräch klären, wie gut aussieht.',
    'contact.cta1': '20-Min-Gespräch buchen&nbsp;→',
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

  let initial = 'en';
  try {
    const saved = localStorage.getItem(STORE);
    if (saved === 'de' || saved === 'en') initial = saved;
    else if ((navigator.language || '').toLowerCase().startsWith('de')) initial = 'de';
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
