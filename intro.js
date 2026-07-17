// ===========================================================================
// intro.js — "Launch" cinematic opening sequence
//
// An abstract shuttle glyph ignites out of darkness, crosses a few layered
// universes harvesting scattered signals into its trail, finds a small founder
// planet trapped in a storm of noisy paths, then breaks through and lands with
// a protective cobalt/mint shockwave. The chaos snaps into a stable system and
// the landing core hands off to the Living Systems hero core beneath.
//
// Not a literal superhero: the "rescue" reads as confident velocity, protective
// arrival, and a landing shockwave. Vanilla Canvas 2D, DPR-capped, self-cleaning.
//
// Public API (window.PrunaIntro):
//   .play({ force })  -> run the sequence (force ignores the session flag)
//   .hasPlayed()      -> boolean, session flag
// The module auto-plays once per session on load unless reduced-motion.
// ===========================================================================
(function () {
  'use strict';

  var SESSION_KEY = 'pruna_intro_played';
  var overlay = document.getElementById('intro');
  var canvas = document.getElementById('intro-canvas');
  if (!overlay || !canvas || !canvas.getContext) { unlockScroll(); return; }

  var ctx = canvas.getContext('2d', { alpha: true });
  // Defensive radius clamp (same rationale as hero.js).
  var _arc = ctx.arc.bind(ctx);
  ctx.arc = function (x, y, r, s, e, cc) { return _arc(x, y, r > 0 ? r : 0, s, e, cc); };
  var _rg = ctx.createRadialGradient.bind(ctx);
  ctx.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
    return _rg(x0, y0, r0 > 0 ? r0 : 0, x1, y1, r1 > 0 ? r1 : 0);
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prefersData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

  // --- Palette from CSS custom properties (tracks theme) --------------------
  function palette() {
    var c = getComputedStyle(document.documentElement);
    var g = function (n, f) { return (c.getPropertyValue(n).trim() || f); };
    return {
      ink: g('--ink', '#070b14'),
      cobalt: g('--cobalt', '#3f78ff'),
      cobaltSoft: g('--cobalt-soft', '#6a97ff'),
      signal: g('--signal', '#b7f24a'),
      node: g('--viz-node', '#9fb2d4'),
      ivory: g('--ivory', '#f4efe6'),
      loose: g('--viz-loose', 'rgba(143,166,201,0.55)')
    };
  }
  var P = palette();

  // --- Sizing ---------------------------------------------------------------
  var W = 0, H = 0, DPR = 1, small = false;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    small = W < 720;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // --- Timeline (seconds) ---------------------------------------------------
  // Trimmed on mobile so it stays dramatic but lighter.
  var T = small
    ? { ignite: 0.7, harvest: 1.7, distress: 2.9, land: 3.9, done: 4.4 }
    : { ignite: 0.9, harvest: 2.3, distress: 3.6, land: 4.7, done: 5.2 };

  // Handoff target = hero core position/size (must match hero.js build()).
  function coreTarget() {
    return {
      x: W * 0.62,
      y: H * 0.52,
      r: Math.max(9, Math.min(W, H) * 0.018)
    };
  }

  // --- Scene state ----------------------------------------------------------
  var stars = [], universes = [], fragments = [], stormNodes = [], stormPaths = [];
  var shuttle, planet, shock, target;
  var rafId = 0, startT = 0, running = false, finished = false;
  var shakeSeed = Math.random() * 1000;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function buildScene() {
    P = palette();
    target = coreTarget();

    // Starfield (parallax depth), lighter on mobile.
    stars = [];
    var starCount = small ? 90 : 170;
    for (var i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        z: rand(0.25, 1), r: rand(0.4, 1.5)
      });
    }

    // Layered "universes": faint concentric arcs sweeping past. Distinct tints.
    universes = [
      { tint: P.cobalt, at: T.ignite + 0.1, y: H * 0.30 },
      { tint: P.signal, at: T.ignite + 0.55, y: H * 0.62 },
      { tint: P.cobaltSoft, at: T.ignite + 1.0, y: H * 0.44 }
    ];

    // Data fragments to harvest into the trail during phase 2.
    fragments = [];
    var fragCount = small ? 10 : 16;
    for (var f = 0; f < fragCount; f++) {
      fragments.push({
        x: rand(W * 0.1, W * 1.05), y: rand(H * 0.1, H * 0.9),
        r: rand(1.5, 3.2), captured: false, capT: 0,
        appear: T.ignite + rand(0.1, 1.2), a: 0
      });
    }

    // Founder planet — small ivory ring, revealed in the distress phase.
    planet = {
      x: W * (small ? 0.5 : 0.62), y: H * (small ? 0.5 : 0.52),
      r: Math.max(10, Math.min(W, H) * 0.02)
    };

    // Storm around the planet: scattered nodes + noisy paths (uncertainty).
    stormNodes = [];
    stormPaths = [];
    var sCount = small ? 22 : 40;
    for (var s = 0; s < sCount; s++) {
      var ang = Math.random() * Math.PI * 2;
      var dist = rand(planet.r * 2.2, Math.min(W, H) * (small ? 0.34 : 0.4));
      stormNodes.push({
        // chaotic starting position
        cx: planet.x + Math.cos(ang) * dist,
        cy: planet.y + Math.sin(ang) * dist,
        // eventual organised slot (a calm ring around the core)
        ox: 0, oy: 0,
        jitter: rand(0, Math.PI * 2), jspeed: rand(0.6, 1.6),
        jamp: rand(4, 14) * (small ? 0.7 : 1),
        r: rand(1.6, 3.0)
      });
    }
    // Assign organised slots on concentric rings (protected system look).
    for (var k = 0; k < stormNodes.length; k++) {
      var ring = 1 + (k % 3);
      var a2 = (k / stormNodes.length) * Math.PI * 2 * 3 + k * 0.3;
      var rr = target.r * (2.4 + ring * 1.7);
      stormNodes[k].ox = target.x + Math.cos(a2) * rr;
      stormNodes[k].oy = target.y + Math.sin(a2) * rr;
    }
    // noisy connecting paths during the storm
    var pCount = small ? 14 : 26;
    for (var p = 0; p < pCount; p++) {
      stormPaths.push({
        a: stormNodes[(Math.random() * stormNodes.length) | 0],
        b: stormNodes[(Math.random() * stormNodes.length) | 0],
        w: rand(0.4, 1.1)
      });
    }

    // Shuttle: enters from lower-left dark, sweeps toward the planet.
    shuttle = {
      x: -W * 0.15, y: H * 0.86,
      // control points for an arced flight into the core
      trail: []
    };

    shock = { t: 0, active: false };
    finished = false;
  }

  // --- Easing ---------------------------------------------------------------
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }

  // Shuttle position along its flight path as a function of global time.
  function shuttlePos(tt) {
    // Fly from off-screen lower-left, arc up through the universes, then dive
    // into the planet by the landing moment.
    var p = clamp01((tt - T.ignite) / (T.land - T.ignite));
    // Enter decisively after ignition so the craft is visible throughout the
    // harvest beat, then slow down for the precision landing.
    var e = p < 0.55
      ? 0.5 * easeOut(p / 0.55)
      : 0.5 + 0.5 * easeInOut((p - 0.55) / 0.45);
    var sx = -W * 0.08, sy = H * 0.86;           // start
    var mx = W * 0.32, my = H * 0.22;            // mid (up among universes)
    var ex = planet.x, ey = planet.y;            // end (planet/core)
    // quadratic bezier
    var u = 1 - e;
    var x = u * u * sx + 2 * u * e * mx + e * e * ex;
    var y = u * u * sy + 2 * u * e * my + e * e * ey;
    return { x: x, y: y, p: p };
  }

  // --- Draw helpers ---------------------------------------------------------
  function withAlpha(color, a) {
    color = (color || '').trim();
    if (color.charAt(0) === '#') {
      var h = color.slice(1);
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
    }
    if (color.indexOf('rgba') === 0) return color.replace(/[\d.]+\)$/, a + ')');
    if (color.indexOf('rgb') === 0) return color.replace('rgb(', 'rgba(').replace(')', ',' + a + ')');
    return color;
  }

  // Original shuttle glyph: an abstract protective chevron with a bright core
  // and a swept mint/cobalt thruster. Drawn pointing along its heading.
  function drawShuttle(x, y, angle, scale, glow) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(scale, scale);

    // thruster glow behind
    var tg = ctx.createLinearGradient(-46, 0, 6, 0);
    tg.addColorStop(0, withAlpha(P.signal, 0));
    tg.addColorStop(0.6, withAlpha(P.signal, 0.5 * glow));
    tg.addColorStop(1, withAlpha(P.cobaltSoft, 0.9 * glow));
    ctx.beginPath();
    ctx.moveTo(-44, 0); ctx.lineTo(-6, -7); ctx.lineTo(-6, 7); ctx.closePath();
    ctx.fillStyle = tg; ctx.fill();

    // hull: forward chevron (protective arrowhead)
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(-8, -11);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-8, 11);
    ctx.closePath();
    ctx.fillStyle = P.ivory;
    ctx.fill();

    // cobalt spine
    ctx.beginPath();
    ctx.moveTo(20, 0); ctx.lineTo(-2, 0);
    ctx.strokeStyle = P.cobalt; ctx.lineWidth = 2.2; ctx.stroke();

    // bright core dot
    ctx.beginPath();
    ctx.arc(4, 0, 3.1, 0, Math.PI * 2);
    ctx.fillStyle = P.signal; ctx.fill();

    ctx.restore();
  }

  // --- Frame ----------------------------------------------------------------
  var lastShuttle = null;
  function frame(now) {
    if (!running) return;
    var tt = (now - startT) / 1000;

    ctx.clearRect(0, 0, W, H);

    // Solid ink backdrop (prevents any white flash) with a subtle vignette.
    ctx.fillStyle = P.ink;
    ctx.fillRect(0, 0, W, H);

    // Restrained camera shake during ignition + landing impact.
    var shake = 0;
    if (tt < T.ignite) shake = (1 - tt / T.ignite) * (small ? 3 : 5);
    if (shock.active && shock.t < 0.25) shake = (0.25 - shock.t) / 0.25 * (small ? 5 : 9);
    var shx = 0, shy = 0;
    if (shake > 0.2) {
       shx = Math.sin(tt * 90 + shakeSeed) * shake;
      shy = Math.cos(tt * 77 + shakeSeed) * shake;
    }
    ctx.save();
    ctx.translate(shx, shy);

    // --- Stars / streaks (velocity) -----------------------------------------
    var speed = clamp01((tt - T.ignite * 0.3) / 0.9) * (tt < T.land ? 1 : easeOut(clamp01(1 - (tt - T.land) / 0.5)));
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      var streak = speed * st.z * (small ? 40 : 70);
      ctx.strokeStyle = withAlpha(P.node, 0.15 + st.z * 0.35);
      ctx.lineWidth = st.r * st.z;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(st.x + streak, st.y);
      ctx.stroke();
      // drift stars leftward to sell motion, wrap around
      st.x -= (0.4 + st.z * 1.6) * (speed * 6 + 0.2);
      if (st.x < -80) st.x = W + Math.random() * 40;
    }

    // --- Layered universes (sweeping tinted arcs) ---------------------------
    for (var u2 = 0; u2 < universes.length; u2++) {
      var uni = universes[u2];
      var ua = clamp01((tt - uni.at) / 0.7) * clamp01((T.distress + 0.4 - tt) / 0.6);
      if (ua <= 0) continue;
      var sweep = easeInOut(clamp01((tt - uni.at) / 1.4));
      var ux = W * 1.2 - sweep * W * 1.6;
      var grd = ctx.createRadialGradient(ux, uni.y, 0, ux, uni.y, W * 0.6);
      grd.addColorStop(0, withAlpha(uni.tint, 0.10 * ua));
      grd.addColorStop(0.5, withAlpha(uni.tint, 0.04 * ua));
      grd.addColorStop(1, withAlpha(uni.tint, 0));
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);
      // a faint horizon arc per universe
      ctx.beginPath();
      ctx.arc(ux, uni.y, W * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(uni.tint, 0.18 * ua);
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // --- Shuttle + harvested fragments --------------------------------------
    var pos = shuttlePos(tt);
    var heading = 0;
    if (lastShuttle) heading = Math.atan2(pos.y - lastShuttle.y, pos.x - lastShuttle.x);
    lastShuttle = { x: pos.x, y: pos.y };

    // trail
    shuttle.trail.push({ x: pos.x, y: pos.y, a: 1 });
    if (shuttle.trail.length > (small ? 16 : 26)) shuttle.trail.shift();

    // Fragments: appear, then get captured into the trail during harvest.
    for (var fr = 0; fr < fragments.length; fr++) {
      var fg = fragments[fr];
      fg.a = clamp01((tt - fg.appear) / 0.5);
      if (fg.a <= 0) continue;
      if (!fg.captured) {
        var d = Math.hypot(fg.x - pos.x, fg.y - pos.y);
        if (tt > T.ignite && d < (small ? 90 : 130)) { fg.captured = true; fg.capT = tt; }
      }
      if (fg.captured) {
        // fly toward the shuttle, shrink
        var cp = easeOut(clamp01((tt - fg.capT) / 0.4));
        fg.x += (pos.x - fg.x) * cp * 0.5;
        fg.y += (pos.y - fg.y) * cp * 0.5;
      }
      var fa = fg.captured ? (1 - easeOut(clamp01((tt - fg.capT) / 0.5))) : fg.a;
      if (fa <= 0) continue;
      ctx.beginPath();
      ctx.arc(fg.x, fg.y, fg.r, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(P.signal, 0.85 * fa);
      ctx.fill();
      // tiny cross-tick to read as "data", not just a dot
      ctx.strokeStyle = withAlpha(P.signal, 0.4 * fa);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(fg.x - fg.r * 2, fg.y); ctx.lineTo(fg.x + fg.r * 2, fg.y);
      ctx.stroke();
    }

    // trail render (mint→cobalt comet)
    if (tt > T.ignite && tt < T.land + 0.2) {
      for (var tr = 0; tr < shuttle.trail.length; tr++) {
        var pt = shuttle.trail[tr];
        var frac = tr / shuttle.trail.length;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (1 - frac) * (small ? 3 : 4.5), 0, Math.PI * 2);
        ctx.fillStyle = withAlpha(tr < shuttle.trail.length * 0.5 ? P.signal : P.cobaltSoft, frac * 0.5);
        ctx.fill();
      }
    }

    // --- Distress: founder planet in a storm --------------------------------
    var distressA = clamp01((tt - T.distress) / 0.5);
    var organise = clamp01((tt - T.land) / 0.8); // 0 chaos -> 1 organised
    if (distressA > 0) {
      // storm nodes move from chaos to organised ring after landing
      for (var sn = 0; sn < stormNodes.length; sn++) {
        var nd = stormNodes[sn];
        var jx = Math.cos(nd.jitter + tt * nd.jspeed) * nd.jamp * (1 - organise);
        var jy = Math.sin(nd.jitter + tt * nd.jspeed) * nd.jamp * (1 - organise);
        var oe = easeInOut(organise);
        nd.x = (nd.cx + jx) * (1 - oe) + nd.ox * oe;
        nd.y = (nd.cy + jy) * (1 - oe) + nd.oy * oe;
      }
      // noisy paths fade as things organise
      var pathA = distressA * (1 - organise) * 0.5;
      if (pathA > 0.01) {
        ctx.lineWidth = 1;
        for (var sp = 0; sp < stormPaths.length; sp++) {
          var pa = stormPaths[sp];
          ctx.strokeStyle = withAlpha(P.loose, pathA * pa.w);
          ctx.beginPath();
          ctx.moveTo(pa.a.x, pa.a.y);
          // jagged midpoint = uncertainty
          var mx2 = (pa.a.x + pa.b.x) / 2 + Math.sin(tt * 3 + sp) * 18 * (1 - organise);
          var my2 = (pa.a.y + pa.b.y) / 2 + Math.cos(tt * 2.5 + sp) * 18 * (1 - organise);
          ctx.quadraticCurveTo(mx2, my2, pa.b.x, pa.b.y);
          ctx.stroke();
        }
      }
      // organised links to core after landing
      if (organise > 0.05) {
        ctx.strokeStyle = withAlpha(P.node, organise * 0.5);
        ctx.lineWidth = 1;
        for (var sl = 0; sl < stormNodes.length; sl += 2) {
          ctx.beginPath();
          ctx.moveTo(stormNodes[sl].x, stormNodes[sl].y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      }
      // draw storm nodes
      for (var dn = 0; dn < stormNodes.length; dn++) {
        var d2 = stormNodes[dn];
        ctx.beginPath();
        ctx.arc(d2.x, d2.y, d2.r, 0, Math.PI * 2);
        ctx.fillStyle = organise > 0.5 ? withAlpha(P.node, 0.9) : withAlpha(P.loose, distressA);
        ctx.fill();
      }
      // planet ring (before landing) — small, embattled
      if (tt < T.land + 0.3) {
        var planetA = distressA * (1 - clamp01((tt - T.land) / 0.3));
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.r, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(P.ivory, 0.8 * planetA);
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // --- Rescue landing shockwave -------------------------------------------
    if (tt >= T.land && !shock.active) { shock.active = true; shock.t = 0; announce('landed'); }
    if (shock.active) {
      shock.t = tt - T.land;
      var rings = 3;
      for (var ri = 0; ri < rings; ri++) {
        var rt = shock.t - ri * 0.12;
        if (rt < 0) continue;
        var rp = easeOut(clamp01(rt / 0.7));
        var rr2 = rp * Math.min(W, H) * (small ? 0.5 : 0.62);
        var ra = (1 - rp) * 0.8;
        ctx.beginPath();
        ctx.arc(target.x, target.y, rr2, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(ri % 2 ? P.signal : P.cobalt, ra);
        ctx.lineWidth = (1 - rp) * (small ? 4 : 6) + 0.5;
        ctx.stroke();
      }
    }

    // --- Landing core (hands off to hero core) ------------------------------
    if (tt >= T.land - 0.1) {
      var coreGrow = easeOut(clamp01((tt - (T.land - 0.1)) / 0.5));
      var haloR = target.r * (3.4 + Math.sin(tt * 6) * 0.3) * coreGrow;
      var halo = ctx.createRadialGradient(target.x, target.y, target.r * 0.4, target.x, target.y, haloR);
      halo.addColorStop(0, withAlpha(P.cobalt, 0.35 * coreGrow));
      halo.addColorStop(1, withAlpha(P.cobalt, 0));
      ctx.beginPath(); ctx.arc(target.x, target.y, haloR, 0, Math.PI * 2);
      ctx.fillStyle = halo; ctx.fill();
      // boundary ring
      ctx.beginPath(); ctx.arc(target.x, target.y, target.r * 1.7 * coreGrow, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(P.cobalt, 0.5 * coreGrow); ctx.lineWidth = 1.4; ctx.stroke();
      // body + mint centre — identical construction to hero core
      ctx.beginPath(); ctx.arc(target.x, target.y, target.r * coreGrow, 0, Math.PI * 2);
      ctx.fillStyle = P.cobalt; ctx.fill();
      ctx.beginPath(); ctx.arc(target.x, target.y, target.r * 0.42 * coreGrow, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(P.signal, 0.9); ctx.fill();
    }

    // --- Shuttle draw (fades into the core on landing) ----------------------
    if (tt < T.land + 0.15) {
      var shScale = (small ? 1.0 : 1.32) * (0.65 + easeOut(clamp01((tt - T.ignite) / 0.55)) * 0.35);
      var shGlow = clamp01((tt - T.ignite * 0.4) / 0.5);
      var shFade = 1 - clamp01((tt - (T.land - 0.15)) / 0.3);
      ctx.globalAlpha = shFade;
      drawShuttle(pos.x, pos.y, heading, shScale, shGlow);
      ctx.globalAlpha = 1;
    }

    ctx.restore(); // shake

    // --- Status announcements (throttled, screen-reader friendly) -----------
    maybeAnnounce(tt);

    // --- End ----------------------------------------------------------------
    if (tt >= T.done) { finish(); return; }
    rafId = requestAnimationFrame(frame);
  }

  // --- Screen-reader status (concise, not per event) ------------------------
  var statusEl = document.getElementById('intro-status');
  var announced = {};
  function announce(key) {
    if (announced[key] || !statusEl) return;
    announced[key] = true;
    var lang = document.documentElement.getAttribute('lang') === 'de' ? 'de' : 'en';
    var msg = {
      en: { start: 'Intro animation playing. A launch sequence that ends at the homepage.', landed: '' },
      de: { start: 'Intro-Animation läuft. Eine Startsequenz, die auf der Startseite endet.', landed: '' }
    };
    if (msg[lang][key]) statusEl.textContent = msg[lang][key];
  }
  function maybeAnnounce() { /* single concise status only; visual events not announced */ }

  // --- Finish / cleanup -----------------------------------------------------
  function finish() {
    if (finished) return;
    finished = true;
    running = false;
    cancelAnimationFrame(rafId);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}

    // Iris/fade handoff: overlay fades out revealing the live hero underneath,
    // whose core sits exactly where the intro core landed.
    overlay.classList.add('intro--out');
    unlockScroll();
    var onEnd = function () {
      overlay.classList.add('intro--hidden');
      overlay.setAttribute('aria-hidden', 'true');
      teardown();
    };
    overlay.addEventListener('transitionend', onEnd, { once: true });
    // Fallback in case transitionend doesn't fire.
    setTimeout(onEnd, 1100);
    // Nudge the hero to (re)start cleanly now that it's visible.
    if (typeof window.__prunaHeroKick === 'function') window.__prunaHeroKick();
  }

  function teardown() {
    window.removeEventListener('resize', onResize);
    document.removeEventListener('keydown', onKey);
    if (skipBtn) skipBtn.removeEventListener('click', onSkip);
  }

  // --- Scroll lock ----------------------------------------------------------
  function lockScroll() { document.documentElement.classList.add('intro-lock'); document.body.classList.add('intro-lock'); }
  function unlockScroll() { document.documentElement.classList.remove('intro-lock'); document.body.classList.remove('intro-lock'); }

  // --- Controls -------------------------------------------------------------
  var skipBtn = document.getElementById('intro-skip');
  function onSkip() { finish(); }
  function onKey(e) { if (e.key === 'Escape') { e.preventDefault(); finish(); } }

  var onResize = function () { resize(); buildScene(); };

  // --- Reduced motion: no flight; brief static core then reveal -------------
  function playReduced() {
    resize(); buildScene();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = P.ink; ctx.fillRect(0, 0, W, H);
    var t2 = coreTarget();
    var halo = ctx.createRadialGradient(t2.x, t2.y, t2.r * 0.4, t2.x, t2.y, t2.r * 3.4);
    halo.addColorStop(0, withAlpha(P.cobalt, 0.35));
    halo.addColorStop(1, withAlpha(P.cobalt, 0));
    ctx.beginPath(); ctx.arc(t2.x, t2.y, t2.r * 3.4, 0, Math.PI * 2); ctx.fillStyle = halo; ctx.fill();
    ctx.beginPath(); ctx.arc(t2.x, t2.y, t2.r * 1.7, 0, Math.PI * 2); ctx.strokeStyle = withAlpha(P.cobalt, 0.5); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(t2.x, t2.y, t2.r, 0, Math.PI * 2); ctx.fillStyle = P.cobalt; ctx.fill();
    ctx.beginPath(); ctx.arc(t2.x, t2.y, t2.r * 0.42, 0, Math.PI * 2); ctx.fillStyle = withAlpha(P.signal, 0.9); ctx.fill();
    announce('start');
    setTimeout(finish, 460); // under 500ms
  }

  // --- Play -----------------------------------------------------------------
  function play(opts) {
    opts = opts || {};
    if (finished && !opts.force) return;
    // reset state for replay
    finished = false;
    announced = {};
    overlay.classList.remove('intro--out', 'intro--hidden');
    overlay.setAttribute('aria-hidden', 'false');
    lockScroll();
    resize();
    buildScene();
    document.addEventListener('keydown', onKey);
    if (skipBtn) skipBtn.addEventListener('click', onSkip);
    window.addEventListener('resize', onResize);

    if (reduceMotion) { playReduced(); return; }
    announce('start');
    running = true;
    lastShuttle = null;
    startT = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  // --- Public API -----------------------------------------------------------
  window.PrunaIntro = {
    play: function (o) { play(o || {}); },
    hasPlayed: function () { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
  };

  // --- Auto-run once per session -------------------------------------------
  var alreadyPlayed = window.PrunaIntro.hasPlayed();
  if (alreadyPlayed || (prefersData && !reduceMotion)) {
    // Skip the sequence entirely; make sure nothing is locked or covering.
    overlay.classList.add('intro--hidden');
    overlay.setAttribute('aria-hidden', 'true');
    unlockScroll();
    finished = true;
  } else {
    // Lock scroll immediately (before paint) to avoid any jump; the inline
    // head script already added the lock class, this is a safety net.
    lockScroll();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { play(); }, { once: true });
    } else {
      play();
    }
  }
})();
