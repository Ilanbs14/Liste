/* ==========================================================================
   CURSEUR — cadeau 🎁, traîneau 🛷 ou renne 🦌, avec traînée de particules
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const root = document.documentElement;
  const { clamp } = Noel;

  const KINDS = ['gift', 'sleigh', 'reindeer'];
  const LABELS = { gift: 'le cadeau', sleigh: 'le traîneau', reindeer: 'le renne' };
  const INTERACTIVE = 'a, button, select, summary, label, [role="button"], [data-elf], .bulb, .moon, .gift-front, .skygift, .flight-svg, .chip';
  const SLEEP_AFTER = 25000;

  const Cursor = (Noel.cursor = {
    kind: Noel.store.get('cursor', 'gift'),
    enabled: false,
    sprites: {}
  });
  if (KINDS.indexOf(Cursor.kind) < 0) Cursor.kind = 'gift';

  Cursor.sprite = (kind) => {
    const a = Noel.art;
    return kind === 'sleigh' ? a.sleighSprite() : kind === 'reindeer' ? a.reindeerSprite() : a.giftSprite();
  };

  let el, spriteEl, dotEl, labelEl, zzzEl;
  let x = -200, y = -200, tx = -200, ty = -200;
  let rot = 0, flip = 1, started = false, down = false, hover = false, asleep = false;
  let lastActivity = performance.now();
  const lastTrail = { x: 0, y: 0 };

  function setKind(kind, opts) {
    if (KINDS.indexOf(kind) < 0) return;
    const o = opts || {};
    Cursor.kind = kind;
    Noel.store.set('cursor', kind);
    if (spriteEl) {
      spriteEl.innerHTML = Cursor.sprite(kind);
      el.dataset.kind = kind;
      if (!o.silent) {
        Noel.fx.burst(x, y, { n: 16, shapes: ['star', 'spark', 'circle'], power: 260, g: 200, size: [5, 10] });
        spriteEl.classList.remove('pop'); void spriteEl.offsetWidth; spriteEl.classList.add('pop');
      }
    }
    Noel.$$('.cursor-switch [data-cursor]').forEach((b) => {
      const on = b.dataset.cursor === kind;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    Noel.emit('cursor', kind);
  }
  Cursor.set = setKind;
  Cursor.label = (kind) => LABELS[kind || Cursor.kind];

  function wake() {
    lastActivity = performance.now();
    if (asleep) {
      asleep = false;
      el.classList.remove('sleepy');
    }
  }

  function frame(dt) {
    if (!Cursor.enabled) return;
    const now = performance.now();

    if (!asleep && Noel.pointer.type === 'mouse' && now - lastActivity > SLEEP_AFTER && started) {
      asleep = true;
      el.classList.add('sleepy');
      Noel.emit('sleep');
    }

    const k = 1 - Math.exp(-dt * (Noel.calm ? 60 : 34));
    const px = x, py = y;
    x += (tx - x) * k;
    y += (ty - y) * k;
    const vx = (x - px) / Math.max(dt, 0.001);
    const vy = (y - py) / Math.max(dt, 0.001);

    let r = 0;
    if (!Noel.calm) {
      if (Cursor.kind === 'gift') {
        r = clamp(vx * 0.014, -24, 24);
      } else if (Cursor.kind === 'sleigh') {
        if (Math.abs(vx) > 70) flip = vx < 0 ? -1 : 1;
        r = clamp(vy * 0.018 * flip, -26, 26);
      } else {
        r = clamp(vx * 0.011, -18, 18);
      }
    } else if (Cursor.kind === 'sleigh' && Math.abs(vx) > 70) {
      flip = vx < 0 ? -1 : 1;
    }
    rot += (r - rot) * (1 - Math.exp(-dt * 12));

    const scale = down ? 0.88 : hover ? 1.12 : 1;
    const sx = Cursor.kind === 'sleigh' ? flip * scale : scale;
    spriteEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(${sx}, ${scale})`;
    dotEl.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    labelEl.style.transform = `translate3d(${(x + 16).toFixed(1)}px, ${(y + 14).toFixed(1)}px, 0)`;
    zzzEl.style.transform = `translate3d(${(x + 8).toFixed(1)}px, ${(y - 24).toFixed(1)}px, 0)`;

    // traînée
    if (!Noel.calm && Noel.pointer.inside && !asleep) {
      const dist = Math.hypot(x - lastTrail.x, y - lastTrail.y);
      if (dist > (Cursor.kind === 'sleigh' ? 9 : 14)) {
        lastTrail.x = x; lastTrail.y = y;
        Noel.fx.trail(x, y, Cursor.kind, { flip });
      }
    }
  }

  function init() {
    if (!Noel.finePointer) {
      // Tactile : pas de curseur, mais les boutons de choix restent utiles pour l'effet des taps.
      setKind(Cursor.kind, { silent: true });
      return;
    }

    el = document.createElement('div');
    el.className = 'cursor';
    el.setAttribute('aria-hidden', 'true');
    el.dataset.kind = Cursor.kind;
    el.innerHTML = '<div class="cursor-dot"></div><div class="cursor-sprite"></div>' +
      '<div class="cursor-label"></div><div class="cursor-zzz"><i>z</i><i>z</i><i>Z</i></div>';
    document.body.appendChild(el);
    spriteEl = el.querySelector('.cursor-sprite');
    dotEl = el.querySelector('.cursor-dot');
    labelEl = el.querySelector('.cursor-label');
    zzzEl = el.querySelector('.cursor-zzz');
    spriteEl.innerHTML = Cursor.sprite(Cursor.kind);

    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!started) { x = tx; y = ty; started = true; lastTrail.x = x; lastTrail.y = y; }
      el.classList.add('on');
      wake();
    }, { passive: true });

    window.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return;
      down = true; wake();
      el.classList.add('down');
    });
    window.addEventListener('pointerup', () => { down = false; el.classList.remove('down'); });
    window.addEventListener('keydown', wake);
    window.addEventListener('scroll', wake, { passive: true });
    root.addEventListener('mouseleave', () => el.classList.remove('on'));
    root.addEventListener('mouseenter', () => { if (started) el.classList.add('on'); });
    window.addEventListener('blur', () => el.classList.remove('on'));

    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      if (!t || !t.closest) return;
      const inter = t.closest(INTERACTIVE);
      const isText = t.closest('input[type="search"], input[type="text"], textarea');
      hover = !!inter && !isText;
      el.classList.toggle('hover', hover);
      el.classList.toggle('text', !!isText);
      const lab = t.closest('[data-cursor-label]');
      if (lab && !isText) {
        labelEl.textContent = lab.getAttribute('data-cursor-label');
        el.classList.add('has-label');
      } else {
        el.classList.remove('has-label');
      }
    });

    Cursor.enabled = true;
    root.classList.add('has-cursor');
    setKind(Cursor.kind, { silent: true });
    Noel.ticker.add(frame);
  }

  Cursor.init = init;
  Cursor.wake = wake;
  /** Position actuelle du sprite (utile pour les effets) */
  Cursor.pos = () => ({ x: Cursor.enabled ? x : Noel.pointer.x, y: Cursor.enabled ? y : Noel.pointer.y });
})();
