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
    'hero.lede': 'Erfahrene IT- und Sicherheitsführung, ohne Vollzeitstelle. Ich setze Ihre Architektur auf, bringe die Sicherheit in Ordnung, baue das Team dafür und bleibe dabei, bis es läuft.',
    'hero.for': 'Für Start-ups und den Mittelstand. Eine Person, die die Richtung setzt und die Arbeit macht.',
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
    'needs.lede': 'Die meisten kommen mit einem brennenden Thema und wollen am Ende alle vier. Sie hängen zusammen.',

    'svc1.h': 'IT-Infrastruktur & Architektur',
    'svc1.tag': 'Am häufigsten gefragt',
    'svc1.p': 'Ein klares Zielbild für Ihre Systeme, Cloud und Daten, dann ein Aufräumen des Bestands. Weniger Werkzeuge, klare Verantwortung, eine Architektur, die mit Ihnen wächst statt gegen Sie zu arbeiten.',
    'svc2.h': 'Cybersicherheit',
    'svc2.p': 'Sicherheit in der Größe Ihres Unternehmens, keine Konzern-Checkliste. Ich finde, wo Sie angreifbar sind, schließe die dringenden Lücken zuerst und mache Sie fit für ISO 27001 oder NIS2, ganz ohne Drama.',
    'svc3.h': 'Teams & Prozesse',
    'svc3.p': 'Werkzeuge betreiben sich nicht von selbst. Ich helfe Ihnen, die richtigen Leute einzustellen, den IT-Alltag aufzusetzen und das Team zu coachen, damit es ohne mich läuft. Klare Rollen, vernünftige Prozesse.',
    'svc5.h': 'CIO/CISO auf Abruf',
    'svc5.p': 'Erfahrenes Urteil, wenn Sie es brauchen: eine Board-Präsentation zum Gegenprüfen, einen Anbietervertrag zum Lesen, eine schwierige Entscheidung. So viel oder so wenig, wie Sie brauchen.',

    'engage.title': 'Wege, zusammenzuarbeiten',
    'engage.t1l': 'CIO / CISO auf Zeit',
    'engage.t1d': 'Ein paar Tage im Monat. Ich verantworte Ihre IT- und Sicherheitsrichtung und bleibe nah am Team.',
    'engage.t2l': 'Projekteinsatz',
    'engage.t2d': 'Ein klar umrissenes Stück Arbeit: eine Architektur, ein Sicherheitsreview, eine Migration. Fester Umfang, fertig.',
    'engage.t3l': 'Beratung auf Abruf',
    'engage.t3d': 'Auf Abruf für Board-Präsentationen, Anbietergespräche und die großen Entscheidungen.',

    'offer.badge': 'Hier starten',
    'offer.title': 'Ein IT- & Sicherheits-Check',
    'offer.lede': 'Ein fokussierter Blick auf Ihr Setup: wo die echten Risiken liegen und was zuerst zu beheben ist. Ein entspannter Weg, um zu sehen, wie ich arbeite.',
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
    'about.lede': 'Neun Jahre Aufbau und Skalierung von IT-, Daten- und KI-Plattformen in über zehn Ländern, als Enterprise-Architektin und anpackende Leiterin. Ich weiß, wie gut im großen Maßstab aussieht, und was kaputtgeht.',
    'about.bio': 'Gründerin von Pruna Secura. Ich habe über 2.500 Werkzeuge auf eine Handvoll strategischer Plattformen zusammengeführt, die Standards für Bau und Sicherheit gesetzt, crossfunktionale Teams geführt und Menschen gecoacht, damit sie es nach mir weitertragen. ArchiMate- und IPMA-zertifiziert. Anbieterunabhängig: Ich empfehle, was zu Ihnen passt, nicht, was mich bezahlt.',
    'about.s1': 'Jahre Aufbau & Skalierung von IT-Plattformen',
    'about.s2': 'Länder, in denen geliefert wurde',
    'about.s3': 'Werkzeuge zu Plattformen zusammengeführt',

    'proof.n1': 'Weniger<br>Störungen',
    'proof.p1': 'Monitoring, Standards und Gewohnheiten, die aus kleinen Problemen keine Ausfälle werden lassen.',
    'proof.n2': 'Niedrigere<br>Betriebskosten',
    'proof.p2': 'Überflüssige Werkzeuge und Lizenzen fallen weg, zusammengeführt in einer saubereren Architektur.',
    'proof.n3': 'Echte<br>Sicherheit',
    'proof.p3': 'Zuerst die Lücken, die wirklich zählen, mit Kontrollen in der Größe Ihres Unternehmens.',
    'proof.n4': 'Ein Team, das es<br>betreiben kann',
    'proof.p4': 'Klare Rollen und Prozesse, damit Ihre Leute es am Laufen halten, wenn ich weg bin.',

    'creds.intro': 'Das bekommen Sie',
    'creds.l1': 'Erfahrenes IT- & Sicherheits-Urteil, in Teilzeit',
    'creds.l2': 'Anpackende Umsetzung, nicht nur Foliensätze',
    'creds.l3': 'Anbieterunabhängige Beratung',

    'certs.intro': 'Zertifiziert & qualifiziert',
    'certs.c1': 'Enterprise-Architektur',
    'certs.c2': 'Projektmanagement',
    'certs.c3': 'Moderne Entwicklung',
    'certs.c4n': 'Doktorandin',
    'certs.c4': 'Angewandte Mathematik',

    'whyme.eyebrow': 'Warum mit mir',
    'whyme.title': 'Erfahren genug, um das ganze Feld zu sehen, anpackend genug, um es zu richten.',
    'whyme.lede': 'Die meisten, die Sie engagieren können, sind entweder Strategen, die die Tastatur nicht anfassen, oder Umsetzer, denen man sagen muss, was zu bauen ist. Ich mache beides und sage Ihnen ehrlich, was wirklich zählt.',

    'quote.text': '„Uns war klar, dass unsere IT ein Durcheinander war, aber einen CIO in Vollzeit konnten wir uns nicht leisten. Ella kam, brachte die Architektur und unsere Sicherheit in Ordnung und hinterließ uns ein Team, das das Ganze wirklich betreiben kann. Kein Fachjargon, kein Drama.“',
    'quote.name': 'Geschäftsführer',
    'quote.role': 'Mittelständisches Unternehmen · Referenz auf Anfrage',

    'faq.eyebrow': 'Bevor Sie schreiben',
    'faq.title': 'Häufige Fragen',
    'faq.q1': 'Wie fangen wir an?',
    'faq.a1': 'Ein kostenloses Kennenlerngespräch, dann meist ein halbtägiger IT- und Sicherheits-Check. Sie bekommen ein klares Bild und einen Plan, bevor Sie sich auf mehr festlegen.',
    'faq.q2': 'Arbeiten Sie remote und EU-weit?',
    'faq.a2': 'Ja. Ich sitze in Deutschland und arbeite mit Unternehmen in ganz Europa. Standardmäßig remote, vor Ort, wenn ein Projekt es braucht.',
    'faq.q3': 'Sind Sie technisch oder eher Strategin?',
    'faq.a3': 'Beides. Ich setze die Strategie für Ihr Board und gehe mit Ihren Entwicklern ins Detail. Ich übergebe keinen Foliensatz und verschwinde dann.',
    'faq.q4': 'Wir sind klein. Brauchen wir das überhaupt?',
    'faq.a4': 'Wenn Ihre Technik oder Sicherheit Sie ausbremst oder nachts wachhält, dann ja. Sie bekommen erfahrenes Urteil in der Größe, die zu Ihnen passt, ohne Vollzeitstelle.',
    'faq.q5': 'Wie funktioniert die Preisgestaltung?',
    'faq.a5': 'Ein einfacher Umfang, vorab festgelegt: ein einmaliges Review, ein Projekt mit festem Umfang oder ein paar Tage im Monat. Keine Überraschungen, keine vage Stundenabrechnung.',

    'contact.eyebrow': 'Sprechen wir',
    'contact.title': 'Bringen wir Ihre Technik <span class="accent">in Ordnung.</span>',
    'contact.lede': 'Architektur, die Sie ausbremst, Sicherheit, die Sie nachts wachhält, oder einfach jemand Erfahrenes zum Durchdenken? Rufen Sie an.',
    'contact.cta1': 'Kostenloses Kennenlerngespräch →',
    'contact.cta2': 'Schreiben Sie mir',
    'trust.nda': 'Alles, worüber wir sprechen, bleibt vertraulich. NDA auf Wunsch.',
    'trust.eu': 'Ansässig in Deutschland. Ihre Daten bleiben in der EU.',

    'footer.copy': '© 2026 Pruna Secura · München, Deutschland',
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
    'ds.intro.p': 'Der Schutz Ihrer persönlichen Daten ist mir wichtig. Ich verarbeite Ihre Daten ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TDDDG). Diese Erklärung informiert Sie über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten auf dieser Website.',
    'ds.ctrl.h': '2. Verantwortliche Stelle',
    'ds.ctrl.p': 'Verantwortlich für die Datenverarbeitung auf dieser Website ist:',
    'ds.host.h': '3. Hosting',
    'ds.host.p': 'Diese Website wird bei GitHub Pages gehostet, einem Dienst der GitHub, Inc. (88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). GitHub kann beim Aufruf der Seite technische Zugriffsdaten (z. B. IP-Adresse, Datum und Uhrzeit) in Server-Logfiles erfassen. Rechtsgrundlage ist das berechtigte Interesse an einer sicheren und zuverlässigen Bereitstellung der Website (Art. 6 Abs. 1 lit. f DSGVO). Für die Übermittlung in die USA stützt sich GitHub auf Standardvertragsklauseln. Weitere Informationen finden Sie in der Datenschutzerklärung von GitHub.',
    'ds.contactdata.h': '4. Kontaktaufnahme',
    'ds.contactdata.p': 'Wenn Sie mich per E-Mail oder Telefon kontaktieren, werden Ihre Angaben zur Bearbeitung der Anfrage und für den Fall von Anschlussfragen gespeichert. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Anbahnung eines Vertrags) bzw. lit. f (berechtigtes Interesse an der Beantwortung). Ich gebe diese Daten nicht ohne Ihre Einwilligung weiter und lösche sie, sobald sie für den Zweck nicht mehr erforderlich sind.',
    'ds.storage.h': '5. Lokale Speicherung im Browser',
    'ds.storage.p': 'Diese Website setzt keine Tracking-Cookies ein. Zur Speicherung Ihrer bevorzugten Sprache und des Farbschemas wird der lokale Speicher Ihres Browsers (localStorage) verwendet. Diese Daten verbleiben auf Ihrem Gerät, werden nicht an mich übertragen und können jederzeit über die Einstellungen Ihres Browsers gelöscht werden.',
    'ds.rights.h': '6. Ihre Rechte',
    'ds.rights.p': 'Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten. Zudem steht Ihnen ein Beschwerderecht bei einer Aufsichtsbehörde zu. Wenden Sie sich dazu an die oben genannten Kontaktdaten.',
    'ds.updated': 'Stand: Juli 2026'
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
