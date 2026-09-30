// Drawing for Night Pass. Black ink, white line art, screentone; red only for tail lights.
const INK = '#0a0a0a', WHITE = '#efede7', RED = '#e0242f';
const fade = (hex, f) => f > .85 ? `rgba(239,237,231,${(1 - f) / .15 * .6})` : hex; // far things dissolve into the dark

export function sky(g, W, H, stars, offset) {
  g.fillStyle = INK; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(239,237,231,.7)';
  stars.forEach(([x, y, r]) => { const sx = ((x - offset * .05) % 1 + 1) % 1 * W; g.fillRect(sx, y * H, r, r); });
  const mx = ((.78 - offset * .08) % 1 + 1) % 1 * W, my = H * .16, mr = Math.min(W, H) * .07;
  g.fillStyle = WHITE; g.beginPath(); g.arc(mx, my, mr, 0, 7); g.fill();
  g.fillStyle = INK; g.beginPath(); g.arc(mx + mr * .35, my - mr * .1, mr * .92, 0, 7); g.fill(); // crescent
}

export function hills(g, W, H, pts, offset, layer) {
  const base = H * (layer ? .56 : .5), step = W * 1.4 / (pts.length - 1), shift = ((offset * W * .4) % (W * 1.4) + W * 1.4) % (W * 1.4);
  for (const dx of [-shift, -shift + W * 1.4]) {
    g.beginPath(); g.moveTo(dx, H);
    pts.forEach((p, i) => g.lineTo(dx + i * step, base - p * H));
    g.lineTo(dx + W * 1.4, H); g.closePath();
    g.fillStyle = layer ? '#0d0d0d' : '#121212'; g.fill();
    g.strokeStyle = layer ? 'rgba(239,237,231,.5)' : 'rgba(239,237,231,.22)'; g.lineWidth = 1.2; g.stroke();
  }
}

export function segment(g, W, s, fogK) {
  const a = s.p1, b = s.p2;
  g.fillStyle = s.dark ? '#0c0c0c' : '#101010';                 // verge
  g.fillRect(0, b.sy, W, a.sy - b.sy);
  const quad = (x1, y1, w1, x2, y2, w2, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x1 - w1, y1); g.lineTo(x1 + w1, y1); g.lineTo(x2 + w2, y2); g.lineTo(x2 - w2, y2); g.closePath(); g.fill(); };
  const r1 = a.sw / 7, r2 = b.sw / 7;
  quad(a.sx, a.sy, a.sw + r1, b.sx, b.sy, b.sw + r2, s.dark ? fade(WHITE, fogK) : INK);   // rumble strips
  quad(a.sx, a.sy, a.sw, b.sx, b.sy, b.sw, s.dark ? '#1b1b1b' : '#171717');              // asphalt
  if (s.dark) {
    const l1 = a.sw / 40, l2 = b.sw / 40;
    for (let k = 1; k < 3; k++) {                                   // lane dashes
      const f = -1 + k * 2 / 3;
      quad(a.sx + a.sw * f, a.sy, l1, b.sx + b.sw * f, b.sy, l2, `rgba(239,237,231,${.55 * (1 - fogK)})`);
    }
  }
}

export function lamp(g, x, y, scale, side, fogK) {
  const h = scale * .9, w = Math.max(1, scale * .025);
  if (h < 4) return;
  g.globalAlpha = 1 - fogK * .7;
  const glow = g.createRadialGradient(x - side * h * .35, y - h, 0, x - side * h * .35, y - h * .1, h * .9);
  glow.addColorStop(0, 'rgba(239,237,231,.22)'); glow.addColorStop(1, 'rgba(239,237,231,0)');
  g.fillStyle = glow; g.beginPath(); g.moveTo(x - side * h * .35, y - h); g.lineTo(x - side * h * .9, y); g.lineTo(x + side * h * .2, y); g.closePath(); g.fill();
  g.strokeStyle = WHITE; g.lineWidth = w;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.lineTo(x - side * h * .35, y - h); g.stroke();
  g.fillStyle = WHITE; g.fillRect(x - side * h * .35 - w * 2, y - h, w * 4, w * 2);
  g.globalAlpha = 1;
}

