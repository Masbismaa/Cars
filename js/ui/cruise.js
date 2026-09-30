// Opening shot: side view of car 42 cruising at night, the world smeared into light streaks behind it.
// Everything is drawn on one canvas. The car is an original design, not any real make or model.
import { $, reduceMotion } from './dom.js';
import { createEngine, soundPref } from '../audio/engine.js';

const C = {
  skyTop: '#03040d', skyMid: '#0a0e33', skyLow: '#16194a',
  road: '#0c1519', roadLit: '#2e4a4c', lane: '#7a7440',
  bodyTop: '#123039', bodyLow: '#05090f', teal: '#4d8d93', rim: '#e0242f',
  glass: '#2a0a10', glow: '#d8283a', amber: '#ffc46b', white: '#e9eef0',
};

export function initCruise() {
  const canvas = $('cruise'), g = canvas.getContext('2d');
  let W = 0, H = 0, t = 0, last = 0, dist = 0, visible = true;
  let streaks = [], bands = [], grain = null, hero = null;

  const rand = (a, b) => a + Math.random() * (b - a);
  const fit = () => {
    const d = Math.min(2, devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * d; canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
    streaks = Array.from({ length: 14 }, () => sky(true));
    hero = { x: -W * .1, y: H * .36, len: W * .62, v: .1, w: Math.max(4, H * .014), red: true, ph: 3, a: .85 };
    bands = Array.from({ length: 90 }, () => band(true));
    grain = makeGrain();
  };

  // --- background: wavy light trails in the sky, smeared road below ---
  function sky(anywhere) {
    const red = Math.random() < .05, soft = !red && Math.random() < .3;
    return {
      x: anywhere ? rand(-W, W) : -rand(W * .3, W * .9), y: H * rand(.08, .5), len: W * rand(.08, red ? .7 : .35),
      v: rand(.18, .45), w: red ? rand(4, 7) : soft ? rand(5, 9) : rand(1.2, 2.4), red, soft, ph: rand(0, 99), a: soft ? rand(.08, .16) : rand(.35, .8),
    };
  }
  function band(anywhere) {
    const y = rand(.6, 1.02), near = (y - .6) / .42;           // lower on screen = closer = faster and thicker
    const lane = Math.random() < .08;
    return {
      x: anywhere ? rand(-W, W) : -rand(W * .5, W * 1.5), y: H * y, len: W * rand(.2, 1.1), h: 1 + near * rand(2, 9),
      v: .7 + near * 1.6, col: lane ? C.lane : C.roadLit, a: lane ? rand(.4, .7) : rand(.2, .6) * (1 - near * .35),
    };
  }
  function makeGrain() {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const k = c.getContext('2d'), img = k.createImageData(128, 128);
    for (let i = 0; i < img.data.length; i += 4) { const v = Math.random() * 255; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 22; }
    k.putImageData(img, 0, 0); return g.createPattern(c, 'repeat');
  }

  function drawWorld(dt) {
    const speed = W * 1.5;
    let grd = g.createLinearGradient(0, 0, 0, H * .62);
    grd.addColorStop(0, C.skyTop); grd.addColorStop(.7, C.skyMid); grd.addColorStop(1, C.skyLow);
    g.fillStyle = grd; g.fillRect(0, 0, W, H * .62);

    // sky trails: distant lights dragged into lines by the long exposure
    hero.x += hero.v * speed * dt; if (hero.x > W * 1.05) hero.x = -hero.len - W * .1;
    [...streaks, hero].forEach((s, i) => {
      if (s !== hero) { s.x += s.v * speed * dt; if (s.x > W + 20) streaks[i] = s = sky(false); }
      g.save();
      g.strokeStyle = s.red ? C.glow : C.white; g.globalAlpha = s.a; g.lineWidth = s.w; g.lineCap = 'round';
      g.shadowColor = s.red ? C.glow : '#9fb4ff'; g.shadowBlur = s.red ? 16 : s.soft ? 12 : 6;
      g.beginPath();
      for (let x = 0; x <= s.len; x += 6) {
        const y = s.y + Math.sin((x + s.ph * 40) * .045) * (s.red ? 2.4 : 1.2) + Math.sin((x + s.ph) * .31) * .6;
        x ? g.lineTo(s.x + x, y) : g.moveTo(s.x, y);
      }
      g.stroke(); g.restore();
    });

    // horizon: a guard rail line and a band of haze
    grd = g.createLinearGradient(0, H * .5, 0, H * .62);
    grd.addColorStop(0, 'rgba(60,50,110,0)'); grd.addColorStop(1, 'rgba(60,50,110,.35)');
    g.fillStyle = grd; g.fillRect(0, H * .5, W, H * .12);
    g.fillStyle = 'rgba(160,175,210,.35)'; g.fillRect(0, H * .585, W, 1.5);

    // road
    grd = g.createLinearGradient(0, H * .6, 0, H);
    grd.addColorStop(0, '#16262b'); grd.addColorStop(.4, C.road); grd.addColorStop(1, '#05080a');
    g.fillStyle = grd; g.fillRect(0, H * .6, W, H * .4);
    bands.forEach((b, i) => {
      b.x += b.v * speed * dt;
      if (b.x > W + 10) bands[i] = b = band(false);
      const lg = g.createLinearGradient(b.x, 0, b.x + b.len, 0);
      lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(.3, b.col); lg.addColorStop(.8, b.col); lg.addColorStop(1, 'rgba(0,0,0,0)');
      g.globalAlpha = b.a; g.fillStyle = lg; g.fillRect(b.x, b.y, b.len, b.h); g.globalAlpha = 1;
    });
  }

  // --- the car, in its own units: 100 long, ground at y = 0, nose pointing left ---
  function body(p) {
    const wy = -WR, R = WR + 1.6, off = -6 - wy, dx = Math.sqrt(R * R - off * off), a = Math.atan2(off, dx);
    p.moveTo(49, -6);
    p.lineTo(32 + dx, -6); p.arc(32, wy, R, a, Math.PI - a, true);
    p.lineTo(-29 + dx, -6); p.arc(-29, wy, R, a, Math.PI - a, true);
    p.lineTo(-49.5, -6);
    p.quadraticCurveTo(-52, -8, -51, -10.5);        // chin
    p.lineTo(-49, -13.5);                            // wedge nose
    p.lineTo(-18, -17);                              // long flat hood
    p.lineTo(-4, -26.5);                             // windscreen
    p.quadraticCurveTo(5, -27.8, 13, -27.3);         // roof
    p.lineTo(33, -20);                               // fastback
    p.lineTo(47, -19.5);                             // short deck
    p.quadraticCurveTo(50.5, -19, 50.5, -15.5);      // tail
    p.lineTo(50, -8); p.closePath();
  }
  const topLine = p => { p.moveTo(-49, -13.5); p.lineTo(-18, -17); p.lineTo(-4, -26.5); p.quadraticCurveTo(5, -27.8, 13, -27.3); p.lineTo(33, -20); p.lineTo(47, -19.5); };
  const WR = 7.8;

  function drawCar() {
    const len = Math.min(W * (W < 600 ? .64 : .48), H * 1.15), s = len / 100;
    const cx = W * .5, gy = H * .79;
    const bob = Math.sin(t * 9) * .22 + Math.sin(t * 2.3) * .12;
    const sweep = ((t % 3.4) / 3.4) * 2.4 - .7;          // a street light sliding along the body, rear to front... it's the car passing under it

    g.save(); g.translate(cx, gy); g.scale(s, s);

    // headlight throw on the road ahead, tail light smear behind
    let lg0 = g.createLinearGradient(-50, 0, -120, 0);
    lg0.addColorStop(0, 'rgba(255,196,107,.55)'); lg0.addColorStop(1, 'rgba(255,196,107,0)');
    g.fillStyle = lg0; g.fillRect(-120, -12.2, 70, 2.2);                     // glare smeared ahead
    lg0 = g.createLinearGradient(-45, 0, -130, 0);
    lg0.addColorStop(0, 'rgba(255,196,107,.16)'); lg0.addColorStop(1, 'rgba(255,196,107,0)');
    g.fillStyle = lg0; g.fillRect(-130, -1.2, 85, 1.6);                      // and its reflection on the road
    let rg;
    let lg = g.createLinearGradient(50, 0, 105, 0);
    lg.addColorStop(0, 'rgba(216,40,58,.75)'); lg.addColorStop(1, 'rgba(216,40,58,0)');
    g.fillStyle = lg; g.fillRect(50, -15.4, 55, 3);
    // shadow
    rg = g.createRadialGradient(0, 0, 10, 0, 0, 60);
    rg.addColorStop(0, 'rgba(0,0,0,.85)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = rg; g.beginPath(); g.ellipse(0, .3, 58, 3.4, 0, 0, Math.PI * 2); g.fill();

    // wheels (they stay on the road; the body bobs on its springs above them)
    [-29, 32].forEach(x => wheel(x, -WR, WR));

    g.translate(0, bob);
    const p = new Path2D(); body(p);
    // paint: dark teal, lighter up top where the sky reflects
    lg = g.createLinearGradient(0, -28, 0, -6);
    lg.addColorStop(0, C.bodyTop); lg.addColorStop(.55, '#0a1a22'); lg.addColorStop(1, C.bodyLow);
    g.fillStyle = lg; g.fill(p);

    g.save(); g.clip(p);
    // road reflecting in the lower doors
    lg = g.createLinearGradient(0, -12, 0, -6);
    lg.addColorStop(0, 'rgba(77,141,147,0)'); lg.addColorStop(1, 'rgba(77,141,147,.35)');
    g.fillStyle = lg; g.fillRect(-55, -12, 110, 7);
    // shoulder crease catching light
    g.strokeStyle = 'rgba(120,190,196,.55)'; g.lineWidth = .5;
    g.beginPath(); g.moveTo(-47, -12.8); g.lineTo(48, -16.2); g.stroke();
    // passing street light
    lg = g.createLinearGradient((sweep - .12) * 100 - 50, 0, (sweep + .12) * 100 - 50, 0);
    lg.addColorStop(0, 'rgba(233,238,240,0)'); lg.addColorStop(.5, 'rgba(233,238,240,.22)'); lg.addColorStop(1, 'rgba(233,238,240,0)');
    g.fillStyle = lg; g.fillRect(-55, -29, 110, 25);
    g.restore();

    // greenhouse, lit red from the dash
    const win = new Path2D();
    win.moveTo(-14.8, -17.8); win.lineTo(-4.4, -25.2); win.quadraticCurveTo(5, -26.4, 12.4, -26); win.lineTo(28.5, -20.6); win.closePath();
    lg = g.createLinearGradient(-15, 0, 28, 0);
    lg.addColorStop(0, 'rgba(200,30,48,.9)'); lg.addColorStop(.55, 'rgba(120,14,28,.95)'); lg.addColorStop(1, 'rgba(40,6,12,1)');
    g.fillStyle = lg; g.fill(win);
    g.save(); g.clip(win);
    // driver: hands on the wheel, looking ahead
    g.fillStyle = 'rgba(20,4,8,.85)';
    g.beginPath(); g.arc(3.5, -22.4, 2.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(.4, -19.6); g.quadraticCurveTo(3.5, -20.8, 7, -19.4); g.lineTo(8, -17); g.lineTo(-.5, -17); g.fill();
    g.strokeStyle = 'rgba(20,4,8,.85)'; g.lineWidth = 1.1; g.beginPath(); g.moveTo(1.6, -18.8); g.lineTo(-4, -19.6); g.stroke();
    g.beginPath(); g.ellipse(-5, -19.4, .7, 2, -.3, 0, Math.PI * 2); g.stroke();   // steering wheel
    // B-pillar and glass reflection
    g.fillStyle = '#060b10'; g.beginPath(); g.moveTo(11, -27); g.lineTo(14.5, -27); g.lineTo(17, -17.5); g.lineTo(13.5, -17.5); g.fill();
    g.fillStyle = 'rgba(255,190,200,.12)'; g.beginPath(); g.moveTo(-8.5, -27); g.lineTo(-5, -27); g.lineTo(-11.5, -17.5); g.lineTo(-15, -17.5); g.fill();
    g.restore();

    // red rim light along the roofline from the tail lights ahead of us, teal below
    g.save(); g.shadowColor = C.rim; g.shadowBlur = 6 * s;
    g.strokeStyle = 'rgba(224,36,47,.65)'; g.lineWidth = .5; g.beginPath(); topLine(g); g.stroke(); g.restore();

    // details: door cut, handle, mirror, race number
    g.strokeStyle = 'rgba(0,0,0,.7)'; g.lineWidth = .35;
    g.beginPath(); g.moveTo(-15, -17.4); g.lineTo(-13.8, -7); g.moveTo(14.5, -17.4); g.lineTo(13.2, -7); g.stroke();
    g.fillStyle = 'rgba(120,190,196,.5)'; g.fillRect(8, -14.6, 3.2, .6);
    g.fillStyle = '#060b10'; g.beginPath(); g.moveTo(-12.6, -18.4); g.lineTo(-9.8, -20); g.lineTo(-9, -18); g.fill();
    g.strokeStyle = 'rgba(233,238,240,.35)'; g.lineWidth = .4; g.beginPath(); g.arc(-1, -11.4, 3.3, 0, Math.PI * 2); g.stroke();
    g.fillStyle = 'rgba(233,238,240,.5)'; g.font = `700 3.6px "JetBrains Mono", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('42', -1, -11.2);

    // rear wing on two stands
    g.fillStyle = '#060b10';
    g.fillRect(40, -23.4, .9, 4); g.fillRect(45.5, -23.2, .9, 3.8);
    g.beginPath(); g.moveTo(36.5, -24); g.lineTo(51, -24.7); g.lineTo(51, -23); g.lineTo(37, -22.8); g.fill();
    g.strokeStyle = 'rgba(224,36,47,.7)'; g.lineWidth = .35; g.beginPath(); g.moveTo(36.5, -24); g.lineTo(51, -24.7); g.stroke();

    // lamps
    g.save(); g.shadowColor = C.amber; g.shadowBlur = 10 * s;
    g.fillStyle = C.amber; g.beginPath(); g.moveTo(-50.2, -11.4); g.lineTo(-45, -12.6); g.lineTo(-45.2, -11.4); g.fill();
    g.shadowColor = C.glow; g.shadowBlur = 12 * s; g.fillStyle = '#ff3346'; g.fillRect(49.6, -15.6, 1.2, 4);
    g.restore();
    g.restore();
  }

  function wheel(x, y, r) {
    g.save(); g.translate(x, y);
    g.fillStyle = '#030507'; g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.fill();
    const rim = r * .64;
    const rg = g.createRadialGradient(0, 0, 0, 0, 0, rim);
    rg.addColorStop(0, '#283034'); rg.addColorStop(.75, '#12181b'); rg.addColorStop(1, '#222a2d');
    g.fillStyle = rg; g.beginPath(); g.arc(0, 0, rim, 0, Math.PI * 2); g.fill();
    // spokes, blurred by speed: several faint copies spread over a few degrees
    g.strokeStyle = 'rgba(150,170,176,.08)'; g.lineWidth = rim * .22;
    const ang = -dist / r;
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      for (let i = 0; i < 5; i++) { const a = ang + k * .09 + i * Math.PI * 2 / 5; g.moveTo(0, 0); g.lineTo(Math.cos(a) * rim * .92, Math.sin(a) * rim * .92); }
      g.stroke();
    }
    g.fillStyle = '#0a0e10'; g.beginPath(); g.arc(0, 0, rim * .22, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(77,141,147,.35)'; g.lineWidth = .4; g.beginPath(); g.arc(0, 0, r - .4, -2.6, -1.2); g.stroke();
    g.restore();
  }

  function drawFinish() {
    // vignette and film grain
    const rg = g.createRadialGradient(W / 2, H * .55, Math.min(W, H) * .3, W / 2, H * .55, Math.max(W, H) * .75);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    g.save(); g.translate(-Math.random() * 128, -Math.random() * 128); g.fillStyle = grain; g.fillRect(0, 0, W + 128, H + 128); g.restore();
  }

  function render(dt) { drawWorld(dt); drawCar(); drawFinish(); }
  function frame(now) {
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (visible) { t += dt; dist += dt * 260; render(dt); }
    requestAnimationFrame(frame);
  }

  // engine sound: cruising in sixth, the throttle breathing a little. Starts only when asked.
  let engine = null, soundOn = false;
  const btn = $('cruiseSound');
  const showBtn = () => { btn.textContent = soundOn ? 'Sound on' : 'Sound off'; btn.setAttribute('aria-pressed', String(soundOn)); };
  btn.addEventListener('click', () => {
    soundOn = !soundOn; soundPref.on = soundOn;
    if (soundOn && !engine) engine = createEngine();
    showBtn(); hum();
  });
  function hum() {
    if (!engine) return;
    if (!soundOn || !visible) { engine.volume(0, .2); return; }
    const k = t * 1.3;
    engine.set({ rpm: 5200 + Math.sin(k) * 260 + Math.sin(k * 3.7) * 90, load: .45 + Math.sin(k * .8) * .1, speed: .75 });
    engine.volume(.32, .4);
  }
  setInterval(hum, 120);
  showBtn();

  fit();
  addEventListener('resize', () => { fit(); if (reduceMotion) render(0); });
  if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  if (reduceMotion) { t = 1.2; render(0); if (document.fonts) document.fonts.ready.then(() => render(0)); }
  else requestAnimationFrame(frame);
}
