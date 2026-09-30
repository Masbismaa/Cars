// Engine, tyre and impact sounds, synthesised with the Web Audio API. No audio files.
// Browsers only allow sound after a click or key press, so nothing starts until the visitor asks.

const store = {
  get: () => { try { return localStorage.getItem('mbp-sound'); } catch (e) { return null; } },
  set: v => { try { localStorage.setItem('mbp-sound', v); } catch (e) {} },
};
export const soundPref = { get on() { return store.get() !== 'off'; }, set on(v) { store.set(v ? 'on' : 'off'); } };

let ctx = null, noiseBuf = null;
function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
const noise = c => { const n = c.createBufferSource(); n.buffer = noiseBuf; n.loop = true; return n; };
const curve = k => { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / n * 2 - 1; c[i] = Math.tanh(x * k); } return c; };

// A six-cylinder engine: firing frequency = rpm / 20. Two detuned saws and a sub square through
// soft clipping and a low-pass that opens with load, plus a band of noise for the intake rasp.
export function createEngine() {
  const c = audio();
  if (!c) return null;
  const out = c.createGain(); out.gain.value = 0; out.connect(c.destination);

  const mix = c.createGain(); mix.gain.value = .5;
  const shaper = c.createWaveShaper(); shaper.curve = curve(2.6); shaper.oversample = '2x';
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 3;
  const oscs = [['sawtooth', 1, 0], ['sawtooth', 1, 9], ['square', .5, 0]].map(([type, mul, det]) => {
    const o = c.createOscillator(); o.type = type; o.detune.value = det; o.start();
    const gg = c.createGain(); gg.gain.value = type === 'square' ? .35 : .5;
    o.connect(gg).connect(mix); return { o, mul };
  });
  mix.connect(shaper).connect(lp).connect(out);

  const rasp = noise(c), raspBp = c.createBiquadFilter(), raspG = c.createGain();
  raspBp.type = 'bandpass'; raspBp.Q.value = 1.2; raspG.gain.value = 0;
  rasp.connect(raspBp).connect(raspG).connect(out); rasp.start();

  // tyre squeal: narrow band of noise that wobbles in pitch
  const sq = noise(c), sqBp = c.createBiquadFilter(), sqG = c.createGain();
  sqBp.type = 'bandpass'; sqBp.frequency.value = 2300; sqBp.Q.value = 14; sqG.gain.value = 0;
  sq.connect(sqBp).connect(sqG).connect(out); sq.start();

  // wind: low rumble that rises with speed
  const wind = noise(c), wLp = c.createBiquadFilter(), wG = c.createGain();
  wLp.type = 'lowpass'; wLp.frequency.value = 420; wG.gain.value = 0;
  wind.connect(wLp).connect(wG).connect(out); wind.start();

  let t0 = c.currentTime;
  return {
    // rpm 800..9000, load 0..1 (throttle), speed 0..1, squeal 0..1
    set({ rpm, load = .7, speed = 0, squeal = 0 }) {
      const now = c.currentTime, f = rpm / 20, k = .06;
      oscs.forEach(({ o, mul }) => o.frequency.setTargetAtTime(f * mul, now, k * .5));
      lp.frequency.setTargetAtTime(Math.min(9000, f * (3 + load * 5)), now, k);
      raspBp.frequency.setTargetAtTime(f * 3.2, now, k);
      raspG.gain.setTargetAtTime(.05 + load * .12, now, k);
      mix.gain.setTargetAtTime(.35 + load * .25, now, k);
      sqBp.frequency.setTargetAtTime(2100 + Math.sin((now - t0) * 13) * 220, now, .02);
      sqG.gain.setTargetAtTime(squeal * .22, now, .05);
      wG.gain.setTargetAtTime(speed * .35, now, .2);
    },
    volume(v, fade = .25) { out.gain.setTargetAtTime(v, c.currentTime, fade); },
    // short sounds
    crash() { hit(c, out, 140, 38, .55, .5); },
    cone() { hit(c, out, 420, 180, .12, .25); },
    slip() { const n = noise(c), f = c.createBiquadFilter(), gg = c.createGain(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 3; gg.gain.setValueAtTime(.18, c.currentTime); gg.gain.exponentialRampToValueAtTime(.001, c.currentTime + .6); n.connect(f).connect(gg).connect(out); n.start(); n.stop(c.currentTime + .65); },
  };
}

function hit(c, out, f0, f1, dur, vol) {
  const now = c.currentTime;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f0, now); o.frequency.exponentialRampToValueAtTime(f1, now + dur);
  g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(.001, now + dur);
  o.connect(g).connect(out); o.start(now); o.stop(now + dur + .05);
  const n = noise(c), ng = c.createGain(), nf = c.createBiquadFilter();
  nf.type = 'lowpass'; nf.frequency.value = 2400;
  ng.gain.setValueAtTime(vol * .6, now); ng.gain.exponentialRampToValueAtTime(.001, now + dur * .6);
  n.connect(nf).connect(ng).connect(out); n.start(now); n.stop(now + dur);
}
