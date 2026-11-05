/* ==========================================================================
   CORE — utilitaires partagés, stockage, boucle d'animation, pointeur, toasts
   ========================================================================== */
(function () {
  'use strict';

  const Noel = (window.Noel = window.Noel || {});
  const root = document.documentElement;

  /* ---------- Petits utilitaires ---------- */
  Noel.$ = (sel, ctx = document) => ctx.querySelector(sel);
  Noel.$$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  Noel.rand = (a, b) => a + Math.random() * (b - a);
  Noel.randInt = (a, b) => Math.floor(Noel.rand(a, b + 1));
  Noel.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  Noel.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  Noel.lerp = (a, b, t) => a + (b - a) * t;
  Noel.wait = (ms) => new Promise((r) => setTimeout(r, ms));
  Noel.esc = (s) =>
    String(s == null ? '' : s).replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));

  /** Typographie française : espace insécable avant « ? ! : ; » » et après « « » */
  Noel.typo = (s) =>
    String(s == null ? '' : s)
      .replace(/\s+([?!:;»])/g, ' $1')
      .replace(/(«)\s+/g, '$1 ');

  /** Les couleurs « bonbons » utilisées partout (confettis, guirlandes…) */
  Noel.PALETTE = ['#ff4d6d', '#ffd166', '#3ddc97', '#4cc9f0', '#f8fbff', '#c77dff', '#ff9f1c'];

  /* ---------- Stockage (localStorage sécurisé) ---------- */
  const PREFIX = 'noel:';
  Noel.store = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(PREFIX + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) { /* navigation privée */ }
    },
    remove(key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    }
  };

  /* ---------- Bus d'évènements minimal ---------- */
  const handlers = {};
  Noel.on = (ev, fn) => { (handlers[ev] = handlers[ev] || []).push(fn); return fn; };
  Noel.emit = (ev, data) => {
    (handlers[ev] || []).forEach((fn) => {
      try { fn(data); } catch (e) { console.error('[Noel] ' + ev, e); }
    });
  };

  /* ---------- Contexte de navigation ---------- */
  Noel.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  Noel.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mode calme ---------- */
  Noel.calm = !!Noel.store.get('calm', Noel.reduceMotion);
  root.classList.toggle('calm', Noel.calm);
  Noel.setCalm = (value) => {
    Noel.calm = !!value;
    root.classList.toggle('calm', Noel.calm);
    Noel.store.set('calm', Noel.calm);
    Noel.emit('calm', Noel.calm);
  };

  /* ---------- Pointeur (souris / doigt / stylet) ---------- */
  const p = (Noel.pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 3,
    vx: 0,
    vy: 0,
    type: 'mouse',
    inside: false
  });
  window.addEventListener('pointermove', (e) => {
    p.vx += (e.clientX - p.x) * 0.5;
    p.vy += (e.clientY - p.y) * 0.5;
    p.x = e.clientX;
    p.y = e.clientY;
    p.type = e.pointerType || 'mouse';
    p.inside = p.type === 'mouse' || p.type === 'pen';
  }, { passive: true });
  root.addEventListener('mouseleave', () => { p.inside = false; });
  root.addEventListener('mouseenter', () => { p.inside = p.type === 'mouse' || p.type === 'pen'; });

  /* ---------- Boucle d'animation unique ---------- */
  const tickers = [];
  let last = 0;
  Noel.ticker = {
    add(fn) { tickers.push(fn); return fn; },
    remove(fn) { const i = tickers.indexOf(fn); if (i >= 0) tickers.splice(i, 1); }
  };
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    const decay = Math.exp(-dt * 9);
    p.vx *= decay;
    p.vy *= decay;
    for (let i = 0; i < tickers.length; i++) {
      try { tickers[i](dt, now); } catch (e) { console.error('[Noel] ticker', e); }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame((t) => { last = t; requestAnimationFrame(frame); });

  /* ---------- Messages flottants (toasts) ---------- */
  Noel.toast = (html, opts) => {
    const o = Object.assign({ duration: 3600, className: '' }, opts);
    const box = Noel.$('#toasts');
    if (!box) return null;
    const t = document.createElement('div');
    t.className = ('toast ' + o.className).trim();
    t.innerHTML = html;
    box.appendChild(t);
    while (box.children.length > 3) box.firstElementChild.remove();
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
    setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => t.remove(), 450);
    }, o.duration);
    return t;
  };

  /* ---------- Format des prix ---------- */
  Noel.fmtPrice = (n) => {
    if (n == null || n === '' || isNaN(Number(n))) return '';
    const cfg = (window.NOEL && window.NOEL.config) || {};
    const v = Number(n);
    try {
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: cfg.devise || 'EUR',
        minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
        maximumFractionDigits: 2
      }).format(v);
    } catch (e) {
      return v + ' €';
    }
  };

  /** Position (centre) d'un élément dans la fenêtre */
  Noel.centerOf = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height };
  };
})();
