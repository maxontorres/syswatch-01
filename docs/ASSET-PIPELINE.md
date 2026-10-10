# Asset pipeline

How Syswatch 01 assets are defined, generated, validated and extended. The generator lives in `asset-generator/`; a file-by-file reference is in [../asset-generator/README.md](../asset-generator/README.md).

All commands run from `asset-generator`:

```powershell
cd asset-generator
npm ci
npm run build
```

## Why SVG is the source of truth

- Assets are geometric: straight strokes, 45° and 90° angles, flat colours. Vector definitions describe them exactly.
- One definition exports to any size without redrawing.
- SVG is text, so a visual change is a readable diff.
- Colours and stroke widths come from one token file, so the whole set changes together.

The SVG itself is not hand-written. It is produced from JavaScript definitions, which are the real source; the `.svg` files in `dist/` are generated output ([D-003](DECISIONS.md#d-003-svg-source-of-truth-pipeline)).

## How JavaScript definitions generate assets

```
design-tokens.json ─┐
                    ├─> src/*-definitions.mjs ─> src/asset-catalog.mjs ─> scripts/generate-*.mjs ─> dist/
src/svg-helpers.mjs ┘
```

- `src/svg-helpers.mjs` loads the tokens and provides element builders (`line`, `polyline`, `polygon`, `rect`, `group`, `svgDocument`). Every number passes through `fmt()`, which rounds to three decimals, so output is byte-stable.
- `src/icon-definitions.mjs` defines the 15 icons as lists of elements, plus the semantic weather mapping.
- `src/structural-definitions.mjs` defines the grid, HUD frame and seconds rings, and exports `layout`, the content areas every face uses.
- `src/asset-catalog.mjs` is the single list of production assets, shared by the generate, preview and validate scripts.
- `src/font-definitions.mjs` declares the two fonts and converts glyph outlines to SVG paths with `opentype.js`. Text on preview faces is drawn as paths, so no font needs to be installed to build or view anything.

## How Sharp exports PNG files

`scripts/generate-icons.mjs` passes each SVG string to [Sharp](https://sharp.pixelplumbing.com/), which rasterises it with librsvg:

```js
await sharp(Buffer.from(asset.svg))
  .resize(asset.width, asset.height)
  .png({ compressionLevel: 9 })
  .toFile(...)
```

Icons export at 64×64 and structural assets at 450×450. No other sizes are exported.

PNG bytes depend on the Sharp/libvips version. After upgrading Sharp, expect a one-off diff across `dist/png` and the preview renders even if nothing looks different. `package-lock.json` pins Sharp at 0.35.5.

## Why generated SVG and PNG files are committed

- Watch Face Studio imports the PNG files directly, so the watch-face project works from a fresh clone without Node.
- Output is deterministic, so a diff under `dist/` always means a real change to a definition or token. Visual changes become reviewable.
- The exact files in any watch-face build are recoverable from Git history.

## Source directories

| Path | Contents |
| --- | --- |
| `asset-generator/design-tokens.json` | Colours, sizes, strokes, grid, ring and typography parameters |
| `asset-generator/src/` | Definitions and helpers (10 `.mjs` files) |
| `asset-generator/scripts/` | 5 generate scripts and 4 validate scripts |
| `asset-generator/assets/fonts/departure-mono/` | `DepartureMono-Regular.otf`, `LICENSE` |
| `asset-generator/assets/fonts/share-tech-mono/` | `ShareTechMono-Regular.ttf`, `OFL.txt` |

`asset-generator/assets/fonts/local/` is ignored by Git and is not a source directory. See [LICENSING.md](LICENSING.md#bm-space-rejected).

## Output directories

Everything under `asset-generator/dist/` is generated.

| Path | Contents | Written by |
| --- | --- | --- |
| `dist/svg/*.svg` | 19 production SVGs | `npm run generate` |
| `dist/png/*.png` | 19 production PNGs | `npm run generate` |
| `dist/manifest.json` | Asset and font inventory | `npm run generate` |
| `dist/weather-mapping.json` | Semantic weather label to icon name | `npm run generate` |
| `dist/previews/index.html` | Asset preview | `npm run preview` |
| `dist/svg/numerals/<family>/`, `dist/png/numerals/<family>/` | 33 experimental glyphs in each format | `npm run generate:numerals` |
| `dist/previews/numeral-lab.html` | Numeral comparison | `npm run generate:numerals` |
| `dist/previews/clock-font/*.png`, `dist/previews/clock-font.html` | 27 comparison faces and their page | `npm run generate:clock-font` |
| `dist/previews/production-preview.png`, `.html` | Production preview | `npm run generate:production` |

Total: 138 files.

## Manifest generation

`scripts/generate-icons.mjs` writes `dist/manifest.json`:

- `assets`: one entry per production asset with `name`, `category` (`icon-interface`, `icon-weather` or `structural`), `width`, `height`, `transparent`, and `svg` and `png` paths relative to `dist/`. Sorted by name.
- `fonts`: one entry per font with family, role, usage, version, designer, licence, source, file paths relative to `dist/`, and SHA-256 checksums of the font and its licence file.
- `assetCount`: 19.

The manifest contains no timestamps. Numerals and preview renders are deliberately not listed.

`dist/weather-mapping.json` is written from `weatherMapping` in `src/icon-definitions.mjs`. It maps 25 semantic labels to the 11 weather icons, with `weather-unknown` as the fallback, and its `wfsNumericMapping.values` is `null` ([D-019](DECISIONS.md#d-019-numeric-watch-face-studio-weather-mapping-remains-unverified)).

## Preview generation

| Page | Script | How the face is built |
| --- | --- | --- |
| `index.html` | `generate-preview.mjs` | HTML page that layers the exported PNGs. The clock, event and module text are placeholder HTML in the page font; only the date is drawn from Share Tech Mono outlines. |
| `numeral-lab.html` | `generate-numerals.mjs` | HTML page that lays out the numeral PNGs. |
| `clock-font.html` | `generate-clock-font.mjs` | Each face is one SVG, rendered to PNG. All text is font outlines. |
| `production-preview.html` | `generate-production-preview.mjs` | One SVG face rendered to PNG. All text is font outlines. |

Pages are self-contained: no external libraries or network resources. The validators check this.

## Validation

Each validator prints `PASS` or `FAIL` per check and exits non-zero on any failure.

| Command | Checks | Enforces |
| --- | --- | --- |
| `npm run validate` | 22 | Exactly 15 icons and 4 structural assets with the expected names; `dist/svg` and `dist/png` hold exactly those files; SVGs parse and equal their definitions; correct viewBoxes; no text, images, filters, gradients or other disallowed elements; both rings have 60 evenly spaced segments with identical geometry; PNG sizes; transparency (only `background-grid` is opaque); manifest complete and sorted; weather mapping targets real icons, covers every weather icon and has no numeric values; the asset preview shows every asset and uses no network resources. |
| `npm run validate:numerals` | 21 | Three families, 11 characters each; file sets; SVG rules; glyph sizes (72×112 digits, 28×112 colon); transparency; small gaps still transparent; equal digit widths, cap height and baseline per family. |
| `npm run validate:clock-font` | 18 | Only the two expected fonts; each beside its licence; licence text is OFL 1.1; family, version and OFL notice in the font's own name table; manifest checksums match; Departure Mono glyphs lie on the 11 px grid; sizes 88, 99 and 110; renders match their definitions; every clock pixel fully on or off; each glyph is an exact block-scaled copy of the font. |
| `npm run validate:production` | 13 | Exact sample content; correct font per role; clock 99 px and date 20 px; whole-pixel origins; clock inside the frame; date centred with at least 10 px even gaps; only the date separator is amber; inactive ring at most 0.48 opacity; render matches its definition; no smoothing; page shows the render and uses no network resources. |

Adding an asset without updating the validator's expected list fails the build on purpose.

## How to add a new icon

1. Add an entry to the `icons` array in `asset-generator/src/icon-definitions.mjs` with a `name`, a `category` (`interface` or `weather`) and its `elements`, using the helpers from `svg-helpers.mjs`. Keep stroke centres on even coordinates and geometry within 4–60.
2. For a weather icon, reuse `cloud()`, `rain()` and `flake()` where they fit, and point at least one label at it in `weatherMapping`. Do not add numeric values.
3. Add the name to `EXPECTED_ICONS` in `asset-generator/scripts/validate-assets.mjs` and update the count in the `exactly 15 icons are defined` check.
4. Run `npm run build`.
5. Open `dist/previews/index.html` and check the icon at 16, 24, 32 and 64 px.
6. Update the asset inventory in [../README.md](../README.md#asset-inventory) and the counts in this file.

Follow the icon rules in [DESIGN-SPEC.md](DESIGN-SPEC.md#icon-rules). Consolidating or adding weather states changes a locked decision ([D-018](DECISIONS.md#d-018-weather-icons-consolidated-into-11-visual-states)).

## How to modify design tokens

1. Edit `asset-generator/design-tokens.json`.
2. Run `npm run build`.
3. Review the diff under `dist/` and the previews.

Things to know first:

- The four colours, the 450 canvas, the 99 px clock and the fonts are locked decisions. Changing them needs approval; see [DECISIONS.md](DECISIONS.md).
- Some validators hold expected values on purpose and will fail until updated deliberately: `validate-production-preview.mjs` (clock 99, date 20, inactive opacity at most 0.48), `validate-clock-font.mjs` (sizes 88, 99, 110), `validate-numerals.mjs` (allowed colours `#79EEFF`, `#087DA6`).
- `typography.clock.size` must be a multiple of `nativeSize` (11).

## How to rebuild

```powershell
cd asset-generator
npm run build
```

Re-running is safe. Files are replaced in place and stale `.svg` and `.png` files that are no longer defined are removed. There is no clean script; none is needed.

## How to verify deterministic output

With a clean working tree under `dist/`:

```powershell
cd asset-generator
npm run build
git status --short dist
```

No output means the build reproduced every file exactly. For a check that does not depend on Git:

```powershell
$before = Get-ChildItem dist -Recurse -File | Get-FileHash -Algorithm SHA256
npm run build
$after = Get-ChildItem dist -Recurse -File | Get-FileHash -Algorithm SHA256
Compare-Object $before $after -Property Path, Hash
```

No output means identical. This was verified on 2026-10-10 for all 138 files.

Determinism holds for a fixed Sharp/libvips version. It has been verified on Windows only; output on other platforms has not been compared.

## Aseprite

**Not required for Version 1** ([D-017](DECISIONS.md#d-017-aseprite-deferred)). Every asset is generated from code; nothing is drawn or touched up by hand. If something looks wrong, fix the definition and rebuild.

Aseprite might become useful later if the project needs:

- Hand-drawn pixel art that is impractical to describe as geometry
- Frame-by-frame animation
- A hand-tuned bitmap font or per-pixel numeral adjustments
- Pixel-level corrections for the always-on display

Adopting it would add a second, non-generated source of truth and needs a decision entry first.
