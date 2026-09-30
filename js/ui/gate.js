// The driver panel in the opening spread. The name resolves once, like a title card being inked.
import { $, reduceMotion } from './dom.js';
import { PERSON } from '../data/archive.js';

export function initGate() {
  $('gateLine').textContent = `${PERSON.role}. ${PERSON.line}`;
  $('ledger').innerHTML = [
    ['Status', PERSON.status, 'live'],
    ['On track', `<a href="#RUN-01" data-open="RUN-01">${PERSON.mission}</a>`],
    ['On the dyno', PERSON.training],
  ].map(([k, v, cls]) => `<dt>${k}</dt><dd${cls ? ` class="${cls}"` : ''}>${v}</dd>`).join('');
  if (!reduceMotion) decode($('startName'));
}

function decode(el) {
  const text = el.dataset.text, glyphs = 'ドリフトキィッ01#/';
  const t0 = performance.now(), dur = 850;
  el.setAttribute('aria-label', text);
  const frame = t => {
    const p = Math.min(1, (t - t0) / dur), fixed = Math.floor(p * text.length);
    el.textContent = [...text].map((c, i) => i < fixed || c === ' ' ? c : glyphs[(i * 5 + Math.floor(t / 45)) % glyphs.length]).join('');
    if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
  };
  requestAnimationFrame(frame);
}
