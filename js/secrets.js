/* ==========================================================================
   SECRETS — easter eggs, carnet des secrets, mots magiques à taper
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { $, $$, esc } = Noel;
  const Secrets = (Noel.secrets = {});

  /** Tous les secrets du site. `hint` est affiché tant qu'ils ne sont pas trouvés. */
  const DEFS = [
    { id: 'konami',   icon: '🎮', title: 'Le code du Père Noël',  desc: 'Tu connais la combinaison légendaire des vieux jeux vidéo !', hint: 'Les anciens joueurs connaissent la combinaison : quatre flèches, puis B et A.' },
    { id: 'moon',     icon: '🌕', title: 'Rendez-vous avec la Lune', desc: 'Quelqu\'un est passé devant la lune…', hint: 'Quelqu\'un passe parfois devant la lune, à condition de savoir la toucher.' },
    { id: 'snowman',  icon: '⛄', title: 'Une odeur de carotte',  desc: 'Tu as fait perdre son nez au bonhomme de neige.', hint: 'Le bonhomme de neige tient beaucoup à son nez. Insiste un peu.' },
    { id: 'star',     icon: '⭐', title: 'Un vœu étoilé',         desc: 'Tu as fait un vœu sur l\'étoile du sapin.', hint: 'Tout en haut du sapin, quelque chose brille.' },
    { id: 'melody',   icon: '🎶', title: 'Concert de sapin',      desc: 'Tu as joué « Jingle Bells » sur les boules du sapin.', hint: 'Les boules du sapin savent chanter. Mi Mi Mi, Mi Mi Mi, Mi Sol Do Ré Mi…' },
    { id: 'lights',   icon: '💡', title: 'Soirée disco',          desc: 'Tu as lancé le mode disco de la guirlande.', hint: 'La guirlande a plusieurs humeurs. Clique sur ses ampoules.' },
    { id: 'skygift',  icon: '🛷', title: 'Livraison express',     desc: 'Tu as attrapé le traîneau et récupéré un cadeau.', hint: 'Le traîneau passe de temps en temps dans le ciel… attrape-le !' },
    { id: 'unwrap',   icon: '🎁', title: 'Le grand déballage',    desc: 'Tu as déballé tous les paquets d\'un seul coup.', hint: 'Un bouton permet de tout déballer d\'un seul coup. Quelle impatience !' },
    { id: 'elves',    icon: '🧝', title: 'La chasse aux lutins',   desc: 'Tu as retrouvé tous les lutins cachés.', hint: 'Des lutins se cachent un peu partout. Ouvre l\'œil (et déballe les paquets).' },
    { id: 'grinch',   icon: '💚', title: 'Un invité grincheux',   desc: 'Tu as invoqué le grincheux vert.', hint: 'Écris au clavier le nom de celui qui déteste Noël.' },
    { id: 'rudolph',  icon: '🔴', title: 'Le nez qui brille',     desc: 'Tu as réveillé Rudolph, le renne au nez rouge.', hint: 'Écris au clavier le nom du renne le plus célèbre.' },
    { id: 'blizzard', icon: '❄️', title: 'Tempête de neige',      desc: 'Tu as déclenché le blizzard.', hint: 'Écris au clavier ce qui tombe du ciel en hiver.' },
    { id: 'sleep',    icon: '😴', title: 'Chut, ça dort',         desc: 'Tu n\'as plus bougé pendant un moment : ton curseur s\'est endormi.', hint: 'Ne touche plus à rien pendant un petit moment…' }
  ];

  const found = new Set(Noel.store.get('secrets', []));

  Secrets.defs = DEFS;
  Secrets.total = () => DEFS.length;
  Secrets.count = () => DEFS.filter((d) => found.has(d.id)).length;
  Secrets.has = (id) => found.has(id);

  /* ---------- Découverte ---------- */
  Secrets.discover = function (id) {
    const d = DEFS.find((x) => x.id === id);
    if (!d || found.has(id)) return false;
    found.add(id);
    Noel.store.set('secrets', Array.from(found));
    updateUI();
    const ov = $('#secrets-overlay');
    if (ov && !ov.hidden) renderList();
    const n = Secrets.count();
    setTimeout(() => {
      Noel.toast('<span class="toast-ico" aria-hidden="true">' + d.icon + '</span><b>Secret découvert !</b><br><span class="toast-small">' +
        esc(d.title) + ' · ' + n + '/' + DEFS.length + '</span>', { duration: 4600, className: 'toast-secret' });
      Noel.audio.chime();
    }, 350);
    if (n === DEFS.length) setTimeout(allFound, 2200);
    return true;
  };

  function setGolden() {
    Noel.golden = true;
    document.body.classList.add('golden');
  }

  function allFound() {
    setGolden();
    Noel.toast('<b>Tu as TOUT trouvé !</b><br><span class="toast-small">Le Père Noël est impressionné : le mode doré est débloqué.</span>',
      { duration: 7000, className: 'toast-secret' });
    Noel.fx.rain('confetti', 5000);
    [0, 400, 800, 1200].forEach((t) => setTimeout(() => {
      Noel.fx.fireworks(Noel.rand(innerWidth * 0.15, innerWidth * 0.85), Noel.rand(innerHeight * 0.15, innerHeight * 0.5));
    }, t));
    Noel.audio.melody();
  }

  /* ---------- Carnet (fenêtre) ---------- */
  function updateUI() {
    const n = Secrets.count();
    const total = DEFS.length;
    const c = $('#secrets-count');
    if (c) c.textContent = n + '/' + total;
    const bar = $('#secrets-bar');
    if (bar) bar.style.width = ((n / total) * 100).toFixed(0) + '%';
    const txt = $('#secrets-progress-txt');
    if (txt) txt.textContent = n + ' / ' + total;
    const btn = $('#btn-secrets');
    if (btn) btn.classList.toggle('has-all', n === total);
  }

  function renderList() {
    const list = $('#secrets-list');
    list.innerHTML = DEFS.map((d) => {
      const ok = found.has(d.id);
      let desc = ok ? d.desc : d.hint;
      if (!ok && d.id === 'elves' && Noel.scene) desc += ' (' + Noel.scene.elfFound() + '/' + Noel.scene.elfTotal() + ' trouvés)';
      return '<li class="secret ' + (ok ? 'is-found' : 'is-locked') + '">' +
        '<span class="secret-ico" aria-hidden="true">' + (ok ? d.icon : '?') + '</span>' +
        '<div><b>' + (ok ? esc(d.title) : 'Secret à découvrir') + '</b><p>' + esc(desc) + '</p></div></li>';
    }).join('');
  }

  /* Le carnet est un calque ordinaire (pas un <dialog> en « couche supérieure » du navigateur),
     sinon notre curseur personnalisé passerait derrière. Il reste accessible : rôle dialog,
     focus déplacé dedans, reste de la page « inerte », Échap pour fermer. */
  const BEHIND = ['.skip-link', '#topbar', '#contenu', '.footer', '#to-top'];
  let lastFocus = null;

  function setBehindInert(on) {
    BEHIND.forEach((sel) => {
      const el = $(sel);
      if (!el) return;
      if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  }

  function onPanelKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      Secrets.closePanel();
    }
  }

  Secrets.openPanel = function () {
    const ov = $('#secrets-overlay');
    if (!ov || !ov.hidden) return;
    lastFocus = document.activeElement;
    renderList();
    updateUI();
    ov.hidden = false;
    setBehindInert(true);
    window.addEventListener('keydown', onPanelKey, true);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ov.classList.add('open');
      const close = $('#secrets-close');
      if (close) close.focus({ preventScroll: true });
    }));
  };

  Secrets.closePanel = function () {
    const ov = $('#secrets-overlay');
    if (!ov || ov.hidden) return;
    ov.classList.remove('open');
    setBehindInert(false);
    window.removeEventListener('keydown', onPanelKey, true);
    setTimeout(() => { if (!ov.classList.contains('open')) ov.hidden = true; }, 320);
    if (lastFocus && document.contains(lastFocus) && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  /* ---------- Les effets ---------- */
  function konami() {
    Secrets.discover('konami');
    Noel.toast('<b>HO HO HO !</b><br><span class="toast-small">Code du Père Noël activé…</span>', { duration: 4200 });
    if (Noel.scene) Noel.scene.fly({ force: true, y: window.innerHeight * 0.2, duration: 6500 });
    Noel.fx.rain('gift', 6500);
    Noel.audio.jingle(16);
    Noel.audio.melody();
  }

  let grinchBusy = false;
  async function grinchMode() {
    if (grinchBusy) return;
    grinchBusy = true;
    Secrets.discover('grinch');
    const mood = $('#mood-grinch');
    mood.classList.add('on');
    const face = document.createElement('div');
    face.className = 'grinch';
    face.innerHTML = Noel.art.grinch();
    document.body.appendChild(face);
    requestAnimationFrame(() => requestAnimationFrame(() => face.classList.add('up')));
    Noel.toast('<b>Le grincheux vert est là…</b><br><span class="toast-small">« Je vais voler ta liste ! »</span>', { duration: 3400 });
    await Noel.wait(1600);
    $$('.gift').forEach((g, i) => setTimeout(() => g.classList.add('stolen'), i * 90));
    await Noel.wait(3800);
    Noel.toast('<b>…Finalement non.</b><br><span class="toast-small">Son cœur vient de grandir de trois tailles. Joyeux Noël !</span>', { duration: 4400 });
    $$('.gift').forEach((g, i) => setTimeout(() => g.classList.remove('stolen'), i * 80));
    face.classList.remove('up');
    mood.classList.remove('on');
    Noel.fx.confetti(innerWidth / 2, innerHeight * 0.55, 60);
    Noel.audio.chime();
    await Noel.wait(1100);
    face.remove();
    grinchBusy = false;
  }

  let rudolphTimer = null;
  function rudolphMode() {
    Secrets.discover('rudolph');
    if (Noel.cursor) Noel.cursor.set('reindeer');
    const g = $('#rudolph-glow');
    g.classList.add('on');
    clearTimeout(rudolphTimer);
    rudolphTimer = setTimeout(() => g.classList.remove('on'), 15000);
    Noel.toast('<b>Rudolph a rejoint la fête !</b><br><span class="toast-small">Son nez éclaire la nuit…</span>');
    Noel.audio.sparkle();
  }

  let stormTimer = null;
  function blizzard() {
    Secrets.discover('blizzard');
    Noel.snow.storm(true);
    $('#mood-blizzard').classList.add('on');
    Noel.toast('<b>Tempête de neige !</b><br><span class="toast-small">Accroche-toi à ton bonnet.</span>', { duration: 2800 });
    clearTimeout(stormTimer);
    stormTimer = setTimeout(() => {
      Noel.snow.storm(false);
      $('#mood-blizzard').classList.remove('on');
    }, 9000);
  }

  function noelBurst() {
    Noel.fx.confetti(innerWidth / 2, innerHeight * 0.4, 50);
    Noel.audio.chime();
    Noel.toast('Joyeux Noël ! 🎄', { duration: 2000 });
  }

  /* ---------- Écoute du clavier ---------- */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  const WORDS = { grinch: grinchMode, rudolph: rudolphMode, rudolf: rudolphMode, renne: rudolphMode, neige: blizzard, blizzard: blizzard, noel: noelBurst };
  let kbuf = [];
  let typed = '';

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    const key = (e.key || '').toLowerCase();

    kbuf.push(key);
    if (kbuf.length > KONAMI.length) kbuf.shift();
    if (kbuf.length === KONAMI.length && kbuf.every((k, i) => k === KONAMI[i])) {
      kbuf = [];
      konami();
      return;
    }
    if (key.length === 1) {
      typed = (typed + key).slice(-12);
      for (const w in WORDS) {
        if (typed.endsWith(w)) { typed = ''; WORDS[w](); break; }
      }
    }
  }

  /* ---------- Démarrage ---------- */
  Secrets.reset = function () {
    found.clear();
    Noel.store.remove('secrets');
    Noel.golden = false;
    document.body.classList.remove('golden');
    if (Noel.scene) Noel.scene.resetElves();
    updateUI();
    renderList();
  };

  Secrets.init = function () {
    const backdrop = $('#secrets-backdrop');
    backdrop.addEventListener('click', () => Secrets.closePanel());
    // on ne laisse pas la page défiler derrière le carnet quand on tourne la molette sur le fond
    backdrop.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
    backdrop.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    $('#secrets-close').addEventListener('click', () => Secrets.closePanel());
    $('#secrets-reset').addEventListener('click', () => {
      if (window.confirm('Effacer tous les secrets découverts et les lutins retrouvés ?')) Secrets.reset();
    });
    window.addEventListener('keydown', onKey);
    Noel.on('sleep', () => Secrets.discover('sleep'));

    // Le nez de Rudolph éclaire la page autour du curseur
    const glow = $('#rudolph-glow');
    Noel.ticker.add(() => {
      if (!glow.classList.contains('on')) return;
      const p = Noel.cursor ? Noel.cursor.pos() : Noel.pointer;
      glow.style.transform = 'translate3d(' + p.x.toFixed(0) + 'px,' + p.y.toFixed(0) + 'px,0)';
    });

    if (Secrets.count() === DEFS.length) setGolden();
    updateUI();
  };
})();
