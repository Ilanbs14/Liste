/* ==========================================================================
   GATE — verrou léger : le site ne s'ouvre qu'avec le « mot magique » dans l'adresse
   (ex. https://…/Liste/?guimauve-givree)
   ==========================================================================
   ⚠️ C'est une sécurité LÉGÈRE : une page statique ne peut pas être vraiment secrète.
   Elle écarte les curieux et les moteurs de recherche, pas quelqu'un qui fouillerait le code.
   Le mot n'est jamais écrit en clair : data/ma-liste.js ne contient que son empreinte (SHA-256).

   Ce fichier est chargé dans le <head>, AVANT l'affichage, pour que la page ne « clignote » pas.
   ========================================================================== */
(function () {
  'use strict';

  var SALT = 'noel-liste|';

  /* SHA-256 en JavaScript pur (marche partout, même sans HTTPS) */
  function sha256(str) {
    function rrot(n, x) { return (x >>> n) | (x << (32 - n)); }
    var K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    var utf8 = unescape(encodeURIComponent(str));
    var bytes = [];
    for (var i = 0; i < utf8.length; i++) bytes.push(utf8.charCodeAt(i));
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    var hi = Math.floor(bitLen / 4294967296), lo = bitLen >>> 0;
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255,
      (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    for (var off = 0; off < bytes.length; off += 64) {
      var w = new Array(64), t;
      for (t = 0; t < 16; t++) {
        w[t] = (bytes[off + 4 * t] << 24) | (bytes[off + 4 * t + 1] << 16) | (bytes[off + 4 * t + 2] << 8) | bytes[off + 4 * t + 3];
      }
      for (t = 16; t < 64; t++) {
        var s0 = rrot(7, w[t - 15]) ^ rrot(18, w[t - 15]) ^ (w[t - 15] >>> 3);
        var s1 = rrot(17, w[t - 2]) ^ rrot(19, w[t - 2]) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = rrot(6, e) ^ rrot(11, e) ^ rrot(25, e);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = rrot(2, a) ^ rrot(13, a) ^ rrot(22, a);
        var maj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + maj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  /** « Guimauve Givrée » = « guimauve-givree » = « GUIMAUVEGIVREE » : casse, accents et séparateurs ignorés */
  function normalise(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
  }
  function hashMot(mot) { return sha256(SALT + normalise(mot)); }

  var Gate = (window.NoelGate = { sha256: sha256, normalise: normalise, hashMot: hashMot, enabled: false, locked: false, bypass: '' });

  var cfg = (window.NOEL && window.NOEL.acces) || {};
  if (!cfg.actif || !cfg.hash) return;            // verrou désactivé (ou page d'outils sans liste)
  Gate.enabled = true;

  var root = document.documentElement;
  var host = location.hostname;
  var local = location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
  var forced = /(^|[?&])verrou($|[&=])/.test(location.search);   // ?verrou : tester le verrou en local
  if (local && !forced) {                          // en local (développement), pas de verrou
    Gate.bypass = 'local';
    root.classList.add('unlocked');
    return;
  }

  Gate.check = function (mot) { return hashMot(mot) === cfg.hash; };

  /* Le mot peut être « ?mot », « ?mot&autre=1 » ou « ?acces=mot » */
  function candidates() {
    var out = [];
    var q = location.search.replace(/^\?/, '');
    if (!q) return out;
    q.split('&').forEach(function (part) {
      var dec;
      try { dec = decodeURIComponent(part.replace(/\+/g, ' ')); } catch (e) { dec = part; }
      out.push(dec);
      var i = dec.indexOf('=');
      if (i > 0) { out.push(dec.slice(0, i)); out.push(dec.slice(i + 1)); }
    });
    return out;
  }

  var KEY = 'noel:acces';
  var ok = candidates().some(Gate.check);
  try {
    if (ok) {
      if (cfg.memoriser !== false) localStorage.setItem(KEY, JSON.stringify(cfg.hash));
    } else if (cfg.memoriser !== false && !forced && JSON.parse(localStorage.getItem(KEY)) === cfg.hash) {
      ok = true;                                   // déjà entré sur cet appareil avec le bon mot
    }
  } catch (e) { /* navigation privée : pas de mémoire, pas grave */ }

  if (ok) {
    root.classList.add('unlocked');
  } else {
    root.classList.add('locked');
    Gate.locked = true;
  }
})();
