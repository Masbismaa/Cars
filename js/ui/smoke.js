// Tyre smoke drawn like cel-shaded anime clouds.
// Three passes over every puff: ink outline, grey shadow, then a paper-white lit side offset
// toward the light. Doing each pass for all puffs before the next makes them merge into one
// billowing mass instead of a pile of separate circles.
const INK = '#0a0a0a', SHADE = '#9d9b95', LIGHT = '#efede7', GLINT = '#ffffff';

// puffs: [{ x, y, r, a }] where a is opacity 0..1. light: direction the light comes from.
export function drawCloud(g, puffs, light = [-.2, -.26]) {
  if (!puffs.length) return;
  const [lx, ly] = light;
  const circle = (x, y, r) => { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, Math.PI * 2); g.fill(); };
  g.save();
  g.fillStyle = INK;
  puffs.forEach(p => { g.globalAlpha = Math.min(1, p.a * 1.3); circle(p.x, p.y, p.r + Math.max(1.6, p.r * .07)); });
  g.fillStyle = SHADE;
  puffs.forEach(p => { g.globalAlpha = p.a; circle(p.x, p.y, p.r); });
  g.fillStyle = LIGHT;
  puffs.forEach(p => { g.globalAlpha = p.a; circle(p.x + p.r * lx, p.y + p.r * ly, p.r * .74); });
  g.fillStyle = GLINT;
  puffs.forEach(p => { if (p.a > .45 && p.r > 10) { g.globalAlpha = p.a * .9; circle(p.x + p.r * lx * 1.9, p.y + p.r * ly * 1.9, p.r * .16); } });
  g.restore();
}
