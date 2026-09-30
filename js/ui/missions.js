// Run sheets. The head is always visible; the full record unrolls on demand.
import { $, esc } from './dom.js';
import { MISSIONS, STATUS } from '../data/archive.js';

const field = (k, v) => v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : '';

// Request path through ALR; the dashed box is the security layer that every route passes.
const DIAGRAM = `
<svg class="diagram" viewBox="0 0 640 250" role="img" aria-label="Request flow: browser to routes to services to models to PostgreSQL, with a security layer around routes and services and an audit log written by services">
  <rect x="8" y="96" width="92" height="40"/><text x="54" y="120" text-anchor="middle">browser</text>
  <rect class="guard" x="120" y="40" width="296" height="152"/><text class="dim" x="130" y="58">security: auth · OTP · RBAC · CSRF</text><text class="dim" x="130" y="74">rate limit · sessions</text>
  <rect x="140" y="96" width="100" height="40"/><text x="190" y="120" text-anchor="middle">routes</text>
  <rect x="290" y="96" width="104" height="40"/><text x="342" y="120" text-anchor="middle">services</text>
  <text class="dim" x="342" y="152" text-anchor="middle">rules · validation</text>
  <rect x="436" y="96" width="92" height="40"/><text x="482" y="120" text-anchor="middle">models</text>
  <rect x="548" y="88" width="84" height="56"/><text x="590" y="113" text-anchor="middle">Postgre</text><text x="590" y="129" text-anchor="middle">SQL</text>
  <rect x="290" y="206" width="104" height="36"/><text x="342" y="228" text-anchor="middle">audit log</text>
  <path class="flowline" d="M100 116 H140 M240 116 H290 M394 116 H436 M528 116 H548"/>
  <path d="M342 160 V206"/>
</svg>`;

export function initMissions() {
  $('missionList').innerHTML = MISSIONS.map(m => `
    <article class="mission${m.lead ? ' mission--lead' : ''}" id="${m.id}" aria-labelledby="t-${m.id}">
      <div class="mission-head">
        <span class="mission-id">${m.id}</span>
        <h3 id="t-${m.id}">${esc(m.name)}</h3>
        <span class="stamp" data-state="${m.state}">${m.state}</span>
        <p class="mission-obj">${esc(m.objective)}</p>
        <p class="mission-tags">${m.system.map(esc).join(' · ')}</p>
        ${hasFile(m) ? `<button class="mission-toggle" type="button" aria-expanded="false" aria-controls="b-${m.id}">Open run sheet</button>` : ''}
      </div>
      ${hasFile(m) ? `<div class="mission-body" id="b-${m.id}" hidden>${body(m)}</div>` : ''}
    </article>`).join('');

  document.querySelectorAll('.mission-toggle').forEach(b => b.addEventListener('click', () => toggle(b.closest('.mission').id)));
  // links elsewhere on the page (inspector, terminal) can ask for a file to be opened
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-open]');
    if (a) openMission(a.dataset.open);
  });
}

const hasFile = m => !!(m.features || m.progression || m.lessons);

function body(m) {
  if (m.features) {
    return `<dl class="file">
      ${field('Architecture', esc(m.architecture))}
      <div><dt>Flow</dt><dd>${DIAGRAM}</dd></div>
      ${field('Database', esc(m.database))}
      ${field('Testing', esc(m.testing))}
      <div><dt>Status</dt><dd><ul class="features">${m.features.map(([f, s]) => `<li><span>${esc(f)}</span><span class="state" data-s="${s}">${STATUS[s]}</span></li>`).join('')}</ul></dd></div>
      <div><dt>Lessons</dt><dd><ul class="lessons">${m.lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul></dd></div>
      ${field('Repository', esc(m.repo))}
    </dl>`;
  }
  return `<dl class="file">
    ${m.progression ? `<div><dt>Progression</dt><dd><ol class="steps">${m.progression.map(p => `<li>${esc(p)}</li>`).join('')}</ol></dd></div>` : ''}
    ${m.lessons ? `<div><dt>Lesson</dt><dd><ul class="lessons">${m.lessons.map(l => `<li>${esc(l)}</li>`).join('')}</ul></dd></div>` : ''}
    ${field('Repository', m.repo ? esc(m.repo) : 'Not published yet')}
  </dl>`;
}

export function toggle(id, force) {
  const art = $(id);
  const btn = art && art.querySelector('.mission-toggle'), panel = art && art.querySelector('.mission-body');
  if (!btn) return false;
  const open = force ?? btn.getAttribute('aria-expanded') !== 'true';
  btn.setAttribute('aria-expanded', open);
  btn.textContent = open ? 'Close sheet' : 'Open run sheet';
  panel.hidden = !open;
  panel.classList.toggle('open', open);
  return true;
}

export function openMission(id) {
  if (!$(id)) return false;
  toggle(id, true);
  $(id).scrollIntoView({ block: 'start' });
  return true;
}