// Rear view of an ordinary car ahead: dark body, white line work, red tail lights.
export function traffic(g, x, y, w, variant, fogK) {
  if (w < 2) return;
  const h = w * (variant === 2 ? .95 : .62);
  g.save(); g.globalAlpha = 1 - fogK * .6;
  g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x - w * .55, y - h * .08, w * 1.1, h * .1);
  g.fillStyle = '#1c1c1c'; g.strokeStyle = WHITE; g.lineWidth = Math.max(1, w / 60);
  g.beginPath();
  if (variant === 2) { g.rect(x - w / 2, y - h, w, h * .92); }
  else { g.moveTo(x - w / 2, y - h * .08); g.lineTo(x - w / 2, y - h * .5); g.lineTo(x - w * .36, y - h); g.lineTo(x + w * .36, y - h); g.lineTo(x + w / 2, y - h * .5); g.lineTo(x + w / 2, y - h * .08); g.closePath(); }
  g.fill(); g.stroke();
  g.fillStyle = INK; g.fillRect(x - w * .3, y - h * (variant === 2 ? .88 : .92), w * .6, h * (variant === 2 ? .3 : .3));
  g.fillStyle = WHITE; g.fillRect(x - w * .1, y - h * .3, w * .2, h * .1);
  g.fillStyle = RED; g.shadowColor = RED; g.shadowBlur = w * .2;
  g.fillRect(x - w * .46, y - h * .46, w * .16, h * .1); g.fillRect(x + w * .3, y - h * .46, w * .16, h * .1);
  g.shadowBlur = 0;
  g.fillStyle = INK; g.fillRect(x - w * .44, y - h * .1, w * .16, h * .12); g.fillRect(x + w * .28, y - h * .1, w * .16, h * .12);
  g.restore();
}

export function cone(g, x, y, w, fogK) {
  if (w < 2) return;
  const h = w * 1.5;
  g.save(); g.globalAlpha = 1 - fogK * .6;
  g.fillStyle = WHITE; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + w / 2, y); g.lineTo(x - w / 2, y); g.closePath(); g.fill();
  g.fillStyle = INK; g.fillRect(x - w * .3, y - h * .5, w * .6, h * .14); g.fillRect(x - w * .42, y - h * .2, w * .84, h * .12);
  g.fillStyle = RED; g.fillRect(x - w * .6, y - h * .04, w * 1.2, h * .06);
  g.restore();
}

export function oil(g, x, y, w, fogK) {
  if (w < 2) return;
  g.save(); g.globalAlpha = 1 - fogK * .6;
  g.fillStyle = '#030303'; g.beginPath(); g.ellipse(x, y - w * .06, w / 2, w * .12, 0, 0, 7); g.fill();
  g.strokeStyle = 'rgba(239,237,231,.7)'; g.lineWidth = Math.max(1, w / 80);
  g.beginPath(); g.ellipse(x - w * .08, y - w * .08, w * .22, w * .04, 0, Math.PI * 1.1, Math.PI * 1.9); g.stroke();
  g.restore();
}

