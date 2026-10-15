# Watch Face Studio project

`Syswatch 01.wfs` is the Version 1 Watch Face Studio project. It was built in Watch Face Studio 1.9.9 and installed on a Galaxy Watch9 (SM-L350, Android 17, API 37, as reported by `adb shell getprop`) on 2026-10-15.

Watch Face Studio does not accept hyphens in project file names, so the file is named `Syswatch 01.wfs` rather than the planned `syswatch-01.wfs`.

| File | What |
| --- | --- |
| `Syswatch 01.wfs` | The project: a zip holding `honeyface.json` (layers and settings), the imported PNGs and the bundled Departure Mono font. Edit it only in Watch Face Studio. |
| `captures/v1-normal-galaxy-watch9.png` | Screen capture from the watch after the first Version 1 install (live data, 4:04 PM). |

Watch Face Studio writes build output to a `build/` folder beside the project when it runs on a device. `build/` is ignored by `.gitignore`.

## Open, preview and deploy

1. Open `Syswatch 01.wfs` in Watch Face Studio (File → Open Project).
2. Inspect the **Normal** and **Always-On** tabs in the layer panel.
3. Enable wireless debugging on the watch and connect it with adb (`adb pair <ip>:<pairing-port>`, then `adb connect <ip>:<port>`). `adb devices` must list it as `device`.
4. Click **Run on Device** and pick the watch. Watch Face Studio runs an always-on check first, then reports "Launch Complete".
5. Do not run other adb commands while Watch Face Studio is installing. A second adb client can drop the connection and the install fails with `device offline`.

To capture the watch screen: `adb exec-out screencap -p > capture.png`. This works for normal mode only. In ambient (dozing) mode it returns a black image.

## Layer structure

Top of the list is drawn on top. All coordinates are canvas pixels on the 450×450 canvas.

| Layer | Type | Position, size | Normal | Always-on | Notes |
| --- | --- | --- | --- | --- | --- |
| `TIME_PERIOD_AOD` | Text `[AMPM]` | 331, 185 · 45×26 | hidden | shown | Departure Mono 18, `#087DA6` |
| `DATE_AOD` | Text | 80, 61 · 295×28 | hidden | shown | Copy of `DATE` in `#087DA6` |
| `TIME_AOD` | Digital clock | 80, 106 · 295×100 | hidden | shown | Copy of `TIME` in `#087DA6`, colon not blinking |
| `WX_MODULE` | Group | 283, 297 · 78×35 | shown | hidden | Tap opens `com.samsung.android.watch.weather` |
| ├ `WX_ICON_*` (11 layers) | Image 28×28 | 0, 3 in group | by condition | — | Weather condition timeline, see below |
| ├ `WX_LABEL` | Text `TEMP` | 34, 0 · 44×14 | shown | — | Departure Mono 11, `#087DA6` |
| └ `WX_TEMP` | Text `[WTHR_TEM]°` | 34, 15 · 44×20 | shown | — | Departure Mono 16, `#79EEFF` |
| `BATT_MODULE` | Group | 187, 297 · 78×35 | shown | hidden | Tap opens Battery status |
| ├ `BATT_VALUE_LOW` | Text `[BATT_PER]%` | 34, 15 · 44×20 | battery 0–15 % | — | Amber `#FFB347` |
| ├ `BATT_LABEL` | Text `BATT` | 34, 0 · 44×14 | shown | — | |
| ├ `BATT_VALUE` | Text `[BATT_PER]%` | 34, 15 · 44×20 | battery 16–100 % | — | `#79EEFF` |
| └ `BATT_ICON` | Image `battery.png` | 0, 3 · 28×28 | shown | — | |
| `HR_MODULE` | Group | 91, 297 · 78×35 | shown | hidden | Tap opens Heart rate (Samsung Health) |
| ├ `HR_LABEL` | Text `HR` | 34, 0 · 44×14 | shown | — | |
| ├ `HR_VALUE` | Text `[HR]` | 34, 15 · 44×20 | shown | — | |
| └ `HR_ICON` | Image `heart.png` | 0, 3 · 28×28 | shown | — | |
| `EVENT_ICON_COVER` | Rectangle | 105, 234 · 64×26 | hidden | hidden | Obsolete experiment, kept hidden, not deleted |
| `NEXT_EVENT` | Complication, fixed, Next event, Long text "Image + Long Text" | 83, 233 · 290×28 | shown | hidden | |
| ├ `Image` | Complication small image | 2, 3 · 22×22 | | | The system calendar icon, square |
| └ `Long Text` | Complication text | 30, 4 · 258×20 | | | Departure Mono 16, `#79EEFF`, left-aligned, ellipsis when too long |
| `SECONDS_RING` | Circular progress bar `[SEC]` 0–59 | 1, 1 · 448×448 | shown | hidden | `#79EEFF`, 12 % background, 4 px, clockwise from 12 o'clock |
| `DATE` | Text | 80, 61 · 295×28 | shown | hidden | Departure Mono 18, `#79EEFF` |
| `TIME_PERIOD` | Text `[AMPM]` | 331, 185 · 45×26 | shown | hidden | |
| `TIME` | Digital clock, 12 h, no leading zero | 80, 106 · 295×100 | shown | hidden | Departure Mono, `#79EEFF`, blinking colon |
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
