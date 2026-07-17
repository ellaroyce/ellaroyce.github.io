// ===========================================================================
// intro.js — "Mission" cinematic opening, FIRST-PERSON from inside the ship.
//
// The viewer sits in a rocket/spaceship cockpit (see cockpit.js): a front
// viewport framed by a canopy, with a premium mission-control dashboard below.
// Through the glass we fly across art-directed galaxies collecting data signals
// (confirmed on the instrument meters), detect a founder planet trapped in an
// uncertainty storm, lock the route, break through, arrive, and deploy a
// protective system around the planet — ending in a warm, stable, "made it"
// state with a connection/handshake cue that hands off to the Living Systems
// hero beneath.
//
// Directed beats (desktop): ignition -> transit/harvest -> detect/lock ->
// approach/breakthrough -> arrive/protect -> handoff. ~4.4s + short fade.
//
// The first frame paints synchronously: the cabin + live instruments are
// visible within ~100ms. No blank open, no freeze.
//
// window.PrunaIntro.play({force}) / .hasPlayed()
// ===========================================================================
(function () {
  'use strict';

  var SESSION_KEY = 'pruna_intro_played';
  var overlay = document.getElementById('intro');
  var canvas = document.getElementById('intro-canvas');
  if (!overlay || !canvas || !canvas.getContext || !window.PrunaCockpit) { unlockScroll(); return; }

  var ctx = canvas.getContext('2d', { alpha: true });
  var _arc = ctx.arc.bind(ctx);
  ctx.arc = function (x, y, r, s, e, cc) { return _arc(x, y, r > 0 ? r : 0, s, e, cc); };
  var _rg = ctx.createRadialGradient.bind(ctx);
  ctx.createRadialGradient = function (x0, y0, r0, x1, y1, r1) {
    return _rg(x0, y0, r0 > 0 ? r0 : 0, x1, y1, r1 > 0 ? r1 : 0);
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var prefersData = window.matchMedia('(prefers-reduced-data: reduce)').matches;
  function rgba(c, a) { return window.PrunaCockpit._rgba(c, a); }

  var P;
  function refreshPalette() { P = window.PrunaCockpit.palette(); }
  refreshPalette();

  // --- Sizing ---------------------------------------------------------------
  var W = 0, H = 0, DPR = 1, small = false, vp = null;
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    small = W < 720;
    DPR = Math.min(window.devicePixelRatio || 1, small ? 1.75 : 2);
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    vp = window.PrunaCockpit.viewport(W, H, small);
  }

  // --- Timeline (seconds) ---------------------------------------------------
  var T = small
    ? { ignite: 0.55, transit: 1.7, detect: 2.5, approach: 3.15, arrive: 3.55, done: 3.9 }
    : { ignite: 0.65, transit: 2.0, detect: 2.9, approach: 3.6, arrive: 4.05, done: 4.4 };

  // Handoff target = hero core position (must match hero.js build()).
  function coreTarget() {
    return { x: W * 0.62, y: H * 0.52, r: Math.max(9, Math.min(W, H) * 0.018) };
  }

  // --- Scene ----------------------------------------------------------------
  var stars, galaxies, signals, planet, storm, target;
  var rafId = 0, startT = 0, running = false, finished = false;
  var shakeSeed = Math.random() * 1000;
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
  function easeInOut(x) { return x < 0.5 ? 4*x*x*x : 1 - Math.pow(-2*x+2,3)/2; }
  function smooth(x){ x=clamp01(x); return x*x*(3-2*x); }

  function build() {
    refreshPalette();
    target = coreTarget();
    // Inner-viewport coordinate space (relative to the glass rect).
    var gx = vp.x, gy = vp.y, gw = vp.w, gh = vp.h;
    var cxg = gx + gw*0.5, cyg = gy + gh*0.5;

    // Starfield inside the viewport — depth cue, restrained.
    stars = [];
    var n = small ? 60 : 110;
    for (var i=0;i<n;i++){ stars.push({ x: gx+Math.random()*gw, y: gy+Math.random()*gh, z: rand(0.25,1), r: rand(0.5,1.7) }); }

    // Art-directed galaxy layers we fly through during transit — soft spiral
    // clouds tinted cobalt / mint, entering from the far center and sweeping past.
    galaxies = [
      { tint: P.cobalt, at: T.ignite+0.05, spin: 0.5,  seed: 1 },
      { tint: P.signal, at: T.ignite+0.55, spin: -0.4, seed: 2 },
      { tint: P.cobaltSoft, at: T.ignite+1.05, spin: 0.3, seed: 3 }
    ];

    // Data signals: originate in deep space (small far points) and stream toward
    // the ship (screen -> down into the dashboard), confirming capture.
    signals = [];
    var sn = small ? 7 : 11;
    for (var s=0;s<sn;s++){
      signals.push({
        appear: T.ignite + 0.15 + s*0.12,
        // start near vanishing point, drift out toward a viewport edge
        ang: rand(0, Math.PI*2), dist0: rand(gw*0.02, gw*0.06), dist1: rand(gw*0.32, gw*0.5),
        captured:false, capT:0, spin: rand(0,6.28)
      });
    }

    // Founder planet appears at the vanishing point then we approach it; final
    // handoff maps it to the hero core (outside the viewport, full screen).
    planet = { vx: cxg, vy: cyg, r: Math.max(10, Math.min(gw,gh)*0.05) };
    storm = [];
    var stn = small ? 16 : 26;
    for (var k=0;k<stn;k++){
      var a = (k/stn)*Math.PI*2*2 + rand(-0.2,0.2);
      var d = rand(planet.r*1.8, Math.min(gw,gh)*0.24);
      storm.push({ a:a, d:d, j:rand(0,6.28), js:rand(0.8,1.6), ja:rand(4,10)*(small?0.7:1), r:rand(1.4,2.8) });
    }
    finished = false;
  }

  // Mission state for the dashboard, derived from time.
  function missionState(tt) {
    var st = { t: tt, shake: 0, heading: 0, bearing: 0.15, lock: 0,
               meterA:0, meterB:0, meterC:0, capture:0, mission:'STANDBY', warn:0, protect:0 };
    // ignition vibration
    if (tt < T.ignite) st.shake = (1 - tt/T.ignite) * (small?3:5) + 1.5;
    // capture progression fills meters through transit
    var tr = clamp01((tt - T.ignite) / (T.detect - T.ignite));
    st.meterA = easeOut(clamp01(tr*1.1));
    st.meterB = easeOut(clamp01((tr-0.15)*1.2));
    st.meterC = easeOut(clamp01((tr-0.35)*1.3));
    // heading gently weaves during transit
    st.heading = Math.sin(tt*1.6)*0.4*(tt<T.detect?1:0.2);
    // detect -> lock
    if (tt >= T.detect) {
      st.lock = easeOut(clamp01((tt - T.detect)/(T.approach - T.detect)));
      st.bearing = 0; // centered on target
      st.heading = st.heading*(1-st.lock);
    }
    // breakthrough vibration near arrival
    if (tt >= T.approach && tt < T.arrive+0.2) st.shake = (small?4:6) * (1 - clamp01((tt-T.approach)/0.4));
    // mission text
    if (tt < T.ignite) st.mission = 'ignition';
    else if (tt < T.detect) { st.mission = 'transit · collecting signal'; }
    else if (tt < T.approach) { st.mission = 'founder planet detected'; st.warn = 1; }
    else if (tt < T.arrive) { st.mission = 'breaking through'; }
    else { st.mission = 'arrived · protected'; st.protect = 1; st.lock = 1; st.meterA=st.meterB=st.meterC=1; }
    return st;
  }

  // Draw a soft spiral galaxy at (x,y).
  function drawGalaxy(x, y, r, tint, spin, a, seed) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(spin);
    ctx.globalAlpha = a;
    // core glow
    var g = ctx.createRadialGradient(0,0,0,0,0,r);
    g.addColorStop(0, rgba(tint, 0.5));
    g.addColorStop(0.3, rgba(tint, 0.18));
    g.addColorStop(1, rgba(tint, 0));
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.fill();
    // two faint spiral arms
    ctx.strokeStyle = rgba(tint, 0.35);
    ctx.lineWidth = Math.max(1, r*0.03);
    for (var arm=0;arm<2;arm++){
      ctx.beginPath();
      for (var tS=0;tS<=1;tS+=0.05){
        var ang = arm*Math.PI + tS*Math.PI*1.8;
        var rr2 = tS*r*0.95;
        var px = Math.cos(ang)*rr2, py = Math.sin(ang)*rr2*0.6;
        if (tS===0) ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  // Render the whole cabin + scene.
  function render(tt) {
    var st = missionState(tt);
    // whole-cabin vibration (subtle) — applied to everything via translate
    var vibX = st.shake ? Math.sin(tt*70+shakeSeed)*st.shake*0.4 : 0;
    var vibY = st.shake ? Math.cos(tt*58+shakeSeed)*st.shake*0.4 : 0;

    // Base cabin fill (so no white flash / no transparent gaps)
    ctx.fillStyle = P.frame;
    ctx.fillRect(0,0,W,H);

    // ---- SPACE SCENE inside the viewport glass ----------------------------
    ctx.save();
    ctx.translate(vibX, vibY);
    window.PrunaCockpit.clipViewport(ctx, vp);

    var gx=vp.x, gy=vp.y, gw=vp.w, gh=vp.h;
    var cxg = gx+gw*0.5, cyg = gy+gh*0.5;

    // deep-space backdrop
    var bg = ctx.createRadialGradient(cxg, cyg, 0, cxg, cyg, Math.max(gw,gh)*0.7);
    bg.addColorStop(0, P.light ? window.PrunaCockpit._mix(P.bg,'#ffffff',0.12) : P.bg);
    bg.addColorStop(1, P.bgDeep);
    ctx.fillStyle = bg;
    ctx.fillRect(gx, gy, gw, gh);

    // Ignition corridor: a clear moving reference from the very first paint.
    // This prevents the opening from reading as a frozen empty viewport,
    // especially in the bright cabin where individual stars are subtler.
    if (tt < T.ignite) {
      var ignition = clamp01(tt / T.ignite);
      var pulse = 0.72 + Math.sin(tt * 18) * 0.12;
      for (var ir = 0; ir < 4; ir++) {
        var phase = (ignition * 1.8 + ir / 4) % 1;
        var radius = Math.min(gw, gh) * (0.055 + phase * 0.42);
        ctx.beginPath();
        ctx.ellipse(cxg, cyg, radius * 1.65, radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(ir % 2 ? P.signal : P.cobalt, (1 - phase) * 0.42 * pulse);
        ctx.lineWidth = P.light ? 1.8 : 1.4;
        ctx.stroke();
      }
      var ignitionGlow = ctx.createRadialGradient(cxg, cyg, 0, cxg, cyg, Math.min(gw, gh) * 0.16);
      ignitionGlow.addColorStop(0, rgba(P.cobalt, P.light ? 0.18 : 0.24));
      ignitionGlow.addColorStop(0.45, rgba(P.signal, P.light ? 0.08 : 0.10));
      ignitionGlow.addColorStop(1, rgba(P.cobalt, 0));
      ctx.fillStyle = ignitionGlow;
      ctx.fillRect(gx, gy, gw, gh);
      ctx.strokeStyle = rgba(P.cobalt, P.light ? 0.46 : 0.34);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cxg - gw * 0.12, cyg); ctx.lineTo(cxg + gw * 0.12, cyg);
      ctx.moveTo(cxg, cyg - gh * 0.12); ctx.lineTo(cxg, cyg + gh * 0.12);
      ctx.stroke();
    }

    // velocity: stars streak radially from the vanishing point (we're moving fwd)
    var vel = Math.max(0.24, clamp01((tt - T.ignite*0.08)/0.52))
      * (tt < T.arrive ? 1 : easeOut(clamp01(1-(tt-T.arrive)/0.3)));
    for (var i=0;i<stars.length;i++){
      var stt = stars[i];
      var dx = stt.x - cxg, dy = stt.y - cyg;
      var len = vel * stt.z * (small?18:30);
      var d = Math.hypot(dx,dy) || 1;
      ctx.strokeStyle = rgba(P.node, (P.light?0.35:0.28)+stt.z*0.35);
      ctx.lineWidth = stt.r*stt.z*0.9;
      ctx.beginPath(); ctx.moveTo(stt.x, stt.y); ctx.lineTo(stt.x - dx/d*len, stt.y - dy/d*len); ctx.stroke();
      // move outward
      stt.x += dx/d * (0.4 + stt.z*1.4) * (vel*4+0.2);
      stt.y += dy/d * (0.4 + stt.z*1.4) * (vel*4+0.2);
      if (stt.x<gx||stt.x>gx+gw||stt.y<gy||stt.y>gy+gh){ stt.x=cxg+rand(-gw*0.04,gw*0.04); stt.y=cyg+rand(-gh*0.04,gh*0.04); }
    }

    // galaxies sweep past during transit (grow + drift outward)
    for (var gi=0; gi<galaxies.length; gi++){
      var gl = galaxies[gi];
      var life = clamp01((tt - gl.at)/1.1);
      if (life<=0 || life>=1 || tt>T.detect+0.3) continue;
      var a = Math.sin(life*Math.PI) * 0.9;
      var off = (gi-1)*gw*0.16;
      var gxp = cxg + off + Math.cos(gl.seed)*gw*0.05;
      var gyp = cyg + Math.sin(gl.seed*2)*gh*0.12;
      var gr = (small?60:110) * (0.4 + life*1.1);
      drawGalaxy(gxp, gyp, gr, gl.tint, gl.spin + tt*0.2, a, gl.seed);
    }

    // data signals stream out from vanishing point; captured near edges -> to dash
    for (var s=0;s<signals.length;s++){
      var sg = signals[s];
      var ap = clamp01((tt - sg.appear)/0.5);
      if (ap<=0 || tt>T.detect+0.2) continue;
      var prog = clamp01((tt - sg.appear)/0.9);
      var dd = sg.dist0 + (sg.dist1 - sg.dist0)*easeOut(prog);
      var sx = cxg + Math.cos(sg.ang)*dd;
      var sy = cyg + Math.sin(sg.ang)*dd*0.7;
      var a = ap * (1-clamp01((prog-0.7)/0.3));
      if (a<=0) continue;
      sg.spin += 0.08;
      // signal glyph: small framed diamond
      ctx.save(); ctx.translate(sx,sy); ctx.rotate(sg.spin); ctx.globalAlpha=a;
      ctx.strokeStyle = rgba(P.signal, 0.9); ctx.lineWidth=1.3;
      var r=3.2; ctx.beginPath(); ctx.moveTo(0,-r); ctx.lineTo(r,0); ctx.lineTo(0,r); ctx.lineTo(-r,0); ctx.closePath(); ctx.stroke();
      ctx.fillStyle=rgba(P.signal,1); ctx.beginPath(); ctx.arc(0,0,1.2,0,Math.PI*2); ctx.fill();
      ctx.restore(); ctx.globalAlpha=1;
      // faint capture line toward the dashboard center-bottom
      if (prog>0.5){
        ctx.strokeStyle = rgba(P.signal, (prog-0.5)*0.5*a);
        ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(cxg, gy+gh); ctx.stroke();
      }
    }

    // DETECT -> founder planet at vanishing point, storm around it, then approach
    if (tt >= T.detect - 0.2) {
      var det = clamp01((tt-(T.detect-0.2))/0.5);
      var app = clamp01((tt - T.approach)/(T.arrive - T.approach)); // approach growth
      var organise = clamp01((tt - T.arrive)/0.5);
      // planet grows as we approach (zoom toward it)
      var pr = planet.r * (0.5 + det*0.5) * (1 + app*2.2);
      var px = cxg, py = cyg;
      // storm ring
      for (var k=0;k<storm.length;k++){
        var sd = storm[k];
        var jx = Math.cos(sd.j + tt*sd.js)*sd.ja*(1-organise);
        var jy = Math.sin(sd.j + tt*sd.js)*sd.ja*(1-organise);
        var dd2 = sd.d * (1+app*1.6);
        var nx = px + Math.cos(sd.a)*dd2 + jx;
        var ny = py + Math.sin(sd.a)*dd2*0.7 + jy;
        // links (noisy before arrival, ordered after)
        if (organise < 0.9 && k%2===0 && k+1<storm.length){
          var sd2 = storm[k+1];
          var nx2 = px+Math.cos(sd2.a)*sd2.d*(1+app*1.6), ny2 = py+Math.sin(sd2.a)*sd2.d*0.7*(1+app*1.6);
          ctx.strokeStyle = rgba(P.node, det*(1-organise)*0.4); ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(nx2,ny2); ctx.stroke();
        }
        if (organise>0.1){
          ctx.strokeStyle = rgba(P.cobalt, organise*0.5); ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(nx,ny); ctx.lineTo(px,py); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(nx,ny,sd.r,0,Math.PI*2);
        ctx.fillStyle = organise>0.5?rgba(P.node,0.95):rgba(P.node,0.4+det*0.4); ctx.fill();
      }
      // planet body
      var pg = ctx.createRadialGradient(px-pr*0.3, py-pr*0.3, pr*0.1, px, py, pr);
      pg.addColorStop(0, rgba(P.cobaltSoft, 0.95));
      pg.addColorStop(0.7, rgba(P.cobalt, 0.9));
      pg.addColorStop(1, rgba(P.cobalt, 0.2));
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fillStyle=pg; ctx.fill();
      ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2);
      ctx.strokeStyle = rgba(P.fg, 0.5*det); ctx.lineWidth=1.5; ctx.stroke();
      // mint signal core
      ctx.beginPath(); ctx.arc(px,py,pr*0.32,0,Math.PI*2); ctx.fillStyle=rgba(P.signal, 0.9); ctx.fill();

      // PROTECT: geodesic shield deploys around planet after arrival
      if (organise>0.05){
        drawShield(px, py, pr*1.7, organise, tt);
        // handshake: two dots meet below the planet
        var meet = clamp01((organise-0.3)/0.5);
        if (meet>0){
          var gap = (1-meet)*pr*1.2;
          var ay = py + pr*1.4;
          ctx.strokeStyle = rgba(P.fg, 0.7*meet); ctx.lineWidth=1.6;
          ctx.beginPath(); ctx.moveTo(px-gap-pr*0.1, ay); ctx.lineTo(px-2, ay); ctx.stroke();
          ctx.strokeStyle = rgba(P.cobalt, 0.8*meet);
          ctx.beginPath(); ctx.moveTo(px+gap+pr*0.1, ay); ctx.lineTo(px+2, ay); ctx.stroke();
          ctx.beginPath(); ctx.arc(px-gap-pr*0.1, ay, 2.8, 0, Math.PI*2); ctx.fillStyle=P.signal; ctx.fill();
          ctx.beginPath(); ctx.arc(px+gap+pr*0.1, ay, 2.8, 0, Math.PI*2); ctx.fillStyle=P.cobaltSoft; ctx.fill();
        }
      }
    }

    ctx.restore(); // end viewport clip

    // ---- COCKPIT FRAME + DASHBOARD over the glass --------------------------
    ctx.save();
    ctx.translate(vibX*0.5, vibY*0.5);
    window.PrunaCockpit.drawFrame(ctx, W, H, vp, P, {});
    window.PrunaCockpit.drawPanel(ctx, W, H, vp, P, st);
    ctx.restore();

    // Warm arrival wash — a gentle relief glow across the cabin at the end.
    if (tt >= T.arrive) {
      var warm = easeOut(clamp01((tt - T.arrive)/0.5));
      var wg = ctx.createRadialGradient(W*0.5, vp.y+vp.h*0.5, 0, W*0.5, vp.y+vp.h*0.5, Math.max(W,H)*0.6);
      wg.addColorStop(0, rgba(P.signal, 0.10*warm));
      wg.addColorStop(1, rgba(P.signal, 0));
      ctx.fillStyle = wg; ctx.fillRect(0,0,W,H);
    }
  }

  // Geodesic protective shield (bespoke — not code-rain).
  function drawShield(cx, cy, r, k, tt) {
    ctx.save();
    var a = easeOut(k);
    // boundary ring
    ctx.strokeStyle = rgba(P.cobalt, 0.6*a); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    // spokes + facets
    var seg = 10;
    ctx.strokeStyle = rgba(P.cobaltSoft, 0.4*a); ctx.lineWidth=1;
    for (var i=0;i<seg;i++){
      var ang = (i/seg)*Math.PI*2 + tt*0.15;
      var x1 = cx+Math.cos(ang)*r*0.35, y1=cy+Math.sin(ang)*r*0.35;
      var x2 = cx+Math.cos(ang)*r, y2=cy+Math.sin(ang)*r;
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      var ang2=((i+1)/seg)*Math.PI*2 + tt*0.15;
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(cx+Math.cos(ang2)*r, cy+Math.sin(ang2)*r);
      ctx.stroke();
      // vertex node
      ctx.beginPath(); ctx.arc(x2,y2,1.6,0,Math.PI*2); ctx.fillStyle=rgba(P.signal,0.8*a); ctx.fill();
    }
    // inner concentric strut
    ctx.strokeStyle = rgba(P.cobalt, 0.3*a);
    ctx.beginPath(); ctx.arc(cx,cy,r*0.62,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  function frame(now) {
    if (!running) return;
    var tt = (now - startT)/1000;
    ctx.clearRect(0,0,W,H);
    render(tt);
    if (tt >= T.done) { finish(); return; }
    rafId = requestAnimationFrame(frame);
  }

  // --- SR status ------------------------------------------------------------
  var statusEl = document.getElementById('intro-status');
  function announce() {
    if (!statusEl) return;
    var de = document.documentElement.getAttribute('lang') === 'de';
    statusEl.textContent = de
      ? 'Intro-Animation: Ein Missionsflug aus dem Cockpit, der auf der Startseite ankommt.'
      : 'Intro animation: a cockpit mission flight that arrives at the homepage.';
  }

  // --- Finish / cleanup -----------------------------------------------------
  function finish() {
    if (finished) return;
    finished = true; running = false;
    cancelAnimationFrame(rafId);
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) {}
    overlay.classList.add('intro--out');
    unlockScroll();
    var onEnd = function () {
      overlay.classList.add('intro--hidden');
      overlay.setAttribute('aria-hidden', 'true');
      teardown();
    };
    overlay.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, 1000);
    if (typeof window.__prunaHeroKick === 'function') window.__prunaHeroKick();
  }
  function teardown() {
    window.removeEventListener('resize', onResize);
    document.removeEventListener('keydown', onKey);
    if (skipBtn) skipBtn.removeEventListener('click', onSkip);
  }

  function lockScroll(){ document.documentElement.classList.add('intro-lock'); document.body.classList.add('intro-lock'); }
  function unlockScroll(){ document.documentElement.classList.remove('intro-lock'); document.body.classList.remove('intro-lock'); }

  var skipBtn = document.getElementById('intro-skip');
  function onSkip(){ finish(); }
  function onKey(e){ if (e.key === 'Escape'){ e.preventDefault(); finish(); } }
  var onResize = function () { resize(); build(); if (!running && !reduceMotion && !finished) render((performance.now()-startT)/1000); };

  // --- Reduced motion: static protected cabin, then reveal ------------------
  function playReduced() {
    resize(); build();
    ctx.clearRect(0,0,W,H);
    // draw a single calm arrived frame
    var st = missionState(T.done);
    // scene
    ctx.fillStyle = P.frame; ctx.fillRect(0,0,W,H);
    ctx.save(); window.PrunaCockpit.clipViewport(ctx, vp);
    var bg = ctx.createRadialGradient(vp.x+vp.w*0.5, vp.y+vp.h*0.5, 0, vp.x+vp.w*0.5, vp.y+vp.h*0.5, Math.max(vp.w,vp.h)*0.7);
    bg.addColorStop(0, P.bg); bg.addColorStop(1, P.bgDeep);
    ctx.fillStyle=bg; ctx.fillRect(vp.x,vp.y,vp.w,vp.h);
    var px=vp.x+vp.w*0.5, py=vp.y+vp.h*0.5, pr=Math.min(vp.w,vp.h)*0.12;
    var pg = ctx.createRadialGradient(px-pr*0.3,py-pr*0.3,pr*0.1,px,py,pr);
    pg.addColorStop(0, rgba(P.cobaltSoft,0.95)); pg.addColorStop(0.7,rgba(P.cobalt,0.9)); pg.addColorStop(1,rgba(P.cobalt,0.2));
    ctx.beginPath(); ctx.arc(px,py,pr,0,Math.PI*2); ctx.fillStyle=pg; ctx.fill();
    ctx.beginPath(); ctx.arc(px,py,pr*0.32,0,Math.PI*2); ctx.fillStyle=rgba(P.signal,0.9); ctx.fill();
    drawShield(px,py,pr*1.7,1,0);
    ctx.restore();
    window.PrunaCockpit.drawFrame(ctx, W, H, vp, P, {});
    window.PrunaCockpit.drawPanel(ctx, W, H, vp, P, st);
    announce();
    setTimeout(finish, 480);
  }

  // --- Play -----------------------------------------------------------------
  function play(opts) {
    opts = opts || {};
    finished = false;
    overlay.classList.remove('intro--out','intro--hidden');
    overlay.setAttribute('aria-hidden','false');
    lockScroll();
    resize(); build();
    document.addEventListener('keydown', onKey);
    if (skipBtn) skipBtn.addEventListener('click', onSkip);
    window.addEventListener('resize', onResize);

    if (reduceMotion) { playReduced(); return; }
    announce();
    running = true;
    startT = performance.now();
    // Paint the first frame synchronously — cabin + live instruments visible now.
    render(0);
    rafId = requestAnimationFrame(frame);
  }

  window.PrunaIntro = {
    play: function (o) { play(o || {}); },
    hasPlayed: function () { try { return sessionStorage.getItem(SESSION_KEY) === '1'; } catch (e) { return false; } }
  };

  // Auto-run once per session.
  var already = window.PrunaIntro.hasPlayed();
  // Never hold the page behind a cinematic for visitors who have requested
  // reduced motion. The replay control still offers the calm static frame.
  if (already || reduceMotion || prefersData) {
    overlay.classList.add('intro--hidden');
    overlay.setAttribute('aria-hidden','true');
    unlockScroll();
    finished = true;
  } else {
    lockScroll();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ play(); }, { once: true });
    } else { play(); }
  }
})();
