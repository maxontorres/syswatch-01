# Roadmap

Status of every piece of work, determined from the repository on 2026-10-10 and updated for the Watch Face Studio build on 2026-10-15.

- `[x]` means it exists in the repository and was verified, by the build or by inspection.
- `[ ]` means it is not done. Work that was only discussed is not marked complete.

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
- [x] Commit the generator sources, fonts and `dist/` output
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
- [x] Specify the weather module: condition icon and temperature ([D-023](DECISIONS.md#d-023-weather-module-shows-temperature))
- [x] Decide whether the calendar icon is used in the event strip (system icon, [D-024](DECISIONS.md#d-024-system-calendar-icon-accepted-in-the-event-strip))
- [ ] Specify the event strip: maximum length, truncation, time format, empty state
- [ ] Specify heart-rate formatting and the no-reading state
- [ ] Add a double-digit hour sample to the production preview
- [ ] Update the production preview to match the Version 1 watch face
- [ ] Remove the stale temperature sample (`18°`) from the clock font comparison faces
- [ ] Record the project owner's sign-off on the production preview

## Phase 3 — Watch Face Studio assembly

Version 1 built on 2026-10-15 in Watch Face Studio 1.9.9. Project: [watch-face/](../watch-face/README.md).

- [x] Install Watch Face Studio and record its version (1.9.9)
- [x] Create the 450×450 project, saved as `watch-face/Syswatch 01.wfs` (Watch Face Studio rejects hyphens in file names)
- [x] Add Departure Mono to the project ([D-022](DECISIONS.md#d-022-departure-mono-for-all-text-in-the-watch-face-studio-build); Share Tech Mono not used)
- [x] Confirm Departure Mono renders as crisp pixels (checked on the watch)
- [x] Import the structural PNGs (grid and HUD frame)
- [x] Main clock, 12-hour, no leading zero
- [x] AM/PM indicator
- [x] Date
- [x] Seconds ring driven by `[SEC]`
- [x] Heart rate, with tap to Heart rate
- [x] Battery percentage, amber at 15 % or less, with tap to Battery
- [x] Weather icon switching by condition (11 generated icons on the weather timeline)
- [x] Temperature in the weather module, with tap to Samsung Weather
- [ ] Rain probability (replaced by temperature in Version 1, [D-023](DECISIONS.md#d-023-weather-module-shows-temperature))
- [x] Next-event complication with the system calendar icon ([D-024](DECISIONS.md#d-024-system-calendar-icon-accepted-in-the-event-strip))
- [ ] Compass shortcut
- [x] Record the tags used and the weather timeline order ([WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md))
- [x] `.gitignore` already ignores Watch Face Studio `build/` output
- [ ] Amber middle dot in the date
- [ ] Heart-rate no-reading state (`--`)

## Phase 4 — Device installation and testing

Started 2026-10-15. Test list: [WATCH-FACE-STUDIO.md](WATCH-FACE-STUDIO.md#what-must-be-tested-on-the-physical-watch).

- [x] Record the target watch model and OS version (Galaxy Watch9 SM-L350, Android 17, API 37)
- [x] Install the watch face on a physical watch (Run on Device)
- [x] Each dynamic component with real data, normal mode (one capture, 4:04 PM)
- [x] Tap actions open the right apps
- [x] Round-screen edge clipping: nothing clipped in the capture
- [x] Next-event empty state (`No upcoming events`)
- [ ] Long event titles with real calendar data (checked only in the editor). Blocked on 2026-10-15: a test event created in Google Calendar did not reach the watch because the watch's Bluetooth link to the phone was off. Repeat with Bluetooth on.
- [x] Low-battery amber state on the watch (amber at 10 % and 15 %, cyan at 16 %, forced with `dumpsys battery set level`)
- [ ] Legibility at arm's length, indoors and in sunlight
- [x] Double-digit hours against the clock frame, on the watch (`10:15`, `11:15`, `12:15`; about 32 px clearance per side)
- [x] Clock and date centred on the face (boxes narrowed from 295 to 290 px; measured centred on the watch)
- [x] Heart-rate no-reading state seen: off the wrist for about 5 minutes the last reading stays; `0` never shown
- [x] Bigger module values: stacked layout, 22 px ([D-027](DECISIONS.md#d-027-stacked-data-modules-with-22-px-values)), installed and seen on the watch
- [ ] Weather icons across real conditions (only partly cloudy seen)
- [ ] Compass shortcut opens the Compass app (not built)
- [x] Record findings in [TROUBLESHOOTING.md](TROUBLESHOOTING.md) and [DESIGN-SPEC.md](DESIGN-SPEC.md)

## Phase 5 — Always-on display and optimization

- [x] Design the always-on layout ([D-025](DECISIONS.md#d-025-always-on-layout))
- [x] Generate any always-on assets (none needed)
- [x] Implement it in Watch Face Studio
- [x] See it on the watch screen (checked by the project owner on 2026-10-15; screen capture cannot record it)
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
