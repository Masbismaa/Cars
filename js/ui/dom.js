export const $ = id => document.getElementById(id);
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// dl rows from [label, value, extraClass?] triples; values are trusted HTML from archive.js
export const rows = list => list.map(([k, v, cls]) => `<div><dt>${k}</dt><dd${cls ? ` class="${cls}"` : ''}>${v}</dd></div>`).join('');

export const pips = tier => {
  const n = { honed: 4, drilled: 3, studied: 2, training: 1 }[tier];
  return `<span class="pips" data-tier="${tier}" aria-hidden="true">${[1, 2, 3, 4].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
};

// Runs fn once when el scrolls into view (or right away if IntersectionObserver is missing).
export function onceVisible(el, fn, threshold = .35) {
  if (!('IntersectionObserver' in window)) return fn();
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
  io.observe(el);
}
