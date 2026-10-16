# Watch Face Studio project

`Syswatch 01.wfs` is the Version 1 Watch Face Studio project. It was built in Watch Face Studio 1.9.9 and installed on a Galaxy Watch9 (SM-L350, Android 17, API 37, as reported by `adb shell getprop`) on 2026-10-15.

Watch Face Studio does not accept hyphens in project file names, so the file is named `Syswatch 01.wfs` rather than the planned `syswatch-01.wfs`.

| File | What |
| --- | --- |
| `Syswatch 01.wfs` | The project: a zip holding `honeyface.json` (layers and settings), the imported PNGs and the bundled Departure Mono font. Edit it only in Watch Face Studio. |
| `captures/v1-normal-galaxy-watch9.png` | Screen capture from the watch after the first Version 1 install (live data, 4:04 PM). |
| `captures/v1-battery-15-amber.png`, `captures/v1-battery-16-cyan.png` | Battery forced to 15 % and 16 % with `dumpsys battery set level`: amber and cyan (old module layout). |
| `captures/v1-hour-10.png`, `captures/v1-hour-12.png` | Double-digit hours, by switching the time zone (old module layout, before the centring fix). |
| `captures/v1-segmented-ring.png` | The segmented seconds ring on the watch (40 of 60 segments lit). |
| `captures/v1-modules-22px.png` | After the 2026-10-15 update: stacked modules with 22 px values, clock and date centred. |

Watch Face Studio writes build output to a `build/` folder beside the project when it runs on a device. `build/` is ignored by `.gitignore`.

## Open, preview and deploy

1. Open `Syswatch 01.wfs` in Watch Face Studio (File → Open Project).
2. Inspect the **Normal** and **Always-On** tabs in the layer panel.
3. Enable wireless debugging on the watch and connect it with adb (`adb pair <ip>:<pairing-port>`, then `adb connect <ip>:<port>`). `adb devices` must list it as `device`.
4. Click **Run on Device** and pick the watch. Watch Face Studio runs an always-on check first, then reports "Launch Complete".
5. Do not run other adb commands while Watch Face Studio is installing. A second adb client can drop the connection and the install fails with `device offline`.

To capture the watch screen: `adb exec-out screencap -p > capture.png`. This works for normal mode only. In ambient (dozing) mode it returns a black image.

## Layer structure

Top of the list is drawn on top. All coordinates are canvas pixels on the 450×450 canvas; positions inside a group are relative to the group (the Watch Face Studio properties panel shows them as canvas positions).

The clock and date boxes are 290 px wide at x 80 so they centre on x 225. Until 2026-10-15 they were 295 px wide, which put both about 2.5 px right of centre.

| Layer | Type | Position, size | Normal | Always-on | Notes |
| --- | --- | --- | --- | --- | --- |
| `SECONDS_RING_MASK` | Mask | 0, 0 · 450×450 | shown | hidden | `RING_ACTIVE` masked by a copy of the progress ring: circular progress bar `[SEC]` 0–59, thickness 16, flat cap, background 0 %. Reveals one whole segment per second |
| ├ (mask) | Circular progress bar | 1, 1 · 448×448 | | | Copy of `SECONDS_RING` with the settings above |
| └ `RING_ACTIVE` | Image `seconds-ring-active.png` | 0, 0 · 450×450 | | | |
| `RING_BASE` | Image `seconds-ring-base.png` | 0, 0 · 450×450 | shown | hidden | The 60 dim segments, always visible |
| `TIME_PERIOD_AOD` | Text `[AMPM]` | 331, 185 · 45×26 | hidden | shown | Departure Mono 18, `#087DA6` |
| `DATE_AOD` | Text | 80, 61 · 290×28 | hidden | shown | Copy of `DATE` in `#087DA6` |
| `TIME_AOD` | Digital clock | 80, 106 · 290×100 | hidden | shown | Copy of `TIME` in `#087DA6`, colon not blinking |
| `WX_MODULE` | Group | 283, 288 · 76×52 | shown | hidden | Tap opens `com.samsung.android.watch.weather` |
| ├ `WX_ICON_*` (11 layers) | Image 22×22 | 0, 0 in group | by condition | — | Weather condition timeline, see below |
| ├ `WX_LABEL` | Text `TEMP` | 26, 4 · 50×14 | shown | — | Departure Mono 11, `#087DA6`, left-aligned |
| └ `WX_TEMP` | Text `[WTHR_TEM]°` | 2, 24 · 74×28 | shown | — | Departure Mono 22, `#79EEFF`, left-aligned |
| `BATT_MODULE` | Group | 187, 288 · 76×52 | shown | hidden | Tap opens Battery status |
| ├ `BATT_VALUE_LOW` | Text `[BATT_PER]%` | 2, 24 · 74×28 | battery 0–15 % | — | Departure Mono 22, amber `#FFB347` |
| ├ `BATT_LABEL` | Text `BATT` | 26, 4 · 50×14 | shown | — | |
| ├ `BATT_VALUE` | Text `[BATT_PER]%` | 2, 24 · 74×28 | battery 16–100 % | — | Departure Mono 22, `#79EEFF` |
| └ `BATT_ICON` | Image `battery.png` | 0, 0 · 22×22 | shown | — | |
| `HR_MODULE` | Group | 91, 288 · 76×52 | shown | hidden | Tap opens Heart rate (Samsung Health) |
| ├ `HR_LABEL` | Text `HR` | 26, 4 · 50×14 | shown | — | |
| ├ `HR_VALUE` | Text `[HR]` | 2, 24 · 74×28 | shown | — | Departure Mono 22 |
| └ `HR_ICON` | Image `heart.png` | 0, 0 · 22×22 | shown | — | |
| `EVENT_ICON_COVER` | Rectangle | 105, 234 · 64×26 | hidden | hidden | Obsolete experiment, kept hidden, not deleted |
| `NEXT_EVENT` | Complication, fixed, Next event, Long text "Image + Long Text" | 83, 233 · 290×28 | shown | hidden | |
| ├ `Image` | Complication small image | 2, 3 · 22×22 | | | The system calendar icon, square |
| └ `Long Text` | Complication text | 30, 4 · 258×20 | | | Departure Mono 16, `#79EEFF`, left-aligned, ellipsis when too long |
| `SECONDS_RING` | Circular progress bar `[SEC]` 0–59 | 1, 1 · 448×448 | hidden | hidden | The original smooth 4 px ring, kept hidden as a fallback. To return to it, show it and hide `SECONDS_RING_MASK` and `RING_BASE` |
| `DATE` | Text | 80, 61 · 290×28 | shown | hidden | Departure Mono 18, `#79EEFF` |
| `TIME_PERIOD` | Text `[AMPM]` | 331, 185 · 45×26 | shown | hidden | |
| `TIME` | Digital clock, 12 h, no leading zero | 80, 106 · 290×100 | shown | hidden | Departure Mono, `#79EEFF`, blinking colon |
| `HUD_FRAME` | Image `hud-frame.png` | 0, 0 · 450×450 | shown | hidden | |
| `BG_GRID` | Image `background-grid.png` | 0, 0 · 450×450 | shown | hidden | |

