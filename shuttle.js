// ===========================================================================
// shuttle.js — shared original ROCKET, drawn in Canvas 2D.
//
// Used only as a small SECONDARY route/map indicator (the primary intro is the
// cockpit POV). It must read unmistakably as a rocket — pointed nose cone,
// cylindrical body with panel bands, a porthole, swept tail fins, and layered
// exhaust — never a chevron, arrowhead, paper plane, or shuttle silhouette.
//
// Theme-adaptive: colours derive from --fg / --bg so the hull always contrasts
// on either the dark navy or the warm-ivory light background. A contrast plate
// keeps it legible over alternating section backgrounds.
//
// window.PrunaShuttle (name kept for API compatibility):
//   .palette()
//   .draw(ctx, x, y, angle, scale, opts)   opts:{thrust,glow,plate,palette}
// Rocket points along +X (angle 0 = flying right). Reference length ~120px.
// ===========================================================================
(function () {
  'use strict';

  function toRgb(c) {
    c = (c || '').trim();
    if (c.charAt(0) === '#') { var h=c.slice(1);
      if (h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n=parseInt(h,16); return [(n>>16)&255,(n>>8)&255,n&255]; }
    var m=c.match(/rgba?\(([^)]+)\)/);
    if (m){ var p=m[1].split(',').map(parseFloat); return [p[0],p[1],p[2]]; }
    return null;
  }
  function mix(a,b,t){ var x=toRgb(a),y=toRgb(b); if(!x||!y) return a;
    return 'rgb('+Math.round(x[0]+(y[0]-x[0])*t)+','+Math.round(x[1]+(y[1]-x[1])*t)+','+Math.round(x[2]+(y[2]-x[2])*t)+')'; }
  function rgba(c,a){ var v=toRgb(c); if(!v) return c; return 'rgba('+v[0]+','+v[1]+','+v[2]+','+a+')'; }

  function palette() {
    var cs=getComputedStyle(document.documentElement);
    var g=function(n,f){ return (cs.getPropertyValue(n).trim()||f); };
    var isLight=document.documentElement.getAttribute('data-theme')==='light';
    var fg=g('--fg', isLight?'#0c1424':'#f4efe6');
    var bg=g('--bg', isLight?'#f5f3ec':'#0c1220');
    var cobalt=g('--cobalt', isLight?'#2151d8':'#3f78ff');
    var cobaltSoft=g('--cobalt-soft', isLight?'#3f78ff':'#6a97ff');
    var signal=g('--signal', isLight?'#6ba300':'#b7f24a');
    var ink=g('--ink','#070b14');
    return {
      isLight:isLight, bg:bg,
      hull: mix(fg,bg, isLight?0.06:0.10),
      hullLit: mix(fg,bg, isLight?0.30:0.36),
      nose: cobalt,
      panel: mix(fg,bg, isLight?0.5:0.55),
      edge: isLight?mix(fg,ink,0.15):rgba('#050912',0.85),
      window: cobaltSoft,
      accent: cobalt,
      signal: signal,
      exhaustHot: signal,
      exhaustCool: cobaltSoft
    };
  }

  function draw(ctx, x, y, angle, scale, opts) {
    opts = opts||{};
    var P = opts.palette||palette();
    var thrust = opts.thrust==null?0.6:opts.thrust;
    var glow = opts.glow==null?1:opts.glow;

    ctx.save();
    ctx.translate(x,y); ctx.rotate(angle); ctx.scale(scale,scale);
    ctx.lineJoin='round'; ctx.lineCap='round';

    // contrast plate
    if (opts.plate){
      var pr=62;
      var plate=ctx.createRadialGradient(0,0,6,0,0,pr);
      plate.addColorStop(0, rgba(P.bg, P.isLight?0.55:0.5));
      plate.addColorStop(0.7, rgba(P.bg, P.isLight?0.22:0.2));
      plate.addColorStop(1, rgba(P.bg,0));
      ctx.fillStyle=plate; ctx.beginPath(); ctx.arc(0,0,pr,0,Math.PI*2); ctx.fill();
    }

    // ---- layered exhaust behind the rocket --------------------------------
    if (thrust>0.01){
      var plen=40+thrust*54;
      var g1=ctx.createLinearGradient(-34,0,-34-plen,0);
      g1.addColorStop(0, rgba(P.exhaustCool, 0.55*glow));
      g1.addColorStop(1, rgba(P.exhaustCool,0));
      ctx.fillStyle=g1; ctx.beginPath();
      ctx.moveTo(-34,-9); ctx.quadraticCurveTo(-34-plen*0.7,0,-34-plen,0);
      ctx.quadraticCurveTo(-34-plen*0.7,0,-34,9); ctx.closePath(); ctx.fill();
      var g2=ctx.createLinearGradient(-34,0,-34-plen*0.7,0);
      g2.addColorStop(0, rgba(P.exhaustHot, 0.9*glow));
      g2.addColorStop(1, rgba(P.exhaustHot,0));
      ctx.fillStyle=g2; ctx.beginPath();
      ctx.moveTo(-34,-4); ctx.quadraticCurveTo(-34-plen*0.5,0,-34-plen*0.72,0);
      ctx.quadraticCurveTo(-34-plen*0.5,0,-34,4); ctx.closePath(); ctx.fill();
    }

    // ---- tail fins (behind body) ------------------------------------------
    ctx.strokeStyle=P.edge; ctx.lineWidth=1.2;
    ctx.fillStyle=P.panel;
    // top fin
    ctx.beginPath(); ctx.moveTo(-20,-9); ctx.lineTo(-40,-22); ctx.lineTo(-30,-9); ctx.closePath(); ctx.fill(); ctx.stroke();
    // bottom fin
    ctx.fillStyle=P.hullLit;
    ctx.beginPath(); ctx.moveTo(-20,9); ctx.lineTo(-40,22); ctx.lineTo(-30,9); ctx.closePath(); ctx.fill(); ctx.stroke();

    // ---- body tube (rounded cylinder) with pointed nose cone --------------
    var body=new Path2D();
    body.moveTo(-32,-9);                 // tail top
    body.lineTo(26,-9);                  // body top
    body.quadraticCurveTo(48,-8, 58,0);  // nose cone top
    body.quadraticCurveTo(48,8, 26,9);   // nose cone bottom
    body.lineTo(-32,9);                   // body bottom
    body.quadraticCurveTo(-38,0,-32,-9); // rounded tail
    body.closePath();

    ctx.fillStyle=P.hull; ctx.fill(body);
    // top light
    ctx.save(); ctx.clip(body);
    var lit=ctx.createLinearGradient(0,-9,0,3);
    lit.addColorStop(0, rgba(P.hullLit,1));
    lit.addColorStop(1, rgba(P.hull,0));
    ctx.fillStyle=lit; ctx.fillRect(-40,-9,110,10);
    // underside shade
    var sh=ctx.createLinearGradient(0,3,0,9);
    sh.addColorStop(0, rgba(P.edge,0));
    sh.addColorStop(1, rgba(P.edge, P.isLight?0.3:0.45));
    ctx.fillStyle=sh; ctx.fillRect(-40,2,110,8);
    ctx.restore();
    // outline
    ctx.strokeStyle=P.edge; ctx.lineWidth=1.4; ctx.stroke(body);

    // ---- nose cone accent -------------------------------------------------
    var noseP=new Path2D();
    noseP.moveTo(26,-9); noseP.quadraticCurveTo(48,-8,58,0);
    noseP.quadraticCurveTo(48,8,26,9); noseP.lineTo(26,-9); noseP.closePath();
    ctx.fillStyle=rgba(P.nose, P.isLight?0.9:0.85); ctx.fill(noseP);
    ctx.strokeStyle=P.edge; ctx.lineWidth=1; ctx.stroke(noseP);

    // ---- panel bands ------------------------------------------------------
    ctx.strokeStyle=rgba(P.edge,0.5); ctx.lineWidth=0.8;
    for (var bx=-18; bx<=20; bx+=12){ ctx.beginPath(); ctx.moveTo(bx,-8.5); ctx.lineTo(bx,8.5); ctx.stroke(); }

    // ---- porthole window --------------------------------------------------
    var wg=ctx.createRadialGradient(6,-1,0.5,8,0,4.6);
    wg.addColorStop(0, P.window); wg.addColorStop(1, P.accent);
    ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(8,0,4.4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=P.edge; ctx.lineWidth=1.1; ctx.stroke();
    ctx.strokeStyle=rgba('#ffffff', P.isLight?0.5:0.7); ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(8,0,2.4,-2.4,-0.6); ctx.stroke();

    // ---- engine nozzle ----------------------------------------------------
    ctx.fillStyle=P.panel; ctx.strokeStyle=P.edge; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-32,-6); ctx.lineTo(-38,-8); ctx.lineTo(-38,8); ctx.lineTo(-32,6); ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.restore();
  }

  function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }

  window.PrunaShuttle = { palette: palette, draw: draw, _rgba: rgba, _mix: mix };
})();
