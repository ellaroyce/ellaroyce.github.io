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
    'nav.how': 'So läuft es ab',
    'nav.ready': 'AI Act, einfach erklärt',
    'nav.needs': 'Worüber ich lehre',
    'nav.about': 'Über mich',
    'nav.faq': 'FAQ',
    'nav.cta': 'Kostenloses Gespräch',

    'hero.eyebrow': 'Coaching & Workshops zu KI, ML und IT für Gründer und Teams',
    'hero.title': 'Wissen, wo Sie mit KI anfangen, <span class="accent">ohne den Fachjargon.</span>',
    'hero.lede': 'Noch keine IT und KI fühlt sich nur nach Lärm an? Ich begleite Sie und Ihr Team Schritt für Schritt: wo Sie anfangen, wie Sie Ihre Prozesse aufsetzen und was ML, LLMs und der EU AI Act konkret für Sie bedeuten.',
    'hero.for': 'Für Gründer, C-Level und kleine Teams, die lernen wollen, statt auszulagern. Noch kein CISO, kein Datenteam, keine KI-Verantwortliche? Ich helfe Ihnen zu verstehen, was Sie wirklich brauchen, bevor Sie einstellen oder bauen.',
    'hero.note': 'Eine unabhängige Coachin, keine Tool-Anbieterin. Ich arbeite mit den KI-Werkzeugen, die Sie wählen, bleibe davon aber unabhängig.',
    'hero.cta1': 'Kostenloses 20-Min-Gespräch',
    'hero.cta2': 'Sehen, was ich lehre',

    'funnel.s1tag': 'Wo die meisten Gründer stehen',
    'funnel.s1': 'Überall KI, aber keine Ahnung, wo anfangen',
    'funnel.s2tag': 'Was wir zusammen machen',
    'funnel.s2': 'Coaching, verständliche Workshops, ein klarer Plan',
    'funnel.s3': 'Ein Team, das weiß, was als Nächstes zu tun ist',
    'funnel.payoff': 'Das nehmen Sie mit:',
    'funnel.o1': 'Einen klaren ersten Schritt',
    'funnel.o2': 'Eine gemeinsame Sprache',
    'funnel.o3': 'Sichere Entscheidungen',
    'funnel.o4': 'Ein Team, das es versteht',

    'strip.1': 'Wo Sie mit KI anfangen',
    'strip.2': 'IT-Prozesse aufsetzen',
    'strip.3': 'ML & LLMs verständlich erklärt',
    'strip.4': 'EU AI Act, einfach gemacht',
    'strip.5': 'Von der Idee zum ersten Produkt',
    'strip.6': 'Ein KI-fittes Team aufbauen',

    'ready.eyebrow': 'Ein Thema, das ich coache',
    'ready.title': 'Der EU AI Act, in klarer Sprache',
    'ready.lede': 'Die zentralen Pflichten gelten ab August 2026, und klein zu sein ist keine Ausnahme. Ich helfe Ihnen zu verstehen, was das für Ihr Produkt heißt und was zuerst zu tun ist, und wie es zu Rahmenwerken wie NIST AI RMF und ISO 42001 passt, damit es sich wie eine Checkliste anfühlt und nicht wie eine Bedrohung.',
    'ready.ref': 'Der vollständige Text: <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener">Verordnung (EU)&nbsp;2024/1689</a>',
    'ready.stat1': 'bis die zentralen Pflichten der EU-KI-Verordnung greifen (2. Aug. 2026).',
    'ready.stat2': 'Höchststrafe vom weltweiten Jahresumsatz bei den schwersten Verstößen.',
    'ready.stat3num': '~3 von 4',
    'ready.stat3': 'deutsche Unternehmen haben keine voll entwickelten KI-Governance-Strukturen (Red Hat / Censuswide, 2026).',

    'needs.eyebrow': 'Worüber ich lehre',
    'needs.title': 'Die Fragen, bei denen ich Ihnen weiterhelfe',
    'needs.lede': 'Keine Buzzwords, keine Folien ins Leere. Nur klare Antworten auf die Fragen, an denen Gründer und Teams wirklich hängenbleiben.',

    'svc1.h': '„Wo fangen wir mit KI überhaupt an?“',
    'svc1.tag': 'Am häufigsten gefragt',
    'svc1.p': 'Wir lassen den Hype beiseite und finden die ein, zwei Stellen, an denen KI Ihre Zeit wirklich wert ist, und in welcher Reihenfolge Sie sie angehen.',
    'svc2.h': '„Wir haben noch gar keine richtige IT.“',
    'svc2.p': 'Ich zeige Ihnen, wie Sie Ihre IT und Prozesse von null an organisieren, damit Sie früh gute Gewohnheiten aufbauen statt später ein Durcheinander entwirren zu müssen.',
    'svc3.h': '„Was sind ML und LLMs eigentlich?“',
    'svc3.p': 'Eine verständliche Erklärung von maschinellem Lernen und großen Sprachmodellen: was sie können, was nicht, und wo sie in Ihr Unternehmen passen.',
    'svc5.h': '„Unser Team muss auf den gleichen Stand kommen.“',
    'svc5.p': 'Praxisnahe Workshops, die Ihr ganzes Team auf ein gemeinsames Verständnis bringen, damit alle dieselbe Sprache sprechen und in dieselbe Richtung ziehen.',

    'engage.title': 'Wege, zusammenzuarbeiten',
    'engage.t1l': '1:1-Coaching',
    'engage.t1d': 'Regelmäßige Sitzungen für Gründer oder Führungskräfte. Wir arbeiten Ihre Fragen in Ihrem Tempo durch.',
    'engage.t2l': 'Team-Workshops',
    'engage.t2d': 'Praxisnahe Halb- oder Ganztagessitzungen, die Ihr ganzes Team auf ein gemeinsames Niveau bringen.',
    'engage.t3l': 'Vorträge & Einstiegssitzungen',
    'engage.t3d': 'Ein einzelner Vortrag oder eine „Wo anfangen“-Sitzung für Ihr Team oder Event.',

    'offer.badge': 'Hier starten',
    'offer.title': '„Wo mit KI anfangen“-Sitzung',
    'offer.lede': 'Eine fokussierte erste Sitzung, um zu klären, wo Sie stehen und welche wenigen Dinge als Nächstes lohnen. Ein entspannter Weg, um zu sehen, ob Coaching zu Ihnen passt.',
    'offer.li1': 'Eine ehrliche Einschätzung, wo KI Ihnen wirklich hilft',
    'offer.li2': 'Die ersten zwei, drei Schritte, in klarer Sprache',
    'offer.li3': 'Ein einfacher Plan, dem Sie und Ihr Team folgen können',
    'offer.m1': 'Format',
    'offer.m1v': '90-Min-Sitzung',
    'offer.m2': 'Für',
    'offer.m2v': 'Gründer & Teams',
    'offer.cta': 'Sitzung buchen',

    'about.tag': 'Echte KI & ML × IT von Grund auf × klare Sprache',
    'about.eyebrow': 'Über mich',
    'about.title': 'Ich habe das Echte gebaut. Jetzt zeige ich Ihnen, wie es funktioniert.',
    'about.lede': 'Seit über zehn Jahren bringe ich KI aus der Forschung in Produkte, die wirklich live gegangen sind, in einigen der anspruchsvollsten Umfelder, die es gibt. Ich coache in klarer Sprache, weil ich die schwierigen Teile selbst gemacht habe.',
    'about.bio': 'Gründerin von Pruna Secura. Früher Enterprise-Architektin in sicherheitskritischer Bahntechnik, davor Wissenschaftlerin im MedTech-Bereich, zwei der am stärksten regulierten Umfelder für KI. Die Gewohnheiten, die dort funktionieren, vermittle ich in klarer Sprache, damit Gründer und Teams, die bei null anfangen, lernen, wo sie beginnen, wie sie die IT aufsetzen und was KI wirklich für sie leisten kann.',
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
    'creds.l2': 'KI-Umsetzung mit Auszeichnung',
    'creds.l3': 'Google AI- & Anthropic-zertifiziert',

    'whyme.eyebrow': 'Warum mit mir',
    'whyme.title': 'Eine Coachin, die KI wirklich gebaut hat, nicht nur darüber gelesen.',
    'whyme.lede': 'Die meisten KI-Schulungen sind allgemeine Folien von jemandem, der nie etwas live gebracht hat. Ich habe KI in anspruchsvollen Umfeldern selbst gebaut und betrieben, deshalb kann ich sie einfach erklären und die echten Fragen Ihres Teams beantworten. Sie lernen von jemandem, der die Arbeit gemacht hat.',

    'quote.text': '„Mein Team hörte ständig von KI, aber niemand wusste wirklich, was das für uns bedeutet. Nach ein paar Sitzungen mit Ella sprachen wir endlich dieselbe Sprache, wussten, wo wir anfangen, und jagten nicht mehr jedem neuen Tool hinterher.“',
    'quote.name': 'Start-up-Gründerin',
    'quote.role': 'Kleines Team · Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie fangen wir an?',
    'faq.a1': 'Mit einem kostenlosen 20-minütigen Gespräch, in dem ich höre, wo Sie stehen und was Sie lernen möchten. Die meisten starten danach mit einer einzelnen „Wo mit KI anfangen“-Sitzung. Das ist ein entspannter Weg, um zu sehen, ob Coaching passt, bevor Sie mehr buchen.',
    'faq.q2': 'Coachen Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in Deutschland und coache Gründer und Teams in ganz Europa. Standardmäßig remote, für Team-Workshops aber gerne auch vor Ort, wenn das besser passt.',
    'faq.q3': 'Brauche ich technisches Vorwissen?',
    'faq.a3': 'Nein. Ich coache Gründer, C-Level und Teams, die noch wenig oder gar keine IT haben. Alles in klarer Sprache, und wir starten dort, wo Sie gerade stehen.',
    'faq.q4': 'Wie sieht eine Sitzung oder ein Workshop aus?',
    'faq.a4': 'Entweder 1:1-Coaching, ein Team-Workshop oder ein einzelner Vortrag. Die Sitzungen sind praxisnah und bauen auf Ihren Fragen auf, nicht auf einem festen Foliensatz. Umfang und Preis legen wir vorab einfach fest, ohne Stundenabrechnung.',
    'faq.q5': 'Ist das Beratung oder Coaching?',
    'faq.a5': 'Coaching und Lehre. Ich helfe Ihnen und Ihrem Team, KI, ML und IT zu verstehen und zu entscheiden, was zu tun ist, sodass das Wissen bei Ihnen bleibt. Ich übernehme nicht Ihre Projekte für Sie.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'Finden wir heraus, <span class="accent">wo Sie anfangen.</span>',
    'contact.lede': 'Vielleicht fühlt sich KI nur nach Lärm an und Sie wissen nicht, was der erste Schritt ist. Vielleicht muss Ihr Team auf den gleichen Stand kommen. So oder so: Geben Sie mir 20 Minuten, und wir besprechen, was Ihnen wirklich weiterhilft.',
    'contact.cta1': 'Kostenloses 20-Min-Gespräch →',
    'contact.cta2': 'Auf LinkedIn vernetzen',
    'contact.cta3': 'Direkt anrufen →',

    'footer.copy': '© 2026 Pruna Secura · Ella Türümina · Erlangen, Deutschland',
    'footer.email': 'E-Mail',
    'footer.tag': 'KI-, ML- & IT-Coaching für Gründer und Teams'
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