Normal canvas background: `#02070D`. Always-on canvas background: `#000000`.

### Weather condition mapping

Each `WX_ICON_*` layer uses the Watch Face Studio weather condition timeline. Its columns, in order, are the `[WTHR_COND]` values 0–15 that the project stores:

| Value | Watch Face Studio column | Layer | Icon |
| --- | --- | --- | --- |
| 0 | Unknown | `WX_ICON_UNKNOWN` | `weather-unknown` |
| 1 | Clear | `WX_ICON_CLEAR` | `weather-clear` |
| 2 | Cloudy | `WX_ICON_CLOUDY` | `weather-cloudy` |
| 3 | Fog | `WX_ICON_FOG` | `weather-fog` |
| 4 | Heavy Rain | `WX_ICON_HEAVY_RAIN` | `weather-heavy-rain` |
| 5 | Heavy Snow | `WX_ICON_SNOW` | `weather-snow` |
| 6 | Rain | `WX_ICON_RAIN` | `weather-rain` |
| 7 | Snow | `WX_ICON_SNOW` | `weather-snow` |
| 8 | Sunny | `WX_ICON_CLEAR` | `weather-clear` |
| 9 | Thunder Storm | `WX_ICON_STORM` | `weather-storm` |
| 10 | Sleet | `WX_ICON_SLEET` | `weather-sleet` |
| 11 | Light Snow | `WX_ICON_SNOW` | `weather-snow` |
| 12 | Light Rain | `WX_ICON_RAIN` | `weather-rain` |
| 13 | Mist | `WX_ICON_FOG` | `weather-fog` |
| 14 | Partly Cloudy | `WX_ICON_PARTLY_CLOUDY` | `weather-partly-cloudy` |
| 15 | Windy | `WX_ICON_WIND` | `weather-wind` |

The Watch Face Studio editor does not preview weather conditions: it draws all 11 icons on top of each other. Switching has been seen on the watch only for the condition that was current at install time (partly cloudy).

## Editing tips

- Colours are shared between Normal and Always-on. To make a layer look different in always-on mode, duplicate it, hide the copy in Normal and the original in Always-on (as `*_AOD` does).
- In the battery and weather timelines, double-clicking a layer row that has no condition yet gives it a full-range bar. Trim it by dragging the bar's end handle, which only responds when grabbed exactly. On a row that already has weather cells, double-clicking an empty cell adds just that cell. The view scrolls one column after each double-click, so look again before the next click.
- Use **Swap Media** in a layer's context menu to replace an image and keep its size, position and conditions.

## Release build

Release 1.0.0 was built on 2026-10-16 with Publish (type AAB+APK) to `C:\Dev\wear-os\builds\syswatch-01\`, outside the repository:

| Setting | Value |
| --- | --- |
| Package | `io.github.maxontorres.syswatch01` |
| Version name / code | 1.0.0 / 10000001 (Watch Face Studio prefixes the entered code `1`) |
| Min SDK | 34 |
| Watch type | Digital |
| Preview image | `watch-face/store/preview-450.png` (the current capture, resized to 450×450) |
| Signing key | Owner's keystore in `C:\Users\maxon\WatchFaceStudio\keystore\`, alias `key0`. Never commit it; `.gitignore` excludes `*.jks`, `*.keystore` and `*.p12`. Every future release must use the same key. |

The APK is attached to the GitHub Release; it is not committed. Installation for users: [INSTALL.md](../INSTALL.md).
