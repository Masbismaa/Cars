# Garage MBP 42-50: build notes

How the profile is put together, how to run and change it, and what still needs your input.

## 1. Creative direction

A night garage. The visitor arrives on a cinematic night shot of the car on the highway, then walks into a garage drawn like a black and white manga and finds the driver's records: parts with evidence, runs with status, the gearbox of how they learned, and the roll cage of security rules they actually apply.

- **Tone.** Short sentences, specific nouns, a little dry humour ("Nobody skips second gear. You just stall faster."). No claims the commit history cannot back up.
- **World.** Car vocabulary only where it maps to something real:
  - *parts* are tools, rated by evidence;
  - *runs* are projects;
  - *the gearbox* is the learning path;
  - *the roll cage* is security controls;
  - *telemetry* is live GitHub activity.
- **Opening shot.** Side view of the car at speed, the world smeared into light streaks: deep navy sky, teal road glare, one long red trail of tail lights ahead, the cabin lit red from the dash, film grain on top. It is the only place with colour beyond red, so the first view feels like a film still.
- **Manga language.** Everything after the opening: panels with thick white borders, screentone dots, speed lines, and katakana sound effects (キィィィッ for tyre squeal, ドリフト, ドンッ for a crash). Red is the only colour, and it is used for tail lights, live status and the current gear.
- **Originality.** Every car is an original design: a white coupe with a big rear wing, a full-width red tail light and the number 42. It is not modelled on any real make or model, and there are no real car names, badges, characters or franchise references anywhere. One kanji per chapter, each with its meaning written next to it (運 luck, 改 to modify, 走 to run, 段 gear, 守 to protect, 速 speed, 峠 mountain pass, 問 to ask, 信 message).

## 2. Information architecture

| Order | Chapter | Question it answers | README | Website |
|---|---|---|---|---|
| 00 | Opening spread | Who is this, what are they doing now | header SVG (night shot and driver strip) | animated night shot, driver ledger, tach, two start buttons |
| 01 | Driver | How does this person work | console block and two paragraphs | prose and record sheet |
| 02 | Tune sheet | What can they actually use, and how do we know | tune table, part sheets in `<details>` | tier legend, part inspector |
| 03 | Run log | What did they build | RUN-01 SVG, RUN-01 sheet, log table | expandable run sheets, request-flow diagram |
| 04 | Gearbox | How did they get here | gearbox SVG and table | path that shifts up as you read |
| 05 | Roll cage | How do they treat security | status table | status table |
| 06 | Telemetry | Are they active | live cards from the workflow | the same cards |
| 07 | Night Pass | Something to play | not possible in a README (link only) | the driving game |
| 08 | Pit radio | Can I ask it things | static console block | working command line |
| 09 | Pit wall | How do I reach them | contact table | contact with copy button |
| -- | Glovebox | Reward for exploring | `∴` details, raw-file comment | `ls -a`, `cat .glovebox`, `launch` |

## 3. Visual system

| Token | Value | Use |
|---|---|---|
| ink-0 | `#0a0a0a` | page ground, gutters between panels |
| ink-1 | `#141414` | panels |
| ink-2 | `#1f1f1f` | selected rows |
| paper | `#efede7` | body text, panel borders, the car |
| muted | `#8e8c86` | metadata |
| crimson | `#b3121c` | primary actions, stamps |
| red | `#e0242f` | tail lights, IDs, current gear |
| ember | `#ff4a3d` | only for live things (status, drift combo) |

- **Type.** Dela Gothic One for display, JetBrains Mono for records and HUD, IBM Plex Sans for reading. The README SVGs use system fonts (Arial Black, Helvetica, Consolas), because GitHub does not load web fonts inside images.
- **Texture.** A 5 px screentone dot pattern, masked so it fades toward the edges. No particles, no gradients for decoration.
- **Motion.** Each animation has a job:
  - the opening shot: streaks sliding past, wheels spinning, the body riding its springs, a street light sweeping along the paint;
  - cel-shaded tyre smoke in the game that billows and breaks up like painted anime smoke;
  - the tach shifting from first to sixth, which is the current gear;
  - the name decoding once;
  - chapter tags slamming in when a chapter enters;
  - run sheets opening;
  - the red pulse on live status.

  `prefers-reduced-motion` stops all of it: the opening shot draws one still frame, the tach sits in sixth, and the game waits for the start button.

## 4 and 5. Files

