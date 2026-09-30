// Parts grouped by system, plus a part sheet that shows the evidence behind each tuning level.
import { $, esc, pips, reduceMotion } from './dom.js';
import { TECHNIQUES, SCHOOLS, TIERS, MISSIONS } from '../data/archive.js';

export function initTechniques() {
  $('tiers').innerHTML = Object.entries(TIERS).map(([k, t]) => `<li>${pips(k)}<span><b>${t.label}</b> ${t.note}</span></li>`).join('');

  $('schools').innerHTML = SCHOOLS.map(s => {
    const list = TECHNIQUES.filter(t => t.school === s.id);
    return `<section class="school" aria-label="${s.name}">
      <h3><span title="${s.meaning}">${s.mark}</span>${s.name}</h3>
      <ul>${list.map(t => `<li><button class="tech" type="button" data-id="${t.id}" aria-pressed="false" aria-controls="inspector">
        <span class="tech-name">${esc(t.name)}</span>${pips(t.tier)}<span class="tech-tier">${TIERS[t.tier].label}</span></button></li>`).join('')}</ul>
    </section>`;
  }).join('');

  const buttons = [...document.querySelectorAll('.tech')];
  buttons.forEach(b => b.addEventListener('click', () => inspect(b.dataset.id)));
  inspect('flask', true);
}

export function inspect(id, quiet) {
  const t = TECHNIQUES.find(x => x.id === id || x.name.toLowerCase() === String(id).toLowerCase());
  if (!t) return null;
  document.querySelectorAll('.tech').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === t.id));
  const m = MISSIONS.find(x => x.id === t.mission);
  const panel = $('inspector');
  panel.innerHTML = `
    <p class="label">Part sheet</p>
    <h3>${esc(t.name)}</h3>
    <p>${pips(t.tier)} <span class="tech-tier">${TIERS[t.tier].label}: ${TIERS[t.tier].note}</span></p>
    <dl>
      <div><dt>Built with it</dt><dd>${esc(t.built)}</dd></div>
      <div><dt>Run</dt><dd>${m ? `<a href="#${m.id}" data-open="${m.id}">${m.id} · ${esc(m.name)}</a>` : 'None on record'}</dd></div>
      <div><dt>What it taught</dt><dd>${esc(t.learned)}</dd></div>
      <div><dt>Related</dt><dd>${t.related.map(esc).join(' / ')}</dd></div>
    </dl>`;
  if (!quiet && !reduceMotion) { panel.classList.remove('scan'); void panel.offsetWidth; panel.classList.add('scan'); }
  return t;
}
