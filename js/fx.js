/* ==========================================================================
   FX — particules (confettis, étincelles, feux d'artifice) et champs de neige
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { rand, pick, clamp } = Noel;

  /* ======================================================================
     1. PARTICULES  (canvas #fx, au-dessus de tout)
     ====================================================================== */
  const cv = Noel.$('#fx');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1;
  const parts = [];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
    cv.style.width = W + 'px';
    cv.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function starShape(c, R, n) {
    c.beginPath();
    for (let i = 0; i < n * 2; i++) {
      const r = i % 2 ? R * 0.45 : R;
      const a = -Math.PI / 2 + (i * Math.PI) / n;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      if (i) c.lineTo(x, y); else c.moveTo(x, y);
    }
    c.closePath();
  }

  function sparkShape(c, s) {
    const k = s * 0.16;
    c.beginPath();
    c.moveTo(0, -s);
    c.quadraticCurveTo(k, -k, s, 0);
    c.quadraticCurveTo(k, k, 0, s);
    c.quadraticCurveTo(-k, k, -s, 0);
    c.quadraticCurveTo(-k, -k, 0, -s);
    c.closePath();
  }

  function drawParticle(p, k) {
    switch (p.shape) {
      case 'rect': {
        const f = Math.cos(p.t * p.fl);
        ctx.scale(1, Math.abs(f) < 0.12 ? 0.12 : f);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
        break;
      }
      case 'circle':
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, 6.2832);
        ctx.fill();
        break;
      case 'star':
        ctx.fillStyle = p.color;
        starShape(ctx, p.size / 2, 5);
        ctx.fill();
        break;
      case 'spark': {
        const s = p.size * (0.5 + k * 0.6);
        ctx.fillStyle = p.color;
        ctx.globalAlpha *= 0.28;
        ctx.beginPath();
        ctx.arc(0, 0, s * 1.2, 0, 6.2832);
        ctx.fill();
        ctx.globalAlpha = Math.min(1, k * 2) * p.alpha;
        sparkShape(ctx, s);
        ctx.fill();
        break;
      }
      case 'puff': {
        const r = p.size * (1.7 - k * 0.7);
        ctx.fillStyle = p.color;
        ctx.globalAlpha *= 0.55;
        ctx.beginPath();
        ctx.arc(0, 0, r / 2, 0, 6.2832);
        ctx.fill();
        break;
      }
      case 'flake': {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        const r = p.size / 2;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI) / 3;
          ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          ctx.lineTo(-Math.cos(a) * r, -Math.sin(a) * r);
        }
        ctx.stroke();
        break;
      }
      case 'gift': {
        const s = p.size;
        ctx.fillStyle = p.color;
        ctx.fillRect(-s / 2, -s / 2, s, s);
        ctx.fillStyle = p.color2 || '#ffd166';
        ctx.fillRect(-s * 0.09, -s / 2, s * 0.18, s);
        ctx.fillRect(-s / 2, -s * 0.09, s, s * 0.18);
        ctx.fillRect(-s * 0.32, -s * 0.68, s * 0.64, s * 0.18);
        break;
      }

      /* ---- formes des animations de l'Avent ---- */
      case 'snowflake': { // vrai flocon à 6 branches
        const r = p.size / 2;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1.3, r * 0.13);
        ctx.lineCap = 'round';
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3, ca = Math.cos(a), sa = Math.sin(a);
          ctx.moveTo(0, 0);
          ctx.lineTo(ca * r, sa * r);
          const bx = ca * r * 0.55, by = sa * r * 0.55;
          for (const d of [0.65, -0.65]) {
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + Math.cos(a + d) * r * 0.34, by + Math.sin(a + d) * r * 0.34);
          }
        }
        ctx.stroke();
        break;
      }
      case 'candy': { // canne en sucre
        const s = p.size;
        ctx.lineCap = 'round';
        ctx.lineWidth = s * 0.22;
        const path = () => {
          ctx.beginPath();
          ctx.moveTo(-s * 0.18, s * 0.5);
          ctx.lineTo(-s * 0.18, -s * 0.12);
          ctx.arc(0, -s * 0.12, s * 0.18, Math.PI, 0);
          ctx.lineTo(s * 0.18, -s * 0.02);
        };
        ctx.strokeStyle = '#ffffff';
        path(); ctx.stroke();
        ctx.strokeStyle = '#d62839';
        ctx.setLineDash([s * 0.12, s * 0.17]);
        path(); ctx.stroke();
        ctx.setLineDash([]);
        break;
      }
      case 'bell': { // cloche dorée
        const s = p.size;
        ctx.fillStyle = p.color || '#ffd166';
        ctx.beginPath();
        ctx.moveTo(-s * 0.42, s * 0.28);
        ctx.quadraticCurveTo(-s * 0.4, -s * 0.05, -s * 0.22, -s * 0.28);
        ctx.quadraticCurveTo(0, -s * 0.55, s * 0.22, -s * 0.28);
        ctx.quadraticCurveTo(s * 0.4, -s * 0.05, s * 0.42, s * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-s * 0.46, s * 0.24, s * 0.92, s * 0.1);
        ctx.fillStyle = '#b8821a';
        ctx.beginPath(); ctx.arc(0, s * 0.42, s * 0.09, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.ellipse(-s * 0.14, -s * 0.08, s * 0.05, s * 0.14, 0.3, 0, 6.2832); ctx.fill();
        break;
      }
      case 'gingerbread': { // bonhomme en pain d'épices
        const s = p.size;
        ctx.fillStyle = '#b9772f';
        ctx.strokeStyle = '#b9772f';
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(0, -s * 0.32, s * 0.17, 0, 6.2832); ctx.fill();
        ctx.beginPath(); ctx.ellipse(0, s * 0.02, s * 0.17, s * 0.2, 0, 0, 6.2832); ctx.fill();
        ctx.lineWidth = s * 0.14;
        ctx.beginPath();
        ctx.moveTo(-s * 0.12, -s * 0.06); ctx.lineTo(-s * 0.36, -s * 0.15);
        ctx.moveTo(s * 0.12, -s * 0.06); ctx.lineTo(s * 0.36, -s * 0.15);
        ctx.moveTo(-s * 0.07, s * 0.15); ctx.lineTo(-s * 0.2, s * 0.42);
        ctx.moveTo(s * 0.07, s * 0.15); ctx.lineTo(s * 0.2, s * 0.42);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        for (const [ex, ey] of [[-0.06, -0.35], [0.06, -0.35]]) { ctx.beginPath(); ctx.arc(ex * s, ey * s, s * 0.027, 0, 6.2832); ctx.fill(); }
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = s * 0.03;
        ctx.beginPath(); ctx.arc(0, -s * 0.3, s * 0.07, 0.2, Math.PI - 0.2); ctx.stroke();
        ctx.fillStyle = '#d62839';
        for (const by of [-0.04, 0.09]) { ctx.beginPath(); ctx.arc(0, by * s, s * 0.032, 0, 6.2832); ctx.fill(); }
        break;
      }
      case 'cookie': { // biscuit aux pépites
        const s = p.size / 2;
        ctx.fillStyle = '#d9a15b';
        ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.25)';
        ctx.beginPath(); ctx.arc(-s * 0.25, -s * 0.3, s * 0.45, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#5a3418';
        for (const [cx, cy, r] of [[-0.4, -0.2, 0.16], [0.3, -0.35, 0.14], [0.1, 0.15, 0.17], [-0.25, 0.42, 0.13], [0.45, 0.3, 0.13]]) {
          ctx.beginPath(); ctx.arc(cx * s, cy * s, r * s, 0, 6.2832); ctx.fill();
        }
        break;
      }
      case 'tangerine': { // mandarine
        const s = p.size / 2;
        ctx.fillStyle = '#ff9f1c';
        ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.beginPath(); ctx.ellipse(-s * 0.35, -s * 0.35, s * 0.28, s * 0.18, -0.7, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#2fa65a';
        ctx.beginPath(); ctx.ellipse(s * 0.18, -s * 0.95, s * 0.34, s * 0.15, -0.5, 0, 6.2832); ctx.fill();
        break;
      }
      case 'mitten': { // moufle
        const s = p.size;
        ctx.fillStyle = p.color || '#d62839';
        ctx.beginPath();
        ctx.moveTo(-s * 0.2, s * 0.5);
        ctx.lineTo(-s * 0.22, -s * 0.05);
        ctx.quadraticCurveTo(-s * 0.22, -s * 0.45, 0, -s * 0.45);
        ctx.quadraticCurveTo(s * 0.22, -s * 0.45, s * 0.22, -s * 0.05);
        ctx.lineTo(s * 0.2, s * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath(); ctx.ellipse(s * 0.27, s * 0.08, s * 0.1, s * 0.17, -0.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#f7fbff';
        ctx.fillRect(-s * 0.24, s * 0.3, s * 0.48, s * 0.18);
        break;
      }
      case 'hat': { // bonnet de Père Noël
        const s = p.size;
        ctx.fillStyle = '#d62839';
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, s * 0.25);
        ctx.quadraticCurveTo(-s * 0.35, -s * 0.35, s * 0.25, -s * 0.4);
        ctx.quadraticCurveTo(s * 0.1, -s * 0.1, s * 0.4, s * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-s * 0.44, s * 0.2, s * 0.88, s * 0.16);
        ctx.beginPath(); ctx.arc(s * 0.26, -s * 0.42, s * 0.1, 0, 6.2832); ctx.fill();
        break;
      }
      case 'heart': {
        const s = p.size / 2;
        ctx.fillStyle = p.color || '#ff4d6d';
        ctx.beginPath();
        ctx.moveTo(0, s * 0.9);
        ctx.bezierCurveTo(-s * 1.3, s * 0.1, -s * 0.7, -s * 0.9, 0, -s * 0.35);
        ctx.bezierCurveTo(s * 0.7, -s * 0.9, s * 1.3, s * 0.1, 0, s * 0.9);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.4)';
        ctx.beginPath(); ctx.ellipse(-s * 0.4, -s * 0.2, s * 0.14, s * 0.22, -0.6, 0, 6.2832); ctx.fill();
        break;
      }
      case 'holly': { // houx
        const s = p.size;
        ctx.fillStyle = '#1f9d55';
        for (const sgn of [-1, 1]) {
          ctx.beginPath(); ctx.ellipse(sgn * s * 0.26, -s * 0.04, s * 0.3, s * 0.13, sgn * -0.5, 0, 6.2832); ctx.fill();
        }
        ctx.fillStyle = '#d62839';
        for (const [bx, by] of [[-0.07, 0.1], [0.08, 0.1], [0, 0.24]]) { ctx.beginPath(); ctx.arc(bx * s, by * s, s * 0.11, 0, 6.2832); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.beginPath(); ctx.arc(-s * 0.1, 0.06 * s, s * 0.03, 0, 6.2832); ctx.fill();
        break;
      }
      case 'bauble': { // boule de Noël (rebondit bien)
        const s = p.size / 2;
        ctx.fillStyle = '#e0a526';
        ctx.fillRect(-s * 0.22, -s * 1.28, s * 0.44, s * 0.3);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath(); ctx.ellipse(-s * 0.35, -s * 0.38, s * 0.26, s * 0.16, -0.7, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = Math.max(1, s * 0.07);
        ctx.beginPath(); ctx.arc(0, 0, s * 0.62, 0.3, 1.6); ctx.stroke();
        break;
      }
      case 'lantern': { // lanterne lumineuse
        const s = p.size;
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.5);
        g.addColorStop(0, 'rgba(255,214,120,.9)');
        g.addColorStop(0.4, 'rgba(255,150,50,.35)');
        g.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, s * 1.5, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,170,60,.95)';
        ctx.beginPath(); ctx.ellipse(0, 0, s * 0.42, s * 0.52, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,240,190,.9)';
        ctx.beginPath(); ctx.ellipse(0, s * 0.04, s * 0.22, s * 0.32, 0, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#7a3f10';
        ctx.fillRect(-s * 0.24, -s * 0.56, s * 0.48, s * 0.09);
        ctx.fillRect(-s * 0.2, s * 0.47, s * 0.4, s * 0.09);
        break;
      }
      case 'snowball': {
        const s = p.size / 2;
        const g = ctx.createRadialGradient(-s * 0.3, -s * 0.3, 0, 0, 0, s);
        g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bcd2f5');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(0, 0, s, 0, 6.2832); ctx.fill();
        break;
      }
    }
  }

  function loop(dt) {
    if (!parts.length) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 80 || p.y < -160) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      p.t += dt;
      p.vy += p.g * dt;
      const d = Math.max(0, 1 - p.drag * dt);
      p.vx *= d;
      p.vy *= d;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.sway) p.x += Math.sin(p.t * p.sf + p.sp) * p.sway * dt; // balancement des objets qui flottent
      if (p.bounce && p.y > p.floor) {                              // rebond sur le bas de l'écran
        p.y = p.floor;
        if (Math.abs(p.vy) < 70) { p.vy = 0; p.vx *= 0.85; p.vr *= 0.8; }
        else { p.vy = -p.vy * p.bounce; p.vx *= 0.94; p.vr *= 0.85; }
      }
      p.rot += p.vr * dt;
      const k = p.life / p.max;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = (p.nofade ? 1 : Math.min(1, k * 2.4)) * p.alpha;
      drawParticle(p, k);
      ctx.restore();
    }
    if (!parts.length) ctx.clearRect(0, 0, W, H);
  }

  function add(o) {
    if (parts.length > 650) parts.splice(0, 40);
    const life = o.life || rand(0.9, 1.6);
    parts.push(Object.assign({
      x: 0, y: 0, vx: 0, vy: 0, g: 0, drag: 0.5, rot: 0, vr: 0, size: 8,
      color: '#fff', shape: 'circle', life, max: life, alpha: 1, t: 0, fl: rand(6, 12)
    }, o, { max: life, life }));
  }

  const Fx = (Noel.fx = {
    add,

    /** Explosion de particules depuis un point */
    burst(x, y, opts) {
      const o = Object.assign({
        n: 26, shapes: ['rect', 'rect', 'star', 'circle'], colors: Noel.PALETTE,
        power: 430, spread: Math.PI * 2, angle: -Math.PI / 2, g: 820, drag: 1.5,
        life: [0.9, 1.7], size: [6, 12]
      }, opts);
      const colors = Noel.golden ? ['#ffd166', '#fff2b0', '#e0a526', '#ffffff'] : o.colors;
      for (let i = 0; i < o.n; i++) {
        const a = o.angle + (Math.random() - 0.5) * o.spread;
        const sp = rand(0.3, 1) * o.power;
        add({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.g, drag: o.drag,
          rot: rand(0, 6.28), vr: rand(-9, 9), size: rand(o.size[0], o.size[1]),
          color: pick(colors), shape: pick(o.shapes), life: rand(o.life[0], o.life[1])
        });
      }
    },

    confetti(x, y, n) { Fx.burst(x, y, { n: n || 34 }); },

    /** Étincelle dorée isolée */
    sparkle(x, y, color) {
      add({
        x: x + rand(-6, 6), y: y + rand(-6, 6), vx: rand(-24, 24), vy: rand(-40, 6), g: 30, drag: 1.6,
        size: rand(5, 11), color: color || pick(['#fff2b0', '#ffd166', '#ffffff']), shape: 'spark',
        life: rand(0.5, 1), vr: rand(-2, 2)
      });
    },

    /** Petit nuage de neige */
    puff(x, y) {
      add({
        x, y, vx: rand(-30, 30), vy: rand(-40, -8), g: -6, drag: 1.4, size: rand(10, 20),
        color: '#ffffff', shape: 'puff', life: rand(0.5, 0.9)
      });
    },

    /** Feu d'artifice */
    fireworks(x, y) {
      const c = pick([
        ['#ff4d6d', '#ffd166', '#fff'],
        ['#4cc9f0', '#c77dff', '#fff'],
        ['#3ddc97', '#ffd166', '#fff']
      ]);
      Fx.burst(x, y, { n: 46, shapes: ['spark', 'circle'], colors: c, power: 330, g: 240, drag: 1.1, life: [1.1, 1.9], size: [4, 8] });
    },

    /** Traînée du curseur */
    trail(x, y, kind, info) {
      if (Noel.golden) {
        add({ x: x + rand(-4, 4), y: y + rand(-4, 4), vx: rand(-14, 14), vy: rand(-22, 6), g: 14, drag: 1.4,
          size: rand(5, 10), color: pick(['#ffd166', '#fff2b0', '#ffffff']), shape: 'spark', life: rand(0.5, 0.9) });
        return;
      }
      if (kind === 'gift') {
        add({
          x: x + rand(-7, 7), y: y + rand(-2, 8), vx: rand(-34, 34), vy: rand(-18, 24), g: 330, drag: 0.7,
          rot: rand(0, 6), vr: rand(-8, 8), size: rand(4, 7), color: pick(Noel.PALETTE), shape: 'rect', life: rand(0.8, 1.3)
        });
      } else if (kind === 'sleigh') {
        const f = info && info.flip ? info.flip : 1;
        add({
          x: x - f * 20 + rand(-3, 3), y: y + 4 + rand(-3, 3), vx: -f * rand(10, 50), vy: rand(-12, 16), g: 24, drag: 1.3,
          size: rand(4, 9), color: pick(['#fff2b0', '#ffd166', '#ffffff', '#ffe08a']), shape: 'spark', life: rand(0.5, 1)
        });
      } else {
        add({ x: x + rand(-5, 5), y: y + 9 + rand(-3, 4), vx: rand(-18, 18), vy: rand(-12, 10), g: 12, drag: 1.2,
          size: rand(5, 10), color: '#ffffff', shape: 'puff', life: rand(0.5, 0.9) });
        if (Math.random() < 0.3) {
          add({ x: x + rand(-3, 3), y: y + 5, vx: rand(-14, 14), vy: rand(-26, -4), g: 0, drag: 2,
            size: rand(3, 6), color: '#ff5a5a', shape: 'spark', life: rand(0.4, 0.7) });
        }
      }
    },

    /**
     * Averse d'objets (flocons, bonbons, cœurs…) pendant `dur` ms.
     * `rise: true` les fait monter du bas de l'écran. Renvoie une fonction pour l'arrêter.
     */
    shower(shape, opts) {
      const o = Object.assign({
        dur: 8000, rate: 6, colors: ['#ffffff'], size: [16, 26], vy: [60, 130], vx: [-18, 18],
        g: 0, sway: 26, rise: false, life: 9, spin: 1.6, bounce: 0, floor: 0
      }, opts);
      const end = performance.now() + o.dur;
      const spawn = () => {
        const sz = rand(o.size[0], o.size[1]);
        const speed = rand(o.vy[0], o.vy[1]);
        add({
          x: rand(-10, W + 10), y: o.rise ? H + 40 : -40, vx: rand(o.vx[0], o.vx[1]), vy: o.rise ? -speed : speed,
          g: o.g, drag: 0, rot: rand(0, 6.28), vr: rand(-o.spin, o.spin), size: sz, color: pick(o.colors), shape,
          // les objets qui tombent ou montent ne s'effacent pas : ils sortent de l'écran ; ceux qui rebondissent finissent par disparaître
          life: o.bounce ? o.life : 40, nofade: !o.bounce, sway: o.sway, sf: rand(0.8, 2), sp: rand(0, 6.28),
          bounce: o.bounce, floor: o.floor || H - sz * 0.6
        });
      };
      const timer = setInterval(() => {
        if (performance.now() > end) { clearInterval(timer); return; }
        const n = o.rate * 0.12;
        for (let i = 0; i < Math.floor(n); i++) spawn();
        if (Math.random() < n % 1) spawn();
      }, 120);
      return () => clearInterval(timer);
    },

    /** Pluie de cadeaux / confettis pendant `ms` millisecondes */
    rain(shape, ms) {
      const end = performance.now() + (ms || 5000);
      const timer = setInterval(() => {
        if (performance.now() > end) { clearInterval(timer); return; }
        for (let i = 0; i < 2; i++) {
          add({
            x: rand(0, W), y: -30, vx: rand(-30, 30), vy: rand(140, 300), g: 160, drag: 0.2,
            rot: rand(0, 6), vr: rand(-4, 4), size: shape === 'gift' ? rand(22, 36) : rand(8, 14),
            color: pick(['#d62839', '#1f9d55', '#2f6fd1', '#e8b74f', '#7f43c4', '#ee6a95']), color2: pick(['#ffd166', '#f7fbff']),
            shape: shape || 'gift', life: 7
          });
        }
      }, 90);
    }
  });

  Noel.ticker.add(loop);
  window.addEventListener('resize', resize);
  resize();

  /* ======================================================================
     2. CHAMPS DE NEIGE  (deux canvas : derrière et devant le contenu)
     ====================================================================== */
  function makeSprite(soft) {
    const s = 48;
    const c = document.createElement('canvas');
    c.width = c.height = s;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(soft ? 0.08 : 0.38, 'rgba(255,255,255,.88)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
    return c;
  }

  class SnowField {
    constructor(canvas, opts) {
      this.cv = canvas;
      this.ctx = canvas.getContext('2d');
      this.o = Object.assign({
        density: 9500, min: 90, max: 240, rMin: 1.3, rMax: 4.2, vMin: 26, vMax: 80,
        aMin: 0.35, aMax: 0.9, soft: false, reactive: true
      }, opts);
      this.sprite = makeSprite(this.o.soft);
      this.flakes = [];
      this.time = 0;
      this.speedMul = 1;
      this.extraWind = 0;
      this.extra = 0;
      this.w = 0;
      this.h = 0;
      this.resize();
      Noel.ticker.add((dt) => this.step(dt));
      window.addEventListener('resize', () => this.resize());
      Noel.on('calm', () => this.clear());
    }

    baseCount() {
      return clamp(Math.round((this.w * this.h) / this.o.density), this.o.min, this.o.max);
    }

    resize() {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      this.w = window.innerWidth;
      this.h = window.innerHeight;
      this.cv.width = Math.round(this.w * d);
      this.cv.height = Math.round(this.h * d);
      this.cv.style.width = this.w + 'px';
      this.cv.style.height = this.h + 'px';
      this.ctx.setTransform(d, 0, 0, d, 0, 0);
      this.fit();
    }

    spawn(anywhere) {
      const o = this.o;
      const z = Math.random();
      return {
        x: rand(0, this.w), y: anywhere ? rand(-20, this.h) : rand(-60, -4),
        r: o.rMin + (o.rMax - o.rMin) * z * z,
        vy: o.vMin + (o.vMax - o.vMin) * z, vx: rand(-6, 6), z,
        sway: rand(6, 22), freq: rand(0.4, 1.3), ph: rand(0, 6.28),
        a: o.aMin + (o.aMax - o.aMin) * Math.min(1, z + 0.2), ox: 0, dying: false
      };
    }

    fit() {
      const want = this.baseCount() + this.extra;
      const alive = this.flakes.filter((f) => !f.dying).length;
      if (alive < want) {
        for (let i = alive; i < want; i++) this.flakes.push(this.spawn(true));
      } else if (alive > want) {
        let toKill = alive - want;
        for (let i = this.flakes.length - 1; i >= 0 && toKill > 0; i--) {
          if (!this.flakes[i].dying) { this.flakes[i].dying = true; toKill--; }
        }
      }
    }

    /** Tempête : plus de flocons, plus vite, plus de vent */
    storm(on) {
      this.extra = on ? Math.round(this.baseCount() * 2.2) : 0;
      this.speedMul = on ? 2.4 : 1;
      this.extraWind = on ? 420 : 0;
      this.fit();
    }

    clear() {
      this.ctx.clearRect(0, 0, this.w, this.h);
    }

    step(dt) {
      if (Noel.calm) return;
      const c = this.ctx;
      const p = Noel.pointer;
      const t = (this.time += dt);
      const wind = Math.sin(t * 0.33) * 16 + Math.sin(t * 0.9 + 2) * 7 + this.extraWind;
      c.clearRect(0, 0, this.w, this.h);
      const R = 120, R2 = R * R;
      const react = this.o.reactive && p.inside;
      for (let i = this.flakes.length - 1; i >= 0; i--) {
        const f = this.flakes[i];
        f.y += f.vy * this.speedMul * dt;
        f.x += (f.vx + wind * (0.35 + f.z) + Math.sin(t * f.freq + f.ph) * f.sway + f.ox) * dt;
        f.ox *= Math.max(0, 1 - 2.4 * dt);
        if (react) {
          const dx = f.x - p.x, dy = f.y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            const d = Math.sqrt(d2) || 1;
            const k = 1 - d / R;
            f.ox += ((dx / d) * 300 + p.vx * 7) * k * dt * 6;
            f.y += (dy / d) * 90 * k * dt;
          }
        }
        if (f.y - f.r > this.h) {
          if (f.dying) { this.flakes.splice(i, 1); continue; }
          f.y = -f.r * 2;
          f.x = rand(0, this.w);
        }
        if (f.x < -24) f.x = this.w + 24;
        else if (f.x > this.w + 24) f.x = -24;
        c.globalAlpha = f.a;
        const s = f.r * 2.6;
        c.drawImage(this.sprite, f.x - s / 2, f.y - s / 2, s, s);
      }
      c.globalAlpha = 1;
    }
  }

  Noel.snow = {
    back: new SnowField(Noel.$('#snow-back')),
    front: new SnowField(Noel.$('#snow-front'), {
      density: 150000, min: 4, max: 12, rMin: 3.5, rMax: 7.5, vMin: 70, vMax: 150,
      aMin: 0.12, aMax: 0.3, soft: true
    }),
    storm(on) { this.back.storm(on); this.front.storm(on); }
  };
})();
