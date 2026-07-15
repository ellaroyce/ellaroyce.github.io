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
    'nav.needs': 'Was ich mache',
    'nav.about': 'Das bringt es',
    'nav.faq': 'FAQ',
    'nav.cta': 'Kostenloses Gespräch',

    'hero.eyebrow': 'Sparring, Coaching & Unterstützung für Gründerinnen und Gründer',
    'hero.title': 'Jemand an Ihrer <span class="accent">Seite.</span>',
    'hero.lede': 'Ein Unternehmen aufzubauen ist einsam, und an Ratschlägen fehlt es nie. Ich bin die Person, mit der Sie laut denken: Sparringspartnerin und Coachin, die anpackt, wenn es nötig ist, und mit ruhiger Hand bei Ihren Social Media hilft.',
    'hero.for': 'Für Gründerinnen und Gründer, die eine echte Resonanz wollen, keinen weiteren Kurs.',
    'hero.cta1': 'Kostenloses 20-Min-Gespräch',
    'hero.cta2': 'Sehen, wie ich helfe',

    'funnel.s1tag': 'Wo die meisten Gründenden stehen',
    'funnel.s1': 'Jede Entscheidung allein tragen',
    'funnel.s2tag': 'Was wir zusammen machen',
    'funnel.s2': 'Sparring, Coaching, Unterstützung, Social Media',
    'funnel.s3': 'Gründende, die mit klarem Kopf vorangehen',
    'funnel.payoff': 'Das nehmen Sie mit:',
    'funnel.o1': 'Eine echte Resonanz',
    'funnel.o2': 'Einen klareren Kopf',
    'funnel.o3': 'Schwung statt Überforderung',
    'funnel.o4': 'Eine Marke, die auffällt',

    'strip.1': 'Eine Sparringspartnerin',
    'strip.2': 'Gründer-Coaching',
    'strip.3': 'Anpackende Unterstützung',
    'strip.4': 'Hilfe bei Social Media',
    'strip.5': 'Persönliche Marke',
    'strip.6': 'Jemand an Ihrer Seite',

    'needs.eyebrow': 'Wie ich helfe',
    'needs.title': 'Vier Wege, wie ich Ihnen den Rücken freihalte',
    'needs.lede': 'Manche Gründende wollen eine Resonanz. Manche wollen, dass jemand mit anpackt. Die meisten wollen beides. So sieht das aus.',

    'svc1.h': 'Sparring',
    'svc1.tag': 'Am häufigsten gefragt',
    'svc1.p': 'Eine klare, ehrliche Resonanz für die Entscheidungen, die Sie mit Ihrem Team nicht durchsprechen können. Sie denken laut, ich halte dagegen, und Sie gehen mit klarerem Kopf.',
    'svc2.h': 'Coaching',
    'svc2.p': 'Regelmäßige Einzelsitzungen, die Sie als Gründerin oder Gründer weiterbringen: Ihre Prioritäten, Ihre blinden Flecken und die Gewohnheiten, die Sie ruhig halten, wenn es laut wird.',
    'svc3.h': 'Anpackende Unterstützung',
    'svc3.p': 'Nicht nur Rat. Wenn Sie am Limit sind, krempele ich die Ärmel hoch und helfe Ihnen, die Sache zu erledigen, damit sie vom Tisch ist und läuft.',
    'svc5.h': 'Social Media',
    'svc5.p': 'Ihre Präsenz, geregelt: persönliche Marke, ein einfacher Content-Plan und Posten aus einer Hand, wenn Sie lieber bauen als schreiben. Sie zeigen sich, ohne dass es Ihre Woche frisst.',

    'engage.title': 'Wege, zusammenzuarbeiten',
    'engage.t1l': 'Laufendes Sparring',
    'engage.t1d': 'Ein fester Slot in Ihrem Monat. Jemand, der Ihren Kontext kennt und immer an Ihrer Seite steht.',
    'engage.t2l': 'Unterstützung nach Bedarf',
    'engage.t2d': 'Anpackende Hilfe, wenn eine bestimmte Sache erledigt werden muss, ohne lange Bindung.',
    'engage.t3l': 'Hilfe bei Social Media',
    'engage.t3d': 'Vom Content-Plan, den Sie selbst umsetzen, bis dahin, dass ich das Posten für Sie übernehme.',

    'offer.badge': 'Hier starten',
    'offer.title': 'Eine erste Sparring-Sitzung',
    'offer.lede': 'Eine fokussierte Sitzung zu dem, was Sie gerade beschäftigt. Ein entspannter Weg, um zu spüren, wie es ist, mich an Ihrer Seite zu haben.',
    'offer.li1': 'Raum, eine schwierige Sache einmal ganz durchzudenken',
    'offer.li2': 'Ehrlicher Widerspruch und ein frischer Blickwinkel',
    'offer.li3': 'Ein, zwei nächste Schritte, mit denen Sie sich wohlfühlen',
    'offer.m1': 'Format',
    'offer.m1v': '90-Min-Sitzung',
    'offer.m2': 'Für',
    'offer.m2v': 'Gründerinnen und Gründer',
    'offer.cta': 'Sitzung buchen',

    'proof.n1': 'Ein klarerer<br>Kopf',
    'proof.p1': 'Das Durcheinander im Kopf wird zu etwas, mit dem Sie tatsächlich arbeiten können, ein Gespräch nach dem anderen.',
    'proof.n2': 'Weniger<br>allein',
    'proof.p2': 'Ein verlässlicher Mensch, der Ihren Kontext kennt, damit Sie nicht jede große Entscheidung allein tragen.',
    'proof.n3': 'Mehr<br>Schwung',
    'proof.p3': 'Weniger Dinge, die auf Ihrem Tisch liegen bleiben. Die wichtigen bringen wir in Bewegung, statt sie sich stapeln zu lassen.',
    'proof.n4': 'Eine sichtbare<br>Marke',
    'proof.p4': 'Sie zeigen sich dort, wo es zählt, mit einer Präsenz, die nach Ihnen klingt und Ihre Woche nicht auffrisst.',

    'creds.intro': 'Das bekommen Gründende',
    'creds.l1': 'Eine Resonanz, die selbst mittendrin war',
    'creds.l2': 'Ehrlicher Widerspruch, keine Ja-Sager',
    'creds.l3': 'Echte Hilfe, nicht nur Hausaufgaben',

    'whyme.eyebrow': 'Warum mit mir',
    'whyme.title': 'Eine Resonanz, die selbst gebaut hat, nicht nur darüber gelesen.',
    'whyme.lede': 'Ich war selbst mittendrin und weiß, wie sich Gründen an den harten Tagen anfühlt. Ich sage Ihnen, was ich wirklich denke, helfe Ihnen, die Last zu tragen, und bleibe an Ihrer Seite, ob die Woche gut läuft oder auseinanderfällt.',

    'quote.text': '„Gründen war das Einsamste, was ich je gemacht habe. Ella zum lauten Denken zu haben, und jemanden, der wirklich hilft statt nur zu nicken, hat verändert, wie ich jede Woche auftrete.“',
    'quote.name': 'Start-up-Gründerin',
    'quote.role': 'Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie fangen wir an?',
    'faq.a1': 'Mit einem kostenlosen 20-minütigen Gespräch, in dem ich höre, wo Sie stehen und was Sie beschäftigt. Die meisten Gründenden buchen danach eine erste Sparring-Sitzung. Das ist ein entspannter Weg, um zu sehen, ob es passt, bevor Sie sich auf etwas Laufendes festlegen.',
    'faq.q2': 'Arbeiten Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in Deutschland und arbeite mit Gründenden in ganz Europa. Standardmäßig remote, vor Ort, wenn es passt.',
    'faq.q3': 'Was ist der Unterschied zwischen Sparring und Coaching?',
    'faq.a3': 'Sparring ist im Moment: Sie bringen eine aktuelle Entscheidung mit, und wir denken sie zusammen durch. Coaching ist das längere Spiel: regelmäßige Sitzungen, die Sie als Gründerin oder Gründer weiterbringen. Viele kombinieren beides.',
    'faq.q4': 'Was umfasst die Hilfe bei Social Media?',
    'faq.a4': 'So viel, wie Sie brauchen: Ihre persönliche Marke schärfen, einen einfachen Content-Plan, den Sie selbst umsetzen, oder ich übernehme das Posten und die Betreuung für Sie, damit es vom Tisch ist.',
    'faq.q5': 'Wie funktioniert die Preisgestaltung?',
    'faq.a5': 'Wir legen den Umfang vorab einfach fest, ob eine einzelne Sitzung, ein laufender Slot oder Hilfe bei Social Media. Keine Überraschungen und keine Stundenabrechnung.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'Holen wir Ihnen <span class="accent">Rückendeckung.</span>',
    'contact.lede': 'Vielleicht müssen Sie einfach laut denken. Vielleicht brauchen Sie eine Hand, um etwas zu erledigen. So oder so: Geben Sie mir 20 Minuten, und wir finden heraus, was Ihnen wirklich weiterhilft.',
    'contact.cta1': 'Kostenloses 20-Min-Gespräch →',

    'footer.copy': '© 2026 Pruna Secura · München, Deutschland',
    'footer.tag': 'Sparring, Coaching & Unterstützung für Gründerinnen und Gründer'
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
