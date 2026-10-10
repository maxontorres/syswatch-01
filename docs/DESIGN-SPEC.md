# Syswatch 01 design specification

The canonical visual and behavioural specification for Syswatch 01. Locked decisions and their rationale are in [DECISIONS.md](DECISIONS.md); if this file and the code disagree, the discrepancy is a bug to raise, not to resolve silently.

Every measurement here was read from `asset-generator/design-tokens.json` and `asset-generator/src/`, or computed from them on 2026-10-10. The reference render is `asset-generator/dist/previews/production-preview.png`.

**Scope of what exists.** This specification is realised only as generated images. Nothing here has been built in Watch Face Studio or seen on a watch. All text and numbers shown on preview faces are sample data.

## Canvas

- Design canvas: **450×450 px** (`watchFace.size`).
- The watch is round. Everything except the background grid stays inside the circle inscribed in the canvas; previews clip to that circle.
- Coordinates below are in canvas pixels, origin top-left, centre at (225, 225).

## Visual hierarchy

Brightest and largest first. Any change must preserve this order.

1. Time
2. Date
3. Next event
4. Heart rate, battery and weather
5. Grid and decorative HUD

## Layout

Content areas, from `layout` in `asset-generator/src/structural-definitions.mjs`:

| Area | x | y | Width | Height |
| --- | --- | --- | --- | --- |
| Clock | 75 | 100 | 300 | 112 |
| Next-event strip | 65 | 228 | 320 | 38 |
| Data module 1 (heart rate) | 87 | 284 | 84 | 60 |
| Data module 2 (battery) | 183 | 284 | 84 | 60 |
| Data module 3 (weather / rain) | 279 | 284 | 84 | 60 |

Layer order, bottom to top: `background-grid`, `hud-frame`, `seconds-ring-base`, active ring segments, clock and AM/PM, interface text, icons.

