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
    'nav.about': 'Über mich',
    'nav.faq': 'FAQ',
    'nav.cta': 'Kostenloses Gespräch',

    'hero.eyebrow': 'IT-Architektur, Cybersicherheit und die Teams, die beides betreiben',
    'hero.title': 'Ein CIO an Ihrer <span class="accent">Seite.</span>',
    'hero.lede': 'Wachsende Unternehmen kommen an den Punkt, an dem Technik, Sicherheit und Team jemanden mit Erfahrung im Raum brauchen, aber ein CIO oder CISO in Vollzeit noch zu groß ist. Genau hier komme ich ins Spiel: Ich setze Ihre IT und Architektur auf, bringe Ihre Sicherheit in Ordnung und baue die Teams und Prozesse, die das Ganze tragen. Und ich bleibe dabei, bis es läuft.',
    'hero.for': 'Für Start-ups und mittelständische Unternehmen, die erfahrenes IT- und Sicherheits-Urteil brauchen, aber noch keine Vollzeitstelle.',
    'hero.cta1': 'Kostenloses Kennenlerngespräch',
    'hero.cta2': 'Sehen, was ich mache',

    'funnel.s1tag': 'Wo viele Unternehmen stehen',
    'funnel.s1': 'Technik, die auf Zuruf zusammenhält',
    'funnel.s2tag': 'Was wir zusammen machen',
    'funnel.s2': 'Architektur, Sicherheit, Team, Prozesse',
    'funnel.s3': 'IT, die einfach läuft, und ein Team dafür',
    'funnel.payoff': 'Das nehmen Sie mit:',
    'funnel.o1': 'Infrastruktur, die trägt',
    'funnel.o2': 'Sicherheit, auf die Sie sich verlassen können',
    'funnel.o3': 'Ein Team, das sie betreiben kann',
    'funnel.o4': 'Schnellere, ruhigere Umsetzung',

    'strip.1': 'IT-Infrastruktur',
    'strip.2': 'Architektur',
    'strip.3': 'Cybersicherheit',
    'strip.4': 'Teams & Prozesse',
    'strip.5': 'Cloud',
    'strip.6': 'CIO / CISO auf Zeit',

    'needs.eyebrow': 'Was ich mache',
    'needs.title': 'Vier Dinge, die ich für Sie in Ordnung bringe',
    'needs.lede': 'Die meisten kommen mit einem brennenden Thema zu mir und wollen am Ende bei allen vier Hilfe. Sie hängen zusammen: Eine saubere Architektur macht Sicherheit einfacher, und ein gutes Team hält beides am Laufen, wenn ich längst weg bin.',

    'svc1.h': 'IT-Infrastruktur & Architektur',
    'svc1.tag': 'Am häufigsten gefragt',
    'svc1.p': 'Ich entwerfe das Zielbild für Ihre Systeme, Cloud und Daten und räume dann auf, was schon da ist. Weniger überlappende Werkzeuge, klare Verantwortung und eine Architektur, die mit Ihnen wächst statt gegen Sie zu arbeiten. Cloud-bereit, integriert und so dokumentiert, dass die nächste Person daran anknüpfen kann.',
    'svc2.h': 'Cybersicherheit',
    'svc2.p': 'Sicherheit, die zu Ihrer Größe passt, keine Konzern-Checkliste, die Sie nie fertig bekommen. Ich finde, wo Sie angreifbar sind, schließe die dringenden Lücken zuerst und bringe sinnvolle Kontrollen, Zugriffe und Richtlinien auf den Weg. Wenn Sie Richtung ISO 27001 oder NIS2 gehen, mache ich Sie bereit, ganz ohne Drama.',
    'svc3.h': 'Teams & Prozesse',
    'svc3.p': 'Werkzeuge betreiben sich nicht von selbst. Ich helfe Ihnen, die richtigen Leute einzustellen, den IT-Alltag so aufzusetzen, dass er funktioniert, und coache das Team, damit es ohne mich weiterläuft. Klare Rollen, vernünftige Prozesse und die Gewohnheiten, die aus kleinen Problemen keine Ausfälle werden lassen.',
    'svc5.h': 'CIO/CISO auf Abruf',
    'svc5.p': 'Manchmal brauchen Sie einfach erfahrenes Urteil im Raum: eine Board-Präsentation zum Gegenprüfen, einen Anbietervertrag zum Lesen, eine schwierige Architektur- oder Sicherheitsentscheidung. Ich springe als Ihr CIO oder CISO auf Zeit ein, so viel oder so wenig, wie Sie brauchen.',

    'engage.title': 'Wege, zusammenzuarbeiten',
    'engage.t1l': 'CIO / CISO auf Zeit',
    'engage.t1d': 'Ein paar Tage im Monat, dauerhaft. Ich verantworte Ihre IT- und Sicherheitsrichtung und bleibe nah am Team.',
    'engage.t2l': 'Projekteinsatz',
    'engage.t2d': 'Ein klar umrissenes Stück Arbeit: eine Architektur, ein Sicherheitsreview, eine Migration. Fester Umfang, anpackend bis fertig.',
    'engage.t3l': 'Beratung auf Abruf',
    'engage.t3d': 'Erfahrenes Urteil, wenn Sie es brauchen, für Board-Präsentationen, Anbietergespräche und die großen Entscheidungen.',

    'offer.badge': 'Hier starten',
    'offer.title': 'Ein IT- & Sicherheits-Check',
    'offer.lede': 'Ein fokussierter Blick auf Ihr Setup: wo die echten Risiken liegen, was Sie ausbremst und was zuerst zu beheben ist. Ein entspannter Weg, um zu sehen, wie ich arbeite, bevor Sie sich auf etwas Größeres festlegen.',
    'offer.li1': 'Eine ehrliche Einschätzung Ihrer Architektur und Sicherheit',
    'offer.li2': 'Die drei Dinge, die sich zuerst zu beheben lohnen, und warum',
    'offer.li3': 'Eine kurze schriftliche Zusammenfassung zum Handeln oder Weitergeben',
    'offer.m1': 'Format',
    'offer.m1v': 'Halbtags-Review',
    'offer.m2': 'Für',
    'offer.m2v': 'Start-ups & Mittelstand',
    'offer.cta': 'Review buchen',

    'about.tag': 'Enterprise-Architektin × anpackend × anbieterunabhängig',
    'about.eyebrow': 'Über mich',
    'about.title': 'Ich habe das im Konzernmaßstab gemacht. Jetzt mache ich es für Unternehmen Ihrer Größe.',
    'about.lede': 'Neun Jahre lang habe ich IT-, Daten- und KI-Plattformen in über zehn Ländern im komplexen Industriedienstleistungsumfeld gebaut und skaliert, als Enterprise-Architektin und als anpackende Leiterin. Ich weiß, wie gut im großen Maßstab aussieht, und was kaputtgeht. Dieses Urteil bringe ich zu Unternehmen, die sich noch keinen CIO oder CISO in Vollzeit leisten wollen.',
    'about.bio': 'Gründerin von Pruna Secura. Als Enterprise-Architektin habe ich einen Wildwuchs von über 2.500 Werkzeugen auf eine Handvoll strategischer Plattformen zusammengeführt und die Standards dafür gesetzt, wie neue Systeme gebaut, gesichert und betrieben werden. Ich habe crossfunktionale Teams geführt, das Reporting aufgebaut, das den Betrieb ehrlich hält, und Menschen so gecoacht, dass sie es nach mir weitertragen können. ArchiMate- und IPMA-zertifiziert, mit einem Hintergrund in angewandter Mathematik und Software Engineering. Anbieterunabhängig: Ich empfehle, was zu Ihnen passt, nicht, was mich bezahlt.',
    'about.s1': 'Jahre Aufbau & Skalierung von IT-Plattformen',
    'about.s2': 'Länder, in denen geliefert wurde',
    'about.s3': 'Werkzeuge zu Plattformen zusammengeführt',

    'proof.n1': 'Weniger<br>Störungen',
    'proof.p1': 'Das Monitoring, die Standards und die Gewohnheiten, die aus kleinen Problemen keine Ausfälle werden lassen, damit das Team nachts ruhig schläft.',
    'proof.n2': 'Niedrigere<br>Betriebskosten',
    'proof.p2': 'Überflüssige Werkzeuge und Lizenzen fallen weg, weil alles in einer saubereren Architektur zusammenläuft, mit echten, sichtbaren Einsparungen.',
    'proof.n3': 'Echte<br>Sicherheit',
    'proof.p3': 'Zuerst die Lücken schließen, die wirklich zählen, mit Kontrollen und Richtlinien in der Größe Ihres Unternehmens, nicht eines Konzerns, der Sie nicht sind.',
    'proof.n4': 'Ein Team, das es<br>betreiben kann',
    'proof.p4': 'Klare Rollen, vernünftige Prozesse und Coaching, damit Ihre Leute alles am Laufen halten, lange nachdem der Einsatz vorbei ist.',

    'creds.intro': 'Das bekommen Sie',
    'creds.l1': 'Erfahrenes IT- & Sicherheits-Urteil, in Teilzeit',
    'creds.l2': 'Anpackende Umsetzung, nicht nur Foliensätze',
    'creds.l3': 'Anbieterunabhängige Beratung',

    'whyme.eyebrow': 'Warum mit mir',
    'whyme.title': 'Erfahren genug, um das ganze Feld zu sehen, anpackend genug, um es zu richten.',
    'whyme.lede': 'Die meisten, die Sie dafür engagieren können, sind entweder Strategen, die die Tastatur nicht anfassen, oder Umsetzer, denen jemand sagen muss, was zu bauen ist. Ich mache beides. Ich setze die Richtung und lege dann selbst Hand an, und ich sage Ihnen ehrlich, was wirklich zählt und was nur Lärm ist.',

    'quote.text': '„Uns war klar, dass unsere IT ein Durcheinander war, aber einen CIO in Vollzeit konnten wir uns nicht leisten. Ella kam, brachte die Architektur und unsere Sicherheit in Ordnung und hinterließ uns ein Team, das das Ganze wirklich betreiben kann. Kein Fachjargon, kein Drama.“',
    'quote.name': 'Geschäftsführer',
    'quote.role': 'Mittelständisches Unternehmen · Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie fangen wir an?',
    'faq.a1': 'Mit einem kostenlosen Kennenlerngespräch, um Ihr Setup und Ihre Schmerzpunkte zu verstehen. Danach starten die meisten mit einem halbtägigen IT- und Sicherheits-Check, der Ihnen ein klares Bild und einen Plan gibt, bevor Sie sich auf etwas Größeres festlegen.',
    'faq.q2': 'Arbeiten Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in Deutschland und arbeite mit Unternehmen in ganz Europa. Standardmäßig remote, vor Ort, wenn ein Projekt es braucht.',
    'faq.q3': 'Sind Sie technisch oder eher Strategin?',
    'faq.a3': 'Beides. Ich kann die Architektur- und Sicherheitsstrategie für Ihr Board setzen, und ich kann mit Ihren Entwicklern ins Detail gehen. Ich übergebe Ihnen keinen Foliensatz und verschwinde dann.',
    'faq.q4': 'Wir sind klein. Brauchen wir das überhaupt?',
    'faq.a4': 'Wenn Ihre Technik, Ihre Daten oder Ihre Sicherheit Sie langsam ausbremsen oder nachts wachhalten, dann ja. Der Sinn eines CIO/CISO auf Zeit ist, dass Sie erfahrenes Urteil in der Größe bekommen, die zu Ihnen passt, ohne die Kosten einer Vollzeitstelle.',
    'faq.q5': 'Wie funktioniert die Preisgestaltung?',
    'faq.a5': 'Wir legen den Umfang vorab einfach fest, ob ein einmaliges Review, ein Projekt mit festem Umfang oder ein paar Tage im Monat dauerhaft. Keine Überraschungen und keine vage Stundenabrechnung.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'Bringen wir Ihre Technik <span class="accent">in Ordnung.</span>',
    'contact.lede': 'Vielleicht bremst Sie Ihre Architektur aus. Vielleicht hält Sie die Sicherheit nachts wach. Vielleicht brauchen Sie einfach jemand Erfahrenen zum Durchdenken. Rufen Sie an, und wir finden heraus, was Ihnen wirklich weiterhilft.',
    'contact.cta1': 'Kostenloses Kennenlerngespräch →',

    'footer.copy': '© 2026 Pruna Secura · München, Deutschland',
    'footer.tag': 'IT-Architektur, Cybersicherheit & Teams für Start-ups und den Mittelstand'
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
