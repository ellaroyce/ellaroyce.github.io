// ===========================================================================
// scrollflight.js — persistent shuttle journey driven by scroll progress
//
// After the opening intro hands off to the hero, the SAME recognizable shuttle
// keeps travelling down the homepage. It follows an original curved route that
// passes meaningful section checkpoints (work, process, about, faq, contact),
// carrying a signal trail that accumulates as the visitor scrolls. At the
// contact/CTA section it resolves into a founder-planet finale: the shuttle
// docks, two abstract forms meet in a connection gesture, and a protective
// geodesic security grid closes around the planet — uncertainty becomes
// structure.
//
// Constraints honoured:
//   - fixed layer, pointer-events:none, confined to a safe right-side gutter so
//     it never covers text or CTAs and never steals pointer events;
//   - scroll-driven via passive listener + rAF interpolation, idle-paused;
//   - offscreen / hidden-tab pause; DPR capped; mobile simplified;
//   - prefers-reduced-motion -> static protected-planet at the finale, no flight.
// ===========================================================================
(function () {
  'use strict';

  var canvas = document.getElementById('flight-canvas');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d', { alpha: true });

  // Defensive radius clamp.
  var _arc = ctx.arc.bind(ctx);
  ctx.arc = function (x, y, r, s, e, cc) { return _arc(x, y, r > 0 ? r : 0, s, e, cc); };
  var _rg = ctx.createRadialGradient.bind(ctx);
  ctx.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
    return _rg(x0, y0, r0 > 0 ? r0 : 0, x1, y1, r1 > 0 ? r1 : 0);
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function palette() {
    var c = getComputedStyle(document.documentElement);
    var g = function (n, f) { return (c.getPropertyValue(n).trim() || f); };
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    return {
      cobalt: g('--cobalt', light ? '#2151d8' : '#3f78ff'),
      cobaltSoft: g('--cobalt-soft', light ? '#3f78ff' : '#6a97ff'),
      signal: g('--signal', light ? '#6ba300' : '#b7f24a'),
      node: g('--viz-node', light ? '#4a5a7d' : '#9fb2d4'),
      // fg is theme-adaptive (ink on light, ivory on dark) so lines stay visible
      fg: g('--fg', light ? '#0c1424' : '#f4efe6'),
      bg: g('--bg', light ? '#f5f3ec' : '#0c1220'),
      ivory: g('--fg', light ? '#0c1424' : '#f4efe6'),
      loose: g('--viz-loose', 'rgba(143,166,201,0.55)')
    };
  }
  var P = palette();

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

  // --- Sizing ---------------------------------------------------------------
  var W = 0, H = 0, DPR = 1, small = false, hidden = false;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    small = W < 720;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    buildRoute();
  }

  // --- Route ----------------------------------------------------------------
  // Checkpoints are anchored to real sections. We convert each section's
  // document position into a scroll-progress value [0..1] and pair it with a
  // target point on screen. The X stays inside a safe right-side gutter so the
  // route never crosses reading content; Y is derived per-frame from where the
  // section currently sits in the viewport (so the craft "visits" it).
  var CHECKPOINTS = ['hero', 'work', 'process', 'about', 'faq', 'contact'];
  var route = [];        // [{id, el}]
  var docHeight = 1;
  function buildRoute() {
    route = [];
    for (var i = 0; i < CHECKPOINTS.length; i++) {
      var el = document.getElementById(CHECKPOINTS[i]);
      if (el) route.push({ id: CHECKPOINTS[i], el: el });
    }
    docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }

  // Safe horizontal band (right gutter). Narrower on smaller desktops.
  function gutterX() {
    // keep clear of the content column; hug the right edge
    var margin = Math.min(96, Math.max(48, W * 0.06));
    return W - margin;
  }

  // Original curved lateral wander so the route isn't a straight vertical line.
  // Amplitude is modest and always inside the gutter, so it can't reach text.
  function laneX(progress) {
    var g = gutterX();
    var amp = Math.min(46, W * 0.035);
    // two-frequency sine = organic, non-repeating-looking weave
    return g - amp - (Math.sin(progress * Math.PI * 3.0) * 0.5 + 0.5) * amp
             + Math.sin(progress * Math.PI * 7.0) * (amp * 0.18);
  }

  // --- Scroll state ---------------------------------------------------------
  var targetProg = 0, prog = 0;         // 0..1 smoothed scroll progress
  var running = false, rafId = 0, idleUntil = 0;
  var trail = [];
  var lastPos = null;

  function readScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    targetProg = docHeight > 0 ? Math.min(1, Math.max(0, y / docHeight)) : 0;
    kick();
  }

  // The craft's screen position for a given eased progress.
  function craftPos(p) {
    // Vertical: sweep from just under the hero to the contact finale, but bias
    // toward the section currently centred in the viewport for a "visiting" feel.
    var vh = window.innerHeight;
    var baseY = vh * 0.16 + p * (vh * 0.62);
    return { x: laneX(p), y: baseY };
  }

  // --- Finale geometry ------------------------------------------------------
  // Founder planet finale anchored to the contact section. Progress within the
  // last stretch [dockStart..1] drives docking -> handshake -> shell close.
  var dockStart = 0.86;
  function contactVisible() {
    var el = document.getElementById('contact');
    if (!el) return { on: false };
    var r = el.getBoundingClientRect();
    var on = r.top < window.innerHeight * 0.92 && r.bottom > window.innerHeight * 0.25;
    // Planet centre: right-side of the contact block.
    // On desktop it sits in the right gutter near the CTA. On mobile we push it
    // hard to the corner and lower, clear of the body copy, so the geodesic
    // shell never sits over reading text.
    var shellReach = Math.max(9, Math.min(W, H) * 0.02) * (small ? 3.4 : 4.2);
    var cx, cy;
    if (small) {
      cx = W - shellReach - 6;                 // hug right edge, shell fully on-screen
      cy = r.top + r.height * 0.7;             // lower third, below the CTA cluster
    } else {
      cx = Math.min(W - Math.min(120, W * 0.14), gutterX() - 10);
      cy = r.top + r.height * 0.42;
    }
    cy = Math.max(vhClamp(0.2), Math.min(vhClamp(0.82), cy));
    return { on: on, x: cx, y: cy };
  }
  function vhClamp(f) { return window.innerHeight * f; }

  // --- Shuttle glyph: the same recognizable orbiter used in the intro --------
  // Always drawn with a contrast plate so it stays legible over alternating
  // section backgrounds in either theme. Palette is cached per theme.
  var _spCache = {};
  function shuttlePal() {
    var key = document.documentElement.getAttribute('data-theme') || 'dark';
    if (!_spCache[key]) _spCache[key] = window.PrunaShuttle.palette();
    return _spCache[key];
  }
  function drawShuttle(x, y, angle, scale, glow) {
    if (!window.PrunaShuttle) return;
    window.PrunaShuttle.draw(ctx, x, y, angle, scale, {
      palette: shuttlePal(), thrust: 0.45, glow: glow, plate: true
    });
  }

  // --- Checkpoint beats -----------------------------------------------------
  // Small, tasteful pulses as the craft passes each section centre. Not every
  // section becomes a gimmick — just a brief signal drop.
  var beats = {};
  function checkpointBeat(now) {
    for (var i = 1; i < route.length - 1; i++) { // skip hero + contact (finale)
      var r = route[i].el.getBoundingClientRect();
      var centred = r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
      if (centred && !beats[route[i].id]) {
        beats[route[i].id] = { t: now, y: window.innerHeight * 0.5 };
      } else if (!centred && beats[route[i].id] && now - beats[route[i].id].t > 1400) {
        beats[route[i].id] = null; // allow re-trigger if scrolled back
      }
    }
  }

  // --- Geodesic security shell (original data-grid, not "code rain") ---------
  function drawSecurityShell(cx, cy, radius, close, t) {
    // 'close' 0..1 : shell assembles from sparse struts into a full geodesic cage.
    var rings = 3;
    var spokes = small ? 8 : 12;
    ctx.save();
    // outer protective boundary
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2 * close);
    ctx.strokeStyle = withAlpha(P.cobalt, 0.7 * close);
    ctx.lineWidth = 1.6; ctx.stroke();

    // concentric struts
    for (var ri = 1; ri <= rings; ri++) {
      var rr = radius * (ri / (rings + 0.4));
      var a = 0.16 * close * (1 - ri / (rings + 1));
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(P.cobaltSoft, a);
      ctx.lineWidth = 1; ctx.stroke();
    }
    // radial spokes + triangulated geodesic facets
    for (var s = 0; s < spokes; s++) {
      var ang = (s / spokes) * Math.PI * 2 + t * 0.05;
      var ex = cx + Math.cos(ang) * radius;
      var ey = cy + Math.sin(ang) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(ex, ey);
      ctx.strokeStyle = withAlpha(P.cobalt, 0.12 * close);
      ctx.lineWidth = 0.7; ctx.stroke();
      // facet chord to next spoke (geodesic look)
      var ang2 = ((s + 1) / spokes) * Math.PI * 2 + t * 0.05;
      var mx = cx + Math.cos(ang) * radius * 0.62;
      var my = cy + Math.sin(ang) * radius * 0.62;
      var mx2 = cx + Math.cos(ang2) * radius * 0.62;
      var my2 = cy + Math.sin(ang2) * radius * 0.62;
      ctx.beginPath();
      ctx.moveTo(mx, my); ctx.lineTo(mx2, my2);
      ctx.strokeStyle = withAlpha(P.signal, 0.16 * close);
      ctx.lineWidth = 0.7; ctx.stroke();
    }
    // vertex nodes on the boundary
    for (var v = 0; v < spokes; v++) {
      var va = (v / spokes) * Math.PI * 2 + t * 0.05;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(va) * radius, cy + Math.sin(va) * radius, 2.1 * close, 0, Math.PI * 2);
      ctx.fillStyle = withAlpha(P.node, 0.9 * close);
      ctx.fill();
    }
    ctx.restore();
  }

  // Founder planet core (matches the hero/intro core language).
  function drawPlanet(cx, cy, r, glow) {
    var halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 3);
    halo.addColorStop(0, withAlpha(P.cobalt, 0.30 * glow));
    halo.addColorStop(1, withAlpha(P.cobalt, 0));
    ctx.beginPath(); ctx.arc(cx, cy, r * 3, 0, Math.PI * 2); ctx.fillStyle = halo; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = P.cobalt; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.42, 0, Math.PI * 2); ctx.fillStyle = withAlpha(P.signal, 0.92); ctx.fill();
  }

  // --- Main frame -----------------------------------------------------------
  function frame(now) {
    rafId = 0;
    if (hidden) { running = false; return; }

    // Smooth progress toward target (interpolation for buttery scroll-follow).
    prog += (targetProg - prog) * 0.12;
    if (Math.abs(targetProg - prog) < 0.0005) prog = targetProg;

    ctx.clearRect(0, 0, W, H);

    var fin = contactVisible();
    var dock = fin.on ? Math.min(1, Math.max(0, (prog - dockStart) / (1 - dockStart))) : 0;

    // ---- Persistent flight (desktop full route; mobile lightweight) --------
    var showFlight = !small; // mobile hides the continuous weave for clarity
    var pos = craftPos(prog);
    var heading = 0;
    if (lastPos) heading = Math.atan2(pos.y - lastPos.y, pos.x - lastPos.x);
    // keep the nose pointing generally downward along the route
    if (!lastPos || (Math.abs(pos.y - lastPos.y) < 0.2 && Math.abs(pos.x - lastPos.x) < 0.2)) heading = Math.PI / 2;
    lastPos = { x: pos.x, y: pos.y };

    // Accumulating trail (organises as you go). Denser lower on the page.
    if (showFlight && dock < 0.98) {
      trail.push({ x: pos.x, y: pos.y });
      var maxTrail = 26 + Math.floor(prog * 20);
      while (trail.length > maxTrail) trail.shift();
      for (var t2 = 0; t2 < trail.length; t2++) {
        var pt = trail[t2];
        var frac = t2 / trail.length;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, (1 - frac) * 3.2 + 0.4, 0, Math.PI * 2);
        ctx.fillStyle = withAlpha(frac < 0.5 ? P.signal : P.cobaltSoft, frac * 0.42);
        ctx.fill();
      }
    }

    // Checkpoint beats (subtle signal drop at section centres).
    checkpointBeat(now);
    for (var b in beats) {
      if (!beats[b]) continue;
      var bt = (now - beats[b].t) / 700;
      if (bt > 1) continue;
      var rr = bt * (small ? 26 : 40);
      ctx.beginPath();
      ctx.arc(pos.x, window.innerHeight * 0.5, rr, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(P.signal, (1 - bt) * 0.5);
      ctx.lineWidth = (1 - bt) * 2 + 0.4;
      ctx.stroke();
    }

    // ---- Finale ------------------------------------------------------------
    if (fin.on) {
      var t = now / 1000;
      var px = fin.x, py = fin.y;
      var planetR = Math.max(9, Math.min(W, H) * 0.02);

      // Docking: craft eases from the route into the planet as dock -> 1.
      var dockE = dock * dock * (3 - 2 * dock); // smoothstep
      var craftX = pos.x + (px - 40 - pos.x) * dockE;
      var craftY = pos.y + (py - pos.y) * dockE;

      // Planet appears with the section; glow grows as it becomes protected.
      var planetGlow = Math.min(1, (fin.on ? 0.5 : 0) + dock);
      drawPlanet(px, py, planetR, planetGlow);

      // Handshake: two small abstract forms reach toward each other and meet.
      // Left form = the arriving craft's emissary; right = the founder node.
      var meet = Math.min(1, Math.max(0, (dock - 0.25) / 0.4));
      if (meet > 0) {
        var gap = (1 - meet) * planetR * 2.2;
        var lx = px - gap - planetR * 0.08, rx = px + planetR * 0.08;
        var ay = py + planetR * 1.35;
        // reaching struts: the arriving signal and founder core both extend
        // toward the same connection point, then remain linked at rest.
        ctx.strokeStyle = withAlpha(P.fg, 0.8 * meet);
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(craftX, craftY); ctx.lineTo(lx, ay); ctx.stroke();
        ctx.strokeStyle = withAlpha(P.cobaltSoft, 0.8 * meet);
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(rx, ay); ctx.stroke();
        // the two meeting dots
        ctx.beginPath(); ctx.arc(lx, ay, 3.2, 0, Math.PI * 2); ctx.fillStyle = P.signal; ctx.fill();
        ctx.beginPath(); ctx.arc(rx, ay, 3.2, 0, Math.PI * 2); ctx.fillStyle = P.cobaltSoft; ctx.fill();
        // connection spark when they meet
        if (meet > 0.85) {
          ctx.beginPath();
          ctx.arc((lx + rx) / 2, ay, 4 + (meet - 0.85) * 30, 0, Math.PI * 2);
          ctx.strokeStyle = withAlpha(P.signal, (1 - (meet - 0.85) / 0.15) * 0.7);
          ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      // Protective geodesic shell closes around the planet as dock -> 1.
      var shellClose = Math.min(1, Math.max(0, (dock - 0.55) / 0.45));
      if (shellClose > 0) {
        drawSecurityShell(px, py, planetR * (small ? 3.4 : 4.2), shellClose, t);
      }

      // Craft docks and fades into the planet at the very end.
      if (dock < 0.92) {
        var craftFade = 1 - Math.min(1, Math.max(0, (dock - 0.7) / 0.22));
        ctx.globalAlpha = craftFade;
        var toPlanet = Math.atan2(py - craftY, px - craftX);
        drawShuttle(craftX, craftY, dock > 0.3 ? toPlanet : heading, small ? 0.5 : 0.62, 1);
        ctx.globalAlpha = 1;
      }
    } else if (showFlight && dock < 0.98) {
      // Normal cruising shuttle along the route.
      var glow = Math.min(1, 0.5 + prog);
      drawShuttle(pos.x, pos.y, heading, small ? 0.46 : 0.58, glow);
    }

    // Idle pause: stop rAF shortly after motion settles to save battery.
    var settled = Math.abs(targetProg - prog) < 0.0006;
    if (settled && now > idleUntil) {
      // Keep the finale gently alive if the contact section is visible.
      if (fin.on && dock > 0.02 && !reduceMotion) {
        rafId = requestAnimationFrame(frame);
      } else {
        running = false;
      }
      return;
    }
    rafId = requestAnimationFrame(frame);
  }

  function kick() {
    idleUntil = performance.now() + 600;
    if (!running && !reduceMotion && !hidden) {
      running = true;
      rafId = requestAnimationFrame(frame);
    }
  }

  // --- Reduced motion: static protected planet at the finale ----------------
  function drawStaticFinale() {
    ctx.clearRect(0, 0, W, H);
    var fin = contactVisible();
    if (!fin.on) return;
    var planetR = Math.max(9, Math.min(W, H) * 0.02);
    drawPlanet(fin.x, fin.y, planetR, 1);
    drawSecurityShell(fin.x, fin.y, planetR * (small ? 3.4 : 4.2), 1, 0);
  }

  // --- Events ---------------------------------------------------------------
  var rz;
  window.addEventListener('resize', function () {
    clearTimeout(rz);
    rz = setTimeout(function () { resize(); if (reduceMotion) drawStaticFinale(); else kick(); }, 150);
  });
  window.addEventListener('scroll', function () {
    if (reduceMotion) { drawStaticFinale(); return; }
    readScroll();
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    hidden = document.hidden;
    if (hidden) { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = 0; }
    else if (!reduceMotion) { readScroll(); }
  });

  // Re-read palette on theme change.
  new MutationObserver(function () {
    P = palette();
    _spCache = {}; // invalidate cached shuttle palette so hull tracks theme
    if (reduceMotion) drawStaticFinale(); else kick();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // --- Init -----------------------------------------------------------------
  function init() {
    resize();
    if (reduceMotion) { drawStaticFinale(); return; }
    readScroll();
    kick();
  }

  // The scroll layer should wake up regardless of whether the intro plays. If
  // the intro is running it will keep the layer effectively idle until scroll.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }

  // Recompute route once everything (fonts/images) settles — guards against
  // late layout shifts changing section offsets.
  window.addEventListener('load', function () { buildRoute(); if (reduceMotion) drawStaticFinale(); });
})();