```text
README.md                      profile README (GitHub renders this)
index.html                     the garage website (GitHub Pages)
css/tokens.css                 colour, type, spacing tokens
css/base.css                   reset, body, screentone, focus, reduced motion
css/layout.css                 top bar, index rail, reading column
css/components.css             opening spread, chapters, parts, runs, path, table, terminal
css/race.css                   Night Pass frame, HUD, overlay, touch buttons
js/main.js                     boot order
js/data/archive.js             ALL content and statuses (edit this)
js/ui/dom.js                   small helpers
js/ui/chapters.js              chapter tags, quotes, index progress, mobile menu
js/ui/gate.js                  driver panel and name decode
js/ui/cruise.js                opening shot: the car at night, side view (canvas)
js/ui/tach.js                  opening panel: the tach strip (canvas)
js/ui/smoke.js                 cel-shaded tyre smoke for the game
js/ui/techniques.js            part list and inspector
js/ui/missions.js              run sheets and the ALR diagram
js/ui/records.js               driver sheet, gearbox path, roll cage table, telemetry, contact
js/ui/terminal.js              pit radio command line
js/ui/secrets.js               hidden discoveries
js/game/race.js                Night Pass: road, physics, obstacles, score
js/game/sprites.js             Night Pass: everything it draws
js/audio/engine.js             engine, tyre squeal, wind and impact sounds (Web Audio, no files)
assets/readme/*.svg            README images (generated)
tools/readme_svgs.py           regenerates the README SVGs
.github/workflows/profile-images.yml   daily telemetry cards
.github/scripts/stats_card.py  writes stats.svg, langs.svg, laps.svg to the output branch
docs/ARCHIVE_GUIDE.md          this file
```

No framework, no build step, no runtime dependency except Google Fonts. HTML, CSS and JavaScript together are about 110 KB raw and 40 KB gzipped.

## 6. Night Pass

A pseudo-3D mountain road, drawn the way arcade racers drew roads before 3D hardware: the road is a list of short segments, each projected to the screen, with curves and hills accumulated as it goes.

- **Controls.** Arrow keys or A and D to steer, Space or Shift to drift, P or Esc to pause. On a phone: the three buttons under the road.
- **Rules.** The car speeds up on its own. Other cars cost one of three lives. Cones cost speed and the combo. Oil spins you. Holding drift through a corner at speed builds the combo up to x8; the score is distance times combo.
- **Best score** is kept in the browser's local storage. If storage is blocked (private mode), the game still works and simply forgets.
- **Rating** at the end: Learner plate, Weekend driver, Night regular, Pass specialist, Owns the mountain.
- The game pauses itself when you scroll it out of view.
- **Sound.** The engine is synthesised in the browser: a six-cylinder note that climbs through six gears with speed, tyre squeal while drifting, wind, and a thump on a crash. It starts with the Start button, and the Sound button or the M key turns it off. The opening shot has its own Sound button (off until clicked) for a steady cruise in sixth. Browsers never allow sound before a click, so nothing plays on arrival. The choice is remembered in local storage.

## 7. What the README can and cannot do on GitHub

GitHub strips scripts, styles and event handlers from README files. What is used here and works:

- `<details>` and `<summary>` for the part sheets, the RUN-01 sheet, the rest of the log, and the glovebox note.
- Heading anchors for the top navigation. `## Roll cage` becomes `#roll-cage`.
- SVG through `<img>`, animated with CSS keyframes and SMIL. In the header the streaks and road slide past with CSS, the wheels spin with `<animateTransform>`, and blur, glow and grain come from SVG filters.
- Tables, code blocks, blockquotes, and an HTML comment visible only in the raw file.

What cannot work in a README, and the alternative used here:

| Wanted | Why not | Alternative |
|---|---|---|
| Playing the game | no scripts, no input | the "Enter the garage" button links to the website |
| Engine sound | no audio in a README | sound on the website only |
| Typing a command | no scripts or inputs | static `console` block in the README, real pit radio on the website |
| Clicking a part to inspect it | no state | `<details>` table in the README, inspector on the website |
| Live counters written by hand | numbers would go stale or be invented | workflow regenerates cards from the GitHub API every day |

Reduced motion inside SVG: the CSS animations stop, SMIL (the car moving) does not. That is a browser limitation.

## 8. Setup (local)

1. Put this folder anywhere, then run a static server in it, for example `python -m http.server 8000`.
2. Open `http://localhost:8000`. Opening `index.html` directly as a file does not work, because browsers block ES modules on `file://`.
3. After changing the README numbers, run `python tools/readme_svgs.py`.
4. To test the telemetry cards without the network, run `MOCK=1 python .github/scripts/stats_card.py dist` in bash. In PowerShell: `$env:MOCK=1; python .github/scripts/stats_card.py dist`.

## 9. Deploy on GitHub

1. Repository **Masbismaa/Masbismaa**. It must be public, and the name must match the username so GitHub shows the README on the profile.
2. Delete the old theme files: the old `css/`, `js/`, `assets/`, `docs/`, `tools/` folders and the old `index.html`. Keep the `.github` folder; it gets overwritten.
3. **Add file → Upload files**. Drag in everything from this folder, then **Commit changes**. If the `.github` folder does not upload (hidden folder), create both files with **Create new file** using the same paths.
4. **Settings → Actions → General → Workflow permissions → Read and write permissions → Save.**
5. **Actions → Generate profile images → Run workflow.** This writes `stats.svg`, `langs.svg` and `laps.svg` to the `output` branch.
6. **Settings → Pages → Deploy from a branch → main / (root) → Save.** The site appears at `https://masbismaa.github.io/Masbismaa/` within a minute or two.

