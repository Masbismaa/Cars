// Tachometer strip in the opening spread. It shifts up through the gears and settles in sixth,
// which is the "current" stage in the gearbox chapter.
import { $, reduceMotion } from './dom.js';

const WHITE = '#efede7', RED = '#e0242f', DIM = '#3a3a38';

export function initTach() {
  const canvas = $('tach'), g = canvas.getContext('2d'), gearEl = $('gearNow');
  let W = 0, H = 0, rpm = 900, gear = 1, last = 0, hold = 0;
  const fit = () => {
    const d = Math.min(2, devicePixelRatio || 1);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * d; canvas.height = H * d; g.setTransform(d, 0, 0, d, 0, 0);
  };

  function draw() {
    g.clearRect(0, 0, W, H);
    const x0 = 18, x1 = W - 120, y = H * .5, n = 45, segW = (x1 - x0) / n, k = Math.max(1, Math.min(2.2, H / 150));
    for (let i = 0; i < n; i++) {
      const r = (i + 1) / n * 9000, on = r <= rpm, red = r > 7500;
      const h = (14 + (i / n) * 34) * k;
      g.fillStyle = on ? (red ? RED : WHITE) : DIM;
      if (on && red) { g.shadowColor = RED; g.shadowBlur = 8; }
      g.fillRect(x0 + i * segW, y + 22 * k - h, segW - 3, h);
      g.shadowBlur = 0;
    }
    g.fillStyle = '#8e8c86'; g.font = '11px "JetBrains Mono", monospace'; g.textAlign = 'center';
    for (let k = 0; k <= 9; k++) g.fillText(String(k), x0 + (k / 9) * (x1 - x0), y + 22 * (Math.max(1, Math.min(2.2, H / 150))) + 18);
    g.textAlign = 'left'; g.fillText('x1000 rpm', x0, 20);
    // shift light
    const shift = rpm > 8200;
    g.fillStyle = shift ? RED : DIM; g.beginPath(); g.arc(x1 + 16, 22, 5, 0, 7); g.fill();
  }

  function frame(now) {
    const dt = Math.min(.05, (now - (last || now)) / 1000); last = now;
    if (gear < 6) {
      rpm += (2600 - gear * 260) * dt;
      if (rpm > 8600) { gear++; rpm = 5200 + gear * 180; gearEl.textContent = gear; }
    } else {
      hold += dt;
      rpm = 6900 + Math.sin(hold * 3.1) * 450 + Math.sin(hold * 11) * 120; // cruising in sixth, foot on it
    }
    draw();
    requestAnimationFrame(frame);
  }

  fit();
  addEventListener('resize', () => { fit(); draw(); });
  if (reduceMotion) { gear = 6; rpm = 7000; gearEl.textContent = 6; draw(); }
  else { gearEl.textContent = 1; requestAnimationFrame(frame); }
}
