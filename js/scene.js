/* ==========================================================================
   SCENE — le décor vivant : étoiles, guirlande, compte à rebours, village,
   sapin, bonhomme de neige, traîneau du Père Noël, lutins cachés…
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { $, $$, rand, randInt, pick, clamp } = Noel;
  const Art = Noel.art;
  const Scene = (Noel.scene = {});

  const FACTS = [
    'Le plus ancien sapin de Noël attesté en France date de 1521, à Sélestat, en Alsace.',
    'Rudolph, le renne au nez rouge, est né en 1939 dans un petit livre imaginé pour un grand magasin américain.',
    'En 1965, deux astronautes ont joué « Jingle Bells » dans l\'espace, avec un harmonica et des clochettes.',
    'En Islande, ce ne sont pas un mais treize Pères Noël qui rendent visite aux enfants, un par nuit.',
    'Au Japon, beaucoup de familles mangent du poulet frit pour Noël. C\'est devenu une vraie tradition !',
    'Les rennes mâles perdent leurs bois avant Noël, les femelles gardent les leurs : les rennes du Père Noël sont donc probablement des femelles !',
    'Le premier sapin de Noël illuminé à l\'électricité date de 1882, à New York.',
    '« Jingle Bells » a été écrite en 1857 par James Lord Pierpont.'
  ];
  const JOKES = [
    'Comment appelle-t-on un bonhomme de neige au mois de juillet ? Une flaque !',
    'Que dit un bonhomme de neige à un autre bonhomme de neige ? « Tu ne sens pas une odeur de carotte ? »',
    'Quel est le comble pour un sapin de Noël ? De perdre ses boules !',
    'Pourquoi le Père Noël ne s\'ennuie-t-il jamais ? Parce qu\'il a toujours quelque chose dans sa hotte !'
  ];

  /* ======================================================================
     1. Étoiles
     ====================================================================== */
  function buildStars() {
    const box = $('#stars');
    if (!box) return;
    const n = window.innerWidth < 700 ? 80 : 150;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i');
      const size = Math.random() < 0.12 ? rand(2.4, 3.6) : rand(1, 2.2);
      s.style.cssText = 'left:' + rand(0, 100).toFixed(2) + '%;top:' + (Math.pow(Math.random(), 1.5) * 100).toFixed(2) +
        '%;width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;--d:' + rand(2.2, 6).toFixed(1) +
        's;animation-delay:' + rand(0, 6).toFixed(1) + 's;--o:' + rand(0.45, 1).toFixed(2);
      if (size > 2.4) s.className = 'big';
      frag.appendChild(s);
    }
    box.appendChild(frag);
  }

  /* ======================================================================
     2. Guirlande lumineuse (cliquable : change de mode)
     ====================================================================== */
  const BULBS = [
    ['#ff4d6d', '#a3112b'], ['#ffd166', '#b8821a'], ['#3ddc97', '#127a4d'],
    ['#4cc9f0', '#17608a'], ['#c77dff', '#5a2a99'], ['#ff9f1c', '#a8560a']
  ];
  const MODES = [
    { id: 'twinkle', name: 'Scintillement' },
    { id: 'chase', name: 'Course de lumières' },
    { id: 'steady', name: 'Lumière douce' },
    { id: 'disco', name: 'Mode disco !' }
  ];
  let garlandMode = 0;

  function buildGarland() {
    const box = $('#garland');
    if (!box) return;
    const W = window.innerWidth;
    const compact = W < 640;
    const swagW = compact ? 170 : 240;
    const sag = compact ? 15 : 22;
    const gap = compact ? 30 : 38;
    const n = Math.max(1, Math.round(W / swagW));
    const w = W / n;
    let path = '';
    let html = '';
    let idx = 0;
    for (let s = 0; s < n; s++) {
      const x0 = s * w;
      path += 'M' + x0.toFixed(1) + ',2 Q' + (x0 + w / 2).toFixed(1) + ',' + (2 + sag * 2) + ' ' + (x0 + w).toFixed(1) + ',2 ';
      const count = Math.max(3, Math.round(w / gap) - 1);
      for (let k = 1; k <= count; k++) {
        const t = k / (count + 1);
        const bx = x0 + w * t;
        const by = 2 + 4 * sag * t * (1 - t);
        const ang = (Math.atan((4 * sag * (1 - 2 * t)) / w) * 180) / Math.PI;
        const c = BULBS[idx % BULBS.length];
        html += '<span class="bulb" data-cursor-label="Change les lumières" style="left:' + bx.toFixed(1) + 'px;top:' + by.toFixed(1) +
          'px;--c:' + c[0] + ';--c2:' + c[1] + ';--i:' + idx + ';--k:' + (idx % 4) + ';--r:' + (Math.random() * 2).toFixed(2) +
          ';--rot:' + (ang * 0.55).toFixed(1) + 'deg"><i class="glow"></i></span>';
        idx++;
      }
    }
    const h = 2 + sag * 2;
    box.innerHTML = '<svg width="' + W + '" height="' + h + '" viewBox="0 0 ' + W + ' ' + h + '"><path d="' + path + '" class="wire"/></svg>' + html;
    box.dataset.mode = MODES[garlandMode].id;
  }

  function initGarland() {
    const box = $('#garland');
    if (!box) return;
    buildGarland();
    let timer;
    window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(buildGarland, 220); });
    box.addEventListener('click', (e) => {
      const bulb = e.target.closest('.bulb');
      if (!bulb) return;
      garlandMode = (garlandMode + 1) % MODES.length;
      const mode = MODES[garlandMode];
      box.dataset.mode = mode.id;
      bulb.classList.remove('pop'); void bulb.offsetWidth; bulb.classList.add('pop');
      const r = bulb.getBoundingClientRect();
      Noel.fx.sparkle(r.left + r.width / 2, r.top + r.height / 2, getComputedStyle(bulb).getPropertyValue('--c'));
      Noel.audio.sparkle();
      Noel.toast('<b>Guirlande :</b> ' + mode.name, { duration: 2200 });
      if (mode.id === 'disco') {
        const mood = $('#mood-disco');
        mood.classList.add('on');
        setTimeout(() => mood.classList.remove('on'), 9000);
        Noel.secrets && Noel.secrets.discover('lights');
      }
    });
  }

  /* ======================================================================
     3. Titre en lettres
     ====================================================================== */
  Scene.splitLetters = function (el) {
    if (!el) return;
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.textContent = '';
    let i = 0;
    text.split(/\s+/).forEach((word, wi, arr) => {
      const w = document.createElement('span');
      w.className = 'word';
      w.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach((ch) => {
        const s = document.createElement('span');
        s.className = 'ltr';
        s.style.setProperty('--i', i++);
        s.textContent = ch;
        w.appendChild(s);
      });
      el.appendChild(w);
      if (wi < arr.length - 1) el.appendChild(document.createTextNode(' '));
    });
    el.addEventListener('pointerdown', (e) => {
      const l = e.target.closest && e.target.closest('.ltr');
      if (!l) return;
      l.classList.remove('bump'); void l.offsetWidth; l.classList.add('bump');
      const r = l.getBoundingClientRect();
      Noel.fx.sparkle(r.left + r.width / 2, r.top + r.height * 0.3);
    });
    const total = i;
    setTimeout(() => el.classList.add('settled'), 500 + total * 60 + 900);
  };

  /* ======================================================================
     4. Compte à rebours
     ====================================================================== */
  const UNITS = [
    { k: 'd', label: 'jours', c1: '#ff6b81', c2: '#9d1226' },
    { k: 'h', label: 'heures', c1: '#52d68f', c2: '#0d6338' },
    { k: 'm', label: 'minutes', c1: '#62b8ff', c2: '#1a3d8c' },
    { k: 's', label: 'secondes', c1: '#ffd166', c2: '#b5802a' }
  ];

  function buildCountdown() {
    const box = $('#countdown');
    box.innerHTML = UNITS.map((u, i) =>
      '<div class="bauble" style="--c1:' + u.c1 + ';--c2:' + u.c2 + ';--sw:' + (3.6 + i * 0.5) + 's;--dl:' + (-i * 0.9) + 's">' +
      '<span class="bauble-cap"></span><span class="bauble-body"><b data-unit="' + u.k + '">00</b><i>' + u.label + '</i></span></div>'
    ).join('');
    box.dataset.built = '1';
  }

  function updateCountdown() {
    const box = $('#countdown');
    const msg = $('#count-msg');
    if (!box) return;
    const now = new Date();
    const month = now.getMonth(), date = now.getDate();
    if (month === 11 && date === 25) {
      if (box.dataset.built !== 'xmas') {
        box.innerHTML = '<div class="xmas-banner">C\'est Noël&nbsp;!</div>';
        box.dataset.built = 'xmas';
        msg.textContent = 'Joyeux Noël ! Que la magie t\'accompagne toute la journée.';
        setTimeout(() => Noel.fx.rain('confetti', 4000), 800);
      }
      return;
    }
    if (box.dataset.built !== '1') buildCountdown();

    const y = now.getFullYear();
    let target = new Date(y, 11, 25, 0, 0, 0);
    const passed = month === 11 && date > 25;
    if (passed) target = new Date(y + 1, 11, 25, 0, 0, 0);
    let diff = Math.max(0, target - now);
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const h = Math.floor(diff / 36e5); diff -= h * 36e5;
    const m = Math.floor(diff / 6e4); diff -= m * 6e4;
    const s = Math.floor(diff / 1000);
    const vals = { d: d, h: h, m: m, s: s };
    UNITS.forEach((u) => {
      const b = $('[data-unit="' + u.k + '"]', box);
      const txt = String(vals[u.k]).padStart(2, '0');
      if (b && b.textContent !== txt) {
        b.textContent = txt;
        if (u.k === 's') { b.classList.remove('tick'); void b.offsetWidth; b.classList.add('tick'); }
      }
    });

    let text;
    if (passed) text = 'Noël est passé… mais la magie continue ! Rendez-vous l\'an prochain.';
    else if (month === 11 && date === 24) text = 'C\'est ce soir ! N\'oublie pas les biscuits pour le Père Noël.';
    else if (d > 30) text = 'Les lutins sont déjà au travail…';
    else if (d > 14) text = 'Les rennes commencent leurs étirements.';
    else if (d > 7) text = 'Le traîneau est en pleine révision.';
    else text = 'Plus que quelques dodos !';
    if (msg.textContent !== text) msg.textContent = text;
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  /* ======================================================================
     5. Parallaxe (le décor bouge légèrement avec la souris)
     ====================================================================== */
  function initParallax() {
    if (!Noel.finePointer) return;
    const layers = $$('[data-depth]');
    let cx = 0, cy = 0;
    Noel.ticker.add((dt) => {
      if (Noel.calm || window.scrollY > window.innerHeight * 1.3) return;
      const p = Noel.pointer;
      const tx = (p.x / window.innerWidth - 0.5) * 2;
      const ty = (p.y / window.innerHeight - 0.5) * 2;
      const k = 1 - Math.exp(-dt * 4);
      cx += (tx - cx) * k;
      cy += (ty - cy) * k;
      for (let i = 0; i < layers.length; i++) {
        const l = layers[i];
        const dep = parseFloat(l.dataset.depth);
        l.style.transform = 'translate3d(' + (-cx * dep).toFixed(2) + 'px,' + (-cy * dep * 0.5).toFixed(2) + 'px,0)';
      }
    });
  }

  /* ======================================================================
     6. Étoiles filantes
     ====================================================================== */
  function shootingStar() {
    if (Noel.calm || document.hidden) return;
    const s = document.createElement('i');
    s.className = 'shoot';
    const ang = rand(16, 32);
    const len = rand(320, 560);
    s.style.left = rand(window.innerWidth * 0.05, window.innerWidth * 0.8) + 'px';
    s.style.top = rand(70, window.innerHeight * 0.4) + 'px';
    document.body.appendChild(s);
    const a = s.animate([
      { transform: 'rotate(' + ang + 'deg) translateX(0)', opacity: 0 },
      { transform: 'rotate(' + ang + 'deg) translateX(' + len * 0.2 + 'px)', opacity: 1, offset: 0.15 },
      { transform: 'rotate(' + ang + 'deg) translateX(' + len + 'px)', opacity: 0 }
    ], { duration: rand(850, 1300), easing: 'ease-in' });
    a.onfinish = () => s.remove();
  }
  function scheduleShooting() {
    setTimeout(() => { shootingStar(); scheduleShooting(); }, rand(6000, 15000));
  }

  /* ======================================================================
     7. Vol du traîneau (clique dessus : il laisse tomber un cadeau !)
     ====================================================================== */
  let flying = false;

  function fly(opts) {
    const o = Object.assign({ force: false, y: null, duration: null }, opts);
    const host = $('#flight');
    if (flying || !host) return false;
    if (Noel.calm && !o.force) return false;
    flying = true;

    const vw = window.innerWidth, vh = window.innerHeight;
    const w = clamp(vw * 0.38, 250, 460);
    host.innerHTML = Art.flight();
    const svg = host.firstElementChild;
    svg.style.width = w + 'px';
    svg.setAttribute('data-cursor-label', 'Attrape-moi !');

    const baseY = o.y != null ? o.y : rand(vh * 0.12, vh * 0.36);
    const phase = rand(0, 6);
    const N = 40;
    const frames = [];
    let prev = null;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const x = -w - 40 + (vw + w + 80) * t;
      const y = baseY + Math.sin(t * Math.PI * 2.2 + phase) * vh * 0.035 - Math.sin(t * Math.PI) * vh * 0.05;
      const rot = prev ? clamp(Math.atan2(y - prev.y, x - prev.x) * 57.3 * 1.6, -14, 14) : 0;
      frames.push({ transform: 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(1) + 'deg)' });
      prev = { x: x, y: y };
    }
    const duration = o.duration || clamp(vw * 8, 8500, 13500);
    const anim = svg.animate(frames, { duration: duration, easing: 'linear', fill: 'forwards' });

    Noel.audio.jingle(12);

    const trail = (dt) => {
      if (!flying || Noel.calm) return;
      const r = svg.getBoundingClientRect();
      if (Math.random() < 0.7) Noel.fx.sparkle(r.left + r.width * 0.04, r.top + r.height * (0.45 + Math.random() * 0.25));
      if (Math.random() < 0.25) Noel.fx.sparkle(r.left + r.width * 0.12, r.top + r.height * 0.6, '#ffffff');
    };
    Noel.ticker.add(trail);

    svg.addEventListener('click', () => {
      if (svg.dataset.dropped) return;
      svg.dataset.dropped = '1';
      const r = svg.getBoundingClientRect();
      dropGift(r.left + r.width * 0.3, r.top + r.height * 0.6);
      Noel.audio.jingle(7);
    });

    anim.onfinish = () => {
      flying = false;
      Noel.ticker.remove(trail);
      svg.remove();
    };
    return true;
  }
  Scene.fly = fly;
  Scene.isFlying = () => flying;

  function dropGift(fromX, fromY) {
    const g = document.createElement('button');
    g.type = 'button';
    g.className = 'skygift';
    g.setAttribute('aria-label', 'Un cadeau tombé du ciel : ouvre-le !');
    g.setAttribute('data-cursor-label', 'Ouvre-moi !');
    g.innerHTML = Art.giftSprite();
    const landX = clamp(fromX - 28, 12, window.innerWidth - 76);
    g.style.left = landX + 'px';
    document.body.appendChild(g);
    const landY = window.innerHeight - 92;
    g.animate([
      { transform: 'translate3d(0,' + fromY + 'px,0) rotate(-24deg) scale(.5)', easing: 'cubic-bezier(.5,0,1,.7)' },
      { transform: 'translate3d(0,' + landY + 'px,0) rotate(10deg) scale(1)', offset: 0.55, easing: 'ease-out' },
      { transform: 'translate3d(0,' + (landY - 54) + 'px,0) rotate(-6deg) scale(1)', offset: 0.76, easing: 'ease-in' },
      { transform: 'translate3d(0,' + landY + 'px,0) rotate(0deg) scale(1)', offset: 0.9, easing: 'ease-out' },
      { transform: 'translate3d(0,' + (landY - 14) + 'px,0)', offset: 0.95, easing: 'ease-in' },
      { transform: 'translate3d(0,' + landY + 'px,0)' }
    ], { duration: 1500, fill: 'forwards' });
    g.style.setProperty('--land', landY + 'px');

    const bye = setTimeout(() => g.classList.add('leaving'), 18000);
    setTimeout(() => g.remove(), 19000);
    g.addEventListener('click', () => {
      clearTimeout(bye);
      const r = g.getBoundingClientRect();
      Noel.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 46);
      Noel.audio.chime();
      g.remove();
      const useFact = Math.random() < 0.6;
      const text = useFact ? pick(FACTS) : pick(JOKES);
      Noel.toast('<b>Un cadeau tombé du ciel !</b><br><span class="toast-small">' + (useFact ? 'Le saviez-vous ? ' : '') + Noel.esc(text) + '</span>',
        { duration: 8000, className: 'toast-card' });
      Noel.secrets && Noel.secrets.discover('skygift');
    }, { once: true });
  }

  function scheduleFlights() {
    const loop = (first) => {
      setTimeout(() => {
        if (!document.hidden && !Noel.calm) fly();
        loop(false);
      }, first ? rand(14000, 22000) : rand(38000, 70000));
    };
    loop(true);
  }

  /* ======================================================================
     8. Décor du héros : village, sapin, bonhomme de neige
     ====================================================================== */
  let melodyBuf = [];
  const MELODY = ['Mi', 'Mi', 'Mi', 'Mi', 'Mi', 'Mi', 'Mi', 'Sol', 'Do', 'Ré', 'Mi'];

  function playBauble(el) {
    const note = el.getAttribute('data-note');
    if (!Noel.audio.enabled) {
      Noel.audio.setEnabled(true);
      Noel.toast('Son activé 🔔 — tu peux le couper en haut à droite.', { duration: 2800 });
    }
    Noel.audio.note(note);
    el.classList.remove('ring'); void el.getBoundingClientRect(); el.classList.add('ring');
    const r = el.getBoundingClientRect();
    Noel.fx.sparkle(r.left + r.width / 2, r.top + r.height / 2);
    Noel.fx.sparkle(r.left + r.width / 2, r.top + r.height / 2);
    melodyBuf.push(note);
    if (melodyBuf.length > MELODY.length) melodyBuf.shift();
    if (melodyBuf.length === MELODY.length && melodyBuf.every((n, i) => n === MELODY[i])) {
      melodyBuf = [];
      setTimeout(() => {
        Noel.audio.melody();
        const c = Noel.centerOf($('#tree'));
        Noel.fx.fireworks(c.x, c.y - c.h * 0.2);
        setTimeout(() => Noel.fx.fireworks(c.x - 90, c.y - c.h * 0.35), 350);
        setTimeout(() => Noel.fx.fireworks(c.x + 90, c.y - c.h * 0.3), 700);
        Noel.toast('<b>Bravo, quel talent !</b><br><span class="toast-small">Tu viens de jouer « Jingle Bells » sur le sapin.</span>');
      }, 450);
      Noel.secrets && Noel.secrets.discover('melody');
    }
  }

  function shakeTree() {
    const svg = $('.tree-svg');
    if (!svg) return;
    svg.classList.remove('shake'); void svg.getBoundingClientRect(); svg.classList.add('shake');
    const r = svg.getBoundingClientRect();
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        const t = Math.random();
        Noel.fx.puff(r.left + r.width * (0.15 + Math.random() * 0.7), r.top + r.height * (0.15 + t * 0.7));
      }, i * 30);
    }
    if (Noel.audio.enabled) Noel.audio.jingle(6);
  }

  function starWish() {
    const star = $('.treestar');
    if (!star) return;
    const r = star.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    Noel.fx.burst(x, y, { n: 30, shapes: ['spark', 'star'], colors: ['#fff2b0', '#ffd166', '#ffffff'], power: 300, g: 120, size: [6, 13] });
    Noel.audio.chime();
    star.classList.remove('wish'); void star.getBoundingClientRect(); star.classList.add('wish');
    Noel.toast('<b>Un vœu s\'envole…</b><br><span class="toast-small">Ferme les yeux et pense très fort à ta liste.</span>', { duration: 3200 });
    Noel.secrets && Noel.secrets.discover('star');
  }

  const SNOW_LINES = [
    'Brrr… il fait bon aujourd\'hui, non ?',
    'Tu as vu tous ces cadeaux ? Moi, je n\'ai qu\'une carotte.',
    'Chut, je fais semblant d\'être une statue.',
    'Tu ne sens pas une odeur de carotte ?',
    'Attention, je fonds pour les câlins.',
    'Mon chapeau est mon plus beau cadeau.'
  ];
  let snowClicks = 0, bubbleTimer = null;

  function say(text) {
    const b = $('#bubble');
    if (!b) return;
    b.textContent = text;
    b.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => b.classList.remove('show'), 3200);
  }

  function snowmanClick() {
    snowClicks++;
    const svg = $('.snowman-svg');
    svg.classList.remove('hop'); void svg.getBoundingClientRect(); svg.classList.add('hop');
    const r = svg.getBoundingClientRect();
    Noel.fx.puff(r.left + r.width / 2, r.top + r.height * 0.1);
    if (snowClicks >= 3) {
      snowClicks = 0;
      const c = $('.sn-carrot', svg);
      c.classList.remove('lost'); void c.getBoundingClientRect(); c.classList.add('lost');
      say('MA CAROTTE ! Rends-la-moi !');
      Noel.audio.sparkle();
      Noel.secrets && Noel.secrets.discover('snowman');
    } else {
      say(pick(SNOW_LINES));
    }
  }

  function moonClick() {
    const sil = $('#moon-sil');
    if (!sil || sil.classList.contains('go')) return;
    sil.innerHTML = Art.flight({ silhouette: true });
    sil.classList.add('go');
    Noel.audio.jingle(8);
    setTimeout(() => { sil.classList.remove('go'); sil.innerHTML = ''; }, 3600);
    Noel.secrets && Noel.secrets.discover('moon');
  }

  /* ---- Lutins cachés ---- */
  const elves = new Set(Noel.store.get('elves', []));
  Scene.elfIds = () => Array.from(new Set($$('[data-elf]').map((e) => e.dataset.elf)));
  Scene.elfTotal = () => Scene.elfIds().length;
  Scene.elfFound = () => Scene.elfIds().filter((id) => elves.has(id)).length;

  Scene.updateElfUI = function () {
    const total = Scene.elfTotal();
    const found = Scene.elfFound();
    const out = $('#elf-count');
    if (out) out.textContent = 'Lutins : ' + found + '/' + total;
    Scene.elfIds().forEach((id) => {
      $$('[data-elf="' + id + '"]').forEach((e) => e.classList.toggle('found', elves.has(id)));
    });
  };

  function foundElf(el) {
    const id = el.dataset.elf;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    el.classList.remove('hop'); void el.getBoundingClientRect(); el.classList.add('hop');
    if (elves.has(id)) {
      Noel.fx.sparkle(x, y);
      Noel.toast('Hihi ! Tu m\'avais déjà trouvé. 🧝', { duration: 1800 });
      return;
    }
    elves.add(id);
    Noel.store.set('elves', Array.from(elves));
    Noel.fx.burst(x, y, { n: 26, power: 330 });
    Noel.audio.chime();
    Scene.updateElfUI();
    const total = Scene.elfTotal(), found = Scene.elfFound();
    Noel.toast('<b>Lutin trouvé !</b> ' + found + ' / ' + total + '<br><span class="toast-small">' +
      (found === total ? 'Tous les lutins sont de retour au pôle Nord.' : 'Il en reste encore à débusquer…') + '</span>');
    if (found === total) Noel.secrets && Noel.secrets.discover('elves');
  }

  Scene.resetElves = function () {
    elves.clear();
    Noel.store.remove('elves');
    Scene.updateElfUI();
  };

  /**
   * Le lutin du toit se pose sur une cheminée qui est bien visible à l'écran et qui n'est jamais
   * cachée par le titre, le compte à rebours, le bouton, le sapin ou le bonhomme de neige.
   * On refait le calcul quand la fenêtre change de taille ou quand les polices arrivent.
   */
  function placeRoofElf() {
    const slot = $('.elf-slot');
    const hero = $('.hero');
    if (!slot || !hero) return;
    const svg = slot.ownerSVGElement;
    const marks = $$('.chim', svg);
    const ctm = svg.getScreenCTM();
    if (!marks.length || !ctm) return;

    const vw = window.innerWidth;
    const k = Math.abs(ctm.a) || 1;               // taille d'une unité du village, à l'écran
    const ew = 44 * 0.75 * k, eh = 48 * 0.75 * k; // taille du lutin, à l'écran
    const heroRect = hero.getBoundingClientRect();
    const top0 = heroRect.top;                    // pour raisonner comme si la page n'était pas défilée
    const heroH = heroRect.height;
    // obstacles : le texte d'accueil (avec une marge de confort) et le dessin du sapin / du bonhomme de neige
    const toBox = (el, pad) => {
      const r = el.getBoundingClientRect();
      return { l: r.left - pad, r: r.right + pad, t: r.top - top0 - pad, b: r.bottom - top0 + pad };
    };
    const blockers = $$('.hero-content > *').map((el) => toBox(el, 12))
      .concat($$('#tree .tree-body, #snowman .snowman-svg').map((el) => toBox(el, 2)))
      .filter((b) => b.r - b.l > 4 && b.b - b.t > 4);
    const area = (a) => Math.max(0, a.r - a.l) * Math.max(0, a.b - a.t);
    const overlapWith = (a, b) => area({ l: Math.max(a.l, b.l), r: Math.min(a.r, b.r), t: Math.max(a.t, b.t), b: Math.min(a.b, b.b) });

    const wanted = vw >= 900 ? vw * 0.7 : vw * 0.55;
    const cands = marks.map((m) => {
      const r = m.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top - top0;
      const box = { l: cx - ew / 2, r: cx + ew / 2, t: cy - eh + 2 * k, b: cy + 2 * k };
      const inView = box.l >= 10 && box.r <= vw - 10 && box.t >= 76 && box.b <= heroH - 54;
      // part du lutin recouverte par un obstacle (0 = libre, 1 = totalement caché)
      const covered = Math.min(1, blockers.reduce((sum, b) => sum + overlapWith(box, b), 0) / area(box));
      return { m, inView, covered, ground: m.classList.contains('ground'), dist: Math.abs(cx - wanted) };
    });
    // à l'écran > le moins recouvert > une cheminée plutôt que le sol > proche de la zone voulue
    const score = (c) => (c.inView ? 0 : 1e7) + c.covered * 1e5 + (c.ground ? 2000 : 0) + c.dist;
    const best = cands.slice().sort((a, b) => score(a) - score(b))[0];
    if (!best) return;
    const x = parseFloat(best.m.getAttribute('data-x'));
    const y = parseFloat(best.m.getAttribute('data-y'));
    slot.setAttribute('transform', 'translate(' + (x - 16.5).toFixed(1) + ' ' + (y - 36).toFixed(1) + ')');
  }
  Scene.placeRoofElf = placeRoofElf;

  function initRoofElf() {
    placeRoofElf();
    let timer = null;
    const later = () => { clearTimeout(timer); timer = setTimeout(placeRoofElf, 180); };
    window.addEventListener('resize', later);
    window.addEventListener('load', later);
    window.addEventListener('orientationchange', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
    setTimeout(placeRoofElf, 900);
  }

  function initProps() {
    $('#layer-village').innerHTML = Art.village();
    $('#tree').innerHTML = Art.tree();
    const sm = $('#snowman');
    sm.innerHTML = Art.snowman();
    const bubble = $('#bubble');
    if (bubble) sm.appendChild(bubble);

    $('#tree').addEventListener('click', (e) => {
      if (e.target.closest('[data-elf]')) return;
      const bb = e.target.closest('.bb');
      if (bb) return playBauble(bb);
      if (e.target.closest('.treestar')) return starWish();
      shakeTree();
    });
    $('#tree').addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const bb = e.target.closest && e.target.closest('.bb');
      if (bb) { e.preventDefault(); playBauble(bb); }
      else if (e.target.closest && e.target.closest('.treestar')) { e.preventDefault(); starWish(); }
    });
    sm.addEventListener('click', (e) => { if (!e.target.closest('[data-elf]')) snowmanClick(); });

    const moon = $('#moon');
    moon.addEventListener('click', moonClick);
    moon.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); moonClick(); } });

    document.addEventListener('click', (e) => {
      const el = e.target.closest && e.target.closest('[data-elf]');
      if (el) { e.stopPropagation(); foundElf(el); }
    });
  }

  /* ======================================================================
     9. Défilement : barre du haut, bouton « remonter », apparitions
     ====================================================================== */
  function initScrollUI() {
    const topbar = $('#topbar');
    const toTop = $('#to-top');
    const onScroll = () => {
      const y = window.scrollY;
      topbar.classList.toggle('scrolled', y > 20);
      toTop.classList.toggle('show', y > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      fly();
    });

    let io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    }
    Scene.reveal = (el) => {
      if (io) io.observe(el); else el.classList.add('in');
    };
    $$('.reveal').forEach(Scene.reveal);
  }

  /* ======================================================================
     Démarrage
     ====================================================================== */
  Scene.init = function () {
    buildStars();
    initGarland();
    initProps();
    initCountdown();
    initRoofElf();
    initParallax();
    initScrollUI();
    scheduleShooting();
    scheduleFlights();
  };
})();