There is no area for the compass shortcut. See [Open design questions](#open-design-questions).

### Clock

| Property | Value |
| --- | --- |
| Font | Departure Mono Regular |
| Size | 99 px = 9× the 11 px design size (`typography.clock.size`) |
| Tracking | 0 (`typography.clock.tracking`) |
| Colour | Primary cyan `#79EEFF` |
| Baseline | y = 192 |
| Digit | 45 px wide, 72 px tall, on a 63 px advance |
| Horizontal position | Ink centred on the face |
| Vertical position | Capitals centred in the clock area |
| Rendering | Whole-pixel glyph origins, uniform scale, no anti-aliasing |

12-hour format, no leading zero on the hour, minutes always two digits.

| Example | Hour digits | Ink width at 99 px | Clearance to the frame, per side |
| --- | --- | --- | --- |
| `6:42` | 1 | 234 px | 33 px |
| `10:08` | 2 | 297 px | 1 px |
| `12:59` | 2 | 297 px | 1 px |

Double-digit hours fit the 300 px clock area with 1 px to spare per side at tracking 0. This was accepted when 99 px was chosen ([D-012](DECISIONS.md#d-012-clock-size-99-px-default-tracking)); it must be checked on the watch. 110 px overruns the frame by 15 px per side at default tracking.

Because the hour has no leading zero, the clock's width changes between one-digit and two-digit hours and it must stay centred.

### AM/PM

| Property | Value |
| --- | --- |
| Font | Departure Mono Regular |
| Size | 22 px = 2× the design size (`typography.clock.meridiemSize`) |
| Colour | Primary cyan |
| Baseline | y = 94, that is 6 px above the clock area |
| Horizontal position | Right-aligned, ink ending 8 px inside the clock area's right edge (x = 367) |

### Date

| Property | Value |
| --- | --- |
| Format | Uppercase three-letter weekday, space, middle dot, space, `DD/MM/YYYY` |
| Example | `SAT · 10/10/2026` (sample data) |
| Font | Share Tech Mono Regular |
| Size | 20 px (`typography.interface.dateSize`) |
| Tracking | 1 px (`dateTracking`) |
| Colour | Primary cyan; the middle dot alone is amber `#FFB347` |
| Baseline | y = 217 |
| Horizontal position | Ink centred on the face |
| Vertical position | Capitals midway between the clock baseline and the top of the event strip: 11 px clear above, 11 px below |

Day and month are always two digits. Weekday abbreviations: `SUN MON TUE WED THU FRI SAT`.

### Event panel

| Property | Value |
| --- | --- |
| Shape | 320×38 strip, 12 px chamfer on the top-right and bottom-left corners, secondary cyan outline |
| Marker | Amber bar, 4×22 px, at x = 73, y = 236 |
| Text | Share Tech Mono Regular, 16 px, tracking 1 px, primary cyan |
| Text position | Left-aligned, first glyph at x = 87, baseline y = 253 |
| Sample | `14:30  SYSTEM REVIEW` (sample data) |

Not specified yet: maximum text length, truncation, the format of the event time, and what shows when there is no upcoming event.

### Bottom data modules

Three 84×60 modules, 12 px apart, top edge at y = 284. Each has a secondary cyan outline with primary cyan corner brackets (14 px arms) at top-left and bottom-right.

Content of each module, centred as a block: a 28 px icon, a 6 px gap, then a label above a value.

| Module | Icon | Label | Sample value |
| --- | --- | --- | --- |
| 1 | `heart` | `HR` | `072` |
| 2 | `battery` | `BATT` | `84%` |
| 3 | `weather-rain` | `RAIN` | `18%` |

| Text | Size | Colour | Baseline |
| --- | --- | --- | --- |
| Label | 12 px (`moduleLabelSize`) | Secondary cyan `#087DA6` | y = 310 |
| Value | 16 px (`moduleValueSize`) | Primary cyan | y = 327 |

Values are sample data. The heart-rate sample is zero-padded to three digits; whether the watch can pad it is unverified.

### Seconds ring

| Property | Value |
| --- | --- |
| Segments | 60 (`secondsRing.segments`) |
| Radii | Inner 208 px, outer 220 px, centred on (225, 225) |
| Gap | 1.8° between segments (`gapDegrees`) |
| Inactive | Secondary cyan at 48% opacity (`inactiveOpacity`), asset `seconds-ring-base` |
| Active | Full primary cyan, asset `seconds-ring-active` |

Segment *i* fills the 6° cell that starts at *i* × 6° clockwise from 12 o'clock. A clockwise sweep to *s* × 6° therefore reveals exactly *s* whole segments: at second 0 none are lit, at second 59 fifty-nine are.

The inactive ring is capped at 48% opacity so it stays behind the clock in the hierarchy; the validator enforces the cap.

### HUD frame and grid

- Clock corner brackets: four L-shapes with 22 px arms, primary cyan.
- Cardinal ticks from 34 to 50 px inside each edge: 12 o'clock in primary cyan; 3, 6 and 9 o'clock in secondary cyan.
- Grid: 1 px lines every 25 px starting at x, y = 12 (`grid.pitch`, `grid.offset`), which makes the grid mirror-symmetric. Every third line is major. Minor lines are secondary cyan at 16% opacity, major at 32%, with primary cyan cross marks at 40% on major intersections.

## Color palette

| Token | Value | Role |
| --- | --- | --- |
| `color.background` | `#02070D` | Background |
| `color.primary` | `#79EEFF` | Clock, date, event text, values, icons, active ring, bright brackets |
| `color.secondary` | `#087DA6` | Grid, frame outlines, module labels, inactive ring |
| `color.accent` | `#FFB347` | Amber signals only |

Amber is used for exactly these elements: the date's middle dot, the event strip marker, and one "signal" part of an icon (compass north, the calendar's "today" cell, the sun, lightning). Do not add amber elsewhere without a decision.

Colours come from `design-tokens.json`. Never hard-code a colour in a definition.

## Stroke rules

- Structural assets: 2 px stroke (`stroke.width`).
- Icons: 4-unit stroke on the 64-unit canvas (`icon.strokeWidth`).
- Square line caps, miter joins (`stroke.linecap`, `stroke.linejoin`).
- Angles are 45° or 90° wherever possible. No soft curves.
- Axis-aligned shapes get `shape-rendering="crispEdges"` automatically; diagonals stay anti-aliased.
- No text, embedded rasters, filters, blur, gradients or shadows in any production SVG. The validator enforces this.

## Icon rules

- `viewBox="0 0 64 64"`, transparent background, exported at 64×64.
- Geometry on a 2-unit grid; stroke centres on even coordinates so strokes land on whole pixels at 64, 32 and 16 px.
- Keep geometry within 4–60 so strokes do not clip.
- No decorative enclosing square unless the object is one (calendar, battery).
- Primary cyan throughout, with at most one amber signal element.
- Weather icons must stay distinguishable at 24×24. They are shown at 28 px on the face (`moduleIconSize`).
- The compass is a fixed four-point rose with a solid amber north arm. It must not read as a live needle.
- The battery icon is static: it always shows three cells and does not reflect the charge level.

The 11 weather states and the labels that map to them are listed in `asset-generator/dist/weather-mapping.json`.

## Typography rules

| Element | Font | Size | Tracking |
| --- | --- | --- | --- |
| Main clock | Departure Mono Regular | 99 px | 0 |
| AM/PM | Departure Mono Regular | 22 px | 0 |
| Date | Share Tech Mono Regular | 20 px | 1 px |
| Next event | Share Tech Mono Regular | 16 px | 1 px |
| Module value | Share Tech Mono Regular | 16 px | 0 |
| Module label | Share Tech Mono Regular | 12 px | 0 |

- Departure Mono sets the clock numerals, the colon and AM/PM. Nothing else.
- Share Tech Mono sets everything else.
- Departure Mono only at whole multiples of 11 px, at whole-pixel positions, never scaled unevenly, never smoothed, never redrawn. Its tracking may be tightened in whole pixels but never widened.
- Every glyph origin and baseline is a whole pixel.
- Numerals are tabular: both fonts are monospaced, and Departure Mono also carries an OpenType `tnum` feature.
- All interface text is uppercase.

`typography.interface.moduleSize` (15 px) is used only by the clock font comparison faces, not by the production face.

## Spacing rules

- Date: at least 10 px clear of the clock above and the event strip below, with the two gaps equal to within 1 px. Currently 11 and 11.
- Date and clock: centred on the face to within 0.5 px.
- Clock: must not overrun the clock area horizontally.
- Module gap: 12 px between modules; 6 px between icon and text; 6 px between label and value lines.
- Event text starts 22 px inside the strip's left edge, clear of the amber marker.

The first three rules are enforced by `npm run validate:production`.

## Readability requirements

- The time must be readable at a glance and dominate the face.
- Weather icons must be distinguishable at 24×24.
- Decoration (grid, inactive ring, frame outlines) must never compete with data; that is why it uses secondary cyan and reduced opacity.
- No effect may reduce legibility: no glow, blur or gradient.

These have been judged on a desktop screen at 1:1 only. **Legibility at the physical size of a watch, outdoors and at arm's length is untested.**

## Ambient / always-on display

**Pending. Not designed.** No always-on layout, asset or token exists in the repository.

Considerations to resolve when it is designed (none of these is a decision):

- Which elements remain: likely time, possibly date; the seconds ring cannot update every second in ambient mode.
- Reducing lit pixels: the grid, inactive ring and frame outlines are candidates for removal.
- Burn-in protection on OLED and whether outlined or thinner numerals are needed.
- Whether Departure Mono at 99 px is acceptable as-is in ambient mode.
- Battery impact, measured on the watch.

## Open design questions

These are unresolved in the repository. Do not answer them by assumption; raise them with the project owner and record the outcome in [DECISIONS.md](DECISIONS.md).

1. **Compass shortcut placement.** The `compass` icon exists, but the layout has three modules (heart rate, battery, weather) and no fourth position.
2. **Weather module content.** The module shows a weather icon with the label `RAIN` and the rain probability. Whether the icon follows the current condition while the label stays `RAIN`, or whether weather and rain should be separate, is not specified.
3. **Calendar icon.** It exists but no composed face uses it; the event strip uses an amber bar.
4. **Event strip details.** Maximum length, truncation, event time format, empty state.
5. **Heart-rate formatting.** Zero-padded (`072`) or not, and what shows when no reading is available.
6. **Double-digit hours.** Confirm the 1 px clearance at 99 px on the watch, and add a double-digit sample to the production preview.
7. **Always-on display.** See above.
8. **Stale sample.** The clock font comparison faces show `18°` beside a partly-cloudy icon. Temperature is not a Version 1 feature.
