/* ==========================================================================
   FEUILLE — lit la liste depuis un Google Sheet « publié sur le Web » (format CSV)
   ==========================================================================
   Le site reste 100 % statique (GitHub Pages) : c'est le navigateur du visiteur qui
   télécharge le tableau, le transforme en cadeaux, et garde une copie en cache pour
   fonctionner même si Google est lent ou injoignable.
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const Sheet = (Noel.sheet = {});

  /* ---------- Petits outils ---------- */
  const strip = (s) => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const key = (s) => strip(s).replace(/[^a-z0-9]/g, '');
  const clampN = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- Adresse : accepte le lien « Publier sur le Web » ou le lien d'édition ---------- */
  Sheet.toCsvUrl = function (raw) {
    const u = String(raw || '').trim();
    if (!u) return '';
    // Lien « Fichier → Partager → Publier sur le Web » (…/d/e/XXXX/pub…) : on s'assure qu'on demande bien du CSV
    if (/\/spreadsheets\/d\/e\//.test(u)) {
      return /output=csv/.test(u) ? u : u + (u.indexOf('?') >= 0 ? '&' : '?') + 'output=csv';
    }
    // Lien d'édition ordinaire (…/d/ID/edit#gid=0) : export CSV (la feuille doit être lisible par « toute personne disposant du lien »)
    const m = u.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (m) {
      const gid = (u.match(/[#&?]gid=(\d+)/) || [])[1];
      return 'https://docs.google.com/spreadsheets/d/' + m[1] + '/gviz/tq?tqx=out:csv' + (gid ? '&gid=' + gid : '');
    }
    return u; // autre adresse (ex. un fichier .csv hébergé ailleurs)
  };

  /* ---------- Lecture du CSV (guillemets, virgules, points-virgules, retours à la ligne) ---------- */
  Sheet.parseCSV = function (text) {
    text = String(text || '').replace(/^﻿/, '');
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    const count = (c) => firstLine.split(c).length;
    const delim = count(';') > count(',') ? ';' : count('\t') > count(',') ? '\t' : ',';
    const rows = [];
    let row = [], cur = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
        else cur += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(cur); cur = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cur); cur = ''; rows.push(row); row = [];
      } else cur += c;
    }
    if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
    return rows.filter((r) => r.some((c) => String(c).trim() !== ''));
  };

  /* ---------- Noms de colonnes acceptés (accents, majuscules et ponctuation ignorés) ---------- */
  const ALIASES = {
    nom: ['nom', 'cadeau', 'titre', 'produit', 'article'],
    categorie: ['categorie', 'categories', 'rayon', 'type'],
    priorite: ['priorite', 'envie', 'importance', 'etoiles'],
    prix: ['prix', 'budget', 'cout', 'tarif'],
    lien: ['lien', 'url', 'link', 'site'],
    emoji: ['emoji', 'emojiouphoto', 'photo', 'image', 'illustration', 'visuel', 'emojiimage'],
    description: ['description', 'desc', 'details', 'detail', 'commentaire'],
    note: ['note', 'precision', 'precisions', 'remarque'],
    reserve: ['reserve', 'reservee', 'pris', 'statut']
  };

  function mapHeader(cells) {
    const idx = {};
    cells.forEach((cell, i) => {
      const k = key(cell);
      if (!k) return;
      for (const field in ALIASES) {
        if (idx[field] != null) continue;
        if (ALIASES[field].some((a) => k === a || k.indexOf(a) === 0)) { idx[field] = i; break; }
      }
    });
    return idx;
  }

  /* ---------- Conversion des valeurs ---------- */
  function parsePrio(v) {
    const s = String(v == null ? '' : v).trim();
    if (!s) return 1;
    const stars = (s.match(/[★⭐]/g) || []).length;
    if (stars) return clampN(stars, 1, 3);
    const n = parseInt(s, 10);
    return clampN(isNaN(n) ? 1 : n, 1, 3);
  }

  function parsePrix(v) {
    let s = String(v == null ? '' : v).replace(/[\s  ]/g, '').replace(/[^\d,.\-]/g, '');
    if (!s) return null;
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) {            // « 1.299,90 » ou « 1,299.90 » : le dernier séparateur est la virgule des décimales
      const dec = s.lastIndexOf(',') > s.lastIndexOf('.') ? ',' : '.';
      s = s.split(dec === ',' ? '.' : ',').join('').replace(dec, '.');
    } else if (s.indexOf(',') >= 0) s = s.replace(',', '.');
    const n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  const parseBool = (v) => /^(oui|o|yes|y|x|1|true|vrai|✓|✔|✅|reserve|reservé|réservé|pris)$/i.test(String(v == null ? '' : v).trim());

  const THEMES = ['bleu', 'rouge', 'or', 'vert', 'rose', 'violet', 'candy'];
  const slug = (s) => key(s) || 'divers';

  /** « 🎧 High-Tech » → { emoji: "🎧", nom: "High-Tech" } */
  function splitCategory(cell) {
    const s = String(cell == null ? '' : cell).trim();
    const m = s.match(/^(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)\s*(.*)$/u);
    return m ? { emoji: m[1], nom: m[2] || '' } : { emoji: '', nom: s };
  }

  /**
   * Transforme les lignes du tableau en { categories, cadeaux }.
   * `localCats` (les catégories de data/ma-liste.js) sert à retrouver l'emoji et la couleur d'une catégorie par son nom.
   */
  Sheet.rowsToData = function (rows, localCats) {
    if (!rows.length) return { categories: [], cadeaux: [] };
    // la ligne d'en-tête est la première qui contient une colonne « nom »
    let h = 0;
    while (h < rows.length && mapHeader(rows[h]).nom == null) h++;
    if (h >= rows.length) throw new Error('colonne « nom » introuvable (vérifie la première ligne du tableau)');
    const idx = mapHeader(rows[h]);
    const get = (r, f) => (idx[f] == null ? '' : String(r[idx[f]] == null ? '' : r[idx[f]]).trim());

    const cats = [];
    const byKey = {};
    const local = Array.isArray(localCats) ? localCats : [];
    const cadeaux = [];

    rows.slice(h + 1).forEach((r) => {
      const nom = get(r, 'nom');
      if (!nom || nom.charAt(0) === '#') return;            // ligne vide ou commentaire
      const rawCat = splitCategory(get(r, 'categorie'));
      const catName = rawCat.nom || 'Divers';
      const ck = key(catName) || 'divers';
      if (!byKey[ck]) {
        const known = local.find((c) => key(c.nom) === ck || key(c.id) === ck);
        const cat = {
          id: known ? known.id : slug(catName),
          nom: known ? known.nom : catName,
          emoji: rawCat.emoji || (known && known.emoji) || '🎁',
          theme: (known && known.theme) || THEMES[cats.length % THEMES.length]
        };
        byKey[ck] = cat;
        cats.push(cat);
      } else if (rawCat.emoji && !byKey[ck].emoji) byKey[ck].emoji = rawCat.emoji;

      const g = {
        nom,
        categorie: byKey[ck].id,
        priorite: parsePrio(get(r, 'priorite')),
        prix: parsePrix(get(r, 'prix')),
        lien: get(r, 'lien'),
        emoji: get(r, 'emoji'),            // un emoji OU l'adresse d'une photo (liste.js fait la différence)
        description: get(r, 'description'),
        note: get(r, 'note')
      };
      if (parseBool(get(r, 'reserve'))) g.reserve = true;
      cadeaux.push(g);
    });
    return { categories: cats, cadeaux };
  };

  /* ---------- Téléchargement + cache ---------- */
  const CACHE_KEY = 'feuille';

  Sheet.cached = function (url) {
    const c = Noel.store.get(CACHE_KEY, null);
    return c && c.url === url && c.data && Array.isArray(c.data.cadeaux) ? c.data : null;
  };

  Sheet.load = async function (url, localCats) {
    const csvUrl = Sheet.toCsvUrl(url);
    if (!csvUrl) throw new Error('adresse vide');
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => ctrl && ctrl.abort(), 9000);
    let res;
    try {
      res = await fetch(csvUrl, { cache: 'no-store', signal: ctrl ? ctrl.signal : undefined });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) throw new Error('réponse ' + res.status);
    const text = await res.text();
    if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('Google a renvoyé une page web au lieu du tableau (la feuille est-elle bien publiée ?)');
    const data = Sheet.rowsToData(Sheet.parseCSV(text), localCats);
    if (!data.cadeaux.length) throw new Error('aucun cadeau trouvé dans le tableau');
    Noel.store.set(CACHE_KEY, { url, t: Date.now(), data });
    return data;
  };
})();
