// Night Pass: a pseudo-3D mountain road (segment projection, the classic arcade technique).
// Dodge traffic, cones and oil. Hold drift through corners to build a combo.
import { $, reduceMotion } from '../ui/dom.js';
import * as art from './sprites.js';
import { drawCloud } from '../ui/smoke.js';
import { createEngine, soundPref } from '../audio/engine.js';

const SEG = 200, ROAD = 2000, LANES = 3, DRAW = 160, CAM_H = 1000, FOV = 100;
const DEPTH = 1 / Math.tan((FOV / 2) * Math.PI / 180);
const MAX_SPEED = SEG * 60, N = 1400, TRACK = N * SEG;
const RANKS = [[0, 'Learner plate'], [4000, 'Weekend driver'], [12000, 'Night regular'], [26000, 'Pass specialist'], [50000, 'Owns the mountain']];
const store = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };

export function initRace() {
  const canvas = $('raceCanvas'), g = canvas.getContext('2d'), box = $('race');
  let W = 0, H = 0, onScreen = false;
  const fit = () => {
    const d = Math.min(2, devicePixelRatio || 1);
    W = box.clientWidth; H = box.clientHeight;
    canvas.width = W * d; canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
  };
  fit(); addEventListener('resize', fit);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (!onScreen && S.state === 'play') pause(); }, { threshold: .2 }).observe(box);

  const segments = buildRoad();
  const stars = Array.from({ length: 70 }, () => [Math.random(), Math.random() * .45, Math.random() < .15 ? 1.6 : .9]);
  const hills = [ridge(24, .18, .05), ridge(40, .12, .02)];

  const S = {
    state: 'idle', pos: 0, x: 0, speed: MAX_SPEED * .45, lives: 3, score: 0, dist: 0, combo: 1, driftT: 0, lastDrift: 0,
    drift: false, yaw: 0, spin: 0, hurt: 0, shake: 0, sky: 0, objects: [], smoke: [], sfx: [], lines: [], best: +(store.get('mbp-nightpass-best') || 0),
  };
  $('rBest').textContent = S.best;
  const keys = { left: false, right: false, drift: false };

  // ---------- input ----------
  const keymap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'drift', ShiftLeft: 'drift', ShiftRight: 'drift' };
  addEventListener('keydown', e => {
    if (S.state !== 'play' || !onScreen) return;
    if (e.code === 'KeyP' || e.code === 'Escape') { pause(); return; }
    const k = keymap[e.code]; if (!k) return;
    keys[k] = true; e.preventDefault();
  });
  addEventListener('keyup', e => { const k = keymap[e.code]; if (k) keys[k] = false; });
  document.querySelectorAll('.race-pad [data-key]').forEach(b => {
    const k = b.dataset.key, on = e => { e.preventDefault(); keys[k] = true; b.classList.add('down'); }, off = () => { keys[k] = false; b.classList.remove('down'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  });
  $('rStart').addEventListener('click', () => { if (soundPref.on) ensureEngine(); if (S.state === 'paused') resume(); else start(); });

  // ---------- sound ----------
  let engine = null;
  const soundBtn = $('rSound');
  const ensureEngine = () => { if (!engine) engine = createEngine(); return engine; };
  const showSound = () => { const on = soundPref.on; soundBtn.setAttribute('aria-pressed', String(on)); soundBtn.textContent = on ? 'Sound on' : 'Sound off'; };
  const toggleSound = () => { soundPref.on = !soundPref.on; if (soundPref.on) ensureEngine(); else if (engine) engine.volume(0, .05); showSound(); };
  soundBtn.addEventListener('click', toggleSound);
  addEventListener('keydown', e => { if (e.code === 'KeyM' && onScreen && (S.state === 'play' || S.state === 'paused')) toggleSound(); });
  showSound();
  function sound() {
    if (!engine) return;
    if (!soundPref.on || !onScreen || S.state === 'idle' || S.state === 'over') { engine.volume(0, .15); return; }
    const r = S.speed / MAX_SPEED;
    if (S.state === 'paused') { engine.set({ rpm: 950 + Math.random() * 40, load: .15, speed: 0 }); engine.volume(.3); return; }
    const gear = Math.min(6, 1 + Math.floor(r * 6)), frac = r * 6 - (gear - 1);
    const rpm = gear === 1 ? 1000 + frac * 7600 : 3600 + frac * 5000;
    engine.set({ rpm, load: S.hurt > 0 ? .3 : keys.drift ? .55 : .85, speed: r, squeal: S.drift ? .9 : S.spin > 0 ? .7 : 0 });
    engine.volume(.42);
  }

  function start() {
    Object.assign(S, { state: 'play', pos: 0, x: 0, speed: 0, lives: 3, score: 0, dist: 0, combo: 1, driftT: 0, yaw: 0, spin: 0, hurt: 0, smoke: [], sfx: [] });
    S.objects = spawnObjects();
    $('rOverlay').hidden = true; hud(); canvas.focus({ preventScroll: true });
  }
  function pause() { S.state = 'paused'; $('rTitle').textContent = 'Pulled over'; $('rMsg').textContent = 'The engine is still running.'; $('rStart').textContent = 'Back on the road'; $('rOverlay').hidden = false; }
  function resume() { S.state = 'play'; $('rOverlay').hidden = true; canvas.focus({ preventScroll: true }); }
  function over() {
    S.state = 'over';
    const score = Math.round(S.score);
    if (score > S.best) { S.best = score; store.set('mbp-nightpass-best', score); }
    $('rTitle').textContent = `${score} points`;
    $('rMsg').innerHTML = `${Math.round(S.dist / 1000 * 10) / 10} km down the pass. Rating: <b>${RANKS.filter(r => score >= r[0]).pop()[1]}</b>. Best run ${S.best}.`;
    $('rStart').textContent = 'Run it again'; $('rOverlay').hidden = false; hud();
  }
  const hud = () => {
    $('rSpeed').textContent = Math.round(S.speed / MAX_SPEED * 240);
    $('rScore').textContent = Math.round(S.score);
    $('rCombo').textContent = 'x' + S.combo;
    $('rLives').textContent = S.lives;
    $('rBest').textContent = S.best;
  };

  // ---------- world ----------
  function spawnObjects() {
    const list = [];
    for (let z = 60 * SEG; z < TRACK - 20 * SEG; z += SEG * (7 + Math.random() * 9)) {
      const r = Math.random(), lane = [-.66, 0, .66][Math.floor(Math.random() * LANES)];
      if (r < .62) list.push({ kind: 'car', z, x: lane + (Math.random() - .5) * .1, speed: MAX_SPEED * (.18 + Math.random() * .22), w: .34, variant: Math.floor(Math.random() * 3) });
      else if (r < .85) list.push({ kind: 'cone', z, x: lane, speed: 0, w: .12 });
      else list.push({ kind: 'oil', z, x: lane, speed: 0, w: .36 });
    }
    return list;
  }

  const seg = z => segments[Math.floor(z / SEG) % N];
  const lerp = (a, b, k) => a + (b - a) * k;

  function update(dt) {
    const pz = S.pos + CAM_H * DEPTH, ps = seg(pz), ratio = S.speed / MAX_SPEED;
    if (S.state === 'play') {
      S.speed = Math.min(MAX_SPEED, S.speed + MAX_SPEED * .22 * dt * (keys.drift ? .5 : 1));
      const steer = (keys.left ? -1 : 0) + (keys.right ? 1 : 0);
      S.drift = keys.drift && ratio > .35;
      S.x += steer * dt * 2.2 * ratio * (S.drift ? 1.25 : 1);
      S.x -= dt * 2.2 * ratio * ps.curve * (S.drift ? .1 : .32);          // centrifugal pull, weaker when sliding
      S.yaw += ((S.drift ? steer * .35 + ps.curve * .05 : steer * .06) - S.yaw) * Math.min(1, dt * 6);
      if (S.spin > 0) { S.spin -= dt; S.x += Math.sin(S.spin * 18) * dt * 1.4; S.yaw = Math.sin(S.spin * 22) * .5; }
      if (Math.abs(S.x) > 1) { S.speed *= 1 - dt * 1.6; if (Math.abs(S.x) > 1.25) { S.x = Math.sign(S.x) * 1.25; S.shake = .15; breakCombo(); } }
      // combo: only real drifting counts, in a real corner, at speed
      if (S.drift && Math.abs(ps.curve) > 1.5 && ratio > .5 && Math.abs(S.x) < 1) {
        S.driftT += dt; S.lastDrift = 0;
        S.combo = Math.min(8, 1 + Math.floor(S.driftT / 1.1));
        if (Math.random() < dt * 1.6) pop('キィィ', W * .5 + (Math.random() - .5) * W * .3, H * .78);
      } else { S.lastDrift += dt; if (S.lastDrift > 1.6) { S.combo = 1; S.driftT = 0; } }
      const meters = S.speed * dt / 50;
      S.dist += meters; S.score += meters * S.combo * (S.drift ? 1.5 : 1);
      if (S.hurt > 0) S.hurt -= dt;
      collide(pz);
    } else if (S.state === 'idle') {
      S.speed = MAX_SPEED * .5;
      S.x += (-ps.curve * .12 - S.x) * dt * 2;                           // the attract mode follows the road on its own
      S.drift = Math.abs(ps.curve) > 3; S.yaw = S.drift ? -ps.curve * .06 : 0;
    }
    if (S.state === 'play' || S.state === 'idle') {
      S.pos = (S.pos + S.speed * dt) % TRACK;
      S.sky += ps.curve * ratio * dt * .004;
      S.objects.forEach(o => { o.z = (o.z + o.speed * dt) % TRACK; });
      if (S.drift) for (const side of [-1, 1]) for (let n = 0; n < 2; n++) if (Math.random() < .8) S.smoke.push({ x: W * .5 + side * W * (.08 + Math.random() * .03), y: H * (.9 + Math.random() * .03), r: W * (.008 + Math.random() * .01), vx: side * (40 + Math.random() * 90) - S.yaw * 160, vy: -20 - Math.random() * 60, life: 0, max: .6 + Math.random() * .5 });
      if (S.smoke.length > 160) S.smoke.splice(0, S.smoke.length - 160);
    }
    S.shake = Math.max(0, S.shake - dt);
  }

  function collide(pz) {
    const pseg = Math.floor(pz / SEG) % N;
    for (const o of S.objects) {
      const oseg = Math.floor(o.z / SEG) % N;
      if (oseg !== pseg && oseg !== (pseg + 1) % N) continue;
      if (Math.abs(o.x - S.x) > (o.w + .3) / 2) continue;
      if (o.kind === 'oil') { if (S.spin <= 0) { S.spin = .9; pop('ツルッ', W * .5, H * .62); breakCombo(); if (engine && soundPref.on) engine.slip(); } continue; }
      if (S.hurt > 0) continue;
      if (o.kind === 'cone') { o.z = (o.z + SEG * 400) % TRACK; S.speed *= .7; S.shake = .2; pop('ガッ', W * .5, H * .6); breakCombo(); if (engine && soundPref.on) engine.cone(); continue; }
      // traffic: lose a car, keep going
      S.lives--; S.hurt = 1.6; S.speed *= .25; S.shake = .45; breakCombo(); if (engine && soundPref.on) engine.crash();
      o.z = (o.z + SEG * 30) % TRACK;
      pop('ドンッ', W * .5, H * .45, 2.2);
      hud();
      if (S.lives <= 0) { over(); return; }
    }
  }
  const breakCombo = () => { S.combo = 1; S.driftT = 0; };
  const pop = (txt, x, y, size = 1) => S.sfx.push({ txt, x, y, size, life: 0 });

  // ---------- drawing ----------
  function project(p, cx, cy, cz) {
    const X = (p.x || 0) - cx, Y = p.y - cy, Z = p.z - cz;
    p.scale = DEPTH / Z;
    p.sx = W / 2 + p.scale * X * W / 2;
    p.sy = H / 2 - p.scale * Y * H / 2;
    p.sw = p.scale * ROAD * W / 2;
    p.cz = Z;
  }

  function render(dt) {
    const shake = S.shake > 0 ? (Math.random() - .5) * 14 * S.shake : 0;
    g.save(); g.translate(shake, shake * .6);
    art.sky(g, W, H, stars, S.sky);
    hills.forEach((h, i) => art.hills(g, W, H, h, S.sky * (i ? 1.6 : 1), i));

    const base = seg(S.pos), bp = (S.pos % SEG) / SEG;
    const ps = seg(S.pos + CAM_H * DEPTH), pp = ((S.pos + CAM_H * DEPTH) % SEG) / SEG;
    const py = lerp(ps.p1.y, ps.p2.y, pp);
    let maxy = H, x = 0, dx = -(base.curve * bp);
    const drawn = [];
    for (let n = 0; n < DRAW; n++) {
      const s = segments[(base.index + n) % N], looped = s.index < base.index;
      project(s.p1, S.x * ROAD - x, py + CAM_H, S.pos - (looped ? TRACK : 0));
      project(s.p2, S.x * ROAD - x - dx, py + CAM_H, S.pos - (looped ? TRACK : 0));
      x += dx; dx += s.curve;
      s.clip = maxy;
      if (s.p1.cz <= DEPTH || s.p2.sy >= s.p1.sy || s.p2.sy >= maxy) continue;
      const fog = Math.min(1, n / DRAW * 1.35);
      art.segment(g, W, s, fog);
      maxy = s.p1.sy;
      drawn.push([n, s]);
    }
    // roadside things and traffic, far to near
    const bySeg = new Map();
    S.objects.forEach(o => { const i = Math.floor(o.z / SEG) % N; if (!bySeg.has(i)) bySeg.set(i, []); bySeg.get(i).push(o); });
    for (let k = drawn.length - 1; k >= 0; k--) {
      const [n, s] = drawn[k];
      g.save(); g.beginPath(); g.rect(0, 0, W, s.clip); g.clip();
      const fog = Math.min(1, n / DRAW * 1.35);
      if (s.lamp) art.lamp(g, s.p1.sx + s.p1.sw * 1.25 * s.lamp, s.p1.sy, s.p1.scale * W / 2 * ROAD, s.lamp, fog);
      (bySeg.get(s.index) || []).forEach(o => {
        const k2 = (o.z % SEG) / SEG, sc = lerp(s.p1.scale, s.p2.scale, k2);
        const ox = lerp(s.p1.sx, s.p2.sx, k2) + sc * o.x * ROAD * W / 2, oy = lerp(s.p1.sy, s.p2.sy, k2), ow = sc * o.w * ROAD * W / 2;
        if (o.kind === 'car') art.traffic(g, ox, oy, ow, o.variant, fog);
        else if (o.kind === 'cone') art.cone(g, ox, oy, ow, fog);
        else art.oil(g, ox, oy, ow, fog);
      });
      g.restore();
    }

    // smoke under the player, then the player
    S.smoke = S.smoke.filter(p => (p.life += dt) < p.max);
    S.smoke.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy *= .98; p.vx *= .97; p.r += W * .055 * dt; });
    drawCloud(g, S.smoke.map(p => ({ x: p.x, y: p.y, r: p.r * Math.min(1, 3 * (1 - p.life / p.max)), a: 1 })), [-.18, -.3]);
    if (!(S.hurt > 0 && Math.floor(S.hurt * 10) % 2)) art.player(g, W / 2, H * .94, W * .2, S.yaw, S.drift, (keys.left ? -1 : 0) + (keys.right ? 1 : 0));

    // manga speed lines once the car is really moving
    const ratio = S.speed / MAX_SPEED;
    if (ratio > .6 && !reduceMotion) art.speedLines(g, W, H, (ratio - .6) / .4);
    S.sfx = S.sfx.filter(f => (f.life += dt) < .8);
    S.sfx.forEach(f => art.sfx(g, f.txt, f.x, f.y - f.life * 30, f.size, 1 - f.life / .8));
    g.restore();
  }

  let last = 0, hudT = 0;
  function frame(now) {
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (onScreen && W) {
      if (S.state !== 'paused' && S.state !== 'over') update(dt);
      render(S.state === 'paused' ? 0 : dt);
      if ((hudT += dt) > .1 && S.state === 'play') { hudT = 0; hud(); }
    }
    sound();
    requestAnimationFrame(frame);
  }
  if (reduceMotion) { fit(); render(0); }
  requestAnimationFrame(frame);
}

