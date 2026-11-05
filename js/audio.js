/* ==========================================================================
   AUDIO — clochettes de Noël synthétisées avec WebAudio (aucun fichier .mp3)
   Le son est désactivé par défaut et ne démarre jamais tout seul.
   ========================================================================== */
(function () {
  'use strict';

  const Noel = window.Noel;
  let ctx = null;
  let master = null;

  /** Notes (octave haute, comme des clochettes) — solfège français */
  const NOTES = {
    'Do': 523.25, 'Ré': 587.33, 'Mi': 659.25, 'Fa': 698.46,
    'Sol': 783.99, 'La': 880.0, 'Si': 987.77, 'Do2': 1046.5
  };

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(comp);
      comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }

  /** Une clochette : plusieurs harmoniques qui s'éteignent à des vitesses différentes */
  function bell(freq, when, opts) {
    if (!A.enabled || !ensure()) return;
    const o = Object.assign({ dur: 1.7, vol: 0.2 }, opts);
    const t0 = ctx.currentTime + (when || 0);
    const partials = [[1, 1], [2.01, 0.42], [2.76, 0.26], [4.07, 0.14], [5.43, 0.08]];
    partials.forEach(([ratio, gain]) => {
      if (freq * ratio > 14000) return; // inaudible, et au-delà de la limite de la carte son
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * ratio;
      const d = o.dur / (ratio > 2 ? 1.8 : 1);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(o.vol * gain, t0 + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      osc.connect(g);
      g.connect(master);
      osc.start(t0);
      osc.stop(t0 + d + 0.05);
    });
  }

  const A = (Noel.audio = {
    enabled: !!Noel.store.get('sound', false),
    NOTES,

    setEnabled(value) {
      A.enabled = !!value;
      Noel.store.set('sound', A.enabled);
      if (A.enabled) { ensure(); A.chime(); }
      Noel.emit('sound', A.enabled);
    },

    /** Joue une note nommée (ex. "Mi") */
    note(name, when) {
      if (NOTES[name]) bell(NOTES[name], when || 0);
    },

    /** Petit « ding-ding » joyeux */
    chime() {
      bell(NOTES.Sol, 0, { vol: 0.16, dur: 1.2 });
      bell(NOTES.Do2, 0.09, { vol: 0.16, dur: 1.4 });
    },

    /** Un seul tintement discret (pour chaque clic) */
    tick() {
      const pool = [NOTES.Do, NOTES['Ré'], NOTES.Mi, NOTES.Sol, NOTES.La];
      bell(Noel.pick(pool) * 2, 0, { vol: 0.05, dur: 0.6 });
    },

    /** Étincelles : trois notes aiguës aléatoires */
    sparkle() {
      const pool = [NOTES.Sol, NOTES.La, NOTES.Si, NOTES.Do2, NOTES.Do2 * 1.25];
      for (let i = 0; i < 3; i++) bell(Noel.pick(pool) * 2, i * 0.07, { vol: 0.07, dur: 0.9 });
    },

    /** Grelots du traîneau : une rafale de petits tintements métalliques */
    jingle(count) {
      const n = count || 9;
      for (let i = 0; i < n; i++) {
        bell(Noel.rand(2600, 4400), i * Noel.rand(0.035, 0.07), { vol: 0.05, dur: 0.35 });
      }
    },

    /** « Vive le vent » — première phrase de Jingle Bells, en clochettes */
    melody() {
      const N = NOTES;
      const tune = [
        ['Mi', 1], ['Mi', 1], ['Mi', 2], ['Mi', 1], ['Mi', 1], ['Mi', 2],
        ['Mi', 1], ['Sol', 1], ['Do', 1.5], ['Ré', 0.5], ['Mi', 4],
        ['Fa', 1], ['Fa', 1], ['Fa', 1.5], ['Fa', 0.5],
        ['Fa', 1], ['Mi', 1], ['Mi', 1], ['Mi', 0.5], ['Mi', 0.5],
        ['Mi', 1], ['Ré', 1], ['Ré', 1], ['Mi', 1], ['Ré', 2], ['Sol', 2]
      ];
      const beat = 0.3;
      let t = 0;
      tune.forEach(([name, len]) => {
        bell(N[name], t, { vol: 0.17, dur: 1.5 });
        t += len * beat;
      });
      return t;
    }
  });

  Noel.on('sound', () => { /* l'interface se met à jour dans main.js */ });
})();
