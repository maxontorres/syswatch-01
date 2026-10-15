# Decision log

The canonical record of locked architecture and design decisions for Syswatch 01.

## How to use this log

- A decision with status **Locked** must not be changed without explicit approval from the project owner.
- To change one, add a new entry that supersedes it. Do not rewrite history.
- New entries take the next ID and go at the end.

| Status | Meaning |
| --- | --- |
| Locked | In force. Requires explicit approval to change. |
| Rejected | An option that was considered and ruled out. Do not reintroduce it. |
| Deferred | Postponed, not ruled out. |
| Open | Deliberately unresolved until verified. |

**About dates and order.** This log was first written on 2026-10-10 from the state of the repository. Both existing commits and every file are dated 2026-10-10, so every entry carries that date. The order is the best reconstruction of the sequence from the code; the exact original order is not recorded anywhere.

**About evidence.** Each entry says where the decision is visible in the repository. The repository records what was decided far more reliably than why. Where a rationale is not stated in the code or in `asset-generator/README.md`, it comes from the project owner's brief for this documentation pass or is a reconstruction, and the project owner should correct it if it is wrong. Decisions with no trace in the code at all are marked "Recorded from the project brief".

## Index

| ID | Decision | Status |
| --- | --- | --- |
| [D-001](#d-001-project-first-repository-organization) | Project-first repository organization | Locked |
| [D-002](#d-002-repository-name-syswatch-01) | Repository name `syswatch-01` | Locked |
| [D-003](#d-003-svg-source-of-truth-pipeline) | SVG source-of-truth pipeline | Locked |
| [D-004](#d-004-sharp-for-png-export) | Sharp for PNG export | Locked |
| [D-005](#d-005-450450-design-canvas) | 450×450 design canvas | Locked |
| [D-006](#d-006-12-hour-time-format) | 12-hour time format | Locked |
| [D-007](#d-007-ddmmyyyy-date-format) | `DD/MM/YYYY` date format | Locked |
| [D-008](#d-008-dseg-rejected) | DSEG rejected | Rejected |
| [D-009](#d-009-tektur-rejected) | Tektur rejected | Rejected |
| [D-010](#d-010-bm-space-rejected) | BM Space rejected | Rejected |
| [D-011](#d-011-departure-mono-for-the-main-clock) | Departure Mono for the main clock | Locked |
| [D-012](#d-012-clock-size-99-px-default-tracking) | Clock size 99 px, default tracking | Locked |
| [D-013](#d-013-experimental-numeral-families-retained-only-as-experiments) | Experimental numeral families retained only as experiments | Locked |
| [D-014](#d-014-share-tech-mono-for-supporting-text) | Share Tech Mono for supporting text | Locked |
| [D-015](#d-015-compass-is-a-shortcut-not-a-live-heading) | Compass is a shortcut, not a live heading | Locked |
| [D-016](#d-016-distance-from-home-excluded-from-version-1) | Distance from home excluded from Version 1 | Locked |
| [D-017](#d-017-aseprite-deferred) | Aseprite deferred | Deferred |
| [D-018](#d-018-weather-icons-consolidated-into-11-visual-states) | Weather icons consolidated into 11 visual states | Locked |
| [D-019](#d-019-numeric-watch-face-studio-weather-mapping-remains-unverified) | Numeric Watch Face Studio weather mapping remains unverified | Open |
| [D-020](#d-020-generated-assets-are-committed) | Generated assets are committed | Locked |
| [D-021](#d-021-colour-palette) | Colour palette | Locked |
| [D-022](#d-022-departure-mono-for-all-text-in-the-watch-face-studio-build) | Departure Mono for all text in the Watch Face Studio build | Locked |
| [D-023](#d-023-weather-module-shows-temperature) | Weather module shows temperature | Locked |
| [D-024](#d-024-system-calendar-icon-accepted-in-the-event-strip) | System calendar icon accepted in the event strip | Locked |
| [D-025](#d-025-always-on-layout) | Always-on layout | Locked |
| [D-026](#d-026-low-battery-amber-state) | Low-battery amber state | Locked |

---

## D-001: Project-first repository organization

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** One repository per watch-face project, containing everything for that project: `asset-generator/`, `watch-face/`, `docs/` and `references/`. The project sits at `wear-os/projects/syswatch-01`.
- **Rationale:** A watch face's assets, tool project and documentation change together. Keeping them in one place means a single clone is enough to continue the work, with no shared tooling repository to keep in step.
- **Evidence:** The directory layout from the first commit (`4e4d116`).

## D-002: Repository name `syswatch-01`

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The repository is `syswatch-01`; the product is "Syswatch 01"; the npm package is `syswatch-01-asset-generator`.
- **Rationale:** A short system-style name that fits the theme. The number leaves room for later faces in the same series.
- **Evidence:** `name` in `asset-generator/design-tokens.json` and `asset-generator/package.json`.

## D-003: SVG source-of-truth pipeline

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Every asset is defined in JavaScript, generated as SVG, and exported to PNG from that SVG. Generated files are never edited by hand.
- **Rationale:** The assets are geometric and token-driven. Code keeps them consistent, makes changes reviewable as text, and makes output reproducible.
- **Evidence:** `asset-generator/src/`; the validator check "SVG files match the JavaScript definitions (not hand-edited or stale)". See [ASSET-PIPELINE.md](ASSET-PIPELINE.md).

## D-004: Sharp for PNG export

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** PNG export uses the `sharp` npm package (0.35.5 in `package-lock.json`).
- **Rationale:** It rasterises SVG from Node with no external application, installs with npm, and can also read pixels back, which the validators rely on.
- **Consequence:** PNG bytes depend on the Sharp/libvips version.
- **Evidence:** `asset-generator/scripts/generate-icons.mjs`.

## D-005: 450×450 design canvas

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The watch face is designed on a 450×450 px canvas. Structural assets are exported at that size.
- **Rationale:** Recorded from the project brief as the chosen design canvas. The repository does not record which watch models it was matched to, so the target device resolution is still to be confirmed.
- **Evidence:** `watchFace.size` in `asset-generator/design-tokens.json`.

## D-006: 12-hour time format

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The clock is 12-hour with a small AM/PM indicator and no leading zero on single-digit hours.
- **Rationale:** The project owner's preferred format. Dropping the leading zero keeps the time compact and natural to read.
- **Consequence:** The clock is four or five characters wide and must stay centred.
- **Evidence:** Sample times in `asset-generator/src/clock-font-definitions.mjs` and `production-definitions.mjs`; the production preview caption.

## D-007: `DD/MM/YYYY` date format

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The date shows an uppercase three-letter weekday, a middle dot and `DD/MM/YYYY`, as in `SAT · 10/10/2026`.
- **Rationale:** The project owner's preferred day-first convention. A four-digit year suits the technical, system-log character of the face.
- **Evidence:** `formatDate` in `asset-generator/src/date-definitions.mjs`; enforced by `validate-production-preview.mjs`.

## D-008: DSEG rejected

- **Date:** 2026-10-10
- **Status:** Rejected
- **Decision:** DSEG is not used for the clock.
- **Rationale:** It looked too much like an alarm clock. Seven-segment digits read as a bedside appliance, not as a monitoring system.
- **Evidence:** Recorded from the project brief. No DSEG file or reference exists in the repository.

## D-009: Tektur rejected

- **Date:** 2026-10-10
- **Status:** Rejected
- **Decision:** Tektur is not used for the clock.
- **Rationale:** It looked too polished and modern for an early-2000s interface.
- **Evidence:** Recorded from the project brief. No Tektur file or reference exists in the repository.

## D-010: BM Space rejected

- **Date:** 2026-10-10
- **Status:** Rejected
- **Decision:** BM Space is not used and is not part of the repository. Do not include or restore BM Space assets without an explicit licence from its author.
- **Rationale:** Commercial licensing restrictions. The terms shipped with the font state that it is freeware with copyright retained, that personal use is allowed, and that selling it or including it in commercial products without the author's permission is strictly prohibited.
- **Evidence:** A copy may exist on a developer's machine under `asset-generator/assets/fonts/local/bm-space/`, which `.gitignore` excludes. No source file references it. See [LICENSING.md](LICENSING.md#bm-space-rejected).

## D-011: Departure Mono for the main clock

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Departure Mono Regular 1.500 sets the main clock numerals, the colon and AM/PM, and nothing else. It is used unmodified.
- **Rationale:** A pixel font with the right period character: technical and slightly rough without imitating an appliance display. Its SIL Open Font License 1.1 allows commercial use and bundling.
- **Constraints:** Whole multiples of its 11 px design size only, whole-pixel positions, uniform scale, no smoothing, never redrawn.
- **Evidence:** `asset-generator/src/font-definitions.mjs`; `typography.clock` in the tokens; enforced by `validate-clock-font.mjs` and `validate-production-preview.mjs`.

## D-012: Clock size 99 px, default tracking

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The clock is 99 px (9× the design size) at tracking 0.
- **Rationale:** Departure Mono can only be used at multiples of 11 px. Of the three sizes compared, 110 px overruns the 300 px clock area by 15 px per side unless tracking is tightened by a full design pixel. 99 px is the largest size at which a five-character time fits at default tracking. 88 px also fits, with 18 px to spare per side; why it was passed over is not recorded, presumably because it is smaller.
- **Consequence:** Five characters are 297 px wide, leaving 1 px per side. To be confirmed on the watch.
- **Evidence:** `asset-generator/dist/previews/clock-font.html`; `typography.clock.size` and `tracking`.

## D-013: Experimental numeral families retained only as experiments

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** The `sys-stencil`, `sys-matrix` and `sys-bus` numeral families stay in the repository as reference experiments. They are not production assets and are not to be used on the watch face.
- **Rationale:** They explored original bitmap numerals before Departure Mono was chosen. Keeping them documents what was tried and costs little; they are excluded from the manifest so they cannot be mistaken for production assets.
- **Note:** The generated lab page says "No family has been selected". That is accurate and final: none will be.
- **Evidence:** `asset-generator/src/numeral-definitions.mjs`; `dist/previews/numeral-lab.html`; absence from `dist/manifest.json`.

## D-014: Share Tech Mono for supporting text

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Share Tech Mono Regular 1.003 sets the date, event text, heart rate, battery, weather and small labels.
- **Rationale:** A narrow technical monospace that stays legible at 12–20 px, where a pixel font would not. Monospaced numerals do not shift as values change. Licensed under the SIL Open Font License 1.1.
- **Evidence:** `asset-generator/src/font-definitions.mjs`; `typography.interface` in the tokens. Implemented in the previews; not yet in Watch Face Studio.

## D-015: Compass is a shortcut, not a live heading

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** In Version 1 the compass is a static icon that opens the Compass app. It shows no heading.
- **Rationale:** A live geographic heading is not available to the watch face as planned. A needle that does not move, or moves on invented data, would be a fake instrument. A shortcut is honest and still useful.
- **Consequence:** The icon is a fixed four-point rose, not a needle.
- **Evidence:** The comment on the `compass` icon in `asset-generator/src/icon-definitions.mjs`. Its position on the face is undecided.

## D-016: Distance from home excluded from Version 1

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Version 1 does not show distance from home. Gym routine management and a custom navigation interface are excluded on the same grounds.
- **Rationale:** These need location data and logic that a Watch Face Studio face does not provide. Nothing is shown that cannot be backed by real data.
- **Evidence:** Recorded from the project brief. No asset or layout for these exists.

## D-017: Aseprite deferred

- **Date:** 2026-10-10
- **Status:** Deferred
- **Decision:** Aseprite is not part of the Version 1 pipeline.
- **Rationale:** Every asset is generated from code. A hand-drawing tool would add a second source of truth and break reproducibility.
- **Revisit when:** Hand-drawn pixel art, animation or per-pixel font work is needed. See [ASSET-PIPELINE.md](ASSET-PIPELINE.md#aseprite).
- **Evidence:** `asset-generator/README.md`.

## D-018: Weather icons consolidated into 11 visual states

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Weather is drawn as 11 icons: unknown, clear, partly cloudy, cloudy, fog, rain, heavy rain, snow, storm, sleet, wind. Finer conditions map onto these.
- **Rationale:** At 24–28 px only a limited number of shapes stay distinguishable. Eleven states cover what a wearer needs to tell apart.
- **Evidence:** `weatherMapping` in `asset-generator/src/icon-definitions.mjs` maps 25 semantic labels to the 11 icons.

## D-019: Numeric Watch Face Studio weather mapping remains unverified

- **Date:** 2026-10-10
- **Status:** Open
- **Decision:** The repository's data files contain no numeric Watch Face Studio weather-condition values. `dist/weather-mapping.json` has `wfsNumericMapping.values: null`.
- **Rationale:** Guessed values would silently show the wrong icon. The values must be confirmed in the installed Watch Face Studio version and on a watch.
- **Current knowledge:** Samsung's documentation publishes a 0–15 list. It is recorded, labelled as documented and unverified, in [WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md#weather-condition). It has not been copied into any data file.
- **Closes when:** The values are verified and deliberately added to the source and the validator.
- **Evidence:** The validator check "weather-mapping.json targets real icons and invents no WFS numeric values".

## D-020: Generated assets are committed

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Everything under `asset-generator/dist/` is committed.
- **Rationale:** Watch Face Studio imports the PNGs directly, so a clone is usable without Node; deterministic output makes diffs meaningful; shipped files stay recoverable from history.
- **Evidence:** `asset-generator/README.md`; `.gitignore` does not exclude `dist/`.

## D-021: Colour palette

- **Date:** 2026-10-10
- **Status:** Locked
- **Decision:** Four colours: background `#02070D`, primary cyan `#79EEFF`, secondary cyan `#087DA6`, amber accent `#FFB347`. Amber is reserved for small signal elements.
- **Rationale:** A restrained cyan HUD on near-black, with a single warm accent for emphasis. No glow, gradients or extra hues.
- **Evidence:** `color` in `asset-generator/design-tokens.json`.

## D-022: Departure Mono for all text in the Watch Face Studio build

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** In the Watch Face Studio project, Departure Mono Regular sets every text layer: clock, AM/PM, date, next event, module labels and values. Share Tech Mono is not bundled in the `.wfs`.
- **Supersedes:** [D-014](#d-014-share-tech-mono-for-supporting-text) for the watch face. The generator's preview still uses Share Tech Mono.
- **Rationale:** The project owner's Version 1 brief of 2026-10-15 names Departure Mono as the main font. The date in the existing `.wfs` already used it. On the watch it renders as crisp pixels at the sizes used.
- **Evidence:** Font settings of every text layer in `watch-face/Syswatch 01.wfs`; `watch-face/captures/v1-normal-galaxy-watch9.png`.

## D-023: Weather module shows temperature

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** The third module shows the current weather condition icon and the temperature (`[WTHR_TEM]°`, label `TEMP`). Rain probability is not shown in Version 1.
- **Supersedes:** The `RAIN` label and rain-probability value in the design spec, and the note that temperature is not a Version 1 feature.
- **Rationale:** The project owner's Version 1 brief of 2026-10-15 asks for "current weather or temperature" with a compact icon. Watch Face Studio supplies both directly, so no complication slot is needed.
- **Evidence:** `WX_MODULE` in `watch-face/Syswatch 01.wfs`; mapping in [watch-face/README.md](../watch-face/README.md#weather-condition-mapping).

## D-024: System calendar icon accepted in the event strip

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** The next-event complication uses the Watch Face Studio "Image + Long Text" layout. The calendar provider's image is shown at 22×22 at the left of the strip, and the text starts after it. The earlier attempt to hide the image with a background-coloured rectangle (`EVENT_ICON_COVER`) is abandoned; the layer is kept hidden.
- **Resolves:** Open design question 3 (calendar icon). The generated `calendar` icon is not used, because a complication's image comes from its provider.
- **Rationale:** The project owner's brief of 2026-10-15: accept the system icon, make it look intentional, never crop the event text. With the cover the first one and a half words of the text were hidden.
- **Evidence:** `NEXT_EVENT` in `watch-face/Syswatch 01.wfs`; the watch capture shows the square icon and `No upcoming events`.

## D-025: Always-on layout

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** Always-on mode shows only the time, AM/PM and date, in secondary blue `#087DA6` on a black background. The grid, HUD frame, seconds ring, event strip and the three modules are hidden. The colon does not blink.
- **Rationale:** The project owner's brief asks for few bright pixels, no seconds animation and low burn-in risk while keeping the identity. Watch Face Studio shares colours between modes, so the dim layers are separate copies (`TIME_AOD`, `DATE_AOD`, `TIME_PERIOD_AOD`) hidden in normal mode.
- **Verified:** On 2026-10-15 the project owner looked at the dozing watch and confirmed it shows only the time, AM/PM and date in dim blue, readable and not cut off. Battery drain is not yet measured.
- **Evidence:** The Always-On tab of `watch-face/Syswatch 01.wfs`.

## D-026: Low-battery amber state

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** The battery percentage turns amber `#FFB347` at 15 % or less and is primary cyan from 16 %. Implemented as two text layers on the Watch Face Studio battery timeline (0–15 and 16–100).
- **Rationale:** The project owner's brief allows amber only for a warning state. This adds one amber element to the list in the design spec's colour rules.
- **Evidence:** `BATT_VALUE` and `BATT_VALUE_LOW` in `watch-face/Syswatch 01.wfs`. Seen on the watch on 2026-10-15: amber at 10 % and 15 %, cyan at 16 % (`watch-face/captures/v1-battery-15-amber.png`, `v1-battery-16-cyan.png`).

## D-027: Stacked data modules with 22 px values

- **Date:** 2026-10-15
- **Status:** Locked
- **Decision:** Each data module stacks its content inside the unchanged 84×60 frame: a 22×22 icon with the label (Departure Mono 11, secondary) beside it on the top row, and the value below it in Departure Mono 22 (2× the design size), left-aligned. Group at module x + 4, y 288, 76×52.
- **Supersedes:** The side-by-side module layout with a 28×28 icon and a size-16 value.
- **Rationale:** The project owner found the 16 px values tiring to read on the watch and asked for bigger values without breaking the layout. At 22 px, `100%` is 56 px wide and no longer fits beside a 28 px icon, so the value moved to its own row. 22 is a whole multiple of Departure Mono's 11 px design size, so it stays crisp. The owner chose this layout over a 20 px side-by-side variant.
- **Evidence:** `HR_MODULE`, `BATT_MODULE`, `WX_MODULE` in `watch-face/Syswatch 01.wfs`; `watch-face/captures/v1-modules-22px.png`.
