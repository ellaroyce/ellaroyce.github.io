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
//   - Desktop gets full snapping; coarse-pointer / small screens get no snap;
//     prefers-reduced-motion disables snapping entirely.
//   - Never preventDefault on wheel/keys; PageDown/Home/End/space/arrows and
//     anchor links all keep working (we only set ScrollTrigger snap config).
//   - Scrub drives only transforms/opacity of the rail — no layout properties,
//     no CLS.
//   - Graceful fallback: if GSAP/ScrollTrigger did not load, everything still
//     works with native scrolling; only the enhancement is skipped.
//
// React port: GSAP, ScrollTrigger and Lenis are bundled (code-split) instead of
// loaded from CDNs, and are passed in. The rail markup is rendered by
// <MissionRail/>; this engine only drives the fill transform and reports the
// active stage through `onStage`. Returns { refresh, destroy }.
// ===========================================================================

// Mission stages mapped to real sections, in page order.
export const MISSION_STAGES = ['hero', 'work', 'process', 'about', 'principles', 'faq', 'contact'];

export function mountMission(opts) {
  var gsap = opts.gsap, ScrollTrigger = opts.ScrollTrigger, Lenis = opts.Lenis;
  var railFill = opts.fillEl, onStage = opts.onStage, onReady = opts.onReady;
  if (!gsap || !ScrollTrigger) return null; // fallback: native scroll only

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  var st = null;              // snap ScrollTrigger instance
  var scrubTrigger = null;    // scrub ScrollTrigger instance (rail)
  var lenis = null;           // Lenis smooth-scroll instance (optional)
  var lenisTick = null;
  var built = false, destroyed = false;
  var lastStage = -1;
  var pollTimer = 0;

  // Lenis is only worthwhile with a fine pointer and when motion is allowed.
  // On touch/mobile it can fight native momentum and hurt usability, so we skip
  // it there and let the browser scroll natively.
  var useLenis = !reduceMotion && !coarse;

  var stageProgress = []; // progress value (0..1) of each stage's scroll position
  var lastRefreshAt = 0;  // time of the last ScrollTrigger refresh

  // Snap config tuned to feel premium, not like scroll-jacking. Snaps to the
  // array of stage progress values; ScrollTrigger only fires this AFTER the
  // user stops scrolling (that's its native behaviour), with our low delay.
  // Directional snap against the *current* stage positions. ScrollTrigger reads
  // a snap array only once, when the trigger is created, so an array would go
  // stale as soon as the layout changes (language switch, fonts, resize) and
  // the page would then settle beside a section instead of on it. A function
  // is called on every snap and always sees fresh values.
  function snapToStage(value, self) {
    var pts = stageProgress.slice().sort(function (a, b) { return a - b; });
    if (!pts.length) return value;
    // Like ScrollTrigger's built-in directional snap: right after a refresh
    // the direction is meaningless, so settle on the nearest stage instead.
    var dir = Date.now() - lastRefreshAt < 500 ? 0 : (self && self.direction) || 0;
    var eps = 0.001;
    var i;
    if (dir > 0) {
      for (i = 0; i < pts.length; i++) if (pts[i] >= value - eps) return pts[i];
      return pts[pts.length - 1];
    }
    if (dir < 0) {
      for (i = pts.length - 1; i >= 0; i--) if (pts[i] <= value + eps) return pts[i];
      return pts[0];
    }
    var best = pts[0];
    for (i = 1; i < pts.length; i++) {
      if (Math.abs(pts[i] - value) < Math.abs(best - value)) best = pts[i];
    }
    return best;
  }

  function snapConfig() {
    return {
      snapTo: snapToStage,
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
      if (stageProgress.length === MISSION_STAGES.length) return; // keep good values
    }
    docH = Math.max(1, docH);
    var next = [];
    for (var i = 0; i < MISSION_STAGES.length; i++) {
      var el = document.getElementById(MISSION_STAGES[i]);
      if (!el) { next.push(i / (MISSION_STAGES.length - 1)); continue; }
      var top = el.getBoundingClientRect().top + (window.pageYOffset || 0);
      next.push(Math.min(1, Math.max(0, top / docH)));
    }
    stageProgress = next;
  }

  // Set up Lenis smooth scrolling and bind it to GSAP/ScrollTrigger the way the
  // Lenis + GSAP docs recommend: Lenis 'scroll' -> ScrollTrigger.update, and the
  // GSAP ticker drives lenis.raf (with lag smoothing off so scrub stays synced).
  function setupLenis() {
    if (!useLenis || !Lenis || lenis) return;
    try {
      lenis = new Lenis({
        duration: 1.05,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        // Never smooth touch scrolling — keep native momentum on mobile.
        smoothTouch: false,
        touchMultiplier: 1
      });
      lenis.on('scroll', ScrollTrigger.update);
      lenisTick = function (time) { if (lenis) lenis.raf(time * 1000); };
      gsap.ticker.add(lenisTick);
      gsap.ticker.lagSmoothing(0);
    } catch (e) { lenis = null; }
  }

  // Keep in-page anchor links working smoothly when Lenis is active. Native
  // anchor jumps still work without Lenis; this just makes them glide and
  // ensures ScrollTrigger stays in sync. We never block the default for keys.
  function onAnchorClick(e) {
    if (!lenis) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    // Leave the skip link to the browser: a native jump also moves keyboard
    // focus to the target, which a scripted scroll would not.
    if (a.classList.contains('skip-link')) return;
    var href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    var target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0, duration: 1.0 });
    // Update the URL hash without an extra native jump. Guarded: sandboxed
    // (opaque-origin) embeds reject History API calls.
    try { if (history && history.pushState) history.pushState(null, '', href); } catch (err) {}
  }

  function onRefreshInit() {
    computeStageProgress();
    lastRefreshAt = Date.now();
  }

  function build() {
    if (built || destroyed) return;
    gsap.registerPlugin(ScrollTrigger);
    built = true;

    setupLenis();
    computeStageProgress();

    // Rail fill starts collapsed; driven by transform only (no layout, no CLS).
    if (railFill) gsap.set(railFill, { transformOrigin: 'top center', scaleY: 0 });

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
        if (idx !== lastStage) { lastStage = idx; if (onStage) onStage(idx); }
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

    document.addEventListener('click', onAnchorClick);

    // Show the rail now that ScrollTrigger is active.
    if (onReady) onReady(true);

    // Recompute stage positions on every refresh.
    ScrollTrigger.addEventListener('refreshInit', onRefreshInit);
    ScrollTrigger.refresh();
  }

  function refresh() {
    if (built && !destroyed) ScrollTrigger.refresh();
  }

  function destroy() {
    destroyed = true;
    clearTimeout(pollTimer);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('load', refresh);
    document.removeEventListener('click', onAnchorClick);
    try { ScrollTrigger.removeEventListener('refreshInit', onRefreshInit); } catch (e) {}
    if (st) { st.kill(); st = null; }
    if (scrubTrigger) { scrubTrigger.kill(); scrubTrigger = null; }
    if (lenisTick) { gsap.ticker.remove(lenisTick); lenisTick = null; }
    if (lenis) { try { lenis.destroy(); } catch (e) {} lenis = null; }
    built = false;
    if (onReady) onReady(false);
  }

  // The intro locks scroll while it plays. Wait until the page is actually
  // scrollable before computing snap positions, otherwise every stage collapses
  // to the same progress value. Poll briefly, then build + refresh.
  function whenScrollable(cb, tries) {
    if (destroyed) return;
    tries = tries || 0;
    var scrollable = (document.documentElement.scrollHeight - window.innerHeight) > window.innerHeight;
    var unlocked = !document.documentElement.classList.contains('intro-lock');
    if ((scrollable && unlocked) || tries > 160) { cb(); return; } // ~8s cap
    pollTimer = setTimeout(function () { whenScrollable(cb, tries + 1); }, 50);
  }

  whenScrollable(function () {
    build();
    refresh();
    // Refresh again after fonts settle (layout can shift snap positions).
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh);
  });

  // Rebuild snap positions on breakpoint changes.
  window.addEventListener('resize', refresh);

  return { refresh: refresh, destroy: destroy };
}