// Inline glossary popovers — plain-language explanations for jargon (CEO-friendly)
(function () {
  const GLOSSARY = {
    governance: {
      en: { t: 'Governance', d: 'The rules, controls and clear accountability for how AI is built, approved and used — so someone owns the risk and decisions are defensible.' },
      de: { t: 'Governance', d: 'Die Regeln, Kontrollen und klare Verantwortung dafür, wie KI gebaut, freigegeben und eingesetzt wird – damit jemand das Risiko trägt und Entscheidungen belastbar sind.' }
    },
    mlops: {
      en: { t: 'MLOps', d: 'The engineering practice of running AI models reliably in production: deploying, monitoring and updating them so they keep working in the real world.' },
      de: { t: 'MLOps', d: 'Die technische Praxis, KI-Modelle zuverlässig im Betrieb zu führen: ausrollen, überwachen und aktualisieren, damit sie im echten Einsatz funktionieren.' }
    },
    'enterprise-architecture': {
      en: { t: 'Enterprise architecture', d: 'How systems, data and tools fit together across the whole organisation, so a project connects to everything else instead of standing alone.' },
      de: { t: 'Enterprise-Architektur', d: 'Wie Systeme, Daten und Werkzeuge im ganzen Unternehmen zusammenpassen, damit ein Projekt mit allem anderen verbunden ist und nicht für sich allein steht.' }
    },
    'high-risk': {
      en: { t: 'High-risk & conformity', d: 'Under the EU AI Act, certain AI uses count as "high-risk" and need documented proof ("conformity") that they meet the rules before going live.' },
      de: { t: 'Hochrisiko & Konformität', d: 'Nach der EU-KI-Verordnung gelten bestimmte KI-Anwendungen als „hochriskant" und brauchen einen dokumentierten Nachweis („Konformität"), dass sie die Vorgaben erfüllen, bevor sie live gehen.' }
    }
  };

  let openPop = null;
  function closeOpen() {
    if (openPop) { openPop.classList.remove('is-open'); openPop = null; }
  }

  function build(term) {
    const key = term.getAttribute('data-term');
    const entry = GLOSSARY[key];
    if (!entry) return;
    const pop = document.createElement('span');
    pop.className = 'term__pop';
    pop.setAttribute('role', 'tooltip');
    const t = document.createElement('span'); t.className = 'term__pop-term';
    const d = document.createElement('span'); d.className = 'term__pop-def';
    pop.appendChild(t); pop.appendChild(d);
    term.appendChild(pop);
    term.setAttribute('tabindex', '0');

    function fill() {
      const lang = (window.__lang === 'de') ? 'de' : 'en';
      t.textContent = entry[lang].t;
      d.textContent = entry[lang].d;
    }
    function open() { closeOpen(); fill(); pop.classList.add('is-open'); openPop = pop; }
    function close() { pop.classList.remove('is-open'); if (openPop === pop) openPop = null; }

    // Desktop hover
    term.addEventListener('mouseenter', open);
    term.addEventListener('mouseleave', close);
    // Keyboard
    term.addEventListener('focus', open);
    term.addEventListener('blur', close);
    // Tap / click toggle (mobile + click)
    term.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pop.classList.contains('is-open')) close(); else open();
    });
    pop.addEventListener('click', (e) => e.stopPropagation());
  }

  document.querySelectorAll('.term[data-term]').forEach(build);
  document.addEventListener('click', closeOpen);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOpen(); });
})();