// The road: sections of straights, sweepers, S-bends and hairpins, with hills that loop cleanly.
function buildRoad() {
  const curves = new Array(N).fill(0);
  let i = 40;
  const plan = [[60, 2], [30, 0], [40, -4], [20, 0], [50, 6], [25, -2], [25, 3], [40, 0], [30, -6], [30, 6], [60, 0], [50, -3], [35, 5], [20, 0], [45, -5], [30, 2], [60, 0], [40, 4], [40, -4], [30, 0], [55, -2], [40, 6]];
  for (const [len, c] of plan) {
    const ease = Math.min(12, Math.floor(len / 3));
    for (let k = 0; k < len && i < N - 20; k++, i++) {
      const e = k < ease ? k / ease : k > len - ease ? (len - k) / ease : 1;
      curves[i] = c * (e * e * (3 - 2 * e));
    }
  }
  return curves.map((c, idx) => {
    const y = z => Math.sin(z / N * Math.PI * 2 * 3) * 1600 + Math.sin(z / N * Math.PI * 2 * 7) * 500;
    return {
      index: idx, curve: c, dark: Math.floor(idx / 3) % 2 === 0,
      p1: { z: idx * SEG, y: y(idx) }, p2: { z: (idx + 1) * SEG, y: y(idx + 1) },
      lamp: idx % 24 === 0 ? (Math.floor(idx / 24) % 2 ? 1 : -1) : 0,
    };
  });
}

function ridge(points, amp, base) {
  const pts = [];
  for (let i = 0; i <= points; i++) pts.push(base + amp * (.5 + .5 * Math.sin(i * 1.7) * Math.cos(i * .63) + (Math.random() - .5) * .3));
  return pts;
}
