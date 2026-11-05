/* ==========================================================================
   MAIN — met tout en route
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  const { $, $$ } = Noel;
  const Art = Noel.art;
  const CFG = (window.NOEL && window.NOEL.config) || {};

  /** Chaque module démarre à part : si l'un plante, le reste du site continue de fonctionner. */
  function safe(name, fn) {
    try { fn(); } catch (e) { console.error('[Noel] ' + name + ' a échoué :', e); }
  }

  function applyConfig() {
    if (CFG.titre) {
      document.title = CFG.titre;
      $('#title').textContent = CFG.titre;
    }
    if (CFG.sousTitre) $('#subtitle').textContent = CFG.sousTitre;
  }

  function fillArt() {
    $$('[data-art]').forEach((el) => {
      const fn = Art.icons[el.dataset.art] || Art[el.dataset.art];
      if (typeof fn === 'function') el.innerHTML = fn();
    });
    $$('.elf').forEach((el) => { if (!el.firstElementChild) el.innerHTML = Art.elf(); });
    $('#brand-ico').innerHTML = Art.icons.treeIcon();
    $('#secrets-ico').innerHTML = Art.icons.star();
    $('#btn-sound').innerHTML = Art.icons.bell();
    $('#btn-calm').innerHTML = Art.icons.flake();
    $('#to-top').innerHTML = Art.icons.up();
    $$('.cursor-switch [data-cursor]').forEach((b) => { b.innerHTML = Noel.cursor.sprite(b.dataset.cursor); });
  }

  function bindTools() {
    $$('.cursor-switch [data-cursor]').forEach((b) => {
      b.addEventListener('click', () => {
        Noel.cursor.set(b.dataset.cursor);
        Noel.audio.sparkle();
      });
    });

    const snd = $('#btn-sound');
    const syncSound = (on) => snd.setAttribute('aria-pressed', on ? 'true' : 'false');
    syncSound(Noel.audio.enabled);
    snd.addEventListener('click', () => Noel.audio.setEnabled(!Noel.audio.enabled));
    Noel.on('sound', syncSound);

    const calm = $('#btn-calm');
    const syncCalm = (on) => {
      calm.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (on) {
        Noel.snow.back.clear();
        Noel.snow.front.clear();
      }
    };
    syncCalm(Noel.calm);
    calm.addEventListener('click', () => {
      Noel.setCalm(!Noel.calm);
      Noel.toast(Noel.calm ? 'Mode calme activé : les animations se reposent.' : 'Les animations sont de retour !', { duration: 2200 });
    });
    Noel.on('calm', syncCalm);

    $('#btn-secrets').addEventListener('click', () => Noel.secrets.openPanel());
    $('#footer-secrets').addEventListener('click', () => Noel.secrets.openPanel());
  }

  /** Petit feu d'étincelles à chaque clic ou tap (le style dépend du curseur choisi). */
  function bindClickFx() {
    document.addEventListener('pointerdown', (e) => {
      if (Noel.calm) return;
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      const kind = Noel.cursor.kind;
      const touch = e.pointerType === 'touch';
      let o;
      if (kind === 'sleigh') o = { n: touch ? 16 : 11, shapes: ['spark', 'star'], colors: ['#fff2b0', '#ffd166', '#ffffff'], power: 270, g: 160, size: [5, 11] };
      else if (kind === 'reindeer') o = { n: touch ? 16 : 11, shapes: ['puff', 'circle', 'flake'], colors: ['#ffffff', '#cfe3ff'], power: 210, g: 70, size: [7, 14] };
      else o = { n: touch ? 18 : 13, power: 330 };
      Noel.fx.burst(e.clientX, e.clientY, o);
      Noel.audio.tick();
    });
  }

  function bindCta() {
    $('#cta').addEventListener('click', () => {
      const r = $('#cta').getBoundingClientRect();
      Noel.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 40);
      Noel.audio.chime();
    });
  }

  function firstVisitHint() {
    if (Noel.store.get('seen', false)) return;
    Noel.store.set('seen', true);
    if (!Noel.finePointer) return;
    setTimeout(() => {
      Noel.toast('<b>Psst…</b> tu peux changer de curseur (cadeau, traîneau ou renne) en haut à droite.', { duration: 6000 });
    }, 5500);
  }

  function start() {
    safe('config', applyConfig);
    safe('titre', () => Noel.scene.splitLetters($('#title')));
    safe('curseur-sprites', () => { Noel.cursor.set(Noel.cursor.kind, { silent: true }); });
    safe('illustrations', fillArt);
    safe('curseur', Noel.cursor.init);
    safe('décor', Noel.scene.init);
    safe('liste', Noel.liste.init);
    safe('secrets', Noel.secrets.init);
    safe('outils', bindTools);
    safe('clics', bindClickFx);
    safe('cta', bindCta);
    safe('lutins', Noel.scene.updateElfUI);
    safe('indice', firstVisitHint);

    // Les polices sont prêtes (ou presque) : on lève le rideau
    const reveal = () => document.body.classList.add('ready');
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, Noel.wait(900)]).then(reveal);
    } else {
      reveal();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