// The player's car from behind: an original low coupe, white with black line work, wing, full-width tail light.
export function player(g, x, y, w, yaw, drifting, steer) {
  const h = w * .52;
  g.save(); g.translate(x, y); g.rotate(yaw * .25 + steer * .02); g.transform(1, 0, yaw * .3, 1, 0, 0);
  g.fillStyle = 'rgba(0,0,0,.7)'; g.beginPath(); g.ellipse(0, 0, w * .6, h * .1, 0, 0, 7); g.fill();
  // tyres
  g.fillStyle = INK; g.fillRect(-w * .5, -h * .3, w * .16, h * .3); g.fillRect(w * .34, -h * .3, w * .16, h * .3);
  // body
  g.fillStyle = WHITE; g.strokeStyle = INK; g.lineWidth = Math.max(1.5, w / 90);
  g.beginPath();
  g.moveTo(-w * .5, -h * .16); g.lineTo(-w * .5, -h * .5); g.lineTo(-w * .4, -h * .62); g.lineTo(-w * .28, -h * .95);
  g.lineTo(w * .28, -h * .95); g.lineTo(w * .4, -h * .62); g.lineTo(w * .5, -h * .5); g.lineTo(w * .5, -h * .16); g.closePath();
  g.fill();
  // cel shading: hard-edged shadow on the lower body and one side, a white glint on the shoulder
  g.save(); g.clip();
  g.fillStyle = '#b9b7b0'; g.fillRect(-w * .6, -h * .3, w * 1.2, h * .3); g.fillRect(w * .18, -h, w * .5, h);
  g.fillStyle = '#ffffff'; g.fillRect(-w * .46, -h * .6, w * .3, h * .035);
  g.restore();
  g.stroke();
  // rear glass
  g.fillStyle = INK; g.beginPath(); g.moveTo(-w * .24, -h * .9); g.lineTo(w * .24, -h * .9); g.lineTo(w * .33, -h * .66); g.lineTo(-w * .33, -h * .66); g.closePath(); g.fill();
  g.save(); g.clip(); g.fillStyle = 'rgba(239,237,231,.55)'; g.beginPath(); g.moveTo(-w * .12, -h * .9); g.lineTo(-w * .04, -h * .9); g.lineTo(-w * .16, -h * .66); g.lineTo(-w * .24, -h * .66); g.closePath(); g.fill(); g.restore(); // glass reflection
  // wing on two stands
  g.fillStyle = INK; g.fillRect(-w * .3, -h * .74, w * .03, h * .12); g.fillRect(w * .27, -h * .74, w * .03, h * .12);
  g.fillStyle = WHITE; g.fillRect(-w * .46, -h * .8, w * .92, h * .07); g.strokeRect(-w * .46, -h * .8, w * .92, h * .07);
  // full-width tail light bar
  g.fillStyle = RED; g.shadowColor = RED; g.shadowBlur = drifting ? w * .12 : w * .06;
  g.fillRect(-w * .44, -h * .52, w * .88, h * .07);
  g.shadowBlur = 0;
  g.fillStyle = INK; g.fillRect(-w * .44, -h * .52, w * .88, h * .02);
  // plate, diffuser, twin exhaust
  g.fillStyle = WHITE; g.strokeRect(-w * .1, -h * .38, w * .2, h * .1);
  g.fillStyle = INK; g.font = `${Math.max(7, w * .05)}px "JetBrains Mono", monospace`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('42-50', 0, -h * .33);
  g.strokeStyle = INK; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * w * .05, -h * .2); g.lineTo(i * w * .06, -h * .12); g.stroke(); }
  g.fillStyle = INK; g.beginPath(); g.ellipse(-w * .3, -h * .18, w * .035, h * .035, 0, 0, 7); g.ellipse(-w * .22, -h * .18, w * .035, h * .035, 0, 0, 7); g.fill();
  g.restore();
}

export function speedLines(g, W, H, k) {
  const cx = W / 2, cy = H * .45, n = 38;
  g.save(); g.strokeStyle = `rgba(239,237,231,${.18 + k * .3})`; g.lineWidth = 1;
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, r0 = Math.max(W, H) * (.45 + Math.random() * .2), r1 = r0 + Math.max(W, H) * (.15 + Math.random() * .3) * k;
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
  }
  g.stroke(); g.restore();
}

export function sfx(g, txt, x, y, size, a) {
  g.save(); g.globalAlpha = a;
  g.font = `${Math.round(30 * size)}px "Dela Gothic One", "Arial Black", sans-serif`; g.textAlign = 'center';
  g.translate(x, y); g.rotate(-.12);
  g.lineWidth = 6; g.strokeStyle = INK; g.strokeText(txt, 0, 0);
  g.fillStyle = WHITE; g.fillText(txt, 0, 0);
  g.restore();
}
