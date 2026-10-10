# Syswatch 01

Syswatch 01 is a custom Samsung Wear OS watch face inspired by early-2000s hacker software, technical monitoring systems, Y2K computer interfaces and restrained cyan science-fiction HUDs.

This repository (`syswatch-01`) is the sole source of truth for the project. Nothing needed to continue the work lives outside it.

| If you are… | Start with |
| --- | --- |
| A developer | This file, then [docs/ROADMAP.md](docs/ROADMAP.md) |
| An AI coding assistant | This file, then [AGENTS.md](AGENTS.md) |
| Changing anything visual | [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) and [docs/DECISIONS.md](docs/DECISIONS.md) |

## Project status

Verified against the repository on 2026-10-10. Details and checkboxes are in [docs/ROADMAP.md](docs/ROADMAP.md).

| State | What |
| --- | --- |
| **Implemented** | The `asset-generator`: a deterministic Node.js pipeline that writes 19 production assets (15 icons, 4 structural) as SVG and PNG, a manifest, a semantic weather mapping, four HTML preview pages and 74 automated checks. |
| **Generated and visually reviewed** | The production preview (`asset-generator/dist/previews/production-preview.png`): one 450×450 face with the locked typography and sample data. Reviewed as an image on a desktop screen only. |
| **Designed but not implemented in Watch Face Studio** | Everything on the watch itself: clock, AM/PM, date, next event, seconds ring, heart rate, battery, weather icon, rain probability, compass shortcut. |
| **Designed only partly** | Compass shortcut placement (the icon exists, no face shows it), weather-condition-to-icon switching, always-on display. See [Known limitations](#known-limitations). |
| **Requires real-watch testing** | Legibility at physical size, every Watch Face Studio tag, weather condition values, the seconds ring, the compass shortcut, battery impact, always-on display. Nothing has been run on a watch. |
| **Future ideas** | Live compass heading, distance from home, gym routines, a custom navigation interface, a native Wear OS implementation. |

## Version 1 features

These are the intended features. None of them runs on a watch yet.

| Feature | Specification |
| --- | --- |
| Clock | 12-hour |
| Hour format | No leading zero for single-digit hours (`6:42`, not `06:42`) |
| AM/PM | Small indicator above the clock, right-aligned |
| Date | Weekday and date as `DD/MM/YYYY`, for example `SAT · 10/10/2026` |
| Next calendar event | One line in the event strip |
| Seconds | 60-segment progress ring around the edge |
| Heart rate | Data module |
| Battery | Percentage, data module |
| Weather | Condition icon |
| Rain | Probability in percent |
| Compass | Shortcut that opens the Compass app |

### Explicit Version 1 exclusions

These are not built and must not be faked with static or invented data:

- Live geographic compass heading
- Distance from home
- Full gym routine management
- Custom navigation interface

The compass is initially a **static shortcut to the Compass app**. Its icon is a fixed four-point rose, deliberately not a needle, so it cannot be mistaken for a live heading.

## Visual identity

- Near-black/navy background
- Cyan technical grid, low contrast
- Bright cyan for primary data
- Darker cyan for structural elements
- Small amber status accents, one "signal" element at a time
- Angular HUD framing: brackets, chamfers, 45° and 90° angles
- Restrained effects: no blur, gradients, shadows or filters in any asset
- No excessive glow
- No generic rounded mobile-app styling

The canonical specification is [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md).

## Typography

Both fonts are bundled, unmodified, each beside its licence. This was verified by the build (family name, version, OFL notice and SHA-256 checksums).

| Role | Font | Bundled file | Size on the 450×450 canvas |
| --- | --- | --- | --- |
| Main clock | Departure Mono Regular 1.500 | `asset-generator/assets/fonts/departure-mono/DepartureMono-Regular.otf` | **99 px** (9× its 11 px design size), tracking 0 |
| AM/PM | Departure Mono Regular 1.500 | same | 22 px (2×) |
| Date | Share Tech Mono Regular 1.003 | `asset-generator/assets/fonts/share-tech-mono/ShareTechMono-Regular.ttf` | 20 px, tracking 1 px |
| Next event | Share Tech Mono Regular 1.003 | same | 16 px, tracking 1 px |
| Module values | Share Tech Mono Regular 1.003 | same | 16 px |
| Module labels | Share Tech Mono Regular 1.003 | same | 12 px |

Rules:

- Departure Mono is a pixel font. Use it only at whole multiples of 11 px, at whole-pixel positions, with one uniform scale and no smoothing.
- Tabular numerals: Departure Mono includes an OpenType `tnum` feature and is monospaced. Share Tech Mono has no `tnum` feature but is monospaced, so its numerals are tabular as drawn.
- In the generator, text is drawn as vector outlines taken from the font files. Whether Watch Face Studio renders Departure Mono as crisply is **not yet tested**; see [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md).

## Color tokens

Actual values from `asset-generator/design-tokens.json`:

| Token | Value | Use |
| --- | --- | --- |
| `color.background` | `#02070D` | Background |
| `color.primary` | `#79EEFF` | Primary cyan: clock, data, icons, active ring |
| `color.secondary` | `#087DA6` | Secondary cyan: grid, frames, labels, inactive ring |
| `color.accent` | `#FFB347` | Amber accent |

## Repository structure

```
syswatch-01/
├── README.md                   this file, the human entry point
├── AGENTS.md                   operating rules for AI coding agents
├── CLAUDE.md                   Claude Code entry point (reading list only)
├── .gitignore
├── docs/                       specifications and guides (see below)
├── asset-generator/            the generator (Node.js)
│   ├── README.md               generator-level reference
│   ├── package.json            npm scripts and dependencies
│   ├── package-lock.json       locked dependency versions
│   ├── design-tokens.json      colours, sizes, strokes, grid, ring, typography
│   ├── assets/fonts/           bundled fonts, each beside its licence
│   ├── src/                    asset and layout definitions (the source of truth)
│   ├── scripts/                generate and validate scripts
│   └── dist/                   generated output, committed, never edited by hand
│       ├── svg/                19 production SVGs + numerals/ (experiments)
│       ├── png/                19 production PNGs + numerals/ (experiments)
│       ├── previews/           4 HTML pages and their renders
│       ├── manifest.json       asset and font inventory
│       └── weather-mapping.json  semantic weather label to icon name
├── watch-face/                 planned: the Watch Face Studio project (empty)
└── references/                 planned: concept images (empty)
```

`watch-face/` and `references/` are empty. Git does not track empty directories, so they do not exist in a fresh clone. See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md#empty-directories-are-not-tracked-by-git).

| Document | Canonical for |
| --- | --- |
| [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md) | Visual and behavioural specification |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Locked decisions and their rationale |
| [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md) | How assets are generated, validated and extended |
| [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md) | Assembly plan for Watch Face Studio |
| [docs/LICENSING.md](docs/LICENSING.md) | Fonts, dependencies, original assets |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Remaining work, by phase |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Known problems and fixes |
| [asset-generator/README.md](asset-generator/README.md) | Generator internals |

## Setup

Requires Node.js and npm (verified with Node 22.22.0 and npm 11.19.0). Windows PowerShell:

```powershell
git clone <repository-url> syswatch-01
cd syswatch-01\asset-generator
npm ci
npm run build
Start-Process .\dist\previews\production-preview.html
```

No Git remote is configured in the working copy this was verified in, so `<repository-url>` has no known value yet.

All npm commands run from `asset-generator`, not from the repository root.

## npm scripts

Read from `asset-generator/package.json`.

| Command | Runs | What it does |
| --- | --- | --- |
| `npm run generate` | `scripts/generate-icons.mjs` | Writes the 19 production SVGs, exports each to PNG, writes `manifest.json` and `weather-mapping.json`, removes stale files. |
| `npm run preview` | `scripts/generate-preview.mjs` | Writes `dist/previews/index.html`. |
| `npm run validate` | `scripts/validate-assets.mjs` | 22 checks on the production assets, manifest, mapping and asset preview. |
| `npm run generate:numerals` | `scripts/generate-numerals.mjs` | Writes the 3 experimental numeral families (33 glyphs) and `numeral-lab.html`. |
| `npm run validate:numerals` | `scripts/validate-numerals.mjs` | 21 checks on the numeral output. |
| `npm run generate:clock-font` | `scripts/generate-clock-font.mjs` | Renders 27 comparison faces and writes `clock-font.html`. |
| `npm run validate:clock-font` | `scripts/validate-clock-font.mjs` | 18 checks on fonts, licences, checksums, pixel geometry and comparison renders. |
| `npm run generate:production` | `scripts/generate-production-preview.mjs` | Renders `production-preview.png` and writes `production-preview.html`. |
| `npm run validate:production` | `scripts/validate-production-preview.mjs` | 13 checks on the production face and page. |
| `npm run build` | all of the above | The five generate steps in the order above, then the four validations. Stops at the first failing step. |

There is no test, lint or watch script.

## Preview files

All in `asset-generator/dist/previews/`. They are self-contained and open directly from disk.

| File | Purpose |
| --- | --- |
| `production-preview.html` | **The production preview.** One 450×450 face with the locked typography, a typography table and the visual hierarchy. Start here. |
| `production-preview.png` | The 450×450 render shown by that page. |
| `index.html` | Asset preview: every icon at 16, 24, 32 and 64 px, the four structural assets, and two composed faces. The clock on its composed face is placeholder HTML text, not Departure Mono. |
| `clock-font.html` | Clock font comparison: Departure Mono at 88, 99 and 110 px, three sample times, three trackings. Kept as the evidence for the 99 px decision. |
| `clock-font/*.png` | The 27 renders shown by that page. |
| `numeral-lab.html` | The three experimental numeral families. Superseded by Departure Mono; kept for reference. |

Every value on every preview is **sample data**.

## Asset inventory

Filenames confirmed against `asset-generator/dist/manifest.json` (`assetCount`: 19). Each asset exists as `dist/svg/<name>.svg` and `dist/png/<name>.png`.

**General icons** (manifest category `icon-interface`, 64×64, transparent)

| Feature | Name |
| --- | --- |
| Calendar | `calendar` |
| Heart | `heart` |
| Battery | `battery` |
| Compass | `compass` |

**Weather icons** (manifest category `icon-weather`, 64×64, transparent)

| State | Name |
| --- | --- |
| Unknown | `weather-unknown` |
| Clear | `weather-clear` |
| Partly cloudy | `weather-partly-cloudy` |
| Cloudy | `weather-cloudy` |
| Fog | `weather-fog` |
| Rain | `weather-rain` |
| Heavy rain | `weather-heavy-rain` |
| Snow | `weather-snow` |
| Storm | `weather-storm` |
| Sleet | `weather-sleet` |
| Wind | `weather-wind` |

**Structural assets** (manifest category `structural`, 450×450)

| Asset | Name | Transparent |
| --- | --- | --- |
| Background grid | `background-grid` | No (opaque `#02070D`) |
| HUD frame | `hud-frame` | Yes |
| Seconds-ring base | `seconds-ring-base` | Yes |
| Seconds-ring active | `seconds-ring-active` | Yes |

**Not in the manifest**

- Experimental numerals: `dist/svg/numerals/<family>/` and `dist/png/numerals/<family>/` for `sys-stencil`, `sys-matrix` and `sys-bus`; files `0`–`9` and `colon`, 33 SVG and 33 PNG in total. Not production assets.
- Preview renders under `dist/previews/`.

## Build verification

`npm run build` generates everything and then runs four validators. Each prints one `PASS` or `FAIL` line per check and exits non-zero on any failure, which stops the build.

Expected successful output, in this order:

```
generated 15 icons and 4 structural assets (SVG + PNG)
wrote previews/index.html
generated 3 numeral families, 33 glyphs (SVG + PNG)
wrote previews/numeral-lab.html
rendered 27 clock font faces (88, 99, 110 px x 3 times x 3 trackings)
wrote previews/clock-font.html
rendered previews/production-preview.png
wrote previews/production-preview.html
22/22 checks passed
21/21 numeral checks passed
18/18 clock font checks passed
13/13 production preview checks passed
```

What the validators enforce, in short: the exact set of expected assets; that every SVG on disk equals its JavaScript definition (so hand edits fail); no text, rasters, filters or gradients in SVGs; PNG sizes and transparency; 60 evenly spaced ring segments; font identity, licence text and checksums; pixel-exact Departure Mono rendering; and that `weather-mapping.json` contains no numeric Watch Face Studio values. Full list in [docs/ASSET-PIPELINE.md](docs/ASSET-PIPELINE.md#validation).

A rebuild of unchanged sources must leave `git status` unchanged under `asset-generator/dist/`.

## Watch Face Studio status

**The Watch Face Studio project has not been started.** `watch-face/` is empty and the repository contains no `.wfs` file. No asset has been imported into Watch Face Studio and nothing has been installed on a watch. The plan is in [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md).

## Licensing

Summary only; [docs/LICENSING.md](docs/LICENSING.md) is authoritative.

- **Departure Mono** 1.500 by Helena Zhang: SIL Open Font License 1.1. Licence included at `asset-generator/assets/fonts/departure-mono/LICENSE`.
- **Share Tech Mono** 1.003 by Carrois Type Design: SIL Open Font License 1.1. Licence included at `asset-generator/assets/fonts/share-tech-mono/OFL.txt`. These are the only two bundled fonts.
- **Generated SVG and PNG assets** are original Syswatch 01 work, generated from code in this repository.
- **BM Space was rejected for production.** Its included terms prohibit selling it or including it in commercial products without the author's permission. Do not include or restore BM Space assets without an explicit licence from its author.
- No licence has been chosen for the project itself: `package.json` says `UNLICENSED` and there is no root `LICENSE` file.

## Known limitations

- Nothing runs on a watch. All behaviour described for the watch is a plan.
- The compass icon exists, but no layout area or preview face contains it. Its position on the face is undecided.
- The calendar icon exists but is not used on any composed face; the event strip is marked by an amber bar instead.
- Weather shares one data module with rain probability (rain icon, `RAIN` label, percentage). How the icon changes with the condition while the label reads `RAIN` is not specified.
- The clock font comparison faces show a temperature sample (`18°`). Temperature is not a Version 1 feature; that sample is stale.
- The production preview shows only a single-digit hour (`6:42 PM`). Double-digit hours at 99 px leave 1 px of clearance to the frame per side; see [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md#clock).
- Always-on display is not designed.
- `dist/weather-mapping.json` carries no numeric Watch Face Studio values by design. Samsung's documentation publishes a list, recorded as unverified in [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md#weather-condition).
- PNG bytes depend on the Sharp/libvips version.

## Roadmap

| Phase | Status |
| --- | --- |
| 1. Asset system | Built and passing; not yet committed |
| 2. Final production preview | Generated; open design questions remain |
| 3. Watch Face Studio assembly | Not started |
| 4. Device installation and testing | Not started |
| 5. Always-on display and optimization | Not started, not designed |
| 6. Possible future custom Wear OS implementation | Idea only |

Full list: [docs/ROADMAP.md](docs/ROADMAP.md).

## Contribution and Git workflow

- The default branch is `main`. Create a branch for any change; do not commit directly to `main`.
- Existing commits use a conventional prefix (`chore:`). Keep using conventional prefixes (`feat:`, `fix:`, `docs:`, `chore:`).
- Change definitions in `asset-generator/src/` or `design-tokens.json`, then run `npm run build`. Never edit `asset-generator/dist/` by hand.
- Commit source changes together with the regenerated `dist/` output in the same commit.
- The build must pass before committing.
- Locked decisions in [docs/DECISIONS.md](docs/DECISIONS.md) change only with explicit approval from the project owner, recorded as a new decision entry.
- AI assistants do not commit automatically. See [AGENTS.md](AGENTS.md).
- `git status` may print `LF will be replaced by CRLF`. It is harmless; see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md#lf-will-be-replaced-by-crlf-warning).

## Continuing this project

First commands, in Windows PowerShell from the repository root:

```powershell
git status
cd asset-generator
npm ci
npm run build
git status
Start-Process .\dist\previews\production-preview.html
```

The build must end with four `checks passed` lines, and the second `git status` must show no new changes under `asset-generator/dist/`.

Then read, in this order:

1. [README.md](README.md) (this file)
2. [AGENTS.md](AGENTS.md)
3. [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md)
4. [docs/DECISIONS.md](docs/DECISIONS.md)
5. [docs/ROADMAP.md](docs/ROADMAP.md)
6. [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md), because that is the next phase of work

The next piece of work is Phase 3: resolve the open design questions in [docs/DESIGN-SPEC.md](docs/DESIGN-SPEC.md#open-design-questions), then create the first Watch Face Studio project using the checklist in [docs/WATCH-FACE-STUDIO.md](docs/WATCH-FACE-STUDIO.md#checklist-for-the-first-wfs-project).

## Last verification

| Item | Value |
| --- | --- |
| Verification date | 2026-10-10 |
| Operating system | Windows 11 Home Single Language, 10.0.26200 |
| Node.js | v22.22.0 |
| npm | 11.19.0 |
| `npm ci` | Succeeded, 0 vulnerabilities reported |
| `npm run build` | Succeeded: 22/22, 21/21, 18/18 and 13/13 checks passed |
| Determinism | SHA-256 of all 138 files in `asset-generator/dist/` identical before and after the build |
| Git state | Branch `main`, 2 commits. At verification time the generator sources, fonts, `dist/` and all documentation were **not yet committed**. |

Update this table whenever the build is re-verified on a new machine or toolchain.
