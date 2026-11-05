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
    }
  }

  function loop(dt) {
    if (!parts.length) return;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 60) {
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
      p.rot += p.vr * dt;
      const k = p.life / p.max;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(1, k * 2.4) * p.alpha;
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
