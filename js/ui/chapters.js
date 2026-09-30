// Chapter headers (panel tag, number, quote), the index rail's reading progress, and the mobile menu.
import { $, onceVisible } from './dom.js';
import { QUOTES } from '../data/archive.js';

export function initChapters() {
  document.querySelectorAll('.chapter-head').forEach(head => {
    const { no, mark, meaning } = head.dataset;
    const section = head.closest('section, footer');
    const quote = QUOTES[section.id];
    head.insertAdjacentHTML('afterbegin',
      `<div class="tag" aria-hidden="true"><b>${no}</b><span>${mark}</span></div>` +
      `<p class="label">${mark} <b>/</b> ${meaning}</p>`);
    if (quote) head.insertAdjacentHTML('beforeend', `<p class="quote">${quote}</p>`);
    onceVisible(head, () => head.classList.add('inked'), .6);
  });
}

export function initIndex() {
  const links = [...document.querySelectorAll('.index a')];
  const targets = links.map(a => document.querySelector(a.getAttribute('href')));
  const update = () => {
    const mid = innerHeight * .35;
    let current = null;
    targets.forEach((t, i) => {
      if (!t) return;
      const r = t.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (mid - r.top) / Math.max(1, r.height)));
      links[i].style.setProperty('--p', p.toFixed(3));
      if (r.top <= mid && r.bottom > mid) current = i;
    });
    links.forEach((a, i) => { a.classList.toggle('on', i === current); if (i === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  const menu = $('menuBtn'), index = $('index');
  const setOpen = open => { index.classList.toggle('open', open); menu.setAttribute('aria-expanded', open); };
  menu.addEventListener('click', () => setOpen(!index.classList.contains('open')));
  links.forEach(a => a.addEventListener('click', () => setOpen(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
}
