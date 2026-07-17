// ===========================================================================
// cockpit.js — first-person rocket/spaceship cockpit, drawn in Canvas 2D.
//
// The viewer sits INSIDE the ship. We draw:
//   - a front viewport opening (rounded trapezoid) through which space is seen
//   - an angled canopy frame / A-pillars around the glass
//   - a dashboard along the bottom holding a premium mission-control panel:
//       * navigation arc (heading + target bearing)
//       * signal / data-capture meters (fill bars that rise as data is caught)
//       * mission-state readout (staged text)
//       * target-lock reticle (locks onto the founder planet)
//       * a couple of tactile controls (dials + toggles)
//
// Restrained aerospace hardware, not a busy gamer HUD or 1990s skeuomorphism.
// Theme-adaptive: derives frame / panel / ink / glass tints from --fg/--bg so
// every element has strong contrast on both the dark cabin and the light
// daylight control-cabin.
//
// window.PrunaCockpit:
//   .palette()                            -> theme-derived colours
//   .viewport(W,H,small)                  -> {x,y,w,h,r} inner glass rect (a
//                                            clip region for the space scene)
//   .clipViewport(ctx, vp)                -> apply rounded-rect clip
//   .drawFrame(ctx, W,H, vp, P, opts)     -> canopy/pillars over the glass edge
//   .drawPanel(ctx, W,H, vp, P, state)    -> the instrument dashboard
//        state: { capture:0..1, meterA:0..1, meterB:0..1, meterC:0..1,
//                 heading:-1..1, bearing:-1..1, lock:0..1, mission:"text",
//                 shake:px, warn:0..1, protect:0..1 }
// ===========================================================================
(function () {
  'use strict';

  function toRgb(c) {
    c = (c || '').trim();
    if (c.charAt(0) === '#') {
      var h = c.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16); return [(n>>16)&255,(n>>8)&255,n&255];
    }
    var m = c.match(/rgba?\(([^)]+)\)/);
    if (m) { var p = m[1].split(',').map(parseFloat); return [p[0],p[1],p[2]]; }
    return [255,255,255];
  }
  function mix(a, b, t) { var x=toRgb(a), y=toRgb(b);
    return 'rgb('+Math.round(x[0]+(y[0]-x[0])*t)+','+Math.round(x[1]+(y[1]-x[1])*t)+','+Math.round(x[2]+(y[2]-x[2])*t)+')'; }
  function rgba(c, a) { var v=toRgb(c); return 'rgba('+v[0]+','+v[1]+','+v[2]+','+a+')'; }

  function palette() {
    var cs = getComputedStyle(document.documentElement);
    var g = function (n, f) { return (cs.getPropertyValue(n).trim() || f); };
    var light = document.documentElement.getAttribute('data-theme') === 'light';
    var fg = g('--fg', light ? '#0c1424' : '#f4efe6');
    var bg = g('--bg', light ? '#f5f3ec' : '#0c1220');
    var bgDeep = g('--bg-deep', light ? '#eae6db' : '#070b14');
    return {
      light: light,
      fg: fg, bg: bg, bgDeep: bgDeep,
      cobalt: g('--cobalt', light ? '#2151d8' : '#3f78ff'),
      cobaltSoft: g('--cobalt-soft', light ? '#3f78ff' : '#6a97ff'),
      signal: g('--signal', light ? '#6ba300' : '#b7f24a'),
      node: g('--viz-node', light ? '#4a5a7d' : '#9fb2d4'),
      // cabin materials
      frame: light ? mix(bg, fg, 0.16) : mix(bg, fg, 0.14),      // canopy body
      frameEdge: light ? mix(fg, bg, 0.15) : mix(bg, fg, 0.42),  // edge highlight
      frameDeep: light ? mix(bg, fg, 0.30) : mix(bgDeep, '#000000', 0.15),
      panel: light ? mix(bg, fg, 0.10) : mix(bg, fg, 0.10),      // dashboard face
      panelEdge: light ? mix(fg, bg, 0.25) : mix(bg, fg, 0.40),
      ink: light ? mix(fg, bg, 0.10) : mix(fg, bg, 0.05),        // labels / strong lines
      inkMute: light ? mix(fg, bg, 0.45) : mix(fg, bg, 0.42),
      glassTint: light ? rgba(g('--cobalt','#2151d8'), 0.05) : rgba(g('--cobalt','#3f78ff'), 0.06)
    };
  }

  // Rounded-rect path helper.
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  // The inner glass viewport where the space scene is drawn. It is a wide
  // rounded rectangle occupying the upper-centre of the cabin; the dashboard
  // sits below it.
  function viewport(W, H, small) {
    var dashH = small ? Math.min(H * 0.24, 210) : Math.min(H * 0.22, 240);
    var padX = small ? W * 0.05 : W * 0.09;
    var padTop = small ? H * 0.06 : H * 0.07;
    var x = padX, y = padTop;
    var w = W - padX * 2;
    var h = H - dashH - padTop - (small ? 14 : 22);
    var r = small ? 22 : 40;
    return { x: x, y: y, w: w, h: h, r: r, dashH: dashH };
  }

  function clipViewport(ctx, vp) {
    rr(ctx, vp.x, vp.y, vp.w, vp.h, vp.r);
    ctx.clip();
  }

  // Canopy frame drawn OVER the glass edges: thick rounded bezel + angled
  // A-pillars + a subtle top brow. Gives the "sitting inside" feeling.
  function drawFrame(ctx, W, H, vp, P, opts) {
    opts = opts || {};
    // Fill the whole cabin behind everything with frame material, then punch
    // the glass out is done by the caller via clip; here we only draw the bezel
    // and structure that overlaps the glass edge.

    // Outer bezel: draw frame-coloured ring by stroking a fat rounded rect.
    ctx.save();
    // brow gradient at the very top (canopy roof)
    var brow = ctx.createLinearGradient(0, vp.y - 40, 0, vp.y + 30);
    brow.addColorStop(0, P.frameDeep);
    brow.addColorStop(1, rgba(P.frame, 0));
    ctx.fillStyle = brow;
    ctx.fillRect(0, 0, W, vp.y + 30);

    // The bezel itself
    var bezelW = opts.bezel || (W < 720 ? 12 : 18);
    rr(ctx, vp.x, vp.y, vp.w, vp.h, vp.r);
    ctx.lineWidth = bezelW;
    ctx.strokeStyle = P.frame;
    ctx.stroke();
    // inner edge highlight
    rr(ctx, vp.x, vp.y, vp.w, vp.h, vp.r);
    ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(P.frameEdge, 0.9);
    ctx.stroke();
    // outer edge shade
    rr(ctx, vp.x - bezelW/2, vp.y - bezelW/2, vp.w + bezelW, vp.h + bezelW, vp.r + bezelW/2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(P.frameDeep, 0.8);
    ctx.stroke();

    // A-pillars: angled struts from the top corners toward the roof, implying a
    // canopy. Kept subtle so they don't dominate.
    ctx.fillStyle = P.frame;
    ctx.strokeStyle = rgba(P.frameEdge, 0.7);
    ctx.lineWidth = 1.5;
    var pin = W < 720 ? 26 : 40;
    // left pillar
    ctx.beginPath();
    ctx.moveTo(vp.x - bezelW/2, vp.y + vp.r);
    ctx.lineTo(vp.x - bezelW/2 - pin, 0);
    ctx.lineTo(vp.x - bezelW/2 - pin + (W<720?16:24), 0);
    ctx.lineTo(vp.x + vp.r, vp.y - bezelW/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // right pillar
    ctx.beginPath();
    ctx.moveTo(vp.x + vp.w + bezelW/2, vp.y + vp.r);
    ctx.lineTo(vp.x + vp.w + bezelW/2 + pin, 0);
    ctx.lineTo(vp.x + vp.w + bezelW/2 + pin - (W<720?16:24), 0);
    ctx.lineTo(vp.x + vp.w - vp.r, vp.y - bezelW/2);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    // fill the corners outside the glass on the sides with frame material
    ctx.fillStyle = P.frame;
    ctx.fillRect(0, 0, vp.x - bezelW/2 + 1, vp.y + vp.h);
    ctx.fillRect(vp.x + vp.w + bezelW/2 - 1, 0, W - (vp.x + vp.w) + bezelW, vp.y + vp.h);

    // a couple of rivet ticks on the bezel for tactility
    ctx.fillStyle = rgba(P.frameEdge, 0.8);
    var ys = [vp.y + vp.h*0.3, vp.y + vp.h*0.7];
    for (var i=0;i<ys.length;i++){
      ctx.beginPath(); ctx.arc(vp.x + 3, ys[i], 1.6, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(vp.x + vp.w - 3, ys[i], 1.6, 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  // A small circular gauge with a sweep needle.
  function gauge(ctx, cx, cy, r, val, P, accent, label) {
    ctx.save();
    // dial face
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = P.panel; ctx.fill();
    ctx.lineWidth = 1.4; ctx.strokeStyle = rgba(P.panelEdge, 0.9); ctx.stroke();
    // ticks
    ctx.strokeStyle = rgba(P.inkMute, 0.7); ctx.lineWidth = 1;
    for (var a=0;a<12;a++){
      var ang = -Math.PI*0.75 + (a/11)*Math.PI*1.5;
      var x1=cx+Math.cos(ang)*(r-2), y1=cy+Math.sin(ang)*(r-2);
      var x2=cx+Math.cos(ang)*(r-5), y2=cy+Math.sin(ang)*(r-5);
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    }
    // needle
    var na = -Math.PI*0.75 + Math.max(0,Math.min(1,(val+1)/2))*Math.PI*1.5;
    ctx.strokeStyle = accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(na)*(r-4), cy+Math.sin(na)*(r-4)); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,2,0,Math.PI*2); ctx.fillStyle=P.ink; ctx.fill();
    if (label) { ctx.fillStyle = rgba(P.inkMute,0.95); ctx.font = '9px ui-monospace, monospace'; ctx.textAlign='center';
      ctx.fillText(label, cx, cy+r+11); }
    ctx.restore();
  }

  // A vertical/horizontal fill meter with label — used for data capture.
  function meter(ctx, x, y, w, h, val, P, accent, label) {
    ctx.save();
    rr(ctx, x, y, w, h, 3);
    ctx.fillStyle = P.panel; ctx.fill();
    ctx.lineWidth = 1; ctx.strokeStyle = rgba(P.panelEdge,0.9); ctx.stroke();
    // fill
    var fw = (w-4) * Math.max(0,Math.min(1,val));
    if (fw > 0.5) {
      rr(ctx, x+2, y+2, fw, h-4, 2);
      var gr = ctx.createLinearGradient(x, 0, x+w, 0);
      gr.addColorStop(0, accent); gr.addColorStop(1, mix(accent, P.bg, 0.15));
      ctx.fillStyle = gr; ctx.fill();
    }
    // segment ticks
    ctx.strokeStyle = rgba(P.bg, P.light?0.5:0.6); ctx.lineWidth = 1;
    for (var s=1;s<6;s++){ var sx=x+ (w/6)*s; ctx.beginPath(); ctx.moveTo(sx,y+1); ctx.lineTo(sx,y+h-1); ctx.stroke(); }
    if (label){ ctx.fillStyle=rgba(P.inkMute,0.95); ctx.font='9px ui-monospace, monospace'; ctx.textAlign='left';
      ctx.fillText(label, x, y-4); }
    ctx.restore();
  }

  // The dashboard: a solid instrument face across the bottom with clusters.
  function drawPanel(ctx, W, H, vp, P, st) {
    st = st || {};
    var top = vp.y + vp.h + (W<720?10:16);
    var h = H - top;
    var small = W < 720;
    ctx.save();

    // panel body with a soft top light
    var pg = ctx.createLinearGradient(0, top, 0, H);
    pg.addColorStop(0, mix(P.frame, P.bg, 0.15));
    pg.addColorStop(0.12, P.frame);
    pg.addColorStop(1, P.frameDeep);
    ctx.fillStyle = pg;
    ctx.fillRect(0, top, W, h);
    // top edge highlight (dash lip)
    ctx.fillStyle = rgba(P.frameEdge, 0.9);
    ctx.fillRect(0, top, W, 2);
    ctx.fillStyle = rgba(P.frameDeep, 0.9);
    ctx.fillRect(0, top+2, W, 1);

    // subtle vibration jitter applied to instrument contents only
    var jx = st.shake ? (Math.random()-0.5)*st.shake*0.6 : 0;
    var jy = st.shake ? (Math.random()-0.5)*st.shake*0.6 : 0;
    ctx.translate(jx, jy);

    var midY = top + h*0.5;

    // ---- LEFT cluster: navigation arc (heading vs bearing) ----------------
    var navR = Math.min(h*0.34, small?34:46);
    var navX = small ? W*0.16 : W*0.14;
    // nav housing
    rr(ctx, navX-navR-8, midY-navR-8, (navR+8)*2, (navR+8)*2, 10);
    ctx.fillStyle = P.panel; ctx.fill();
    ctx.strokeStyle = rgba(P.panelEdge,0.9); ctx.lineWidth=1.4; ctx.stroke();
    // arc scale
    ctx.strokeStyle = rgba(P.inkMute,0.8); ctx.lineWidth=2;
    ctx.beginPath(); ctx.arc(navX, midY, navR, Math.PI*0.85, Math.PI*0.15, false); ctx.stroke();
    // heading marker
    var hb = Math.max(-1,Math.min(1, st.heading||0));
    var ha = Math.PI*0.85 + (hb+1)/2*(Math.PI*1.3);
    ctx.strokeStyle = P.cobalt; ctx.lineWidth=2.4;
    ctx.beginPath(); ctx.moveTo(navX,midY); ctx.lineTo(navX+Math.cos(ha)*navR, midY+Math.sin(ha)*navR); ctx.stroke();
    // target bearing marker (mint)
    var bb = Math.max(-1,Math.min(1, st.bearing==null?0.2:st.bearing));
    var ba = Math.PI*0.85 + (bb+1)/2*(Math.PI*1.3);
    ctx.fillStyle = P.signal;
    ctx.beginPath(); ctx.arc(navX+Math.cos(ba)*navR, midY+Math.sin(ba)*navR, 3.4, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = rgba(P.inkMute,0.95); ctx.font='9px ui-monospace, monospace'; ctx.textAlign='center';
    ctx.fillText('NAV', navX, midY+navR+13);
    // center hub
    ctx.beginPath(); ctx.arc(navX,midY,2.5,0,Math.PI*2); ctx.fillStyle=P.ink; ctx.fill();

    // ---- CENTRE cluster: mission state + capture meters -------------------
    var cx = W*0.5;
    // mission-state readout plate
    var plateW = small ? W*0.44 : Math.min(W*0.30, 360);
    rr(ctx, cx-plateW/2, top+ (small?10:14), plateW, small?20:24, 5);
    ctx.fillStyle = mix(P.panel, P.bg, 0.2); ctx.fill();
    ctx.strokeStyle = rgba(P.panelEdge,0.9); ctx.lineWidth=1; ctx.stroke();
    // status LED
    var ledC = st.warn ? P.signal : (st.protect ? P.signal : P.cobalt);
    ctx.beginPath(); ctx.arc(cx-plateW/2+12, top+(small?20:26), 3.4, 0, Math.PI*2);
    ctx.fillStyle = ledC; ctx.fill();
    ctx.shadowColor = ledC; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
    // mission text
    ctx.fillStyle = P.ink; ctx.font = (small?'10px':'11px')+' ui-monospace, monospace';
    ctx.textAlign='left'; ctx.textBaseline='middle';
    ctx.fillText((st.mission||'STANDBY').toUpperCase(), cx-plateW/2+24, top+(small?20:26));
    ctx.textBaseline='alphabetic';

    // capture meters row
    var mW = small ? W*0.13 : Math.min(W*0.09, 120);
    var mGap = small ? 8 : 14;
    var totalW = mW*3 + mGap*2;
    var mx0 = cx - totalW/2;
    var my = midY + (small?4:2);
    meter(ctx, mx0,          my, mW, small?9:11, st.meterA||0, P, P.signal, 'SIGNAL');
    meter(ctx, mx0+mW+mGap,  my, mW, small?9:11, st.meterB||0, P, P.cobaltSoft, 'DATA');
    meter(ctx, mx0+2*(mW+mGap), my, mW, small?9:11, st.meterC||0, P, P.signal, 'MAP');

    // capture pulse: when capture>0, a signal glyph flies toward centre meters
    if (st.capture && st.capture>0.01) {
      var cpx = cx, cpy = midY - (small?18:24);
      ctx.beginPath(); ctx.arc(cpx, cpy, 2.5 + st.capture*3, 0, Math.PI*2);
      ctx.fillStyle = rgba(P.signal, 0.5+st.capture*0.5); ctx.fill();
    }

    // ---- RIGHT cluster: target-lock reticle + tactile controls -----------
    var lockX = small ? W*0.80 : W*0.82, lockR = Math.min(h*0.32, small?28:38);
    rr(ctx, lockX-lockR-8, midY-lockR-8, (lockR+8)*2, (lockR+8)*2, 10);
    ctx.fillStyle = P.panel; ctx.fill();
    ctx.strokeStyle = rgba(P.panelEdge,0.9); ctx.lineWidth=1.4; ctx.stroke();
    var lock = Math.max(0,Math.min(1, st.lock||0));
    // reticle rings
    ctx.strokeStyle = rgba(lock>0.5?P.signal:P.inkMute, 0.9); ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.arc(lockX, midY, lockR*0.7, 0, Math.PI*2); ctx.stroke();
    // corner brackets that close in as lock increases
    var br = lockR*(1 - lock*0.35);
    ctx.strokeStyle = lock>0.5?P.signal:P.cobalt; ctx.lineWidth=2;
    var cor=[[-1,-1],[1,-1],[1,1],[-1,1]];
    for (var c=0;c<4;c++){ var dx=cor[c][0], dy=cor[c][1];
      ctx.beginPath();
      ctx.moveTo(lockX+dx*br, midY+dy*br - dy*7);
      ctx.lineTo(lockX+dx*br, midY+dy*br);
      ctx.lineTo(lockX+dx*br - dx*7, midY+dy*br);
      ctx.stroke();
    }
    // crosshair
    ctx.strokeStyle=rgba(P.inkMute,0.8); ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(lockX-5,midY); ctx.lineTo(lockX+5,midY); ctx.moveTo(lockX,midY-5); ctx.lineTo(lockX,midY+5); ctx.stroke();
    if (lock>0.5){ ctx.beginPath(); ctx.arc(lockX,midY,2.4,0,Math.PI*2); ctx.fillStyle=P.signal; ctx.fill(); }
    ctx.fillStyle=rgba(P.inkMute,0.95); ctx.font='9px ui-monospace, monospace'; ctx.textAlign='center';
    ctx.fillText(lock>0.5?'LOCK':'SCAN', lockX, midY-lockR-11);

    // tactile controls between centre and right (two dials + a toggle)
    if (!small) {
      gauge(ctx, W*0.66, midY, 15, Math.sin((st.t||0)*0.6)*0.5, P, P.cobalt, 'THR');
      gauge(ctx, W*0.715, midY, 15, (st.protect?1:-0.3), P, P.signal, 'SHLD');
    }

    ctx.restore();
  }

  window.PrunaCockpit = {
    palette: palette, viewport: viewport, clipViewport: clipViewport,
    drawFrame: drawFrame, drawPanel: drawPanel, _rgba: rgba, _mix: mix, _rr: rr
  };
})();
