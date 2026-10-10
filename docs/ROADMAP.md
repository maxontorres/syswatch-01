# Roadmap

Status of every piece of work, determined from the repository on 2026-10-10.

- `[x]` means it exists in the repository and was verified, by the build or by inspection.
- `[ ]` means it is not done. Work that was only discussed is not marked complete.

**Read this first.** At verification time almost all of Phase 1 and Phase 2 existed only as uncommitted files in one working copy. Git tracked four files: `.gitignore`, `README.md`, `asset-generator/package.json` and `asset-generator/package-lock.json`. Until the work is committed, a fresh clone does not contain it.

## Phase 1 — Asset system

- [x] Repository structure
- [x] Design tokens (`asset-generator/design-tokens.json`)
- [x] SVG helper library with byte-stable number formatting
- [x] 4 general icons: calendar, heart, battery, compass
- [x] 11 weather icons
- [x] 4 structural assets: background grid, HUD frame, seconds-ring base, seconds-ring active
- [x] PNG export with Sharp
- [x] `manifest.json` with assets, fonts and checksums
- [x] `weather-mapping.json` with semantic labels and no numeric values
- [x] Asset preview page
- [x] Asset validation, 22 checks
- [x] Departure Mono and Share Tech Mono bundled with their licences
- [x] Deterministic output, verified by checksum across a rebuild on Windows
- [ ] Commit the generator sources, fonts and `dist/` output
- [ ] Add a `WINDY` label to the weather mapping, to match Samsung's documented condition names
- [ ] Decide the project's own licence
- [ ] Verify deterministic output on a second machine or platform
- [ ] Icon export at the 28 px display size, only if Watch Face Studio downscaling proves soft

## Phase 2 — Final production preview

- [x] Numeral laboratory: three experimental families, 21 checks; superseded, kept for reference
- [x] Clock font comparison: 27 faces at 88, 99 and 110 px, 18 checks
- [x] Clock typography locked: Departure Mono, 99 px, tracking 0
- [x] Interface typography locked: Share Tech Mono
- [x] Date line in `DD/MM/YYYY` with weekday, centred with even spacing
- [x] Production preview render and page, 13 checks
- [x] Production render inspected on a desktop screen at 1:1
- [ ] Decide the compass shortcut's position and add it to the layout and the preview
- [ ] Specify the weather module: how the condition icon and the rain probability share it
- [ ] Decide whether the calendar icon is used in the event strip
- [ ] Specify the event strip: maximum length, truncation, time format, empty state
- [ ] Specify heart-rate formatting and the no-reading state
- [ ] Add a double-digit hour sample to the production preview
- [ ] Remove the stale temperature sample (`18°`) from the clock font comparison faces
- [ ] Record the project owner's sign-off on the production preview

## Phase 3 — Watch Face Studio assembly

Not started. `watch-face/` is empty. Guide: [WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md).

- [ ] Install Watch Face Studio and record its version
- [ ] Create the 450×450 project at `watch-face/syswatch-01.wfs` (planned path)
- [ ] Add Departure Mono and Share Tech Mono to the project
- [ ] Confirm Departure Mono renders pixel-exactly, or build the bitmap-font fallback
- [ ] Import the structural PNGs
- [ ] Main clock, 12-hour, no leading zero
- [ ] AM/PM indicator
- [ ] Date
- [ ] Seconds ring driven by seconds
- [ ] Heart rate
- [ ] Battery percentage
- [ ] Weather icon switching by condition
- [ ] Rain probability
- [ ] Next-event complication
- [ ] Compass shortcut
- [ ] Verify every tag expression in the installed version
- [ ] Verify the numeric weather-condition values and record them
- [ ] Update `.gitignore` for any Watch Face Studio build output

## Phase 4 — Device installation and testing

Not started. Test list: [WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md#what-must-be-tested-on-the-physical-watch).

- [ ] Record the target watch model and Wear OS version
- [ ] Install the watch face on a physical watch
- [ ] Legibility at arm's length, indoors and in sunlight
- [ ] Double-digit hours against the clock frame
- [ ] Each dynamic component with real data
- [ ] Weather icons across real conditions
- [ ] Compass shortcut opens the Compass app
- [ ] Round-screen edge clipping
- [ ] Record findings in [TROUBLESHOOTING.md](TROUBLESHOOTING.md) and [DESIGN-SPEC.md](DESIGN-SPEC.md)

## Phase 5 — Always-on display and optimization

Not started and not designed.

- [ ] Design the always-on layout; see [DESIGN-SPEC.md](DESIGN-SPEC.md#ambient--always-on-display)
- [ ] Generate any always-on assets
- [ ] Implement it in Watch Face Studio
- [ ] Measure battery drain over a full day
- [ ] Check for burn-in risk
- [ ] Reduce layers or assets if performance requires it

## Phase 6 — Possible future custom Wear OS implementation

Ideas only. Nothing here is planned or designed, and none of it belongs in Version 1.

- [ ] Evaluate whether a native Wear OS implementation is needed
- [ ] Live compass heading
- [ ] Distance from home
- [ ] Gym routine features
- [ ] Custom navigation interface
