/* ==========================================================================
   LISTE — fabrique les paquets-cadeaux à partir de data/ma-liste.js
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { $, $$, esc, clamp } = Noel;
  const Art = Noel.art;
  const Liste = (Noel.liste = {});

  const DATA = window.NOEL || { config: {}, categories: [], cadeaux: [] };
  const CFG = DATA.config || {};
  const PRIO_LABEL = { 1: 'Un petit plaisir', 2: 'J\'en rêve un peu', 3: 'Le cadeau de mes rêves' };

  const catById = {};
  (DATA.categories || []).forEach((c) => { catById[c.id] = c; });

  const state = { cat: 'all', q: '', sort: 'original' };
  let cards = [];
  let grid, countEl, emptyEl;

  const T = (s) => esc(Noel.typo(s));
  const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function starsHtml(n) {
    let out = '<span class="rating" role="img" aria-label="' + esc(PRIO_LABEL[n]) + '" title="' + esc(PRIO_LABEL[n]) + '">';
    for (let i = 1; i <= 3; i++) {
      out += '<svg viewBox="0 0 24 24" class="' + (i <= n ? 'on' : 'off') + '" aria-hidden="true"><path d="' + Art.starPath(12, 12, 11, 4.8) + '"/></svg>';
    }
    return out + '</span>';
  }

  /* ----------------------------------------------------------------------
     Construction d'une carte
     ---------------------------------------------------------------------- */
  function buildCard(g, i) {
    const cat = catById[g.categorie] || { id: g.categorie || 'divers', nom: 'Divers', emoji: '🎁', theme: 'rouge' };
    const th = Art.themes[cat.theme] || Art.themes.rouge;
    const prio = clamp(parseInt(g.priorite, 10) || 1, 1, 3);
    const price = Noel.fmtPrice(g.prix);
    const icon = g.image
      ? '<img src="' + esc(g.image) + '" alt="" loading="lazy">'
      : '<span class="back-emoji">' + esc(g.emoji || cat.emoji || '🎁') + '</span>';
    const tilt = (((i * 37) % 7) - 3) * 0.45;

    const el = document.createElement('article');
    el.className = 'gift reveal';
    el.dataset.id = String(i);
    el.dataset.prio = String(prio);
    if (g.reserve) el.dataset.reserve = '1';
    const s = el.style;
    s.setProperty('--paper', th.paper);
    s.setProperty('--paper2', th.paper2);
    s.setProperty('--ribbon', th.ribbon);
    s.setProperty('--ribbon2', th.ribbon2);
    s.setProperty('--pat', Art.pattern(th.pat, th.fg));
    s.setProperty('--tilt', tilt.toFixed(2) + 'deg');
    s.setProperty('--i', String(i % 8));
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');

    const link = g.lien
      ? '<a class="btn btn-small btn-green" href="' + esc(g.lien) + '" target="_blank" rel="noopener noreferrer">Voir le cadeau <span class="btn-arrow" data-icon="arrow"></span></a>'
      : '<p class="no-link">Pas de lien : fais comme tu le sens&nbsp;!</p>';

    el.innerHTML =
      '<div class="gift-tilt"><div class="gift-inner">' +
        '<button type="button" class="gift-face gift-front" aria-expanded="false" aria-label="Déballer le cadeau : ' + esc(g.nom) + '" data-cursor-label="Déballer !">' +
          '<span class="paper"></span>' +
          '<span class="rib rib-v"></span><span class="rib rib-h"></span>' +
          '<span class="bow">' + Art.bow(th.ribbon, th.ribbon2) + '</span>' +
          '<span class="sheen"></span>' +
          (prio === 3 ? '<span class="corner">Coup de cœur</span>' : '') +
          (g.reserve ? '<span class="stamp stamp-front">Réservé</span>' : '') +
          '<span class="tag">' +
            '<span class="tag-cat">' + esc(cat.emoji || '') + ' ' + esc(cat.nom) + '</span>' +
            '<strong class="tag-name">' + T(g.nom) + '</strong>' +
            '<span class="tag-meta">' + (price ? '<span class="tag-price">' + esc(price) + '</span>' : '<span class="tag-price tag-free">Surprise</span>') + starsHtml(prio) + '</span>' +
          '</span>' +
        '</button>' +
        '<div class="gift-face gift-back" role="group" aria-label="Détails : ' + esc(g.nom) + '">' +
          '<span class="tape" aria-hidden="true"></span>' +
          '<button type="button" class="back-close" aria-label="Refermer le paquet">×</button>' +
          '<div class="back-ico">' + icon + '</div>' +
          '<h3 class="back-title">' + T(g.nom) + '</h3>' +
          '<p class="back-cat">' + esc(cat.emoji || '') + ' ' + esc(cat.nom) + '</p>' +
          '<div class="back-body">' +
            (g.description ? '<p class="back-desc">' + T(g.description) + '</p>' : '') +
            (g.note ? '<p class="back-note"><span class="note-ico" data-icon="pencil"></span>' + T(g.note) + '</p>' : '') +
          '</div>' +
          '<div class="back-meta">' + (price ? '<span class="price-pill">' + esc(price) + '</span>' : '') + starsHtml(prio) + '</div>' +
          link +
          (g.reserve ? '<span class="stamp">Réservé</span>' : '') +
        '</div>' +
      '</div></div>';

    $$('[data-icon]', el).forEach((n) => { n.innerHTML = Art.icons[n.dataset.icon](); });
    return el;
  }

  /* ----------------------------------------------------------------------
     Ouvrir / refermer un paquet
     ---------------------------------------------------------------------- */
  function updateCount() {
    if (!countEl) return;
    const visible = cards.filter((c) => !c.el.hidden);
    const opened = visible.filter((c) => c.el.classList.contains('open')).length;
    let txt = visible.length + ' cadeau' + (visible.length > 1 ? 'x' : '');
    if (opened) txt += ' · ' + opened + ' déballé' + (opened > 1 ? 's' : '');
    countEl.textContent = visible.length ? txt : '';
  }

  function open(c, opts) {
    const o = opts || {};
    if (c.el.classList.contains('open')) return;
    c.el.classList.add('open');
    c.front.setAttribute('aria-expanded', 'true');
    if (!o.quiet) {
      const r = c.el.getBoundingClientRect();
      const th = c.theme;
      Noel.fx.burst(r.left + r.width / 2, r.top + r.height * 0.4, {
        n: 34, colors: [th.paper, th.ribbon, '#ffd166', '#ffffff', th.ribbon2], power: 480
      });
      Noel.audio.sparkle();
    }
    if (o.focus) setTimeout(() => $('.back-close', c.el).focus({ preventScroll: true }), 520);
    updateCount();
  }

  function close(c, opts) {
    if (!c.el.classList.contains('open')) return;
    c.el.classList.remove('open');
    c.front.setAttribute('aria-expanded', 'false');
    c.el.classList.add('rewrapped');
    setTimeout(() => c.el.classList.remove('rewrapped'), 1300);
    if (opts && opts.focus) setTimeout(() => c.front.focus({ preventScroll: true }), 520);
    updateCount();
  }

  function unwrapAll() {
    const list = cards.filter((c) => !c.el.hidden && !c.el.classList.contains('open'));
    list.forEach((c, i) => setTimeout(() => open(c, { quiet: true }), i * 70));
    if (list.length) {
      setTimeout(() => {
        Noel.fx.rain('confetti', 2200);
        Noel.audio.jingle(10);
      }, Math.min(list.length * 70, 900));
      Noel.secrets && Noel.secrets.discover('unwrap');
    }
  }
  function wrapAll() {
    cards.forEach((c, i) => setTimeout(() => close(c), i * 40));
  }

  /* ----------------------------------------------------------------------
     Filtres, tri, recherche
     ---------------------------------------------------------------------- */
  function sorted(list) {
    const price = (c) => (c.data.prix == null || c.data.prix === '' || isNaN(Number(c.data.prix)) ? null : Number(c.data.prix));
    const byIdx = (a, b) => a.idx - b.idx;
    const copy = list.slice();
    switch (state.sort) {
      case 'priorite':
        return copy.sort((a, b) => (b.prio - a.prio) || byIdx(a, b));
      case 'prix-asc':
        return copy.sort((a, b) => {
          const pa = price(a), pb = price(b);
          if (pa == null && pb == null) return byIdx(a, b);
          if (pa == null) return 1;
          if (pb == null) return -1;
          return (pa - pb) || byIdx(a, b);
        });
      case 'prix-desc':
        return copy.sort((a, b) => {
          const pa = price(a), pb = price(b);
          if (pa == null && pb == null) return byIdx(a, b);
          if (pa == null) return 1;
          if (pb == null) return -1;
          return (pb - pa) || byIdx(a, b);
        });
      case 'nom':
        return copy.sort((a, b) => a.data.nom.localeCompare(b.data.nom, 'fr', { sensitivity: 'base' }));
      default:
        return copy.sort(byIdx);
    }
  }

  function apply(animate) {
    const q = norm(state.q.trim());
    cards.forEach((c) => {
      const okCat = state.cat === 'all' || c.data.categorie === state.cat;
      const okQ = !q || c.hay.indexOf(q) >= 0;
      c.el.hidden = !(okCat && okQ);
    });
    sorted(cards).forEach((c) => grid.appendChild(c.el));

    const visible = cards.filter((c) => !c.el.hidden);
    emptyEl.hidden = visible.length > 0;
    if (!visible.length) {
      emptyEl.innerHTML = cards.length
        ? '<p class="empty-title">Aucun cadeau ne correspond…</p><p>Même le Grinch n\'a rien trouvé&nbsp;!</p><button type="button" class="btn btn-small btn-ghost" id="empty-reset">Tout afficher</button>'
        : '<p class="empty-title">La liste est en cours d\'écriture…</p><p>Les lutins s\'appliquent. Reviens très bientôt&nbsp;!</p>';
      const b = $('#empty-reset');
      if (b) b.addEventListener('click', () => { resetFilters(); });
    }
    if (animate) {
      // on remet les cartes « hors scène » sans transition, puis on les fait entrer une à une
      visible.forEach((c) => { c.el.style.transition = 'none'; c.el.classList.remove('in'); });
      void grid.offsetWidth;
      visible.forEach((c) => { c.el.style.transition = ''; });
      requestAnimationFrame(() => visible.forEach((c) => c.el.classList.add('in')));
    }
    updateCount();
  }

  function resetFilters() {
    state.cat = 'all';
    state.q = '';
    $('#q').value = '';
    $$('.chip').forEach((b) => {
      const on = b.dataset.cat === 'all';
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    apply(true);
  }

  function buildChips() {
    const box = $('#chips');
    const counts = {};
    cards.forEach((c) => { counts[c.data.categorie] = (counts[c.data.categorie] || 0) + 1; });
    const used = (DATA.categories || []).filter((c) => counts[c.id]);
    const all = [{ id: 'all', nom: 'Tous', emoji: '✨', n: cards.length }]
      .concat(used.map((c) => ({ id: c.id, nom: c.nom, emoji: c.emoji, n: counts[c.id] })));
    box.innerHTML = all.map((c, i) =>
      '<button type="button" class="chip' + (i === 0 ? ' is-active' : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
      '<span class="chip-emoji" aria-hidden="true">' + esc(c.emoji || '') + '</span>' + esc(c.nom) + ' <b>' + c.n + '</b></button>'
    ).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state.cat = b.dataset.cat;
      $$('.chip', box).forEach((x) => {
        const on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      Noel.audio.sparkle();
      apply(true);
    });
  }

  /* ----------------------------------------------------------------------
     Lettre au Père Noël
     ---------------------------------------------------------------------- */
  function buildLetter() {
    const box = $('#letter');
    const paras = Array.isArray(CFG.lettre) ? CFG.lettre : [];
    if (!paras.length) { box.hidden = true; return; }
    const sign = CFG.prenom ? esc(CFG.prenom) : 'Un enfant (très) sage';
    box.innerHTML =
      '<div class="letter-paper">' +
        '<span class="seal" aria-hidden="true">' + Art.icons.star() + '</span>' +
        '<p class="letter-hello">Cher Père Noël,</p>' +
        paras.map((p) => '<p>' + esc(p) + '</p>').join('') +
        '<p class="letter-sign">— ' + sign + '</p>' +
      '</div>';
  }

  /* ----------------------------------------------------------------------
     Effet de relief au survol (souris uniquement)
     ---------------------------------------------------------------------- */
  function bindTilt(el) {
    if (!Noel.finePointer) return;
    el.addEventListener('pointermove', (e) => {
      if (Noel.calm || e.pointerType === 'touch') return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((0.5 - py) * 12).toFixed(2) + 'deg');
      el.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', () => {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
    });
  }

  /* ----------------------------------------------------------------------
     Démarrage
     ---------------------------------------------------------------------- */
  Liste.init = function () {
    grid = $('#grid');
    countEl = $('#count');
    emptyEl = $('#empty');

    const items = (DATA.cadeaux || []).filter((g) => g && g.nom);
    cards = items.map((g, i) => {
      const el = buildCard(g, i);
      const cat = catById[g.categorie] || {};
      return {
        el, data: g, idx: i,
        prio: clamp(parseInt(g.priorite, 10) || 1, 1, 3),
        theme: Art.themes[cat.theme] || Art.themes.rouge,
        front: $('.gift-front', el),
        hay: norm([g.nom, g.description, g.note, cat.nom].join(' '))
      };
    });

    // Un lutin se cache derrière le 3e paquet : seul son bonnet dépasse du bord
    if (cards.length) {
      const target = cards[Math.min(2, cards.length - 1)];
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'elf elf-card';
      b.dataset.elf = 'card';
      b.setAttribute('aria-label', 'Un lutin se cache ici !');
      b.innerHTML = Art.elf();
      target.el.insertBefore(b, target.el.firstChild);
    }

    cards.forEach((c) => {
      grid.appendChild(c.el);
      bindTilt(c.el);
      c.front.addEventListener('click', (e) => open(c, { focus: e.detail === 0 }));
      $('.back-close', c.el).addEventListener('click', (e) => close(c, { focus: e.detail === 0 }));
      c.el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && c.el.classList.contains('open')) { e.stopPropagation(); close(c, { focus: true }); }
      });
      Noel.scene.reveal(c.el);
    });

    buildChips();
    buildLetter();

    if (CFG.exemples) {
      const b = $('#demo-banner');
      b.hidden = false;
      b.innerHTML = '<span class="demo-star">' + Art.icons.star() + '</span><span><b>Exemples.</b> Ces cadeaux sont là pour montrer le rendu : la vraie liste arrive très vite&nbsp;!</span>';
    }

    $('#q').addEventListener('input', (e) => {
      state.q = e.target.value;
      apply(false);
    });
    $('#sort').addEventListener('change', (e) => {
      state.sort = e.target.value;
      apply(true);
    });
    $('#unwrap-all').addEventListener('click', unwrapAll);
    $('#wrap-all').addEventListener('click', wrapAll);
    $('#toolbar').hidden = false;

    // Pas de liste : on masque les outils
    if (!cards.length) $('#toolbar').hidden = true;

    apply(false);
  };

  Liste.cards = () => cards;
})();
