/* ==========================================================================
   ART — toutes les illustrations du site, dessinées en SVG
   (rien à télécharger : tout est net à n'importe quelle taille)
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;

  /* ---------- Outils ---------- */
  function starPath(cx, cy, R, r, n, rot) {
    n = n || 5;
    rot = rot == null ? -Math.PI / 2 : rot;
    let d = '';
    for (let i = 0; i < n * 2; i++) {
      const rad = i % 2 ? r : R;
      const a = rot + (i * Math.PI) / n;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rad).toFixed(2) + ' ' + (cy + Math.sin(a) * rad).toFixed(2);
    }
    return d + 'Z';
  }

  /** Générateur pseudo-aléatoire reproductible (pour que le village soit toujours le même) */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- Palettes ---------- */
  const PAL = {
    red: '#d62839', redLight: '#ef4357', redDeep: '#8f1022',
    gold: '#ffd166', gold2: '#e0a526',
    sack: '#8a5a2b', blue: '#4cc9f0', green: '#3ddc97',
    white: '#f7fbff', skin: '#ffd9b5', ink: '#2a1a10',
    deer: '#a8743f', deerLight: '#d9a96c', deerDark: '#7a5230', antler: '#6b4423',
    nose: '#ff2b2b', hoof: '#2b1a0e'
  };
  const SILHOUETTE = {};
  Object.keys(PAL).forEach((k) => { SILHOUETTE[k] = '#0b0a1d'; });

  /* ==========================================================================
     Petites icônes d'interface (taille = currentColor)
     ========================================================================== */
  const icons = {
    star: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${starPath(12, 12, 11, 4.6)}" fill="currentColor"/></svg>`,
    heart: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21C5 15.5 2 12 2 8.2 2 5.4 4.2 3.5 6.8 3.5c2 0 3.8 1.1 5.2 3 1.4-1.9 3.2-3 5.2-3C19.800 3.500 22 5.400 22 8.200 22 12 19 15.500 12 21z" fill="#ff4d6d"/></svg>`,
    search: () => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.500" cy="10.500" r="6.500"/><path d="M15.500 15.500L21 21"/></svg>`,
    giftIcon: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="1.500" fill="#fff"/><rect x="2" y="7.500" width="20" height="5" rx="1.500" fill="#fff"/><rect x="10.500" y="7.500" width="3" height="13.500" fill="#d62839"/><path d="M12 7.500C9 7.500 6.500 6.500 6.800 4.600 7.200 2.600 10.500 3.600 12 7.500zM12 7.500c3 0 5.500-1 5.200-2.900-.4-2-3.700-1-5.200 2.900z" fill="#ffd166"/></svg>`,
    bell: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.500a1.500 1.500 0 0 1 1.500 1.500v.7c3 .8 5 3.400 5 6.600v3.700l1.800 2.300c.4.500 0 1.200-.6 1.200H4.300c-.6 0-1-.7-.6-1.200l1.800-2.300v-3.700c0-3.200 2-5.800 5-6.600V4A1.500 1.500 0 0 1 12 2.500z" fill="currentColor"/><path d="M9.500 19.500a2.500 2.500 0 0 0 5 0z" fill="currentColor"/><path class="slash" d="M3.500 3.500l17 17" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/></svg>`,
    flake: () => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2v20M3.300 7l17.400 10M3.300 17l17.400-10"/><path d="M9.500 3.800L12 6.300l2.500-2.500M9.500 20.200L12 17.700l2.500 2.500"/><path class="slash" d="M3.500 3.500l17 17" stroke-width="2.400"/></svg>`,
    arrow: () => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    pencil: () => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20l1-4L16.500 4.500a2.100 2.100 0 0 1 3 3L8 19l-4 1z"/></svg>`,
    check: () => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.500l4.500 4.500L19 7.500"/></svg>`,
    up: () => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${starPath(12, 12, 11, 4.8)}" fill="#ffd166" stroke="#e0a526" stroke-width="1" stroke-linejoin="round"/></svg>`,
    treeIcon: () => `<svg viewBox="0 0 32 36" aria-hidden="true"><rect x="13.500" y="28" width="5" height="7" rx="1" fill="#8a5a2b"/><path d="M16 5L7 16h4L4 25h24l-7-9h4z" fill="#1f9d55"/><path d="M16 5L11 12h10zM16 14L8 24h16z" fill="#2fbf6c" opacity=".55"/><path d="${starPath(16, 4, 4.200, 1.800)}" fill="#ffd166"/><circle cx="12" cy="20" r="1.500" fill="#ef4357"/><circle cx="20" cy="22" r="1.500" fill="#ffd166"/><circle cx="16" cy="13" r="1.200" fill="#4cc9f0"/></svg>`
  };

  /* ---------- Houx (séparateur de titre) ---------- */
  function holly() {
    return `<svg viewBox="0 0 160 44" width="160" height="44" aria-hidden="true">
      <path d="M80 24C66 6 38 6 22 16c10 5 12 17 25 17 8 5 24 1 33-9z" fill="#1f9d55"/>
      <path d="M80 24C94 6 122 6 138 16c-10 5-12 17-25 17-8 5-24 1-33-9z" fill="#17803f"/>
      <path d="M80 24C64 15 44 14 30 17M80 24C96 15 116 14 130 17" stroke="#0e5a37" stroke-width="1.600" fill="none" stroke-linecap="round"/>
      <circle cx="72" cy="27" r="7" fill="#d62839"/><circle cx="88" cy="27" r="7" fill="#d62839"/><circle cx="80" cy="34" r="7" fill="#ef4357"/>
      <circle cx="69.500" cy="24.500" r="2" fill="#fff" opacity=".7"/><circle cx="85.500" cy="24.500" r="2" fill="#fff" opacity=".7"/><circle cx="77.500" cy="31.500" r="2" fill="#fff" opacity=".7"/>
    </svg>`;
  }

  /* ---------- Nœud de ruban (cartes cadeaux) ---------- */
  function bow(c, d) {
    c = c || PAL.gold; d = d || PAL.gold2;
    return `<svg viewBox="0 0 90 64" aria-hidden="true">
      <path d="M45 36L27 61l10-2 6 4 4-24z" fill="${d}"/>
      <path d="M45 36l18 25-10-2-6 4-4-24z" fill="${d}"/>
      <path d="M45 34C32 4 3 6 8 26c3 11 25 13 37 8z" fill="${c}"/>
      <path d="M45 34C58 4 87 6 82 26c-3 11-25 13-37 8z" fill="${c}"/>
      <path d="M45 34C34 17 19 16 19 24c1 6 17 11 26 10z" fill="${d}" opacity=".5"/>
      <path d="M45 34C56 17 71 16 71 24c-1 6-17 11-26 10z" fill="${d}" opacity=".5"/>
      <path d="M14 14C22 9 30 11 36 20" stroke="#fff" stroke-opacity=".55" stroke-width="2.400" fill="none" stroke-linecap="round"/>
      <rect x="37" y="26" width="16" height="15" rx="6" fill="${c}"/>
      <rect x="37" y="26" width="16" height="15" rx="6" fill="none" stroke="${d}" stroke-width="1.500"/>
      <path d="M40 30c2-2 5-2 7-1" stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  /* ---------- Lutin ---------- */
  function elf(opts) {
    // `hit` : zone de clic élargie et invisible, pour qu'un lutin minuscule reste facile à attraper (doigt compris)
    const hit = opts && opts.hit ? '<circle class="elf-hit" cx="22" cy="28" r="32" fill="transparent" pointer-events="all"/>' : '';
    return `<svg viewBox="0 0 44 48" width="44" height="48" aria-hidden="true" class="elf-svg">
      ${hit}
      <path d="M6 24C8 9 21 2 38 5c-8 4-10 11-8 19z" fill="#1f9d55"/>
      <path d="M6 24C9 12 20 6 31 6" stroke="#2fbf6c" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>
      <circle class="elf-bell" cx="38" cy="6" r="3.800" fill="#ffd166"/>
      <rect x="5" y="21" width="28" height="7" rx="3.500" fill="#f7fbff"/>
      <path d="M9 32L1 27l3 11zM31 32l8-5-3 11z" fill="#ffd9b5"/>
      <circle cx="20" cy="34" r="11" fill="#ffd9b5"/>
      <circle cx="15.800" cy="33" r="1.500" fill="#2a1a10"/><circle cx="24.200" cy="33" r="1.500" fill="#2a1a10"/>
      <path d="M15.500 38.500q4.500 3.800 9 0" stroke="#b0453a" stroke-width="1.700" fill="none" stroke-linecap="round"/>
      <circle cx="12.500" cy="37" r="2.200" fill="#ff8fa3" opacity=".6"/><circle cx="27.500" cy="37" r="2.200" fill="#ff8fa3" opacity=".6"/>
    </svg>`;
  }

  /* ==========================================================================
     CURSEURS (sprites)
     ========================================================================== */
  function giftSprite() {
    return `<svg class="spr spr-gift" viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="60.500" rx="19" ry="3" fill="#000" opacity=".25"/>
      <g class="s-body">
        <rect x="10" y="30" width="44" height="29" rx="3" fill="#d62839"/>
        <rect x="10" y="30" width="44" height="8" fill="#8f1022" opacity=".38"/>
        <rect x="10" y="30" width="7" height="29" fill="#fff" opacity=".13"/>
        <rect x="28" y="30" width="8" height="29" fill="#ffd166"/>
      </g>
      <g class="s-lid">
        <rect x="7" y="21" width="50" height="12" rx="3" fill="#ef4357"/>
        <rect x="7" y="21" width="50" height="4.500" rx="2" fill="#fff" opacity=".22"/>
        <rect x="28" y="21" width="8" height="12" fill="#ffe08a"/>
        <g class="s-bow">
          <path d="M32 21C22 4 6 9 13.500 18.500 18 23 27 22 32 21z" fill="#ffd166"/>
          <path d="M32 21C42 4 58 9 50.500 18.500 46 23 37 22 32 21z" fill="#ffd166"/>
          <path d="M32 21c-7-9-16-9-15-4 2 3 9 4 15 4zM32 21c7-9 16-9 15-4-2 3-9 4-15 4z" fill="#e0a526" opacity=".65"/>
          <circle cx="32" cy="21" r="4.200" fill="#ffc233"/>
          <circle cx="30.800" cy="19.800" r="1.400" fill="#fff" opacity=".75"/>
        </g>
      </g>
    </svg>`;
  }

  /** Dessin du traîneau (sans fond) : sert au curseur ET au vol du Père Noël */
  function sleighInner(p) {
    return `
      <path d="M6 70C4 64 7 58 12 59" stroke="${p.gold}" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M8 69C14 75 26 75 38 75H84C98 75 106 66 101 54" stroke="${p.gold}" stroke-width="4.500" fill="none" stroke-linecap="round"/>
      <path d="M30 74L33 60M74 74L72 60" stroke="${p.gold2}" stroke-width="3.600" stroke-linecap="round"/>
      <g>
        <path d="M13 46C10 31 20 19 35 21c13 2 17 14 13 27z" fill="${p.sack}"/>
        <path d="M18 44c-2-9 3-17 11-19" stroke="#fff" stroke-opacity=".25" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M24 22q5 4 12 1" stroke="${p.gold2}" stroke-width="2.200" fill="none" stroke-linecap="round"/>
        <g transform="rotate(-12 25 15)"><rect x="18" y="5" width="14" height="14" rx="2" fill="${p.blue}"/><rect x="23.500" y="5" width="3" height="14" fill="${p.white}"/></g>
        <g transform="rotate(11 42 14)"><rect x="36" y="7" width="12" height="12" rx="2" fill="${p.green}"/><rect x="40.500" y="7" width="3" height="12" fill="${p.red}"/></g>
      </g>
      <path d="M52 49C52 36 60 31 69 31s17 5 17 18z" fill="${p.red}"/>
      <rect x="52" y="44" width="34" height="6" rx="3" fill="${p.white}"/>
      <path d="M62 27c1 11 15 11 16 0 -4 3 -12 3 -16 0z" fill="${p.white}"/>
      <circle cx="70" cy="21" r="8.500" fill="${p.skin}"/>
      <path d="M61 22c1 15 18 15 19 0-4 4-15 4-19 0z" fill="${p.white}"/>
      <path d="M61 18C62 6 75 2 86 9c-6 0-8 4-7 9z" fill="${p.red}"/>
      <rect x="60.500" y="15.500" width="21" height="5" rx="2.500" fill="${p.white}"/>
      <circle cx="87" cy="8.500" r="3.600" fill="${p.white}"/>
      <circle cx="66.800" cy="22.500" r="1.200" fill="${p.ink}"/><circle cx="73.800" cy="22.500" r="1.200" fill="${p.ink}"/>
      <path d="M8 40C6 58 16 68 36 68H76C94 68 103 58 102 42c-7 6-18 8-30 8H32C22 50 11 47 8 40z" fill="${p.red}"/>
      <path d="M8 40c3 7 14 10 24 10h40c12 0 23-2 30-8" stroke="${p.gold}" stroke-width="3.400" fill="none" stroke-linecap="round"/>
      <path d="M14 56c14-5 36-6 56-1" stroke="${p.gold}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>
      <path d="M14 45c-1 8 3 14 10 16" stroke="#fff" stroke-opacity=".28" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }

  function sleighSprite() {
    return `<svg class="spr spr-sleigh" viewBox="0 0 110 84" aria-hidden="true">${sleighInner(PAL)}</svg>`;
  }

  /** Un renne vu de profil, qui regarde vers la droite */
  function deerInner(p, nose, phase) {
    const legs = [
      // [hanche x, hanche y, pied x, pied y, sens, décalage de l'animation]
      [50, 44, 64, 58, 1, 0], [45, 45, 57, 61, -1, 0.27],
      [26, 45, 11, 57, -1, 0.1], [32, 46, 19, 61, 1, 0.37]
    ].map(([x, y, x2, y2, dir, off]) => `
      <g>
        <animateTransform attributeName="transform" type="rotate" values="${-17 * dir} ${x} ${y};${17 * dir} ${x} ${y};${-17 * dir} ${x} ${y}" dur=".56s" begin="${(off + (phase || 0)).toFixed(2)}s" repeatCount="indefinite"/>
        <path d="M${x} ${y}L${x2} ${y2}" stroke="${p.deerDark}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="${x2}" cy="${y2}" r="2.600" fill="${p.hoof}"/>
      </g>`).join('');
    return `
      <path d="M67 15C64 7 61 2 59-5M64 9L70 3M62 3L67-2M70 14C70 7 69 1 69-6" stroke="${p.antler}" stroke-width="2.600" stroke-linecap="round" fill="none"/>
      ${legs}
      <ellipse cx="38" cy="36" rx="25" ry="12.500" fill="${p.deer}"/>
      <ellipse cx="41" cy="42" rx="19" ry="6" fill="${p.deerLight}"/>
      <path d="M54 32C60 24 62 18 63 13l12 5c-4 9-8 19-14 28z" fill="${p.deer}"/>
      <ellipse cx="72" cy="17" rx="9.500" ry="6.800" transform="rotate(24 72 17)" fill="${p.deer}"/>
      <ellipse cx="80" cy="21" rx="6" ry="4.400" transform="rotate(24 80 21)" fill="${p.deerLight}"/>
      <path d="M66 14l-7-5 3 9z" fill="${p.deerDark}"/>
      <circle cx="73.500" cy="14.500" r="1.500" fill="${p.ink}"/>
      <circle cx="85" cy="22.500" r="3.400" fill="${nose ? p.nose : p.hoof}"/>
      ${nose ? `<circle class="nose-glow" cx="85" cy="22.500" r="9" fill="${p.nose}" opacity=".38"/>` : ''}
      <circle cx="13" cy="31" r="3.800" fill="${p.white}"/>
      <path d="M58 28C53 33 53 40 57 46" stroke="${p.gold}" stroke-width="2.400" fill="none" stroke-linecap="round"/>
      <circle cx="57" cy="46.500" r="2.800" fill="${p.gold}"/>`;
  }

  function reindeerSprite() {
    return `<svg class="spr spr-reindeer" viewBox="0 0 64 64" aria-hidden="true">
      <g class="r-antlers" stroke="#8a5a2b" stroke-width="3.400" stroke-linecap="round" fill="none">
        <path d="M22 24C16 16 14 9 15 2M18 15C13 14 10 11 8 6M20 19C14 20 10 18 6 14"/>
        <path d="M42 24C48 16 50 9 49 2M46 15C51 14 54 11 56 6M44 19C50 20 54 18 58 14"/>
      </g>
      <g class="r-ears">
        <ellipse class="r-ear l" cx="14.500" cy="28" rx="8" ry="4.600" transform="rotate(-28 14.500 28)" fill="#b9772f"/>
        <ellipse cx="15.500" cy="28" rx="4.600" ry="2.200" transform="rotate(-28 15.500 28)" fill="#ffb3a7"/>
        <ellipse class="r-ear r" cx="49.500" cy="28" rx="8" ry="4.600" transform="rotate(28 49.500 28)" fill="#b9772f"/>
        <ellipse cx="48.500" cy="28" rx="4.600" ry="2.200" transform="rotate(28 48.500 28)" fill="#ffb3a7"/>
      </g>
      <ellipse cx="32" cy="38" rx="19" ry="20" fill="#b9772f"/>
      <ellipse cx="32" cy="31" rx="13" ry="8" fill="#c98a42" opacity=".8"/>
      <ellipse cx="32" cy="49" rx="12" ry="9.500" fill="#ecc791"/>
      <g class="r-eyes">
        <circle cx="24.500" cy="35" r="3.400" fill="#2b1a0e"/><circle cx="39.500" cy="35" r="3.400" fill="#2b1a0e"/>
        <circle cx="25.600" cy="33.800" r="1.200" fill="#fff"/><circle cx="40.600" cy="33.800" r="1.200" fill="#fff"/>
      </g>
      <path d="M26 55.500q6 4 12 0" stroke="#7a4a1c" stroke-width="2" fill="none" stroke-linecap="round"/>
      <g class="r-nose">
        <circle cx="32" cy="49" r="9" fill="#ff2b2b" opacity=".3" class="r-glow"/>
        <circle cx="32" cy="49" r="5.800" fill="#ff2b2b"/>
        <circle cx="30" cy="47" r="1.800" fill="#fff" opacity=".8"/>
      </g>
    </svg>`;
  }

  /* ==========================================================================
     TRAÎNEAU VOLANT (Père Noël + 3 rennes)
     ========================================================================== */
  function flight(opts) {
    const sil = opts && opts.silhouette;
    const p = sil ? SILHOUETTE : PAL;
    const reins = sil ? '' : `<path d="M100 42Q140 50 184 42Q226 50 264 42Q306 50 344 42" stroke="${p.gold}" stroke-width="1.600" fill="none" opacity=".9"/>`;
    return `<svg class="flight-svg${sil ? ' is-sil' : ''}" viewBox="-6 -12 392 100" aria-hidden="true">
      <g class="fl-sleigh" transform="translate(0 2)">${sleighInner(p)}</g>
      ${reins}
      <g transform="translate(118 8)">${deerInner(p, false, 0.2)}</g>
      <g transform="translate(200 4)">${deerInner(p, false, 0.05)}</g>
      <g transform="translate(282 2)">${deerInner(p, true, 0)}</g>
    </svg>`;
  }

  /* ==========================================================================
     SAPIN INTERACTIF
     ========================================================================== */
  function tree() {
    const lightColors = ['#ff4d6d', '#ffd166', '#4cc9f0', '#ffffff', '#c77dff', '#3ddc97'];
    const lightPts = [
      [100, 165], [124, 171], [150, 172], [176, 171], [200, 165],
      [74, 258], [102, 262], [128, 266], [150, 262], [174, 266], [200, 262], [226, 258],
      [52, 348], [84, 354], [116, 358], [150, 356], [184, 358], [216, 354], [248, 348],
      [134, 100], [166, 112], [120, 140], [182, 142], [112, 208], [190, 212], [88, 300], [214, 304], [150, 62]
    ];
    const lights = lightPts.map(([x, y], i) => {
      const c = lightColors[i % lightColors.length];
      return `<g class="lt" style="--d:${((i * 0.37) % 2.4).toFixed(2)}s"><circle cx="${x}" cy="${y}" r="7" fill="${c}" opacity=".28"/><circle cx="${x}" cy="${y}" r="3.200" fill="${c}"/></g>`;
    }).join('');

    const balls = [
      ['Do', 'red', 114, 150, 11], ['Ré', 'gold', 190, 176, 11],
      ['Mi', 'blue', 100, 238, 12], ['Fa', 'purple', 182, 250, 12],
      ['Sol', 'pink', 72, 326, 13], ['La', 'orange', 224, 322, 13]
    ].map(([note, col, x, y, r], i) => `
      <g transform="translate(${x} ${y})">
        <g class="bb" role="button" tabindex="0" data-note="${note}" aria-label="Boule de Noël : ${note}" data-cursor-label="♪ ${note}" style="--r:${r}px;animation-delay:${(i * 0.45).toFixed(2)}s">
          <path d="M0 ${-r - 14}V${-r - 2}" stroke="#ffd166" stroke-width="1.200"/>
          <rect x="-3.500" y="${-r - 5}" width="7" height="5" rx="1.500" fill="#e0a526"/>
          <circle r="${r}" fill="url(#tr-${col})"/>
          <ellipse cx="${-r * 0.35}" cy="${-r * 0.4}" rx="${r * 0.28}" ry="${r * 0.18}" transform="rotate(-35 ${-r * 0.35} ${-r * 0.4})" fill="#fff" opacity=".75"/>
          <path d="M${-r * 0.8} ${r * 0.1}Q0 ${r * 0.55} ${r * 0.8} ${r * 0.1}" stroke="#fff" stroke-opacity=".35" stroke-width="1.600" fill="none"/>
        </g>
      </g>`).join('');

    const ballGrad = (id, a, b, c) => `<radialGradient id="tr-${id}" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="${a}"/><stop offset=".4" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`;

    return `<svg class="tree-svg" viewBox="0 0 300 410" aria-label="Un sapin de Noël décoré" role="group">
      <defs>
        <linearGradient id="tr-leaf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37b874"/><stop offset="1" stop-color="#0f6b3f"/></linearGradient>
        <radialGradient id="tr-halo"><stop offset="0" stop-color="#fff1b8" stop-opacity=".85"/><stop offset=".45" stop-color="#ffd166" stop-opacity=".3"/><stop offset="1" stop-color="#ffd166" stop-opacity="0"/></radialGradient>
        <linearGradient id="tr-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2b0"/><stop offset=".5" stop-color="#ffd166"/><stop offset="1" stop-color="#e0a526"/></linearGradient>
        ${ballGrad('red', '#ffb3bd', '#e63950', '#8f1022')}
        ${ballGrad('gold', '#fff4c2', '#ffd166', '#b8821a')}
        ${ballGrad('blue', '#c4efff', '#4cc9f0', '#17608a')}
        ${ballGrad('purple', '#ead2ff', '#b672f5', '#5a2a99')}
        ${ballGrad('pink', '#ffd0e0', '#ff7aa2', '#a8294f')}
        ${ballGrad('orange', '#ffe2b0', '#ff9f1c', '#a8560a')}
      </defs>

      <ellipse cx="150" cy="392" rx="140" ry="15" fill="#000" opacity=".22"/>
      <rect x="132" y="330" width="36" height="58" rx="3" fill="#6b3f1d"/>
      <rect x="132" y="330" width="12" height="58" fill="#4f2d14" opacity=".6"/>

      <g class="tree-body" data-cursor-label="Secoue-moi !">
        <path d="M150 148L28 342Q54 360 84 346Q116 364 150 348Q184 364 216 346Q246 360 272 342Z" fill="url(#tr-leaf)"/>
        <path d="M150 148L272 342Q246 360 216 346Q184 364 150 348Z" fill="#000" opacity=".2"/>
        <path d="M150 84L48 252Q74 268 102 254Q126 270 150 256Q174 270 198 254Q226 268 252 252Z" fill="url(#tr-leaf)"/>
        <path d="M150 84L252 252Q226 268 198 254Q174 270 150 256Z" fill="#000" opacity=".2"/>
        <path d="M150 32L78 164Q100 178 122 166Q136 176 150 168Q164 176 178 166Q200 178 222 164Z" fill="url(#tr-leaf)"/>
        <path d="M150 32L222 164Q200 178 178 166Q164 176 150 168Z" fill="#000" opacity=".2"/>
        <path d="M150 32L131.500 66Q141 73 150 67Q159 75 168.500 66Z" fill="#f4f8ff"/>
        <path d="M150 84L123 128Q136 137 150 129Q164 137 177 128Z" fill="#f4f8ff"/>
        <path d="M150 148L117 200Q133 210 150 201Q167 210 183 200Z" fill="#f4f8ff"/>
        <ellipse cx="62" cy="346" rx="13" ry="4.500" fill="#f4f8ff" opacity=".9"/>
        <ellipse cx="238" cy="346" rx="13" ry="4.500" fill="#f4f8ff" opacity=".9"/>
        <ellipse cx="80" cy="256" rx="11" ry="4" fill="#f4f8ff" opacity=".85"/>
        <ellipse cx="220" cy="256" rx="11" ry="4" fill="#f4f8ff" opacity=".85"/>
      </g>

      <g class="tree-lights">${lights}</g>
      ${balls}

      <g class="tree-star-wrap" transform="translate(150 28)">
        <g class="treestar" role="button" tabindex="0" aria-label="L'étoile du sapin" data-cursor-label="Fais un vœu !">
          <circle r="44" fill="url(#tr-halo)" class="star-halo"/>
          <path d="${starPath(0, 0, 23, 10)}" fill="url(#tr-gold)" stroke="#e0a526" stroke-width="1.500" stroke-linejoin="round"/>
          <path d="${starPath(0, 0, 11, 5)}" fill="#fff8d6" opacity=".8"/>
        </g>
      </g>

      <ellipse cx="150" cy="390" rx="124" ry="14" fill="#e6efff"/>
      <ellipse cx="150" cy="388" rx="124" ry="12" fill="#f4f8ff"/>

      <g transform="translate(46 339) scale(.82)"><g data-elf="tree" class="elf-g">${elf({ hit: true })}</g></g>

      <g>
        <rect x="80" y="360" width="46" height="32" rx="3" fill="#d62839"/>
        <rect x="99" y="360" width="8" height="32" fill="#ffd166"/><rect x="80" y="372" width="46" height="8" fill="#ffd166"/>
        <path d="M103 360c-14-12-22-2-12 2zM103 360c14-12 22-2 12 2z" fill="#ffd166"/>
        <rect x="172" y="368" width="38" height="26" rx="3" fill="#2f6fd1"/>
        <rect x="187" y="368" width="8" height="26" fill="#f7fbff"/><rect x="172" y="377" width="38" height="7" fill="#f7fbff"/>
        <rect x="132" y="376" width="30" height="18" rx="2.500" fill="#e6b34f"/>
        <rect x="143" y="376" width="8" height="18" fill="#d62839"/>
      </g>
    </svg>`;
  }

  /* ==========================================================================
     BONHOMME DE NEIGE
     ========================================================================== */
  function snowman() {
    return `<svg class="snowman-svg" viewBox="0 0 220 300" role="img" aria-label="Un bonhomme de neige" data-cursor-label="Salut !">
      <defs>
        <radialGradient id="sn-g" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#dbe8ff"/><stop offset="1" stop-color="#8fa9e6"/></radialGradient>
      </defs>
      <ellipse cx="110" cy="290" rx="78" ry="9" fill="#000" opacity=".22"/>
      <g class="sn-arm sn-arm-l"><path d="M70 146L24 118M40 126L28 106M34 122L16 126" stroke="#6b4423" stroke-width="5.500" stroke-linecap="round" fill="none"/></g>
      <g class="sn-arm sn-arm-r"><path d="M150 146L198 114M182 124L194 104M188 120L206 124" stroke="#6b4423" stroke-width="5.500" stroke-linecap="round" fill="none"/></g>
      <circle cx="110" cy="228" r="60" fill="url(#sn-g)"/>
      <circle cx="110" cy="146" r="45" fill="url(#sn-g)"/>
      <circle class="sn-head" cx="110" cy="76" r="35" fill="url(#sn-g)"/>
      <circle cx="110" cy="206" r="4.800" fill="#1a1a1a"/><circle cx="110" cy="232" r="4.800" fill="#1a1a1a"/><circle cx="110" cy="258" r="4.800" fill="#1a1a1a"/>
      <circle cx="110" cy="140" r="4.200" fill="#1a1a1a"/><circle cx="110" cy="160" r="4.200" fill="#1a1a1a"/>
      <g class="sn-hat">
        <ellipse cx="110" cy="52" rx="40" ry="8" fill="#161616"/>
        <rect x="86" y="14" width="48" height="38" rx="4" fill="#161616"/>
        <rect x="86" y="38" width="48" height="8" fill="#d62839"/>
        <path d="M122 40c2-5 8-6 11-3-1 5-7 7-11 3z" fill="#1f9d55"/><circle cx="128" cy="40" r="2" fill="#d62839"/>
        <path d="M92 18v26" stroke="#fff" stroke-opacity=".16" stroke-width="4" stroke-linecap="round"/>
      </g>
      <g class="sn-eyes"><circle cx="97" cy="70" r="4" fill="#161616"/><circle cx="123" cy="70" r="4" fill="#161616"/><circle cx="98.200" cy="68.800" r="1.300" fill="#fff"/><circle cx="124.200" cy="68.800" r="1.300" fill="#fff"/></g>
      <g class="sn-carrot"><path d="M110 78L148 86 110 92z" fill="#ff8a1f"/><path d="M110 78L148 86 110 84z" fill="#ffb15a"/><path d="M122 80l-1 8M132 83l-1 6" stroke="#d96a00" stroke-width="1.200"/></g>
      <g fill="#161616"><circle cx="94" cy="96" r="2.400"/><circle cx="101" cy="102" r="2.400"/><circle cx="110" cy="104.500" r="2.400"/><circle cx="119" cy="102" r="2.400"/><circle cx="126" cy="96" r="2.400"/></g>
      <ellipse cx="90" cy="86" rx="5" ry="3" fill="#ff8fa3" opacity=".5"/><ellipse cx="130" cy="86" rx="5" ry="3" fill="#ff8fa3" opacity=".5"/>
      <path d="M72 108Q110 130 148 108L150 122Q110 144 70 122z" fill="#d62839"/>
      <path d="M84 116v14M100 121v14M116 121v14M132 116v14" stroke="#f7fbff" stroke-width="3.400" stroke-linecap="round" opacity=".85"/>
      <g class="sn-tail"><path d="M130 122L150 168 132 172 118 128z" fill="#d62839"/><path d="M139 148l13-5M135 158l14-5" stroke="#f7fbff" stroke-width="3" stroke-linecap="round" opacity=".85"/></g>
    </svg>`;
  }

  /* ==========================================================================
     VILLAGE ENNEIGÉ (généré, toujours identique)
     ========================================================================== */
  function village() {
    const r = rng(11);
    const W = 1600, H = 400;

    const farY = (x) => 236 + 16 * Math.sin(x / 190 + 1) + 9 * Math.sin(x / 83 + 2);
    const midY = (x) => 296 + 12 * Math.sin(x / 230 + 3) + 6 * Math.sin(x / 97);
    const nearY = (x) => 356 + 9 * Math.sin(x / 260 + 0.5) + 5 * Math.sin(x / 120 + 4);

    const silhouette = (fn) => {
      let d = 'M0 ' + H + ' L0 ' + fn(0).toFixed(1);
      for (let x = 20; x <= W; x += 20) d += ' L' + x + ' ' + fn(x).toFixed(1);
      return d + ' L' + W + ' ' + H + 'Z';
    };

    const pine = (x, y, h, dark, snow) => {
      const w = h * 0.36;
      return `<g><rect x="${x - 2.500}" y="${y - 6}" width="5" height="9" fill="#1d1226"/>` +
        `<path d="M${x} ${y - h}L${x + w * 0.55} ${y - h * 0.58}H${x - w * 0.55}z" fill="${dark}"/>` +
        `<path d="M${x} ${y - h * 0.78}L${x + w * 0.8} ${y - h * 0.3}H${x - w * 0.8}z" fill="${dark}"/>` +
        `<path d="M${x} ${y - h * 0.5}L${x + w} ${y - h * 0.04}H${x - w}z" fill="${dark}"/>` +
        `<path d="M${x} ${y - h}L${x + w * 0.2} ${y - h * 0.84}Q${x} ${y - h * 0.8} ${x - w * 0.2} ${y - h * 0.84}z" fill="${snow}"/>` +
        `<path d="M${x} ${y - h * 0.78}L${x + w * 0.3} ${y - h * 0.56}Q${x} ${y - h * 0.52} ${x - w * 0.3} ${y - h * 0.56}z" fill="${snow}"/>` +
        `<path d="M${x} ${y - h * 0.5}L${x + w * 0.4} ${y - h * 0.24}Q${x} ${y - h * 0.2} ${x - w * 0.4} ${y - h * 0.24}z" fill="${snow}"/></g>`;
    };

    const lightsOn = ['#ff4d6d', '#ffd166', '#4cc9f0', '#3ddc97'];

    const house = (cx, base, w, h, o) => {
      const x = cx - w / 2, top = base - h, roofH = Math.round(h * 0.62);
      const chx = x + w * 0.66, chTop = top - roofH * 0.7;
      let s = '<g class="house">';
      s += `<rect x="${x}" y="${top}" width="${w}" height="${h + 8}" fill="${o.body}"/>`;
      s += `<rect x="${chx}" y="${chTop}" width="12" height="${roofH * 0.8}" fill="${o.roof}"/>`;
      s += `<rect x="${chx - 2}" y="${chTop - 3}" width="16" height="6" rx="3" fill="#eaf2ff"/>`;
      if (o.smoke) {
        for (let i = 0; i < 3; i++) {
          s += `<circle class="puff" cx="${(chx + 6).toFixed(1)}" cy="${(chTop - 8).toFixed(1)}" r="5" style="animation-delay:${(o.delay + i * 1.7).toFixed(2)}s"/>`;
        }
      }
      s += `<path d="M${x - 9} ${top + 1}L${cx} ${top - roofH}L${x + w + 9} ${top + 1}z" fill="${o.roof}"/>`;
      s += `<path d="M${x - 9} ${top + 1}L${cx} ${top - roofH}L${x + w + 9} ${top + 1}" fill="none" stroke="#eaf2ff" stroke-width="6.500" stroke-linejoin="round" stroke-linecap="round"/>`;
      // fenêtres
      const nw = w > 92 ? 3 : 2;
      for (let i = 0; i < nw; i++) {
        if (r() < 0.2 && !o.far) continue;
        const wx = x + (w / (nw + 1)) * (i + 1) - 6, wy = top + h * 0.22;
        if (!o.far) s += `<circle cx="${wx + 6}" cy="${wy + 7}" r="22" fill="url(#v-glow)"/>`;
        s += `<rect class="win" x="${wx}" y="${wy}" width="12" height="15" rx="1.500" fill="${o.far ? '#c9a15a' : '#ffd98a'}" style="animation-delay:${(r() * 6).toFixed(2)}s"/>`;
        if (!o.far) s += `<path d="M${wx + 6} ${wy}v15M${wx} ${wy + 7.500}h12" stroke="#0b1238" stroke-width="1.200" opacity=".7"/>`;
      }
      // porte
      if (!o.far) s += `<rect x="${cx - 6}" y="${base - 17}" width="12" height="20" rx="2" fill="#2a1630"/><circle cx="${cx + 3}" cy="${base - 6}" r="1" fill="#ffd98a"/>`;
      // guirlande sur le toit
      if (o.lights) {
        const x0 = x - 9, x1 = cx, y0 = top + 1, y1 = top - roofH;
        for (let i = 1; i <= 6; i++) {
          const t = i / 7;
          const c = lightsOn[(i + o.lights) % lightsOn.length];
          s += `<circle class="bl" cx="${(x0 + (x1 - x0) * t).toFixed(1)}" cy="${(y0 + (y1 - y0) * t + 5).toFixed(1)}" r="1.900" fill="${c}" style="animation-delay:${(i * 0.3).toFixed(2)}s"/>`;
          s += `<circle class="bl" cx="${(x1 + (x + w + 9 - x1) * t).toFixed(1)}" cy="${(y1 + (y0 - y1) * t + 5).toFixed(1)}" r="1.900" fill="${lightsOn[(i + o.lights + 2) % 4]}" style="animation-delay:${(i * 0.3 + 0.15).toFixed(2)}s"/>`;
        }
      }
      // repère invisible : le script s'en sert pour poser le lutin sur une cheminée bien visible à l'écran
      if (o.chim) {
        const mx = chx + 6, my = chTop - 3;
        o.chim.push({ x: mx, y: my });
        s += `<circle class="chim" cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="1" fill="none" data-x="${mx.toFixed(1)}" data-y="${my.toFixed(1)}"/>`;
      }
      return s + '</g>';
    };

    let svg = `<svg class="village-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="v-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3d90"/><stop offset="1" stop-color="#1b2766"/></linearGradient>
        <linearGradient id="v-mid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a50ad"/><stop offset="1" stop-color="#22318a"/></linearGradient>
        <linearGradient id="v-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d6e4ff"/><stop offset=".05" stop-color="#9db6f0"/><stop offset=".3" stop-color="#4a63c2"/><stop offset="1" stop-color="#26358c"/></linearGradient>
        <radialGradient id="v-glow"><stop offset="0" stop-color="#ffd98a" stop-opacity=".5"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
      </defs>`;

    svg += `<path d="${silhouette(farY)}" fill="url(#v-far)"/>`;
    for (let x = 14; x < W; x += 26 + r() * 38) {
      svg += `<g opacity=".75">${pine(x, farY(x) + 8, 34 + r() * 26, '#18235f', '#8da4e6')}</g>`;
    }

    // maisons lointaines (petites, sombres)
    for (let x = 90; x < W - 60; x += 120 + r() * 90) {
      svg += house(x, midY(x) - 18, 46 + r() * 20, 30 + r() * 12, { body: '#1a2670', roof: '#131c58', far: true });
    }

    svg += `<path d="${silhouette(midY)}" fill="url(#v-mid)"/>`;

    // maisons du village
    let x = 70, idx = 0;
    const chims = [];
    while (x < W - 60) {
      const w = 72 + r() * 44, h = 50 + r() * 30;
      const cx = x + w / 2;
      svg += house(cx, midY(cx) + 2, w, h, {
        body: idx % 2 ? '#162068' : '#1a2674',
        roof: idx % 3 === 0 ? '#101a52' : '#0e1648',
        smoke: idx % 2 === 0,
        delay: r() * 4,
        lights: idx % 3 === 1 ? idx + 1 : 0,
        chim: chims
      });
      if (r() < 0.65) svg += pine(x + w + 10 + r() * 8, midY(x + w + 14) + 6, 62 + r() * 44, '#12305a', '#dbe7ff');
      x += w + 34 + r() * 56;
      idx++;
    }

    // premier plan neigeux
    svg += `<path d="${silhouette(nearY)}" fill="url(#v-near)"/>`;
    for (let px = 40; px < W; px += 90 + r() * 140) {
      svg += pine(px, nearY(px) + 10, 70 + r() * 40, '#0f2b57', '#eaf2ff');
    }
    for (let i = 0; i < 46; i++) {
      const px = r() * W, py = nearY(px) + 8 + r() * 34;
      svg += `<circle class="sp" cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${(0.8 + r() * 1.6).toFixed(1)}" fill="#fff" style="animation-delay:${(r() * 5).toFixed(2)}s"/>`;
    }
    // Emplacements de secours au sol (dans la neige) : utiles quand les cheminées sont cachées, sur petit écran
    for (let gx = 140; gx < W - 100; gx += 80) {
      const gy = nearY(gx) - 24;
      svg += `<circle class="chim ground" cx="${gx}" cy="${gy.toFixed(1)}" r="1" fill="none" data-x="${gx}" data-y="${gy.toFixed(1)}"/>`;
    }

    // Le lutin du toit est dessiné en dernier : rien ne peut le recouvrir.
    // Position par défaut : une cheminée à droite du centre (scene.js la déplace si besoin).
    const home = chims.slice().sort((a, b) => Math.abs(a.x - 1000) - Math.abs(b.x - 1000))[0];
    if (home) svg += elfSlot(home.x, home.y);
    return svg + '</svg>';
  }

  /** Lutin posé sur une cheminée (coordonnées du village) */
  function elfSlot(x, y) {
    return `<g class="elf-slot" transform="translate(${(x - 16.5).toFixed(1)} ${(y - 36).toFixed(1)})"><g transform="scale(.75)"><g data-elf="roof" class="elf-g">${elf({ hit: true })}</g></g></g>`;
  }

  /* ==========================================================================
     LE GRINCHEUX VERT (easter egg)
     ========================================================================== */
  function grinch() {
    return `<svg class="grinch-svg" viewBox="0 0 240 250" aria-hidden="true">
      <ellipse cx="120" cy="150" rx="94" ry="88" fill="#4e9a22" stroke="#4e9a22" stroke-width="10" stroke-dasharray="2 6"/>
      <ellipse cx="120" cy="150" rx="88" ry="82" fill="#7ac943"/>
      <ellipse cx="96" cy="120" rx="40" ry="28" fill="#98e05f" opacity=".5"/>
      <path d="M44 120L104 142" stroke="#2e6a12" stroke-width="13" stroke-linecap="round"/>
      <path d="M196 120L136 142" stroke="#2e6a12" stroke-width="13" stroke-linecap="round"/>
      <ellipse cx="86" cy="154" rx="19" ry="14.500" fill="#ffe83a" stroke="#c4411e" stroke-width="4.500"/>
      <ellipse cx="154" cy="154" rx="19" ry="14.500" fill="#ffe83a" stroke="#c4411e" stroke-width="4.500"/>
      <ellipse cx="91" cy="155" rx="4" ry="10" fill="#111"/><ellipse cx="149" cy="155" rx="4" ry="10" fill="#111"/>
      <path d="M113 166Q120 188 127 166" stroke="#4e9a22" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M52 192C86 240 154 240 188 192C164 208 76 208 52 192z" fill="#2b1b0e"/>
      <path d="M72 206l8 12 8-9 9 13 9-10 10 13 10-10 10 12 9-10 9 11 8-9" stroke="#fff" stroke-width="3" fill="none" stroke-linejoin="round" opacity=".92"/>
      <path d="M42 96C54 30 126-6 202 42c-30-4-52 10-54 44z" fill="#d62839"/>
      <rect x="36" y="88" width="162" height="22" rx="11" fill="#f7fbff"/>
      <circle cx="206" cy="42" r="15" fill="#f7fbff"/>
    </svg>`;
  }

  /* ==========================================================================
     PAPIERS CADEAUX (motifs + thèmes)
     ========================================================================== */
  const flakeShape = (cx, cy, r, c) => {
    const a = r * 0.5, b = r * 0.87;
    return `<path d='M${cx - r} ${cy}L${cx + r} ${cy}M${cx - a} ${cy - b}L${cx + a} ${cy + b}M${cx - a} ${cy + b}L${cx + a} ${cy - b}' stroke='${c}' stroke-width='1.800' stroke-linecap='round' fill='none'/>`;
  };
  const heartShape = (cx, cy, c) =>
    `<path d='M${cx} ${cy + 6}C${cx - 10} ${cy - 1} ${cx - 6} ${cy - 8} ${cx} ${cy - 3}C${cx + 6} ${cy - 8} ${cx + 10} ${cy - 1} ${cx} ${cy + 6}z' fill='${c}'/>`;
  const treeShape = (cx, cy, c) =>
    `<path d='M${cx} ${cy - 9}L${cx + 6} ${cy - 1}H${cx + 3}L${cx + 8} ${cy + 6}H${cx - 8}L${cx - 3} ${cy - 1}H${cx - 6}z' fill='${c}'/><rect x='${cx - 1.500}' y='${cy + 6}' width='3' height='3' fill='${c}'/>`;

  const PATTERNS = {
    dots: (c) => `<circle cx='14' cy='14' r='4.500' fill='${c}'/><circle cx='42' cy='42' r='4.500' fill='${c}'/><circle cx='42' cy='14' r='2' fill='${c}'/><circle cx='14' cy='42' r='2' fill='${c}'/>`,
    flakes: (c) => flakeShape(14, 14, 8, c) + flakeShape(42, 42, 8, c) + `<circle cx='42' cy='14' r='1.800' fill='${c}'/><circle cx='14' cy='42' r='1.800' fill='${c}'/>`,
    stars: (c) => `<path d='${starPath(14, 14, 8, 3.400)}' fill='${c}'/><path d='${starPath(42, 42, 8, 3.400)}' fill='${c}'/><circle cx='42' cy='14' r='1.800' fill='${c}'/><circle cx='14' cy='42' r='1.800' fill='${c}'/>`,
    stripes: (c) => `<path d='M-8 56L56-8M-8 84L84-8M20 64L64 20' stroke='${c}' stroke-width='10'/>`,
    trees: (c) => treeShape(14, 16, c) + treeShape(42, 44, c),
    hearts: (c) => heartShape(14, 15, c) + heartShape(42, 43, c),
    candy: (c) => `<path d='M-8 56L56-8M-8 84L84-8M20 64L64 20' stroke='${c}' stroke-width='14'/>`
  };

  function pattern(kind, color) {
    const inner = (PATTERNS[kind] || PATTERNS.dots)(color);
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56' viewBox='0 0 56 56'>${inner}</svg>`;
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  const themes = {
    rouge:  { paper: '#d62839', paper2: '#9d1629', ribbon: '#ffd166', ribbon2: '#e0a526', pat: 'dots',    fg: 'rgba(255,255,255,.30)' },
    vert:   { paper: '#1f9d55', paper2: '#0d6338', ribbon: '#ef4357', ribbon2: '#b8192c', pat: 'flakes',  fg: 'rgba(255,255,255,.34)' },
    bleu:   { paper: '#2f6fd1', paper2: '#1a3d8c', ribbon: '#f7fbff', ribbon2: '#c3d2ee', pat: 'stars',   fg: 'rgba(255,255,255,.32)' },
    violet: { paper: '#7f43c4', paper2: '#4a2282', ribbon: '#ffd166', ribbon2: '#e0a526', pat: 'stripes', fg: 'rgba(255,255,255,.14)' },
    or:     { paper: '#e8b74f', paper2: '#b5802a', ribbon: '#d62839', ribbon2: '#9d1226', pat: 'trees',   fg: 'rgba(122,70,0,.30)' },
    rose:   { paper: '#ee6a95', paper2: '#bd386a', ribbon: '#f7fbff', ribbon2: '#c3d2ee', pat: 'hearts',  fg: 'rgba(255,255,255,.36)' },
    candy:  { paper: '#f7fbff', paper2: '#d9e5f7', ribbon: '#d62839', ribbon2: '#9d1226', pat: 'candy',   fg: 'rgba(214,40,57,.30)' }
  };

  /* ---------- Export ---------- */
  Noel.art = {
    starPath, rng, icons, holly, bow, elf,
    giftSprite, sleighSprite, reindeerSprite,
    flight, tree, snowman, village, grinch,
    pattern, themes
  };
})();
