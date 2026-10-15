# Watch Face Studio implementation guide

Findings and plan for building Syswatch 01 in Samsung Watch Face Studio.

**Status: Version 1 built and installed (2026-10-15).** The project is [`watch-face/Syswatch 01.wfs`](../watch-face/README.md); its layers, weather mapping and deployment steps are documented there. This file records what was verified in Watch Face Studio and on the watch, and keeps the original plan below for the parts that are still open. Where the plan and the build differ, the build is described in [DESIGN-SPEC.md](DESIGN-SPEC.md#watch-face-studio-version-1-as-built).

## Verified on 2026-10-15

| Item | Finding |
| --- | --- |
| Watch Face Studio version | 1.9.9 |
| Watch | Galaxy Watch9, SM-L350, Android 17 (API 37), wireless adb |
| Tags used and seen working on the watch | `[HR]`, `[BATT_PER]`, `[WTHR_TEM]`, `[SEC]` (seconds ring), `[AMPM]`, the 12-hour digital clock, the date tags already in the project |
| Weather condition | Watch Face Studio's weather timeline has 16 columns in this order: Unknown, Clear, Cloudy, Fog, Heavy Rain, Heavy Snow, Rain, Snow, Sunny, Thunder Storm, Sleet, Light Snow, Light Rain, Mist, Partly Cloudy, Windy. The project stores them as 0–15, which matches Samsung's documented `[WTHR_COND]` list below. On the watch the partly-cloudy icon showed; other conditions are not yet seen. |
| Weather tags in the installed version | Found in the application: `[WTHR_CHANCE_PPTN]`, `[WTHR_COND]`, `[WTHR_COND_NAME]`, `[WTHR_DAY_TEM_HIGH]`, `[WTHR_DAY_TEM_LOW]`, `[WTHR_IS_AVAIL]`, `[WTHR_IS_DAY]`, `[WTHR_LAST_UPDATED]`, `[WTHR_TEM]`, `[WTHR_TEM_UNIT]`, `[WTHR_UV_INDEX]` |
| Departure Mono | Bundled in the `.wfs` and rendered as crisp pixels on the watch |
| Next-event complication | "Long text" type, default provider "Next event", fixed. Its "Image + Long Text" layout shows the provider's calendar image; the text-only layout does not. Long text is truncated with an ellipsis. Empty state: `No upcoming events`. |
| Open App actions | Built-in targets include Heart rate and Battery Status. Weather is not built in; "Custom" with App ID `com.samsung.android.watch.weather` works. All three were tapped on the watch and opened the right app. |
| Battery condition | The battery timeline shows a layer only inside its percentage range; used for the amber low-battery value |
| Always-on | Its own tab with separate visibility per layer; colours are shared with normal mode. `adb screencap` returns black while the watch dozes, so it was checked by eye: the project owner confirmed only time, AM/PM and date, dim blue, readable. |
| Low battery | The battery timeline switch works on the watch: amber at 10 % and 15 %, cyan at 16 % (`dumpsys battery set level`, then `dumpsys battery reset`). |
| Double-digit hours | `10:15`, `11:15`, `12:15` fit inside the clock brackets at stored font height 88. Tested by switching the time zone (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md#testing-other-hours-without-waiting)). |
| Text box centring | Text is centred on its own box, not on the canvas. The clock and date boxes were 295 px wide at x 80 (centre 227.5); narrowed to 290 px so they centre on 225. Measured centred on the watch. |
| Heart rate, no reading | Off the wrist for about 5 minutes, `[HR]` keeps the last reading (`68`). `0` shows only in the editor. |
| Group resize | Changing a group's width or height scales its children (positions and sizes, not font size). Set the group first, then set each child. Shift-click selects several layers, and position and size then apply to all of them. |
| Seconds ring with the generated images | Works on the watch. Select a circular progress bar (above) and an image (below) and click **Mask**: the bar's drawn arc becomes the image's mask. With `[SEC]` 0–59, thickness 16 and a flat cap, it reveals exactly `[SEC]` whole segments of `seconds-ring-active.png`, clockwise from 12 o'clock (measured: 40, 45, 50 lit in successive captures, no partial segment). Use the flat cap: the square cap overshoots by half the thickness. The new mask group was shown in always-on by default; hide it there. |
| Adding an image | There is no image entry in Add Component apart from preset images. Duplicate an existing image layer (the copy goes to the top of the list) and use **Swap Media**. Rename by double-clicking the layer name: the context menu's Rename does not always open the field, and Ctrl+A then selects every layer. |
| Long event titles | Not seen on the watch: the test event did not sync because the watch's Bluetooth was off. |
| Editor preview | Does not animate the clock or seconds ring and does not preview weather conditions (all weather icons are drawn at once). Check those on the watch. |

How to read the confidence labels:

| Label | Meaning |
| --- | --- |
| **Documented** | Appears in Samsung's published documentation, read on 2026-10-10. Not tested here. |
| **Unverified** | An assumption about how Watch Face Studio works. Confirm it in the tool before relying on it. |
| **Open** | A design question that must be answered first; see [DESIGN-SPEC.md](DESIGN-SPEC.md#open-design-questions). |

Installed Watch Face Studio version: 1.9.9 (recorded 2026-10-15).

## Tag expressions

Source: Samsung's [tag expression reference](https://developer.samsung.com/watch-face-studio/user-guide/tag-expression.html), read on 2026-10-10. The page states no Watch Face Studio version. No tag has been tested in this project.

| Tag | Documented type and range | Intended use | Status |
| --- | --- | --- | --- |
| `[HOUR_1_12]` | Number, 1–12 | Clock hour, no leading zero | Verify in installed Watch Face Studio version |
| `[MIN_Z]` | String, 00–59 | Clock minutes, zero-padded | Verify in installed Watch Face Studio version |
| `[AMPM]` | String, AM/PM | AM/PM indicator | Verify in installed Watch Face Studio version |
| `[SEC]` | Number, 0–59 | Seconds ring progress | Verify in installed Watch Face Studio version |
| `[BATT_PER]` | Number, 0–100 | Battery percentage | Verify in installed Watch Face Studio version |
| `[HR]` | Number | Heart rate | Verify in installed Watch Face Studio version |
| `[WTHR_CHANCE_PPTN]` | Number, 0–100 | Rain probability | Verify in installed Watch Face Studio version |
| `[WTHR_COND]` | Number, 0–15 | Weather condition icon | Verify in installed Watch Face Studio version |

Other tags on the same page that this plan is likely to need. Same status: verify in installed Watch Face Studio version.

| Tag | Documented type and range | Likely use |
| --- | --- | --- |
| `[WTHR_IS_AVAIL]` | Number, 0 (no) or 1 (yes) | Samsung's documentation says to check this before reading other weather tags; drives the `weather-unknown` fallback |
| `[DAY_WEEK]` | Number, 1 (Sunday) – 7 (Saturday) | Weekday |
| `[DAY_1_31_Z]` | String, 01–31 | Day of month |
| `[MON_Z]` | String, 01–12 | Month |
| `[YEAR]` | Number | Year |

Do not add a tag to this file from memory. Add it only after finding it in the installed version or in Samsung's documentation, and say which.

## Component mapping

| Feature | Intended Watch Face Studio component | Data | Assets and fonts | Status |
| --- | --- | --- | --- | --- |
| Main clock | Text or digital-clock component | `[HOUR_1_12]:[MIN_Z]` | Departure Mono, 99 px, tracking 0, `#79EEFF` | Unverified: crisp rendering of the font |
| AM/PM | Text component | `[AMPM]` | Departure Mono, 22 px | Unverified |
| Date | Text component | Weekday, then `[DAY_1_31_Z]/[MON_Z]/[YEAR]` | Share Tech Mono, 20 px; amber middle dot | Unverified: three-letter uppercase weekday from `[DAY_WEEK]`; a separately coloured dot |
| Next-event complication | Complication slot in the event strip | Calendar next event | Share Tech Mono, 16 px | Unverified; partly open |
| Seconds progress | Progress or masked image driven by seconds | `[SEC]` | `seconds-ring-base.png`, `seconds-ring-active.png` | Unverified: stepped reveal |
| Battery | Icon image plus text | `[BATT_PER]` and a `%` sign | `battery.png`; Share Tech Mono | Unverified |
| Heart rate | Icon image plus text | `[HR]` | `heart.png`; Share Tech Mono | Unverified: zero padding |
| Weather condition | Image whose bitmap depends on the condition | `[WTHR_COND]`, `[WTHR_IS_AVAIL]` | The 11 `weather-*.png` icons | Unverified; mapping documented but untested; partly open |
| Rain probability | Text component | `[WTHR_CHANCE_PPTN]` and a `%` sign | Share Tech Mono | Unverified |
| Compass shortcut | Image with a tap action that opens an app | None | `compass.png` | Open: no position on the face. Unverified: tap action |

Positions, sizes and colours for every component are in [DESIGN-SPEC.md](DESIGN-SPEC.md). Static layers, bottom to top: `background-grid.png`, `hud-frame.png`, `seconds-ring-base.png`.

## Importing generated PNG assets

Planned procedure:

1. In `asset-generator`, run `npm ci` and `npm run build`. Use the PNGs only from a passing build.
2. Create the project at 450×450 so structural assets import at 1:1 with no scaling.
3. Import from `asset-generator/dist/png/`. The 19 production files are listed in `asset-generator/dist/manifest.json`.
4. Place the four structural assets at (0, 0), full size.
5. Icons are 64×64 and are shown at 28×28 on the face. Unverified: how well Watch Face Studio downscales them. If the result is soft, add a 28 px export to the generator rather than resizing by hand.
6. Do not import anything from `dist/png/numerals/`; those are experiments ([D-013](DECISIONS.md#d-013-experimental-numeral-families-retained-only-as-experiments)).

Never edit an imported image in Watch Face Studio or another editor. Change the definition, rebuild and re-import.

Unverified: whether a `.wfs` project stores copies of imported images or references to their paths. This decides whether re-importing after a rebuild is manual.

## Departure Mono

The production font file is `asset-generator/assets/fonts/departure-mono/DepartureMono-Regular.otf` (version 1.500, SIL Open Font License 1.1). Share Tech Mono is at `asset-generator/assets/fonts/share-tech-mono/ShareTechMono-Regular.ttf`.

Plan:

1. Add both font files to the Watch Face Studio project so they are bundled into the watch face. Unverified: the exact mechanism (adding a custom font inside the tool, or installing the font in Windows first) and whether `.otf` is accepted.
2. Set the clock to 99 px and AM/PM to 22 px. Unverified: whether a Watch Face Studio font size of 99 equals 99 px on the 450×450 canvas.
3. Compare a screenshot with `asset-generator/dist/previews/production-preview.png`.

Both fonts may be bundled in a watch face under the OFL; see [LICENSING.md](LICENSING.md).

### Bitmap fonts

Watch Face Studio supports bitmap fonts, where an image is assigned to each digit and symbol. **The repository does not generate a production bitmap font.** What it generates today:

- Departure Mono as a font file, used through font outlines in the previews. This is the production direction.
- Three experimental bitmap numeral families under `dist/png/numerals/`. These are rejected as production numerals.

If Watch Face Studio cannot render Departure Mono pixel-exactly (anti-aliasing, or sizes that do not land on whole multiples of 11 px), the fallback is to generate Departure Mono digit bitmaps (`0`–`9`, colon, `AM`, `PM`) from the font with the generator and assign them as a bitmap font. That generator step **does not exist yet** and would need to be built and validated. A bitmap font also interacts with the no-leading-zero rule and with centring a variable-width time, which must be checked.

## The 60-second ring

Intent: at second *s*, exactly *s* segments are lit, clockwise from 12 o'clock, stepping once per second without a smooth sweep.

The assets are built for this. `seconds-ring-base.png` shows all 60 segments dimmed. `seconds-ring-active.png` shows the same 60 segments at full brightness with identical geometry. Segment *i* fills the cell starting at *i* × 6° from 12 o'clock, so revealing the active ring through an angle of `[SEC]` × 6° shows exactly `[SEC]` whole segments. A reveal that stops partway through a cell would cut a segment.

Unverified: how to reveal it. Candidates to try, in order:

1. A circular progress component using `seconds-ring-active.png`, driven by seconds.
2. A mask over `seconds-ring-active.png` whose sweep angle is `[SEC] * 6`.

Whichever is used, confirm that it steps in whole seconds rather than sweeping continuously, and that it starts at 12 o'clock and runs clockwise.

## The next-event complication

Intent: one line in the event strip showing the next calendar event, for example `14:30  SYSTEM REVIEW` (sample data).

Plan: a complication slot positioned over the event strip (x 65, y 228, 320×38), with the calendar's next-event provider as its default, text in Share Tech Mono 16 px starting at x = 87.

Unverified:

- Which complication type carries enough text (a long-text type is the likely candidate).
- Whether the next-event provider can be set as the default, and whether the wearer can change it.
- Whether the complication's text can use a custom font, size, colour and position.
- What the provider supplies: title only, or time and title.

Open: truncation, the empty state, and whether the `calendar` icon is used.

## The compass shortcut

Intent: tapping the compass icon opens the Compass app. Nothing else. No heading is shown ([D-015](DECISIONS.md#d-015-compass-is-a-shortcut-not-a-live-heading)).

Plan: place `compass.png` as an image and give it a tap action that opens an app.

Unverified:

- That a tap action can open a specific app, and that the Compass app on the target watch can be chosen.
- What happens on a watch without that app.
- That the tap target is large enough to hit reliably.

Open: the icon's position. The current layout has no place for it.

## Weather condition

`asset-generator/dist/weather-mapping.json` maps semantic labels to icons and contains no numeric values on purpose; the validator fails the build if any are added ([D-019](DECISIONS.md#d-019-numeric-watch-face-studio-weather-mapping-remains-unverified)).

**Documented, not verified.** Samsung's tag expression reference lists these `[WTHR_COND]` values. They are recorded here as a starting point for testing. They have not been checked against an installed Watch Face Studio version or a watch, and they must not be copied into `weather-mapping.json` until they have been.

| Documented value | Documented name | Matching label in `weather-mapping.json` | Icon |
| --- | --- | --- | --- |
| 0 | `UNKNOWN_VALUE` | `unknown` | `weather-unknown` |
| 1 | `CLEAR` | `clear` | `weather-clear` |
| 2 | `CLOUDY` | `cloudy` | `weather-cloudy` |
| 3 | `FOG` | `fog` | `weather-fog` |
| 4 | `HEAVY_RAIN` | `heavy-rain` | `weather-heavy-rain` |
| 5 | `HEAVY_SNOW` | `heavy-snow` | `weather-snow` |
| 6 | `RAIN` | `rain` | `weather-rain` |
| 7 | `SNOW` | `snow` | `weather-snow` |
| 8 | `SUNNY` | `sunny` | `weather-clear` |
| 9 | `THUNDERSTORM` | `thunderstorm` | `weather-storm` |
| 10 | `SLEET` | `sleet` | `weather-sleet` |
| 11 | `LIGHT_SNOW` | `light-snow` | `weather-snow` |
| 12 | `LIGHT_RAIN` | `light-rain` | `weather-rain` |
| 13 | `MIST` | `mist` | `weather-fog` |
| 14 | `PARTLY_CLOUDY` | `partly-cloudy` | `weather-partly-cloudy` |
| 15 | `WINDY` | none; the file has `wind` and `breezy` | `weather-wind` |

Notes:

- `WINDY` has no exact label in the mapping file. Adding one is a small source change in `asset-generator/src/icon-definitions.mjs`.
- `weather-clear` is a sun. Whether `CLEAR` at night should show a sun is unresolved; no night icon exists.
- When weather is unavailable, show `weather-unknown`.

To verify: confirm the list in the installed version, then observe real conditions on the watch over several days, or use the tool's preview controls if it offers weather simulation. Only then record the values in the source and change the validator deliberately.

## What must be tested on the physical watch

Nothing below has been tested.

- Legibility of the 99 px clock at arm's length, indoors and in sunlight
- Double-digit hours (`10:08`, `12:59`): 1 px of clearance per side to the clock brackets
- Departure Mono rendering: crisp, unsmoothed, correct size
- Hour without a leading zero, and the time staying centred as its width changes
- AM/PM switching at noon and midnight
- Date format, weekday and the amber dot
- Seconds ring: stepping, direction, start position, behaviour at the minute rollover
- Heart rate: updates, and what shows with no reading
- Battery percentage
- Weather: icon per condition, behaviour when weather is unavailable
- Rain probability
- Next event: real events, long titles, no events
- Compass shortcut: opens the Compass app; tap target size
- Weather icons at 28 px on the real display
- Grid and inactive ring brightness against the data
- Round-screen clipping at the edges, on each target watch size
- Always-on display
- Battery drain over a day

Target watch: Galaxy Watch9, SM-L350, Android 17 (API 37), recorded 2026-10-15.

## Known Watch Face Studio limitations

Known from Samsung's documentation:

- Weather tags are valid only when `[WTHR_IS_AVAIL]` is 1.
- `[WTHR_COND]` is a single number, so each of the 11 icons needs conditional display logic.

Expected, and to be confirmed (unverified):

- Text rendering is controlled by the watch, so pixel-exact Departure Mono is not guaranteed.
- Heart rate updates at an interval the watch decides, not continuously.
- Always-on display restricts update frequency and brightness; per-second updates are not expected there.
- Complication text styling may be limited.
- There is no live compass heading or location distance available to a watch face, which is why those features are excluded from Version 1 ([D-015](DECISIONS.md#d-015-compass-is-a-shortcut-not-a-live-heading), [D-016](DECISIONS.md#d-016-distance-from-home-excluded-from-version-1)).

Replace each expected item with a confirmed finding as it is tested.

## Checklist for the first .wfs project

Ticked on 2026-10-15. Ticked items were built; see the notes in [DESIGN-SPEC.md](DESIGN-SPEC.md#watch-face-studio-version-1-as-built) where the build differs from the item's wording (for example the clock size and the weather guard, which uses the Unknown condition rather than `[WTHR_IS_AVAIL]`).

Preparation

- [ ] Resolve the open questions in [DESIGN-SPEC.md](DESIGN-SPEC.md#open-design-questions), at least compass placement and the weather module
- [x] Install Watch Face Studio and record its version at the top of this file
- [x] Record the target watch model and Wear OS version
- [x] Run `npm ci` and `npm run build` in `asset-generator`; confirm all four validators pass

Project

- [x] Create a 450×450 project and save it as `watch-face/syswatch-01.wfs` (planned path; saved as `watch-face/Syswatch 01.wfs` because hyphens are rejected)
- [x] Check what Watch Face Studio writes beside the `.wfs` file and update `.gitignore` if it creates build output
- [ ] Add Departure Mono and Share Tech Mono

Static layers

- [ ] Import and place `background-grid.png`, `hud-frame.png`, `seconds-ring-base.png`

Dynamic components

- [x] Main clock: `[HOUR_1_12]:[MIN_Z]`, Departure Mono 99 px
- [x] AM/PM: `[AMPM]`, Departure Mono 22 px
- [x] Date in `DD/MM/YYYY` with weekday
- [x] Seconds ring from `[SEC]`
- [x] Heart rate: `heart.png` and `[HR]`
- [x] Battery: `battery.png` and `[BATT_PER]`
- [x] Weather icon from `[WTHR_COND]`, guarded by `[WTHR_IS_AVAIL]`
- [ ] Rain probability from `[WTHR_CHANCE_PPTN]`
- [x] Next-event complication
- [ ] Compass shortcut

Verification

- [ ] Mark each tag in this file as verified, with the Watch Face Studio version
- [ ] Compare a screenshot with `asset-generator/dist/previews/production-preview.png`
- [ ] Test in the Watch Face Studio preview at several times, including `10:08` and `12:59`
- [x] Update [ROADMAP.md](ROADMAP.md) and the status section of [../README.md](../README.md)
