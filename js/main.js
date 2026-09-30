// Boot order: content first (so the page is complete without motion), then the moving parts.
import { initChapters, initIndex } from './ui/chapters.js';
import { initGate } from './ui/gate.js';
import { initRecords } from './ui/records.js';
import { initTechniques } from './ui/techniques.js';
import { initMissions, openMission } from './ui/missions.js';
import { initTerminal } from './ui/terminal.js';
import { initSecrets } from './ui/secrets.js';
import { initCruise } from './ui/cruise.js';
import { initTach } from './ui/tach.js';
import { initRace } from './game/race.js';

initChapters();
initRecords();
initTechniques();
initMissions();
initTerminal();
initSecrets();
initGate();
initIndex();
initCruise();
initTach();
initRace();

// deep links like /#RUN-01 open that run sheet, on load and when the hash changes
const openFromHash = () => { if (/^#RUN-\d+$/.test(location.hash)) openMission(location.hash.slice(1)); };
openFromHash();
addEventListener('hashchange', openFromHash);
