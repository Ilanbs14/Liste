/* ==========================================================================
   LISTE — fabrique les paquets-cadeaux à partir de data/ma-liste.js
   ou, si une feuille Google est indiquée, à partir de ce tableau en ligne
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

  // Données actuellement affichées
  let cur = { categories: [], cadeaux: [] };
  let catById = {};

  const state = { cat: 'all', q: '', sort: 'original' };
  let cards = [];
  let grid, countEl, emptyEl;

  const T = (s) => esc(Noel.typo(s));
  const norm = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ----------------------------------------------------------------------
     Photos : un lien dans le champ « emoji » (ou « image ») devient la photo du produit
     ---------------------------------------------------------------------- */
  const IMG_RE = /^(https?:)?\/\/|^(\.{0,2}\/|assets\/|data:image\/)|\.(png|jpe?g|webp|gif|avif|svg|bmp)([?#].*)?$/i;
  const isImg = (v) => typeof v === 'string' && IMG_RE.test(v.trim());
  const secureUrl = (u) => {
    u = u.trim();
    // une page en https ne peut pas afficher une image en http : on tente la version sécurisée
    return window.location.protocol === 'https:' && /^http:\/\//i.test(u) ? u.replace(/^http:/i, 'https:') : u;
  };
  Liste.isImageRef = isImg;

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
    const photo = isImg(g.image) ? g.image : isImg(g.emoji) ? g.emoji : '';
    const emoji = (!isImg(g.emoji) && g.emoji) || cat.emoji || '🎁';
    const icon = photo
      ? '<img src="' + esc(secureUrl(photo)) + '" alt="Photo : ' + esc(g.nom) + '" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
      : '<span class="back-emoji">' + esc(emoji) + '</span>';
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
          '<div class="back-ico' + (photo ? ' is-photo' : '') + '">' + icon + '</div>' +
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

    // photo introuvable (lien cassé, site qui bloque l'affichage…) : on retombe sur l'emoji
    const img = $('.back-ico img', el);
    if (img) {
      img.addEventListener('error', () => {
        const box = img.parentElement;
        box.classList.remove('is-photo');
        box.innerHTML = '<span class="back-emoji">' + esc(emoji) + '</span>';
      }, { once: true });
    }
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

  /* ----------------------------------------------------------------------
     Couleurs des emballages
     ----------------------------------------------------------------------
     config.couleurs :  "alterne" (par défaut) → les couleurs se suivent dans l'ordre d'affichage, deux voisins n'ont jamais la même
                        ["rouge", "vert", "or"] → on alterne seulement ces couleurs
                        "categorie"            → la couleur dépend de la catégorie
     Un cadeau peut forcer sa couleur avec le champ « couleur » (ex. couleur: "rose"), dans le fichier comme dans le Google Sheet. */
  const ALL_THEMES = ['rouge', 'vert', 'bleu', 'or', 'rose', 'violet', 'candy'];
  const THEME_ALIASES = { mauve: 'violet', dore: 'or', doree: 'or', jaune: 'or', orange: 'or', blanc: 'candy', blanche: 'candy', sucre: 'candy', rouges: 'rouge' };
  function themeName(v) {
    const k = norm(v).replace(/[^a-z]/g, '');
    if (!k) return null;
    if (Art.themes[k]) return k;
    return THEME_ALIASES[k] && Art.themes[THEME_ALIASES[k]] ? THEME_ALIASES[k] : null;
  }

  function paint(c, name) {
    const th = Art.themes[name] || Art.themes.rouge;
    if (c.themeName === name) return;
    c.themeName = name;
    c.theme = th;
    const s = c.el.style;
    s.setProperty('--paper', th.paper);
    s.setProperty('--paper2', th.paper2);
    s.setProperty('--ribbon', th.ribbon);
    s.setProperty('--ribbon2', th.ribbon2);
    s.setProperty('--pat', Art.pattern(th.pat, th.fg));
    const bow = $('.bow', c.el);
    if (bow) bow.innerHTML = Art.bow(th.ribbon, th.ribbon2);
  }

  function applyColors(visibleInOrder) {
    const mode = CFG.couleurs;
    const byCategory = mode === 'categorie';
    const custom = Array.isArray(mode) ? mode.map(themeName).filter(Boolean) : [];
    const list = custom.length ? custom : ALL_THEMES;
    let k = 0, prev = null;
    visibleInOrder.forEach((c, i) => {
      let name;
      if (c.override) name = c.override;
      else if (byCategory) name = c.catTheme;
      else {
        // jamais deux emballages identiques côte à côte (on évite aussi la couleur forcée du cadeau suivant)
        const next = visibleInOrder[i + 1] && visibleInOrder[i + 1].override;
        let guard = 0;
        while (list.length > 2 && guard++ < list.length && (list[k % list.length] === prev || list[k % list.length] === next)) k++;
        if (list.length === 2 && list[k % 2] === prev) k++;
        name = list[k % list.length];
        k++;
      }
      paint(c, name);
      prev = name;
    });
  }

  function apply(animate) {
    const q = norm(state.q.trim());
    cards.forEach((c) => {
      const okCat = state.cat === 'all' || c.data.categorie === state.cat;
      const okQ = !q || c.hay.indexOf(q) >= 0;
      c.el.hidden = !(okCat && okQ);
    });
    const order = sorted(cards);
    order.forEach((c) => grid.appendChild(c.el));
    applyColors(order.filter((c) => !c.el.hidden));

    const visible = cards.filter((c) => !c.el.hidden);
    emptyEl.classList.remove('is-loading');
    emptyEl.hidden = visible.length > 0;
    if (!visible.length) {
      emptyEl.innerHTML = cards.length
        ? '<p class="empty-title">Aucun cadeau ne correspond…</p><p>Même le Grinch n\'a rien trouvé&nbsp;!</p><button type="button" class="btn btn-small btn-ghost" data-empty-reset>Tout afficher</button>'
        : '<p class="empty-title">La liste est en cours d\'écriture…</p><p>Les lutins s\'appliquent. Reviens très bientôt&nbsp;!</p>';
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

  function setChipActive(id) {
    $$('.chip').forEach((b) => {
      const on = b.dataset.cat === id;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function resetFilters() {
    state.cat = 'all';
    state.q = '';
    $('#q').value = '';
    setChipActive('all');
    apply(true);
  }

  function buildChips() {
    const box = $('#chips');
    const counts = {};
    cards.forEach((c) => { counts[c.data.categorie] = (counts[c.data.categorie] || 0) + 1; });
    const used = (cur.categories || []).filter((c) => counts[c.id]);
    const all = [{ id: 'all', nom: 'Tous', emoji: '✨', n: cards.length }]
      .concat(used.map((c) => ({ id: c.id, nom: c.nom, emoji: c.emoji, n: counts[c.id] })));
    if (state.cat !== 'all' && !all.some((c) => c.id === state.cat)) state.cat = 'all';
    box.innerHTML = all.map((c) =>
      '<button type="button" class="chip' + (c.id === state.cat ? ' is-active' : '') + '" data-cat="' + esc(c.id) + '" aria-pressed="' + (c.id === state.cat ? 'true' : 'false') + '">' +
      '<span class="chip-emoji" aria-hidden="true">' + esc(c.emoji || '') + '</span>' + esc(c.nom) + ' <b>' + c.n + '</b></button>'
    ).join('');
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
     (Ré)affichage de toute la liste
     ---------------------------------------------------------------------- */
  function render(data, opts) {
    const o = opts || {};
    cur = { categories: data.categories || [], cadeaux: data.cadeaux || [] };
    catById = {};
    cur.categories.forEach((c) => { catById[c.id] = c; });

    grid.innerHTML = '';
    emptyEl.classList.remove('is-loading');
    const items = cur.cadeaux.filter((g) => g && g.nom);
    cards = items.map((g, i) => {
      const el = buildCard(g, i);
      const cat = catById[g.categorie] || {};
      return {
        el, data: g, idx: i,
        prio: clamp(parseInt(g.priorite, 10) || 1, 1, 3),
        theme: Art.themes[cat.theme] || Art.themes.rouge,
        themeName: Art.themes[cat.theme] ? cat.theme : 'rouge',
        catTheme: Art.themes[cat.theme] ? cat.theme : 'rouge',
        override: themeName(g.couleur),
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

    // Bandeau « exemples » : seulement pour les cadeaux d'exemple du fichier (jamais pour une vraie feuille)
    const banner = $('#demo-banner');
    if (CFG.exemples && o.from === 'local') {
      banner.hidden = false;
      banner.innerHTML = '<span class="demo-star">' + Art.icons.star() + '</span><span><b>Exemples.</b> Ces cadeaux sont là pour montrer le rendu : la vraie liste arrive très vite&nbsp;!</span>';
    } else {
      banner.hidden = true;
    }

    $('#toolbar').hidden = !cards.length;
    apply(false);
    if (Noel.scene && Noel.scene.updateElfUI) Noel.scene.updateElfUI();
    Noel.emit('liste', { count: cards.length, from: o.from });
  }

  function showLoading() {
    $('#toolbar').hidden = true;
    countEl.textContent = '';
    emptyEl.hidden = false;
    emptyEl.classList.add('is-loading');
    emptyEl.innerHTML = '<div class="loading-gifts" aria-hidden="true"><i></i><i></i><i></i></div><p class="empty-title">Les lutins ouvrent la liste…</p>';
  }

  function showError() {
    $('#toolbar').hidden = true;
    countEl.textContent = '';
    emptyEl.hidden = false;
    emptyEl.classList.remove('is-loading');
    emptyEl.innerHTML = '<p class="empty-title">Oups, la liste ne veut pas s\'ouvrir</p>' +
      '<p>Le tableau en ligne est injoignable pour le moment. Vérifie ta connexion et réessaie.</p>' +
      '<button type="button" class="btn btn-small btn-ghost" data-retry>Réessayer</button>';
  }

  /* ----------------------------------------------------------------------
     Démarrage
     ---------------------------------------------------------------------- */
  function loadSheet(url, local, hadCache) {
    return Noel.sheet.load(url, local.categories).then((data) => {
      // si le tableau n'a pas changé depuis la copie déjà affichée, on ne touche à rien
      if (!hadCache || JSON.stringify(hadCache) !== JSON.stringify(data)) render(data, { from: 'sheet' });
    }).catch((err) => {
      console.warn('[Noel] Google Sheet :', err && err.message ? err.message : err);
      if (hadCache) return; // on garde la copie enregistrée, sans déranger personne
      if (CFG.exemples || !local.cadeaux.length) showError();
      else {
        render(local, { from: 'local' });
        Noel.toast('La liste en ligne est injoignable : voici la dernière version enregistrée.', { duration: 4500 });
      }
    });
  }

  Liste.init = function () {
    grid = $('#grid');
    countEl = $('#count');
    emptyEl = $('#empty');

    // branchements faits une seule fois
    buildLetter();
    $('#q').addEventListener('input', (e) => { state.q = e.target.value; apply(false); });
    $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; apply(true); });
    $('#unwrap-all').addEventListener('click', unwrapAll);
    $('#wrap-all').addEventListener('click', wrapAll);
    $('#chips').addEventListener('click', (e) => {
      const b = e.target.closest('.chip');
      if (!b) return;
      state.cat = b.dataset.cat;
      setChipActive(state.cat);
      Noel.audio.sparkle();
      apply(true);
    });

    const local = { categories: DATA.categories || [], cadeaux: DATA.cadeaux || [] };
    const url = (CFG.feuille || '').trim();
    emptyEl.addEventListener('click', (e) => {
      if (e.target.closest('[data-empty-reset]')) resetFilters();
      if (e.target.closest('[data-retry]')) { showLoading(); loadSheet(url, local, null); }
    });

    if (!url || !Noel.sheet) { render(local, { from: 'local' }); return; }

    // Google Sheet : on affiche tout de suite la copie enregistrée (s'il y en a une), puis on vérifie s'il y a du nouveau
    const hadCache = Noel.sheet.cached(url);
    if (hadCache) render(hadCache, { from: 'sheet' }); else showLoading();
    loadSheet(url, local, hadCache);
  };

  Liste.cards = () => cards;
})();
