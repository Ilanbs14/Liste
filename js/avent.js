/* ==========================================================================
   AVENT — une animation spéciale chaque jour, du 1er au 25 décembre
   ==========================================================================
   • Chaque jour a sa surprise. Elle se joue toute seule à la première visite du jour.
   • Le bouton « calendrier » (en bas à gauche) montre les 25 portes : on peut rejouer
     les surprises déjà ouvertes. Les portes à venir restent fermées.
   • Pour essayer un jour précis (toi, le propriétaire) : ajoute  &jour=12  à l'adresse
     (ex. …/?guimauve-givree&jour=12). Avec jour=25 toutes les portes sont ouvertes.
   • Mode calme : on n'affiche que le message du jour, sans animation.
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { $, $$, rand, pick, clamp, wait, esc } = Noel;
  const Art = Noel.art;
  const Fx = Noel.fx;
  const Avent = (Noel.avent = {});

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  /* ======================================================================
     Briques réutilisables
     ====================================================================== */

  /** Un personnage (SVG) fixé à l'écran, qui traverse de gauche à droite */
  function walker(html, o) {
    const el = document.createElement('div');
    el.className = 'actor';
    el.innerHTML = html;
    el.style.width = o.w + 'px';
    el.style.bottom = o.bottom + 'px';
    document.body.appendChild(el);
    const a = el.animate(
      [{ transform: 'translate3d(' + (-o.w - 20) + 'px,0,0)' }, { transform: 'translate3d(' + (W() + 20) + 'px,0,0)' }],
      { duration: o.dur, delay: o.delay || 0, easing: 'linear', fill: 'both' }
    );
    a.onfinish = () => el.remove();
    if (o.bob) {
      el.firstElementChild.animate(
        [{ transform: 'translateY(0) rotate(-6deg)' }, { transform: 'translateY(' + -o.bob + 'px) rotate(6deg)' }],
        { duration: o.bobDur || 360, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: o.delay || 0 }
      );
    }
    return el;
  }

  const bodyClass = (name, ms) => {
    document.body.classList.add(name);
    return wait(ms).then(() => document.body.classList.remove(name));
  };

  const ringBaubles = () => $$('.bb').forEach((b, i) => setTimeout(() => {
    b.classList.remove('ring'); void b.getBoundingClientRect(); b.classList.add('ring');
  }, i * 140));

  async function sleighShow(n, dur) {
    for (let i = 0; i < n; i++) {
      const ok = Noel.scene.fly({ force: true, y: rand(H() * 0.14, H() * 0.32), duration: dur });
      await wait(ok ? dur + 500 : 1500);
    }
  }

  async function fireworkShow(n, gap) {
    for (let i = 0; i < n; i++) {
      Fx.fireworks(rand(W() * 0.12, W() * 0.88), rand(H() * 0.12, H() * 0.5));
      if (i % 3 === 0) Noel.audio.sparkle();
      await wait(gap + rand(-100, 200));
    }
    await wait(1800);
  }

  async function partyLights(ms) {
    const sc = Noel.scene;
    const prev = sc.getGarlandMode();
    const mood = $('#mood-disco');
    sc.setGarlandMode('disco');
    mood.classList.add('on');
    await wait(ms);
    mood.classList.remove('on');
    sc.setGarlandMode(prev === 'disco' ? 'twinkle' : prev);
  }

  async function snowStorm(ms) {
    const mood = $('#mood-blizzard');
    Noel.snow.storm(true);
    mood.classList.add('on');
    await wait(ms);
    Noel.snow.storm(false);
    mood.classList.remove('on');
  }

  /* ======================================================================
     Les 25 surprises
     ====================================================================== */
  const JOURS = [null,
    { n: 1, icone: '❄️', titre: 'Le premier flocon', texte: 'Les premiers gros flocons de l\'hiver tombent sur le village.',
      jouer() {
        Fx.shower('snowflake', { dur: 11000, rate: 7, colors: ['#ffffff', '#e4efff', '#bfe3ff'], size: [24, 46], vy: [40, 90], spin: 0.8, sway: 32 });
        return wait(15000);
      } },
    { n: 2, icone: '🌠', titre: 'Pluie d\'étoiles filantes', texte: 'Fais un vœu, c\'est le moment ou jamais !',
      jouer() {
        for (let i = 0; i < 12; i++) setTimeout(() => Noel.scene.shootingStar(), i * 650);
        Fx.shower('spark', { dur: 7000, rate: 5, colors: ['#fff2b0', '#ffffff', '#ffd166'], size: [8, 14], vy: [30, 70], sway: 20 });
        return wait(9500);
      } },
    { n: 3, icone: '🍬', titre: 'Cannes en sucre', texte: 'Le ciel a décidé de faire une pause gourmande.',
      jouer() {
        Fx.shower('candy', { dur: 9000, rate: 5, size: [32, 52], vy: [90, 170], spin: 2.2, sway: 20 });
        return wait(14000);
      } },
    { n: 4, icone: '🧝', titre: 'La parade des lutins', texte: 'Les lutins défilent : ils rejoignent leur poste à l\'atelier.',
      jouer() {
        const w = clamp(W() * 0.04, 36, 56);
        for (let i = 0; i < 7; i++) {
          walker(Art.elf(), { w, bottom: 6 + (i % 2) * 9, dur: 12000, delay: i * 700, bob: 10, bobDur: 340 + (i % 3) * 30 });
        }
        Noel.audio.jingle(10);
        return wait(12000 + 7 * 700 + 300);
      } },
    { n: 5, icone: '🔔', titre: 'Concert de clochettes', texte: 'Tout le sapin tinte. Active le son (la cloche en haut) pour l\'entendre !',
      jouer() {
        Fx.shower('bell', { dur: 8000, rate: 4, size: [30, 46], vy: [80, 150], spin: 1.2, sway: 26 });
        ringBaubles();
        setTimeout(ringBaubles, 2500);
        setTimeout(ringBaubles, 5000);
        Noel.audio.jingle(16);
        setTimeout(() => Noel.audio.melody(), 600);
        return wait(13000);
      } },
    { n: 6, icone: '🍊', titre: 'Saint-Nicolas', texte: 'Pain d\'épices et mandarines : la tournée de Saint-Nicolas commence.',
      jouer() {
        Fx.shower('gingerbread', { dur: 9000, rate: 3.2, size: [44, 62], vy: [90, 160], spin: 1.4 });
        Fx.shower('tangerine', { dur: 9000, rate: 3, size: [28, 40], vy: [100, 180], spin: 1.2 });
        return wait(14000);
      } },
    { n: 7, icone: '🌌', titre: 'Aurore boréale', texte: 'Le ciel du pôle Nord met ses plus belles couleurs.',
      jouer() {
        for (let i = 0; i < 4; i++) setTimeout(() => Noel.scene.shootingStar(), 2500 + i * 3000);
        return bodyClass('fx-aurora', 17000);
      } },
    { n: 8, icone: '⛄', titre: 'Le bonhomme de neige danse', texte: 'Quand la musique est bonne…',
      async jouer() {
        const sm = $('.snowman-svg');
        if (sm) {
          const r = sm.getBoundingClientRect();
          if (r.bottom < 0 || r.top > H()) { window.scrollTo({ top: 0, behavior: 'smooth' }); await wait(900); }
          sm.classList.add('dance');
        }
        Noel.audio.melody();
        const lines = ['Un, deux, trois…', 'Regardez-moi bouger !', 'Je ne fonds pas, je brille !', 'Encore, encore !'];
        for (let i = 0; i < lines.length; i++) {
          Noel.scene.say(lines[i]);
          const r = sm ? sm.getBoundingClientRect() : { left: 80, top: H() - 200, width: 100 };
          Fx.burst(r.left + r.width / 2, r.top + 20, { n: 8, shapes: ['star', 'spark'], colors: ['#ffd166', '#ffffff', '#ff7aa2'], power: 260, g: 160, size: [8, 14] });
          await wait(2300);
        }
        if (sm) sm.classList.remove('dance');
      } },
    { n: 9, icone: '🚂', titre: 'Le train de Noël', texte: 'Le petit train livre les cadeaux de la gare du pôle Nord.',
      jouer() {
        const w = clamp(W() * 0.4, 280, 480);
        walker(Art.train(), { w, bottom: 0, dur: 10000, bob: 3, bobDur: 180 });
        Noel.audio.jingle(12);
        return wait(10600);
      } },
    { n: 10, icone: '🎁', titre: 'Pluie de cadeaux', texte: 'Dix jours déjà : le Père Noël fait de la place dans sa hotte.',
      jouer() {
        Fx.rain('gift', 7000);
        return wait(11500);
      } },
    { n: 11, icone: '💡', titre: 'Guirlande en folie', texte: 'Les lumières ont décidé de faire la fête.',
      async jouer() {
        Fx.shower('spark', { dur: 8000, rate: 9, colors: ['#ff4d6d', '#ffd166', '#3ddc97', '#4cc9f0', '#c77dff'], size: [10, 18], vy: [30, 80], sway: 24 });
        await partyLights(9000);
      } },
    { n: 12, icone: '🏮', titre: 'Lanternes dans la nuit', texte: 'Des lanternes s\'envolent vers le ciel étoilé.',
      jouer() {
        Fx.shower('lantern', { dur: 12000, rate: 2.4, size: [36, 56], vy: [45, 85], rise: true, sway: 30, spin: 0.25 });
        return wait(19000);
      } },
    { n: 13, icone: '☃️', titre: 'Bataille de boules de neige', texte: 'Le bonhomme de neige est attaqué de toutes parts !',
      async jouer() {
        const sm = $('.snowman-svg');
        for (let i = 0; i < 16; i++) {
          const r = sm ? sm.getBoundingClientRect() : null;
          const visible = r && r.top < H() && r.bottom > 0;
          const own = i % 2 === 0;
          const sx = own ? (visible ? r.left + r.width * 0.75 : 70) : W() + 30;
          const sy = own ? (visible ? r.top + r.height * 0.32 : H() - 80) : rand(H() * 0.3, H() * 0.7);
          const tx = own ? rand(W() * 0.35, W() * 0.95) : rand(W() * 0.05, visible ? r.left + r.width / 2 : W() * 0.4);
          const ty = own ? rand(H() * 0.2, H() * 0.7) : (visible ? r.top + r.height * 0.4 : H() - 80);
          const T = rand(0.9, 1.3), g = 900;
          Fx.add({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy) / T - 0.5 * g * T, g, drag: 0, size: rand(18, 28), shape: 'snowball', life: T, nofade: true, vr: rand(-4, 4) });
          setTimeout(() => {
            Fx.burst(tx, ty, { n: 10, shapes: ['puff', 'circle'], colors: ['#ffffff', '#dbe8ff'], power: 240, g: 420, size: [6, 13] });
            Fx.puff(tx, ty);
          }, T * 1000);
          if (sm && (own || (!own && visible))) { sm.classList.remove('hop'); void sm.getBoundingClientRect(); sm.classList.add('hop'); }
          await wait(rand(380, 620));
        }
        await wait(1500);
      } },
    { n: 14, icone: '💞', titre: 'Sous le gui', texte: 'Des cœurs et du houx : bisous sous le gui !',
      jouer() {
        Fx.shower('heart', { dur: 10000, rate: 5, colors: ['#ff4d6d', '#ff7aa2', '#ff9fb8', '#d62839'], size: [22, 38], vy: [50, 100], rise: true, sway: 28, spin: 0.6 });
        Fx.shower('holly', { dur: 10000, rate: 2, size: [44, 60], vy: [70, 120], spin: 1 });
        return wait(16000);
      } },
    { n: 15, icone: '🧤', titre: 'Bonnets et moufles', texte: 'Il fait froid : tout le monde s\'équipe.',
      jouer() {
        Fx.shower('mitten', { dur: 9000, rate: 3.4, colors: ['#d62839', '#2f6fd1', '#1f9d55', '#7f43c4', '#e8b74f'], size: [36, 54], vy: [90, 160], spin: 1.6 });
        Fx.shower('hat', { dur: 9000, rate: 2.2, size: [40, 58], vy: [90, 160], spin: 1.4 });
        return wait(14000);
      } },
    { n: 16, icone: '🛷', titre: 'Le Père Noël en repérage', texte: 'Il vérifie le ciel. Attrape son traîneau pour recevoir un cadeau !',
      async jouer() { await sleighShow(2, 7500); } },
    { n: 17, icone: '🌨️', titre: 'Tempête de neige', texte: 'Ça souffle : accroche-toi à ton bonnet !',
      async jouer() { await snowStorm(10500); } },
    { n: 18, icone: '🍪', titre: 'Biscuits pour le Père Noël', texte: 'Une petite faim ? Il y en a pour tout le monde.',
      jouer() {
        Fx.shower('cookie', { dur: 9000, rate: 5, size: [34, 50], vy: [90, 170], spin: 1.8 });
        return wait(14000);
      } },
    { n: 19, icone: '🎆', titre: 'Feux d\'artifice', texte: 'Pour fêter la dernière ligne droite : boum !',
      async jouer() { await fireworkShow(11, 550); } },
    { n: 20, icone: '🎄', titre: 'Les boules s\'échappent', texte: 'Elles ont sauté du sapin et rebondissent partout !',
      jouer() {
        Fx.shower('bauble', { dur: 6500, rate: 4.5, colors: ['#e63950', '#ffd166', '#4cc9f0', '#b672f5', '#ff7aa2', '#ff9f1c'], size: [28, 44], vy: [0, 60], vx: [-160, 160], g: 1100, sway: 0, bounce: 0.74, spin: 2.5, life: 11 });
        ringBaubles();
        return wait(12500);
      } },
    { n: 21, icone: '🌙', titre: 'Solstice d\'hiver', texte: 'La nuit la plus longue de l\'année… et l\'une des plus magiques.',
      jouer() {
        Fx.shower('rect', { dur: 11000, rate: 14, colors: ['#ffd166', '#fff2b0', '#e0a526'], size: [6, 11], vy: [40, 100], spin: 6, sway: 30 });
        for (let i = 0; i < 5; i++) setTimeout(() => Noel.scene.shootingStar(), 1500 + i * 2500);
        return bodyClass('fx-solstice', 15000);
      } },
    { n: 22, icone: '🦌', titre: 'Les rennes à toute vitesse', texte: 'L\'entraînement du Père Noël est presque terminé.',
      jouer() {
        const w = clamp(W() * 0.1, 84, 150);
        for (let i = 0; i < 4; i++) {
          walker(Art.deerSvg(i === 0, i * 0.13), { w, bottom: 12 + (i % 2) * 20, dur: 5200, delay: i * 520, bob: 9, bobDur: 280 });
        }
        Noel.audio.jingle(14);
        return wait(5200 + 4 * 520 + 400);
      } },
    { n: 23, icone: '✨', titre: 'Pluie d\'or', texte: 'Tout brille : plus que deux dodos avant Noël !',
      jouer() {
        Fx.shower('rect', { dur: 10000, rate: 38, colors: ['#ffd166', '#fff2b0', '#e0a526', '#ffffff'], size: [7, 13], vy: [140, 280], spin: 8, sway: 40 });
        Fx.shower('spark', { dur: 10000, rate: 8, colors: ['#fff2b0', '#ffd166'], size: [10, 18], vy: [90, 180], sway: 30 });
        Noel.audio.sparkle();
        return wait(14500);
      } },
    { n: 24, icone: '🎅', titre: 'Le décollage', texte: 'Le traîneau décolle : surveille le ciel, il est en route !',
      async jouer() {
        Fx.shower('star', { dur: 14000, rate: 3, colors: ['#ffd166', '#fff2b0', '#ffffff'], size: [14, 24], vy: [50, 110], spin: 1.5 });
        Noel.audio.jingle(18);
        await sleighShow(3, 7000);
      } },
    { n: 25, icone: '🎄', titre: 'Joyeux Noël !', texte: 'Le grand jour est là. Profite de chaque instant (et de chaque cadeau).',
      async jouer() {
        Fx.rain('confetti', 9000);
        Fx.shower('gift', { dur: 8000, rate: 2, colors: ['#d62839', '#1f9d55', '#2f6fd1', '#e8b74f', '#7f43c4', '#ee6a95'], size: [24, 40], vy: [120, 200] });
        partyLights(12000);
        Noel.audio.melody();
        await fireworkShow(9, 700);
        await sleighShow(1, 8000);
      } }
  ];
  Avent.JOURS = JOURS;

  /* ======================================================================
     Quel jour sommes-nous ?
     ====================================================================== */
  Avent.today = function () {
    const m = /(?:^|[?&])jour=(\d{1,2})(?:&|$)/.exec(window.location.search);
    if (m) return { jour: clamp(parseInt(m[1], 10), 0, 25), simule: true };
    const d = new Date();
    if (d.getMonth() === 11) return { jour: Math.min(d.getDate(), 25), simule: false, enCours: d.getDate() <= 25 };
    return { jour: 0, simule: false };
  };

  /* ======================================================================
     Jouer la surprise d'un jour
     ====================================================================== */
  let busy = false;

  Avent.play = async function (n) {
    const day = JOURS[n];
    if (!day) return false;
    Noel.toast('<span class="toast-ico" aria-hidden="true">' + day.icone + '</span><b>Jour ' + n + ' · ' + esc(Noel.typo(day.titre)) +
      '</b><br><span class="toast-small">' + esc(Noel.typo(day.texte)) + '</span>', { duration: 6000, className: 'toast-avent' });
    if (Noel.calm) return true; // mode calme : le message seulement
    if (busy) {
      Noel.toast('Patience, une surprise est déjà en cours !', { duration: 2000 });
      return false;
    }
    busy = true;
    try { await day.jouer(); } catch (e) { console.error('[Noel] Avent, jour ' + n, e); }
    busy = false;
    return true;
  };
  Avent.isBusy = () => busy;

  /* ======================================================================
     Calendrier (fenêtre) et bouton
     ====================================================================== */
  let overlay, grid;

  function daysUntil(n) {
    const now = new Date();
    let y = now.getFullYear();
    let t = new Date(y, 11, n);
    if (now.getMonth() === 11 && now.getDate() > 25) t = new Date(y + 1, 11, n);
    return Math.max(1, Math.ceil((t - now) / 864e5));
  }

  function renderGrid() {
    const t = Avent.today();
    const intro = $('#avent-intro');
    if (t.jour === 0) {
      intro.textContent = 'Les portes s\'ouvriront une à une du 1er au 25 décembre, avec une surprise différente chaque jour. Plus que ' + daysUntil(1) + ' jours avant la première !';
    } else if (t.jour >= 25 && !t.enCours && !t.simule) {
      intro.textContent = 'Toutes les portes sont ouvertes. Clique sur l\'une d\'elles pour revoir sa surprise.';
    } else {
      intro.textContent = 'Une surprise par jour ! Clique sur une porte ouverte pour revoir son animation.';
    }
    grid.innerHTML = JOURS.slice(1).map((d) => {
      const open = d.n <= t.jour;
      const today = open && d.n === t.jour && (t.simule || t.enCours);
      return '<li><button type="button" class="door' + (open ? ' is-open' : ' is-locked') + (today ? ' is-today' : '') + '" data-day="' + d.n + '"' +
        ' aria-label="' + (open ? 'Jour ' + d.n + ' : ' + esc(d.titre) : 'Jour ' + d.n + ' : pas encore ouvert') + '"' +
        (open ? ' data-cursor-label="' + esc(d.titre) + '"' : '') + '>' +
        '<span class="door-in" aria-hidden="true"><i>' + (open ? d.icone : '🔒') + '</i><small>' + d.n + '</small></span>' +
        '<span class="door-leaf" aria-hidden="true"><b>' + d.n + '</b></span>' +
        (today ? '<span class="door-today" aria-hidden="true">Aujourd\'hui</span>' : '') +
        '</button></li>';
    }).join('');
  }

  function onDoor(e) {
    const b = e.target.closest('.door');
    if (!b) return;
    const n = parseInt(b.dataset.day, 10);
    if (b.classList.contains('is-open')) {
      Noel.modal.close(overlay);
      setTimeout(() => { markSeen(); Avent.play(n); }, 420);
    } else {
      b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope');
      const t = Avent.today();
      const left = t.simule || t.jour > 0 ? n - t.jour : daysUntil(n);
      Noel.toast('Cette porte s\'ouvre le ' + (n === 1 ? '1er' : n) + ' décembre. Encore ' + left + ' jour' + (left > 1 ? 's' : '') + ' de patience !', { duration: 2800 });
    }
  }

  const seenKey = () => 'avent:vu';
  function todayStamp() { return new Date().getFullYear() + '-' + Avent.today().jour; }
  function markSeen() {
    const t = Avent.today();
    if (!t.simule && t.jour >= 1) Noel.store.set(seenKey(), todayStamp());
    const btn = $('#avent-btn');
    if (btn) btn.classList.remove('has-new');
  }

  function openCalendar() {
    renderGrid();
    markSeen();
    Noel.modal.open(overlay, '#avent-close');
  }
  Avent.open = openCalendar;

  /* ======================================================================
     Démarrage
     ====================================================================== */
  Avent.init = function () {
    overlay = $('#avent-overlay');
    grid = $('#avent-grid');
    const btn = $('#avent-btn');

    // Interrupteur : config.avent dans data/ma-liste.js (true = actif, tout le reste = désactivé).
    // Désactivé : on retire le bouton et la fenêtre de la page, et aucune animation du jour ne se joue.
    const cfg = (window.NOEL && window.NOEL.config) || {};
    if (cfg.avent !== true) {
      if (btn) btn.remove();
      if (overlay) overlay.remove();
      Avent.disabled = true;
      return;
    }
    if (!overlay || !btn) return;

    $('.avent-ico', btn).innerHTML = Art.icons.door ? Art.icons.door() : Art.icons.star();
    Noel.modal.bind(overlay);
    grid.addEventListener('click', onDoor);
    btn.addEventListener('click', openCalendar);

    const t = Avent.today();
    $('#avent-num').textContent = t.jour >= 1 ? String(t.jour) : '';
    btn.classList.toggle('is-idle', t.jour === 0);

    // Du 1er au 25 décembre : le titre d'accueil annonce le jour, et la surprise du jour se joue seule
    const actif = t.jour >= 1 && (t.simule || t.enCours);
    if (!actif) return;
    const kicker = $('#kicker');
    if (kicker) kicker.textContent = 'Jour ' + t.jour + ' de l\'Avent';

    const dejaVu = !t.simule && Noel.store.get(seenKey(), '') === todayStamp();
    if (dejaVu) return;
    btn.classList.add('has-new');
    setTimeout(() => {
      if (document.hidden) { document.addEventListener('visibilitychange', () => { if (!document.hidden) autoPlay(t.jour); }, { once: true }); return; }
      autoPlay(t.jour);
    }, 3800);
  };

  function autoPlay(jour) {
    markSeen();
    Avent.play(jour);
  }
})();
