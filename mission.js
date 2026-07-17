// ===========================================================================
// mission.js — GSAP ScrollTrigger "mission journey" for the homepage.
//
// Turns the homepage sections into mission stages and adds premium, restrained
// section snapping plus a scrub-driven mission-progress rail. It layers on top
// of the existing scroll-flight canvas (which already reads native scroll) — it
// does NOT hijack the wheel, keyboard, anchor links, or native scrolling.
//
// Design rules honoured:
//   - Snap only AFTER the user stops scrolling (ScrollTrigger.snap behaviour),
//     low delay, moderate duration, power2.inOut, direction-aware.
//   - Desktop gets full snapping; coarse-pointer / small screens get a much
//     softer snap; prefers-reduced-motion disables snapping entirely.
//   - Never preventDefault on wheel/keys; PageDown/Home/End/space/arrows and
//     anchor links all keep working (we only set ScrollTrigger snap config).
//   - Scrub drives only transforms/opacity of the rail — no layout properties,
//     no CLS.
//   - Graceful fallback: if GSAP/ScrollTrigger did not load, everything still
//     works with native scrolling; only the enhancement is skipped.
//   - Not active on legal pages (this file is only included on index.html).
// ===========================================================================
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  // Mission stages mapped to real sections (id -> short stage label keys).
  var STAGES = [
    { id: 'hero',       key: 'mission.stage.launch' },
    { id: 'work',       key: 'mission.stage.transit' },
    { id: 'process',    key: 'mission.stage.route' },
    { id: 'about',      key: 'mission.stage.signal' },
    { id: 'principles', key: 'mission.stage.systems' },
    { id: 'faq',        key: 'mission.stage.checks' },
    { id: 'contact',    key: 'mission.stage.arrival' }
  ];

  // Fallback English labels (script.js i18n also provides these keys; we read
  // the DOM lang to pick language for the rail).
  var LABELS = {
    en: { launch:'Launch', transit:'Transit', route:'Route', signal:'Signal',
          systems:'Systems', checks:'Checks', arrival:'Arrival' },
    de: { launch:'Start', transit:'Transit', route:'Kurs', signal:'Signal',
          systems:'Systeme', checks:'Checks', arrival:'Ankunft' }
  };

  var railEl, railFill, railStages = [];
  var st = null;              // snap ScrollTrigger instance
  var scrubTrigger = null;    // scrub ScrollTrigger instance (rail)
  var lenis = null;          // Lenis smooth-scroll instance (optional)
  var anchorsBound = false;
  var built = false;

  // Lenis is only worthwhile with a fine pointer and when motion is allowed.
  // On touch/mobile it can fight native momentum and hurt usability, so we skip
  // it there and let the browser scroll natively.
  var useLenis = !reduceMotion && !coarse;

  // Build the fixed mission-progress rail (right edge, non-interactive).
  function buildRail() {
    if (document.getElementById('mission-rail')) { railEl = document.getElementById('mission-rail'); return; }
    railEl = document.createElement('div');
    railEl.id = 'mission-rail';
    railEl.setAttribute('aria-hidden', 'true'); // decorative; content is in the page
    var track = document.createElement('div'); track.className = 'mission-rail__track';
    railFill = document.createElement('div'); railFill.className = 'mission-rail__fill';
    track.appendChild(railFill);
    railEl.appendChild(track);

    var lang = document.documentElement.getAttribute('lang') === 'de' ? 'de' : 'en';
    for (var i = 0; i < STAGES.length; i++) {
      var s = document.createElement('div');
      s.className = 'mission-rail__stage';
      var dot = document.createElement('span'); dot.className = 'mission-rail__dot';
      var lab = document.createElement('span'); lab.className = 'mission-rail__label';
      var short = STAGES[i].key.split('.').pop();
      lab.textContent = (LABELS[lang][short] || short);
      s.appendChild(dot); s.appendChild(lab);
      railEl.appendChild(s);
      railStages.push(s);
    }
    document.body.appendChild(railEl);
  }

  function setActiveStage(idx) {
    for (var i = 0; i < railStages.length; i++) {
      railStages[i].classList.toggle('is-active', i === idx);
      railStages[i].classList.toggle('is-past', i < idx);
    }
  }

  function relabelRail() {
    if (!railStages.length) return;
    var lang = document.documentElement.getAttribute('lang') === 'de' ? 'de' : 'en';
    for (var i = 0; i < railStages.length; i++) {
      var short = STAGES[i].key.split('.').pop();
      var lab = railStages[i].querySelector('.mission-rail__label');
      if (lab) lab.textContent = (LABELS[lang][short] || short);
    }
  }

  var stageProgress = []; // progress value (0..1) of each stage's scroll position

  // Snap config tuned to feel premium, not like scroll-jacking. Snaps to the
  // array of stage progress values; ScrollTrigger only fires this AFTER the
  // user stops scrolling (that's its native behaviour), with our low delay.
  function snapConfig() {
    return {
      snapTo: stageProgress.slice(),
      duration: { min: 0.25, max: 0.6 }, // moderate, never a long lurch
      delay: 0.06,                       // fire shortly after scrolling settles
      ease: 'power2.inOut',
      directional: true,                 // respect scroll direction
      inertia: false
    };
  }

  function computeStageProgress() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    // Guard: if the page can't scroll yet (e.g. intro scroll-lock makes the
    // document height collapse), keep the previous values instead of collapsing
    // every stage to 0/1. A real homepage is far taller than the viewport.
    if (docH < window.innerHeight) {
      if (stageProgress.length === STAGES.length) return; // keep good values
    }
    docH = Math.max(1, docH);
    var next = [];
    for (var i = 0; i < STAGES.length; i++) {
      var el = document.getElementById(STAGES[i].id);
      if (!el) { next.push(i / (STAGES.length - 1)); continue; }
      var top = el.getBoundingClientRect().top + (window.pageYOffset || 0);
      next.push(Math.min(1, Math.max(0, top / docH)));
    }
    stageProgress = next;
  }

  // Set up Lenis smooth scrolling and bind it to GSAP/ScrollTrigger the way the
  // Lenis + GSAP docs recommend: Lenis 'scroll' -> ScrollTrigger.update, and the
  // GSAP ticker drives lenis.raf (with lag smoothing off so scrub stays synced).
  function setupLenis(gsap, ScrollTrigger) {
    if (!useLenis || !window.Lenis || lenis) return;
    try {
      lenis = new window.Lenis({
        duration: 1.05,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        // Never smooth touch scrolling — keep native momentum on mobile.
        smoothTouch: false,
        touchMultiplier: 1
      });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  function build() {
    if (built) return;
    var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
    if (!gsap || !ScrollTrigger) return; // fallback: native scroll only
    gsap.registerPlugin(ScrollTrigger);
    built = true;

    setupLenis(gsap, ScrollTrigger);

    buildRail();
    computeStageProgress();

    // Rail fill starts collapsed; driven by transform only (no layout, no CLS).
    gsap.set(railFill, { transformOrigin: 'top center', scaleY: 0 });

    // (1) Scrub trigger — drives the rail fill + active stage. No snap here, so
    //     the rail tracks scroll smoothly without interfering with snapping.
    scrubTrigger = ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: function (self) {
        var p = self.progress;
        if (railFill) railFill.style.transform = 'scaleY(' + p.toFixed(4) + ')';
        var idx = 0;
        for (var i = 0; i < stageProgress.length; i++) {
          if (p + 0.02 >= stageProgress[i]) idx = i;
        }
        setActiveStage(idx);
        window.__missionProgress = p;
        window.__missionStage = idx;
      }
    });

    // (2) Snap trigger — dedicated instance covering the whole page. Snap fires
    //     only after the user stops scrolling. Desktop / fine-pointer only:
    //     snapping is disabled for reduced motion and for touch/coarse pointers,
    //     where it fights native momentum and hurts usability.
    if (!reduceMotion && !coarse) {
      st = ScrollTrigger.create({
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        snap: snapConfig()
      });
    }

    // Keep in-page anchor links working smoothly when Lenis is active. Native
    // anchor jumps still work without Lenis; this just makes them glide and
    // ensures ScrollTrigger stays in sync. We never block the default for keys.
    if (lenis && !anchorsBound) {
      anchorsBound = true;
      document.addEventListener('click', function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (!a) return;
        var href = a.getAttribute('href');
        if (!href || href === '#' || href.length < 2) return;
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: 0, duration: 1.0 });
        // update the URL hash without an extra native jump
        if (history && history.pushState) history.pushState(null, '', href);
      });
    }

    // Show the rail now that ScrollTrigger is active.
    railEl.classList.add('is-ready');

    // Recompute stage positions + refresh snap array on every refresh.
    ScrollTrigger.addEventListener('refreshInit', function () {
      computeStageProgress();
      if (st) st.vars.snap = snapConfig();
    });
    ScrollTrigger.refresh();
  }

  function destroy() {
    if (st) { st.kill(); st = null; }
    if (scrubTrigger) { scrubTrigger.kill(); scrubTrigger = null; }
    if (window.ScrollTrigger) {
      try { window.ScrollTrigger.getAll().forEach(function (t) { t.kill(); }); } catch (e) {}
    }
    if (lenis) { try { lenis.destroy(); } catch (e) {} lenis = null; }
    built = false;
    if (railEl) railEl.classList.remove('is-ready');
  }

  // Wait for GSAP (CDN is async; may resolve before or after this defer script).
  function waitForGsap(cb, tries) {
    tries = tries || 0;
    if (window.gsap && window.ScrollTrigger) { cb(true); return; }
    if (window.__gsapReady === false && tries > 60) { cb(false); return; } // ~3s
    if (tries > 120) { cb(false); return; } // hard cap ~6s
    setTimeout(function () { waitForGsap(cb, tries + 1); }, 50);
  }

  // The intro locks scroll while it plays. Wait until the page is actually
  // scrollable before computing snap positions, otherwise every stage collapses
  // to the same progress value. Poll briefly, then build + refresh.
  function whenScrollable(cb, tries) {
    tries = tries || 0;
    var scrollable = (document.documentElement.scrollHeight - window.innerHeight) > window.innerHeight;
    var unlocked = !document.documentElement.classList.contains('intro-lock');
    if ((scrollable && unlocked) || tries > 160) { cb(); return; } // ~8s cap
    setTimeout(function () { whenScrollable(cb, tries + 1); }, 50);
  }

  function start() {
    waitForGsap(function (ok) {
      if (!ok) { /* graceful fallback: native scroll, no rail */ return; }
      whenScrollable(function () {
        build();
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        // Refresh again after fonts settle (layout can shift snap positions).
        if (document.fonts && document.fonts.ready) {
          document.fonts.ready.then(function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
        }
        window.addEventListener('load', function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); });
      });
    });
  }

  // Rebuild snap positions on breakpoint changes; relabel on language changes.
  var lastCoarse = coarse;
  window.addEventListener('resize', function () {
    if (window.ScrollTrigger && built) window.ScrollTrigger.refresh();
  });
  new MutationObserver(function () { relabelRail(); }).observe(
    document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Do not start until after the intro so snapping never fights the locked
  // intro scroll. If the intro is present it unlocks scroll when done; we simply
  // start once the DOM is interactive — ScrollTrigger respects body overflow.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else { start(); }

  // Expose for potential parent debugging / theme rebuilds.
  window.PrunaMission = { rebuild: function () { destroy(); build(); }, destroy: destroy };
})();
