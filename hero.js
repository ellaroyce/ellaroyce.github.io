// ===========================================================================
// hero.js — Living architecture map
//
// A calm, self-organising system. Loose nodes drift in, discover each other,
// and settle into protected clusters around a stable core. Signal pulses
// travel along the links between them. The pointer gently attracts and
// reorganises nearby nodes. Vanilla Canvas 2D, no dependencies.
//
// Design intent: sophisticated and alive, not a particle wallpaper and not a
// cybersecurity cliche. Structure over noise — every node belongs to a
// cluster, every cluster orbits the core, every link can carry a signal.
// ===========================================================================
(function () {
  'use strict';

  const canvas = document.getElementById('hero-canvas');
  if (!canvas || !canvas.getContext) return;

  const ctx = canvas.getContext('2d', { alpha: true });

  // Defensive: clamp negative radii so a transient sub-zero value (e.g. during
  // the formation sequence or pointer reorganisation) can never throw
  // IndexSizeError and stall the animation loop.
  const _arc = ctx.arc.bind(ctx);
  ctx.arc = (x, y, r, s, e, cc) => _arc(x, y, r > 0 ? r : 0, s, e, cc);
  const _rg = ctx.createRadialGradient.bind(ctx);
  ctx.createRadialGradient = (x0, y0, r0, x1, y1, r1) =>
    _rg(x0, y0, r0 > 0 ? r0 : 0, x1, y1, r1 > 0 ? r1 : 0);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Palette pulled from CSS custom properties so it tracks the theme -----
  const css = getComputedStyle(document.documentElement);
  function tone(name, fallback) {
    const v = css.getPropertyValue(name).trim();
    return v || fallback;
  }
  let palette = readPalette();
  function readPalette() {
    const c = getComputedStyle(document.documentElement);
    const g = (n, f) => (c.getPropertyValue(n).trim() || f);
    return {
      core: g('--viz-core', '#2f6bff'),
      node: g('--viz-node', '#8fa6c9'),
      link: g('--viz-link', 'rgba(120,150,200,0.30)'),
      signal: g('--viz-signal', '#a8e04a'),
      boundary: g('--viz-boundary', 'rgba(120,150,200,0.22)'),
      loose: g('--viz-loose', 'rgba(120,150,200,0.55)'),
    };
  }

  // --- Sizing ---------------------------------------------------------------
  let W = 0, H = 0, DPR = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    // Cap device pixel ratio for performance on high-density / mobile screens.
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  // --- System model ---------------------------------------------------------
  // Cluster = a protected group of nodes with a home position that orbits the
  // core. Nodes ease from a loose scattered entry position toward a slot
  // within their cluster. Links connect nodes inside a cluster, plus a spine
  // from each cluster hub to the core.
  let core, clusters, nodes, links, signals;
  let cx = 0, cy = 0;          // core centre
  let scaleUnit = 1;           // layout scale relative to viewport
  let t0 = 0;                  // animation start time
  const pointer = { x: -9999, y: -9999, active: false };

  function build() {
    cx = W * 0.62;
    cy = H * 0.52;
    scaleUnit = Math.min(W, H);

    core = { x: cx, y: cy, r: Math.max(9, scaleUnit * 0.018), pulse: 0 };

    // Fewer clusters / nodes on small screens for smooth motion.
    const small = W < 720;
    const clusterCount = small ? 4 : 6;
    const perCluster = small ? [3, 4] : [3, 5];

    clusters = [];
    nodes = [];
    links = [];
    signals = [];

    const orbit = scaleUnit * (small ? 0.30 : 0.31);
    for (let i = 0; i < clusterCount; i++) {
      const a = (i / clusterCount) * Math.PI * 2 - Math.PI / 2 + (i % 2 ? 0.22 : -0.14);
      const rad = orbit * (0.82 + (i % 3) * 0.12);
      const hub = {
        hx: cx + Math.cos(a) * rad,
        hy: cy + Math.sin(a) * rad,
        angle: a,
        radius: rad,
        // slow individual orbital drift
        drift: (i % 2 ? 1 : -1) * (0.018 + (i % 3) * 0.006),
        nodes: [],
      };
      clusters.push(hub);

      const n = perCluster[0] + Math.floor(Math.random() * (perCluster[1] - perCluster[0] + 1));
      const spread = scaleUnit * (small ? 0.075 : 0.072);
      let prev = null;
      for (let j = 0; j < n; j++) {
        const na = a + (j - (n - 1) / 2) * 0.62 + (Math.random() - 0.5) * 0.25;
        const nr = spread * (0.55 + Math.random() * 0.9);
        const home = {
          x: hub.hx + Math.cos(na) * nr,
          y: hub.hy + Math.sin(na) * nr,
        };
        // Loose entry position — scattered off toward the edges.
        const ea = Math.random() * Math.PI * 2;
        const edist = scaleUnit * (0.55 + Math.random() * 0.5);
        const node = {
          hx: home.x, hy: home.y,           // home slot
          x: cx + Math.cos(ea) * edist,     // current (starts loose)
          y: cy + Math.sin(ea) * edist,
          vx: 0, vy: 0,
          r: Math.max(2.2, scaleUnit * (0.004 + Math.random() * 0.004)),
          cluster: i,
          // formation delay so nodes arrive in waves
          delay: 0.15 + i * 0.12 + j * 0.05 + Math.random() * 0.1,
          seed: Math.random() * 1000,
        };
        nodes.push(node);
        hub.nodes.push(node);
        // link within cluster (chain + occasional cross-link)
        if (prev) links.push({ a: prev, b: node, cluster: i, k: 1 });
        prev = node;
      }
      // close the cluster loop lightly for a protected-ring feel
      if (hub.nodes.length > 2) {
        links.push({ a: hub.nodes[0], b: hub.nodes[hub.nodes.length - 1], cluster: i, k: 0.6 });
      }
      // spine: first node of cluster links toward core
      links.push({ a: hub.nodes[0], b: core, cluster: i, k: 0.5, spine: true });
    }
  }

  // --- Signals: purposeful pulses that travel a link ------------------------
  function emitSignal() {
    if (!links.length) return;
    // Prefer spine links so pulses read as "reporting to the core".
    const pool = links.filter((l) => l.spine || Math.random() < 0.4);
    const link = pool.length ? pool[(Math.random() * pool.length) | 0] : links[(Math.random() * links.length) | 0];
    signals.push({ link, t: 0, speed: 0.5 + Math.random() * 0.5, toCore: !!link.spine && Math.random() < 0.7 });
  }

  // --- Formation easing ------------------------------------------------------
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }

  // --- Main step ------------------------------------------------------------
  let raf = 0;
  let lastEmit = 0;
  let running = false;

  function frame(now) {
    if (!running) return;
    const elapsed = (now - t0) / 1000;
    const dt = 1 / 60;

    ctx.clearRect(0, 0, W, H);

    // Formation progress overall (0..1 over ~2.6s), used for opacity of links.
    const settle = Math.min(1, elapsed / 2.6);

    // Slow orbital drift of clusters around the core.
    for (const hub of clusters) {
      hub.angle += hub.drift * dt;
      hub.hx = cx + Math.cos(hub.angle) * hub.radius;
      hub.hy = cy + Math.sin(hub.angle) * hub.radius;
      // recompute each node's home relative to its hub movement
    }
    // Update node home positions from hub drift (keep offset from build).
    // We recompute offsets lazily: store base offset once.
    for (const hub of clusters) {
      for (let j = 0; j < hub.nodes.length; j++) {
        const nd = hub.nodes[j];
        if (nd._ox === undefined) {
          // capture the original offset from hub the first time
          nd._ox = nd.hx - (cx + Math.cos(hub._a0 !== undefined ? hub._a0 : hub.angle) * hub.radius);
          nd._oy = nd.hy - (cy + Math.sin(hub._a0 !== undefined ? hub._a0 : hub.angle) * hub.radius);
          if (hub._a0 === undefined) hub._a0 = hub.angle;
        }
      }
    }

    // Physics: ease each node toward its (drifting) home + gentle float + pointer.
    for (const nd of nodes) {
      const hub = clusters[nd.cluster];
      const homeX = hub.hx + (nd._ox || 0);
      const homeY = hub.hy + (nd._oy || 0);

      // formation gating
      const local = Math.max(0, Math.min(1, (elapsed - nd.delay) / 1.4));
      const ease = easeOutCubic(local);

      // subtle organic float once settled
      const fl = local >= 1 ? Math.sin(elapsed * 0.6 + nd.seed) * scaleUnit * 0.004 : 0;
      const flY = local >= 1 ? Math.cos(elapsed * 0.5 + nd.seed) * scaleUnit * 0.004 : 0;

      const targetX = homeX + fl;
      const targetY = homeY + flY;

      // spring toward target — stiffer as formation completes
      const stiff = 0.02 + ease * 0.05;
      nd.vx += (targetX - nd.x) * stiff;
      nd.vy += (targetY - nd.y) * stiff;

      // pointer influence: gentle attraction/reorganisation within a radius
      if (pointer.active) {
        const dx = pointer.x - nd.x;
        const dy = pointer.y - nd.y;
        const d2 = dx * dx + dy * dy;
        const R = scaleUnit * 0.22;
        if (d2 < R * R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / R);
          // attract toward pointer, but capped so system stays legible
          nd.vx += (dx / d) * f * f * 0.7;
          nd.vy += (dy / d) * f * f * 0.7;
        }
      }

      nd.vx *= 0.86;
      nd.vy *= 0.86;
      nd.x += nd.vx;
      nd.y += nd.vy;
    }

    // --- Draw protected boundary rings around each settled cluster ----------
    if (settle > 0.15) {
      for (const hub of clusters) {
        // bounding circle of the cluster nodes
        let mx = 0, my = 0;
        for (const nd of hub.nodes) { mx += nd.x; my += nd.y; }
        mx /= hub.nodes.length; my /= hub.nodes.length;
        let rr = 0;
        for (const nd of hub.nodes) {
          const d = Math.hypot(nd.x - mx, nd.y - my);
          if (d > rr) rr = d;
        }
        rr += scaleUnit * 0.028;
        const a = Math.min(1, (settle - 0.15) / 0.6);
        ctx.beginPath();
        ctx.arc(mx, my, rr, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(palette.boundary, 0.9 * a);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // --- Draw links ---------------------------------------------------------
    for (const l of links) {
      const ax = l.a.x, ay = l.a.y;
      const bx = l.b === core ? core.x : l.b.x;
      const by = l.b === core ? core.y : l.b.y;
      const alpha = settle * (l.spine ? 0.5 : 0.85);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = withAlpha(palette.link, alpha);
      ctx.lineWidth = l.spine ? 1 : 1.1;
      ctx.stroke();
    }

    // --- Signals ------------------------------------------------------------
    if (elapsed - lastEmit > (reduceMotion ? 9999 : 0.85)) {
      lastEmit = elapsed;
      if (settle > 0.7) emitSignal();
    }
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += dt * s.speed;
      if (s.t >= 1) { signals.splice(i, 1); if (s.link.b === core) core.pulse = 1; continue; }
      const ax = s.link.a.x, ay = s.link.a.y;
      const bx = s.link.b === core ? core.x : s.link.b.x;
      const by = s.link.b === core ? core.y : s.link.b.y;
      const p = s.toCore ? s.t : s.t;
      const x = ax + (bx - ax) * p;
      const y = ay + (by - ay) * p;
      // comet tail
      const tail = 0.12;
      const tx = ax + (bx - ax) * Math.max(0, p - tail);
      const ty = ay + (by - ay) * Math.max(0, p - tail);
      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, withAlpha(palette.signal, 0));
      grad.addColorStop(1, withAlpha(palette.signal, 0.9));
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = palette.signal;
      ctx.fill();
    }

    // --- Draw nodes ---------------------------------------------------------
    for (const nd of nodes) {
      const local = Math.max(0, Math.min(1, (elapsed - nd.delay) / 1.4));
      // loose nodes appear faint, settled nodes solid
      ctx.beginPath();
      ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
      ctx.fillStyle = local < 1 ? withAlpha(palette.loose, 0.35 + local * 0.5) : palette.node;
      ctx.fill();
    }

    // --- Draw stable core ---------------------------------------------------
    core.pulse *= 0.94;
    const coreAppear = Math.min(1, elapsed / 1.0);
    // protected halo
    const haloR = core.r * (2.6 + core.pulse * 1.2);
    const halo = ctx.createRadialGradient(core.x, core.y, core.r * 0.4, core.x, core.y, haloR);
    halo.addColorStop(0, withAlpha(palette.core, 0.28 * coreAppear));
    halo.addColorStop(1, withAlpha(palette.core, 0));
    ctx.beginPath();
    ctx.arc(core.x, core.y, haloR, 0, Math.PI * 2);
    ctx.fillStyle = halo;
    ctx.fill();
    // core boundary ring (the "protected boundary" motif)
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.r * 1.7, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(palette.core, 0.5 * coreAppear);
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // core body
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.r * coreAppear, 0, Math.PI * 2);
    ctx.fillStyle = palette.core;
    ctx.fill();
    // core center highlight
    ctx.beginPath();
    ctx.arc(core.x, core.y, core.r * 0.42 * coreAppear, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(palette.signal, 0.9);
    ctx.fill();

    raf = requestAnimationFrame(frame);
  }

  // --- Static composition (reduced motion) ----------------------------------
  function drawStatic() {
    // Run the settle physics to completion instantly, then render one frame.
    ctx.clearRect(0, 0, W, H);
    // place nodes at home
    for (const nd of nodes) { nd.x = clusters[nd.cluster].hx + (nd._ox || (nd.hx - clusters[nd.cluster].hx)); nd.y = clusters[nd.cluster].hy + (nd._oy || (nd.hy - clusters[nd.cluster].hy)); }
    // For a clean static frame, just use home positions directly.
    for (const nd of nodes) { nd.x = nd.hx; nd.y = nd.hy; }

    // boundary rings
    for (const hub of clusters) {
      let mx = 0, my = 0;
      for (const nd of hub.nodes) { mx += nd.x; my += nd.y; }
      mx /= hub.nodes.length; my /= hub.nodes.length;
      let rr = 0;
      for (const nd of hub.nodes) { const d = Math.hypot(nd.x - mx, nd.y - my); if (d > rr) rr = d; }
      rr += scaleUnit * 0.028;
      ctx.beginPath();
      ctx.arc(mx, my, rr, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(palette.boundary, 0.9);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // links
    for (const l of links) {
      const bx = l.b === core ? core.x : l.b.x;
      const by = l.b === core ? core.y : l.b.y;
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(bx, by);
      ctx.strokeStyle = withAlpha(palette.link, l.spine ? 0.4 : 0.75);
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // a couple of frozen signals for life
    for (let i = 0; i < 3 && i < links.length; i++) {
      const l = links.filter((x) => x.spine)[i] || links[i];
      if (!l) break;
      const bx = l.b === core ? core.x : l.b.x;
      const by = l.b === core ? core.y : l.b.y;
      const p = 0.55;
      const x = l.a.x + (bx - l.a.x) * p, y = l.a.y + (by - l.a.y) * p;
      ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fillStyle = palette.signal; ctx.fill();
    }
    // nodes
    for (const nd of nodes) {
      ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2); ctx.fillStyle = palette.node; ctx.fill();
    }
    // core
    const haloR = core.r * 2.8;
    const halo = ctx.createRadialGradient(core.x, core.y, core.r * 0.4, core.x, core.y, haloR);
    halo.addColorStop(0, withAlpha(palette.core, 0.28));
    halo.addColorStop(1, withAlpha(palette.core, 0));
    ctx.beginPath(); ctx.arc(core.x, core.y, haloR, 0, Math.PI * 2); ctx.fillStyle = halo; ctx.fill();
    ctx.beginPath(); ctx.arc(core.x, core.y, core.r * 1.7, 0, Math.PI * 2); ctx.strokeStyle = withAlpha(palette.core, 0.5); ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.arc(core.x, core.y, core.r, 0, Math.PI * 2); ctx.fillStyle = palette.core; ctx.fill();
    ctx.beginPath(); ctx.arc(core.x, core.y, core.r * 0.42, 0, Math.PI * 2); ctx.fillStyle = withAlpha(palette.signal, 0.9); ctx.fill();
  }

  // --- Colour helpers -------------------------------------------------------
  function withAlpha(color, a) {
    color = color.trim();
    if (color.startsWith('rgba')) {
      // replace existing alpha
      return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, (m, rgb) => `rgba(${rgb}, ${a})`);
    }
    if (color.startsWith('rgb(')) {
      return color.replace('rgb(', 'rgba(').replace(')', `, ${a})`);
    }
    if (color.startsWith('#')) {
      let h = color.slice(1);
      if (h.length === 3) h = h.split('').map((c) => c + c).join('');
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return color;
  }

  // --- Pointer --------------------------------------------------------------
  function onMove(e) {
    const rect = canvas.getBoundingClientRect();
    const px = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const py = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    pointer.x = px; pointer.y = py; pointer.active = true;
  }
  function onLeave() { pointer.active = false; pointer.x = -9999; pointer.y = -9999; }

  // --- Lifecycle ------------------------------------------------------------
  let started = false;
  function start() {
    resize();
    build();
    if (reduceMotion) {
      drawStatic();
      return;
    }
    if (started) return;
    started = true;
    running = true;
    t0 = performance.now();
    lastEmit = 0;
    raf = requestAnimationFrame(frame);
  }

  function restart() {
    resize();
    build();
    if (reduceMotion) { drawStatic(); return; }
    t0 = performance.now();
    lastEmit = 0;
  }

  // Debounced resize
  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(restart, 180);
  });

  // Pointer only when motion allowed (and desktop-ish; touch still gets a nudge)
  if (!reduceMotion) {
    canvas.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerleave', onLeave, { passive: true });
    canvas.addEventListener('touchmove', onMove, { passive: true });
    canvas.addEventListener('touchend', onLeave, { passive: true });
  }

  // Pause when the hero scrolls out of view to save battery.
  const heroSection = document.getElementById('hero');
  if ('IntersectionObserver' in window && heroSection && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          if (!running) { running = true; t0 = performance.now() - 3000; lastEmit = 0; raf = requestAnimationFrame(frame); }
        } else {
          running = false;
          cancelAnimationFrame(raf);
        }
      });
    }, { threshold: 0.02 });
    io.observe(heroSection);
  }

  // React to theme changes — re-read palette so colours track light/dark.
  const themeObserver = new MutationObserver(() => { palette = readPalette(); if (reduceMotion) drawStatic(); });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Easter egg hook: triple-click the logo (see script.js) fires a burst of
  // signals toward the core — the system "recalibrating". No-op under reduced
  // motion or when the hero is paused off-screen.
  // Handoff hook: the intro calls this the moment its overlay fades so the hero
  // replays its formation from a clean state, making the landed intro core flow
  // straight into the living-systems core. No-op under reduced motion.
  window.__prunaHeroKick = function () {
    if (reduceMotion) { drawStatic(); return; }
    restart();
    if (!running) { running = true; raf = requestAnimationFrame(frame); }
  };

  window.__prunaBurst = function () {
    if (reduceMotion || !running || !links.length) return;
    const n = 7;
    for (let i = 0; i < n; i++) {
      setTimeout(() => { if (running) emitSignal(); }, i * 70);
    }
    core.pulse = 1;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
