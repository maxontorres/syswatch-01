# Syswatch 01 asset generator

Deterministic Node.js generator for the Version 1 production assets of the Syswatch 01
Samsung Wear OS watch face. SVG written in JavaScript is the single source of truth; PNG
files are exported from that SVG with [Sharp](https://sharp.pixelplumbing.com/).

Project-level documentation is in the repository root: start with [../README.md](../README.md).
The pipeline is described in [../docs/ASSET-PIPELINE.md](../docs/ASSET-PIPELINE.md), the visual rules in
[../docs/DESIGN-SPEC.md](../docs/DESIGN-SPEC.md) and licensing in [../docs/LICENSING.md](../docs/LICENSING.md).

It produces:

- 15 icons (4 interface, 11 weather) as SVG and transparent 64×64 PNG
- 4 structural watch-face assets as SVG and 450×450 PNG
- `manifest.json` (assets and fonts) and `weather-mapping.json`
- an HTML preview page
- a clock font comparison: complete watch faces with the clock set in Departure Mono
- a production preview: the one watch face with the locked typography

## Visual rules

The target is a believable early-2000s monitoring interface: dark, restrained, angular and
functional, with cyan instrumentation and a single amber accent.

- Colours, sizes and stroke settings come from `design-tokens.json`. Do not hard-code them.
- Icons use `viewBox="0 0 64 64"` on a transparent background.
- Icon geometry sits on a 2-unit grid with a 4-unit stroke (`icon.strokeWidth`), so strokes
  land on whole pixels at 64, 32 and 16 px. The 2-unit default stroke (`stroke.width`) is
  used for the 450×450 structural assets.
- Square line caps and miter joins. Angles are 45° or 90° wherever possible; no soft curves.
- Axis-aligned shapes get `shape-rendering="crispEdges"` automatically; diagonals stay
  anti-aliased.
- No text, embedded rasters, filters, blur, gradients or shadows in any SVG.
- No decorative enclosing squares unless the object is one (calendar, battery).
- Amber marks the one "signal" element of an icon (north, today, sun, lightning). Everything
  else is primary cyan.
- Weather icons must stay distinguishable at 24×24. Check the preview after any change.

## Directory structure

```
asset-generator/
├── design-tokens.json            colours, sizes, stroke, grid, ring and typography parameters
├── assets/fonts/                 original font files, each beside its licence
│   ├── departure-mono/           clock font (DepartureMono-Regular.otf, LICENSE)
│   └── share-tech-mono/          interface font (ShareTechMono-Regular.ttf, OFL.txt)
├── src/
│   ├── svg-helpers.mjs           element builders, number formatting, token loading
│   ├── icon-definitions.mjs      the 15 icons and the semantic weather mapping
│   ├── structural-definitions.mjs  grid, HUD frame, seconds rings, HUD layout
│   ├── asset-catalog.mjs         the one list of assets shared by all scripts
│   ├── numeral-definitions.mjs   numeral lab: three candidate clock numeral families
│   ├── font-definitions.mjs      the fonts, their manifest entries, glyph outline to SVG path
│   ├── clock-font-definitions.mjs  clock font comparison faces
│   ├── production-definitions.mjs  production preview face with the locked typography
│   ├── date-definitions.mjs      date line shared by every preview face
│   └── svg-parse.mjs             SVG parser shared by the validation scripts
├── scripts/
│   ├── generate-icons.mjs        writes dist/svg, dist/png, manifest, weather mapping
│   ├── generate-preview.mjs      writes dist/previews/index.html
│   ├── generate-numerals.mjs     writes dist/{svg,png}/numerals and the numeral lab page
│   ├── generate-clock-font.mjs   writes dist/previews/clock-font/ and clock-font.html
│   ├── generate-production-preview.mjs  writes dist/previews/production-preview.{png,html}
│   ├── validate-production-preview.mjs  checks the production preview face and page
│   ├── validate-assets.mjs       checks the icons and structural assets in dist/
│   ├── validate-numerals.mjs     checks the numeral families in dist/
│   └── validate-clock-font.mjs   checks the fonts, licences and clock font comparison
└── dist/                         generated output (committed)
    ├── svg/                      (numerals/<family>/ holds the numeral lab glyphs)
    ├── png/
    ├── previews/index.html
    ├── previews/numeral-lab.html
    ├── previews/clock-font.html  (clock-font/ holds its 450×450 renders)
    ├── previews/production-preview.html  (production-preview.png is its 450×450 render)
    ├── manifest.json
    └── weather-mapping.json
```

## Running it

```
npm ci             # first time only; installs exactly what package-lock.json specifies
npm run build      # generate + preview + numerals + clock font + production preview + validate
```

| Script | Does |
| --- | --- |
| `npm run generate` | Renders every SVG, exports the PNGs, writes the manifest and weather mapping. |
| `npm run preview` | Writes `dist/previews/index.html`. Open it directly in a browser. |
| `npm run validate` | Checks the contents of `dist/` and exits non-zero on any failure. |
| `npm run generate:numerals` | Renders the numeral families and writes `dist/previews/numeral-lab.html`. |
| `npm run validate:numerals` | Checks the numeral output and exits non-zero on any failure. |
| `npm run generate:clock-font` | Renders the clock font comparison faces and writes `dist/previews/clock-font.html`. |
| `npm run validate:clock-font` | Checks the fonts, licences, manifest entries and comparison renders. |
| `npm run generate:production` | Renders the production preview face and writes `dist/previews/production-preview.html`. |
| `npm run validate:production` | Checks the production preview's content, fonts, sizes, date spacing and render. |
| `npm run build` | Generates everything, then runs all four validations. |

Re-running is safe: files are replaced in place, stale `.svg`/`.png` files that are no longer
defined are removed, and the output contains no timestamps, so an unchanged definition
produces an unchanged file.

## Adding an icon

1. Add an entry to the `icons` array in `src/icon-definitions.mjs` with a `name`, a
   `category` (`interface` or `weather`) and its `elements`, built with the helpers from
   `svg-helpers.mjs` (`line`, `polyline`, `polygon`, `rect`). Keep stroke centres on even
   coordinates and stay inside 4–60 so strokes do not clip.
2. For a weather icon, reuse `cloud()`, `rain()` and `flake()` where they fit, and point at
   least one label at it in `weatherMapping`.
3. Add the name to `EXPECTED_ICONS` in `scripts/validate-assets.mjs` and update the expected
   count there. This is deliberate: the validator should not silently accept a new asset.
4. Run `npm run build` and look at the icon at 16, 24, 32 and 64 px in the preview.

Never edit files in `dist/` by hand. The validator compares each SVG with its definition and
fails if they differ.

## Generated files

Everything under `dist/` is generated:

- `dist/svg/*.svg` and `dist/png/*.png`: 19 of each, one pair per asset
- `dist/manifest.json`: every asset with its category, size, transparency and paths, sorted
  by name, plus a `fonts` list with each font's role, version, licence, source, file paths
  and SHA-256 checksums
- `dist/weather-mapping.json`: semantic weather label to icon name
- `dist/previews/index.html`: development preview. It contains HTML text and sample values;
  the assets themselves do not.

### Fonts

| Font | Used for | Files |
| --- | --- | --- |
| Departure Mono 1.500 (Helena Zhang) | Main clock numerals, colon, AM/PM. Nothing else. | `assets/fonts/departure-mono/` |
| Share Tech Mono 1.003 (Ralph Oliver du Carrois) | Date, event text, heart rate, battery, weather, small interface labels. | `assets/fonts/share-tech-mono/` |

Both are under the SIL Open Font License 1.1. Each original font file is kept unmodified next
to its licence; keep the two together. Departure Mono comes from the v1.500 release of
<https://github.com/rektdeckard/departure-mono>, Share Tech Mono from
<https://github.com/google/fonts/tree/main/ofl/sharetechmono>.

Departure Mono is the production clock font, at 99 px (9× its design size) with default
tracking: `size` and `tracking` in `typography.clock`. It is a pixel font with an 11 px design
size (digits are 5×8 design pixels on a 7-pixel advance), so:

- Use it only at whole multiples of 11 px.
- Place it at whole-pixel positions and never scale it unevenly.
- Tracking may be tightened; the glyphs themselves are used as drawn. It has not been redrawn
  or reinterpreted.

### Clock font comparison

`dist/previews/clock-font.html` shows complete watch faces at 88, 99 and 110 px for 10:08 PM,
6:42 AM and 12:59 PM, each at default tracking and at half and one design pixel tighter. The
generator draws the unaltered outlines with one uniform scale and anti-aliasing off, and
validation confirms that every clock pixel is fully on or off and that each glyph is an exact
block-scaled copy of the font's own pixels. Sizes, tracking steps and interface text sizes are
in `typography` in `design-tokens.json`. The renders are evaluation images, not production
assets, and are not listed under `assets` in the manifest.

Five characters are 264, 297 and 330 px wide at the three sizes against a 300 px clock area:
110 px only fits with tracking one design pixel tighter. 99 px was chosen; the comparison is
kept for reference.

### Production preview

`dist/previews/production-preview.html` shows the one face with the locked typography: 6:42 PM
in Departure Mono at 99 px (12-hour, no leading zero) with AM/PM at 22 px, and the date at
20 px, the next event and the data modules in Share Tech Mono. Each module pairs its icon with
a dim label over its value (`moduleLabelSize`, `moduleValueSize`). Only the date's separator
dot is amber. Inactive seconds-ring segments are at 48% opacity (`secondsRing.inactiveOpacity`)
so they sit behind the clock; elapsed segments stay full primary cyan.

### Date line

Every complete face in the three preview pages shows the date as `SAT · 10/10/2026`: uppercase
weekday, a middle dot, then DD/MM/YYYY, in Share Tech Mono (monospaced, so the numerals are
tabular) in primary cyan. `src/date-definitions.mjs` centres it on the face and places its
capitals midway between the bottom of the clock digits and the top of the next-event strip, so
it is attached to neither. Size and tracking are `dateSize` and `dateTracking` in
`typography.interface`. The date is preview sample content: the Watch Face Studio component
will be dynamic, and no asset contains it.

### Numeral laboratory

The numeral laboratory predates the adoption of Departure Mono and is kept for comparison.
Watch Face Studio can assign a bitmap to each clock digit and symbol, so the main clock could
use original numerals instead of a font. `src/numeral-definitions.mjs` defines three candidate
families, each with `0`–`9` and a colon (`colon.svg`/`colon.png`, because `:` is not a valid
file name):

| Family | Construction |
| --- | --- |
| `sys-stencil` | Continuous 10-unit strokes, 45° chamfered turns, 4-unit cuts at selected joints. |
| `sys-matrix` | 5 × 10 grid of 8 × 6 rectangular cells with 2-unit gutters; selected cells left out. |
| `sys-bus` | Separated strokes: parallel-line vertical buses, single horizontal traces, hollow junction pads. |

Digits are 72×112 and the colon is 28×112, transparent, in primary cyan only. In every family
the ink sits between x 12–60 with one cap line and one baseline, so digit widths never change.
Each glyph lists `gapProbes`, pixels inside its small gaps that validation requires to be fully
transparent in the exported PNG.

Output goes to `dist/svg/numerals/<family>/` and `dist/png/numerals/<family>/`. Compare the
families in `dist/previews/numeral-lab.html`. No family was chosen and none will be: Departure
Mono is the clock font, and the families are kept only as experiments. The numerals are not
listed in `manifest.json`. Four digits and a colon are 316 px wide, 16 px more than the
300 px clock area of `hud-frame`; the glyph side bearings absorb the difference at 1:1.

### Structural assets

| Asset | Notes |
| --- | --- |
| `background-grid` | Opaque `#02070D` base with a low-contrast cyan grid. The only asset without transparency. |
| `hud-frame` | Transparent. Frames the main clock, the next-event strip and three bottom data modules. The area rectangles are exported as `layout` from `structural-definitions.mjs`. |
| `seconds-ring-base` | Transparent. 60 dim segments. |
| `seconds-ring-active` | Transparent. Same 60 segments in primary cyan, to be revealed progressively in Watch Face Studio. |

Ring segment *i* occupies the 6° cell starting at *i* × 6° clockwise from 12 o'clock, so a
clockwise sweep to *s* × 6° reveals exactly *s* whole segments.

## Why generated assets are committed

- Watch Face Studio imports the PNG files directly. Committing them means the watch-face
  project works from a fresh clone without running Node first.
- Because output is deterministic, a diff in `dist/` always corresponds to a real change in
  a definition or token, which makes visual changes reviewable.
- The exact files that shipped in a given watch-face build are recoverable from Git history.

PNG bytes depend on the Sharp/libvips version. After upgrading Sharp, expect a one-off diff in
`dist/png` even if nothing looks different.

## Watch Face Studio weather values are not verified

`dist/weather-mapping.json` maps **semantic labels** (`rain`, `fog`, `thunderstorm`, …) to
icon names. It deliberately contains **no numeric Watch Face Studio weather-condition
values**, and its `wfsNumericMapping.values` field is `null`. Those numbers must be read from
the installed Watch Face Studio version and verified before integration. Do not guess them.

## Aseprite

Aseprite is not part of the Version 1 production pipeline. No asset is drawn or touched up by
hand; if something looks wrong, fix the definition and rebuild.