## 10. Customising

- **Change a status** (for example, workspaces are done): in `js/data/archive.js`, change `'progress'` to `'implemented'` for that feature. Then update the same row in `README.md` and the `ALR` counts at the top of `tools/readme_svgs.py`, and run the script.
- **Add a part:** add an object to `TECHNIQUES`. The tier must match the evidence:
  - `honed` (Race-tuned): daily use on an active project;
  - `drilled` (Street-tuned): a real project;
  - `studied` (Stock): no run yet;
  - `training` (On the dyno): studying now.
- **Add a run:** add an object to `MISSIONS` with the next `RUN-` ID. An `objective` and a `system` are enough for a short record. Add `features`, `lessons` or `progression` to make it expandable. Also add a row to "OPEN THE REST OF THE LOG" in the README.
- **Quotes:** `QUOTES` in `archive.js`, one per chapter. Keep them short and keep them yours.
- **Repository links:** set `repo` on a run to a URL string once a repository is public.
- **Game difficulty:** in `js/game/race.js`, `MAX_SPEED` sets top speed; the object mix is chosen in `buildRoad()`.

## 11. Where the content came from

From earlier conversations and your answers:

- **About you:** name, role at Spindo, 3 to 5 years, S1 Informatika, BNSP and HTML (Microsoft) certificates, open to remote, the four learning topics, contacts.
- **Projects:** the MTOA ALR requirements, roles and data rules, naming conventions, branching, milestone commits, Pytest positive and negative scenarios, and the Tabler UI with local assets. Also the Django, Laravel and Flutter projects and the thesis.
- **Your answers:**
  - Login and OTP, RBAC with Public/Private, CSRF, sessions, validation, audit log, Alembic and Pytest are implemented.
  - The Flask and PostgreSQL project was your own CRUD practice app.

**Needs your confirmation** (marked "in progress" until you say otherwise):

- dynamic form per category;
- search, filter and Excel export;
- workspaces with invites;
- link status check.

**Needs your input:**

- links for any public repositories (all show as internal or unpublished now);
- dates for the gearbox stages (left out on purpose rather than guessed);
- whether rate limiting is finished in ALR (marked implemented, based on your earlier answer that OTP and rate limiting are part of how you build).

**Invented on purpose:** the car, the plate MBP 42-50 (MBP in hex is 4D 42 50), the number 42, the quotes, the sound effects, the game and the glovebox notes. These are fiction and style, not claims.

## 12. Testing checklist

- [ ] No console errors on load (DevTools console)
- [ ] Widths 360, 390, 768, 1024, 1366: no horizontal scroll
- [ ] Opening shot: streaks move, wheels spin, the red trail crosses the sky; tach shifts to 6; name decodes once
- [ ] Index rail highlights the current chapter; menu opens and closes on mobile, Esc closes it
- [ ] Every part opens the inspector; the run link inside it opens that sheet
- [ ] Every run toggle opens and closes; `/#RUN-01` opens RUN-01 directly
- [ ] Night Pass: start, steer, drift combo rises in corners, crash costs a life, P pauses, game over shows the rating, best score survives a reload
- [ ] Sound: the opening Sound button starts a steady engine and stops when scrolled away; in the game the pitch climbs through the gears, drifting squeals, a crash thumps, M and the Sound button mute it
- [ ] Night Pass on a phone: the three buttons work while held, the page does not scroll while steering
- [ ] Pit radio: `help`, `whoami`, `run --current`, `garage --list`, `garage --open RUN-00`, `parts --inspect sqlalchemy`, `gearbox`, `cage`, `git log`, `contact`, `clear`, arrow-up history
- [ ] Glovebox: three clicks on the plate in the top bar, the `∴` button, `ls -a`, `cat .glovebox`, `launch` opens Pit notes
- [ ] Keyboard only: Tab reaches the skip link first, then every control, with a visible red outline
- [ ] With reduced motion on in the OS: still drift frame, tach in sixth, everything readable at once
- [ ] Telemetry cards load after the first workflow run; before that, the fallback sentence shows

## 13. Performance checklist

- [ ] HTML, CSS and JS together stay around 110 KB raw, about 40 KB gzipped
- [ ] No images on the site except the three telemetry SVGs, lazy-loaded
- [ ] No libraries. The opening shot and the game stop drawing when they are off screen
- [ ] Canvas resolution is capped at 2x device pixels
- [ ] Fonts load with `display=swap`, and every stack has a system fallback
- [ ] README SVGs stay under 30 KB each

## 14. GitHub compatibility checklist

- [ ] README renders with no raw HTML visible (check on github.com and in the GitHub mobile app)
- [ ] Top navigation links jump to the right headings
- [ ] Every `<details>` has a blank line after `</summary>` so Markdown inside renders
- [ ] All README images have alt text
- [ ] Images from `raw.githubusercontent.com/.../output/` load after the workflow runs
- [ ] No emoji anywhere (search the repository)
