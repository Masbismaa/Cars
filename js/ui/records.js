// Static records: driver sheet, gearbox path, roll cage table, telemetry cards, contact.
import { $, esc, rows, onceVisible } from './dom.js';
import { PERSON, TRAINING, SEALS, STATUS } from '../data/archive.js';

export function initRecords() {
  $('record').innerHTML = rows([
    ['Role', PERSON.role],
    ['Experience', PERSON.experience],
    ['Education', PERSON.education],
    ['Certified', PERSON.certs.join(', ')],
    ['Off duty', PERSON.offDuty],
    ['Plate', `<code>${PERSON.plate}</code>`],
  ]);

  const path = $('path');
  path.innerHTML = TRAINING.map(s => `
    <li class="stage${s.current ? ' current' : ''}" data-stage="${s.stage}">
      <h3>${esc(s.title)}</h3>
      <ul>${s.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>
    </li>`).join('');
  // the line walks down the path as it is read; stages light up when reached
  const walk = () => {
    const r = path.getBoundingClientRect(), p = Math.min(1, Math.max(0, (innerHeight * .6 - r.top) / r.height));
    path.style.setProperty('--walk', p.toFixed(3));
    path.querySelectorAll('.stage').forEach(st => st.classList.toggle('reached', st.getBoundingClientRect().top < innerHeight * .6));
  };
  addEventListener('scroll', walk, { passive: true });
  walk();

  $('sealTable').querySelector('tbody').innerHTML = SEALS.map(([name, what, where, s]) => `
    <tr><td>${esc(name)}</td><td>${esc(what)}</td><td>${where.startsWith('RUN-') ? `<a href="#${where}" data-open="${where}">${where}</a>` : where}</td><td><span class="state" data-s="${s}">${STATUS[s]}</span></td></tr>`).join('');

  // telemetry cards come from the workflow; if the output branch doesn't exist yet, say so plainly
  const imgs = [...document.querySelectorAll('.flow img')];
  let failed = 0;
  imgs.forEach(img => img.addEventListener('error', () => { img.closest('figure').hidden = true; if (++failed === imgs.length) $('flowFallback').hidden = false; }));
  onceVisible($('telemetry'), () => imgs.forEach(img => { img.loading = 'eager'; }), 0);

  $('contact').innerHTML = rows([
    ['Email', `<code id="mail">${PERSON.email}</code> <button class="action action--quiet" id="copyMail" type="button">Copy</button>`],
    ['GitHub', `<a href="${PERSON.github}" rel="noopener" target="_blank">github.com/Masbismaa</a>`],
    ['Instagram', `<a href="${PERSON.instagram}" rel="noopener" target="_blank">@bisma.prasetya_</a>`],
    ['Open to', 'Remote work'],
  ]);
  $('copyMail').addEventListener('click', e => {
    const btn = e.currentTarget, done = t => { btn.textContent = t; setTimeout(() => { btn.textContent = 'Copy'; }, 1600); };
    const select = () => { const r = document.createRange(); r.selectNodeContents($('mail')); getSelection().removeAllRanges(); getSelection().addRange(r); done('Press Ctrl+C'); };
    if (navigator.clipboard) navigator.clipboard.writeText(PERSON.email).then(() => done('Copied'), select); else select();
  });
}
