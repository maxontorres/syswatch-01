// Icon geometry for Syswatch 01.
//
// All icons are drawn on a 64x64 canvas using a 2-unit grid. Stroke centres sit on
// even coordinates so the 4-unit stroke lands on whole pixels at 64, 32 and 16 px.
// Strokes inherit the primary cyan from the SVG root; amber marks the one "signal"
// element of an icon where it has one.

import { tokens, line, polyline, polygon, rect, filled, svgDocument } from './svg-helpers.mjs';

const { primary, accent } = tokens.color;
const amber = { stroke: accent };

// --- Shared weather parts -------------------------------------------------

const CLOUD = [
  [8, 36], [8, 28], [14, 22], [22, 22], [22, 16], [28, 10],
  [42, 10], [48, 16], [48, 22], [56, 30], [56, 36],
];

const cloud = (dx = 0, dy = 0) => polygon(CLOUD.map(([x, y]) => [x + dx, y + dy]));

/** Slanted rain streak starting at (x, y), falling `length` units. */
const rain = (x, y, length) => line(x, y, x - length / 2, y + length);

/** Frozen precipitation: a square-armed cross centred on (cx, cy). */
const flake = (cx, cy) => [line(cx - 4, cy, cx + 4, cy), line(cx, cy - 4, cx, cy + 4)];

// --- Icons ----------------------------------------------------------------

export const icons = [
  {
    name: 'calendar',
    category: 'interface',
    elements: [
      polygon([[8, 12], [56, 12], [56, 48], [48, 56], [8, 56]]),
      line(8, 24, 56, 24),
      line(20, 6, 20, 12),
      line(44, 6, 44, 12),
      rect(15, 31, 6, 6, filled(accent)),
      rect(29, 31, 6, 6, filled(primary)),
      rect(43, 31, 6, 6, filled(primary)),
      rect(15, 43, 6, 6, filled(primary)),
      rect(29, 43, 6, 6, filled(primary)),
    ],
  },
  {
    name: 'heart',
    category: 'interface',
    elements: [
      polygon([
        [32, 22], [24, 12], [14, 12], [8, 20], [8, 30],
        [32, 54], [56, 30], [56, 20], [50, 12], [40, 12],
      ]),
    ],
  },
  {
    name: 'battery',
    category: 'interface',
    elements: [
      rect(6, 20, 44, 24),
      rect(52, 26, 6, 12, filled(primary)),
      rect(12, 26, 8, 12, filled(primary)),
      rect(24, 26, 8, 12, filled(primary)),
      rect(36, 26, 8, 12, filled(primary)),
    ],
  },
  {
    // A fixed four-point rose, not a needle: it marks the Compass shortcut and
    // must not read as a live heading. North is the long, solid amber arm.
    name: 'compass',
    category: 'interface',
    elements: [
      polygon([
        [32, 8], [40, 24], [52, 32], [40, 40],
        [32, 52], [24, 40], [12, 32], [24, 24],
      ]),
      polygon([[32, 8], [40, 24], [24, 24]], { fill: accent, ...amber }),
    ],
  },
  {
    // Empty acquisition brackets with a three-cell "no data" readout.
    name: 'weather-unknown',
    category: 'weather',
    elements: [
      polyline([[10, 22], [10, 10], [22, 10]]),
      polyline([[42, 10], [54, 10], [54, 22]]),
      polyline([[54, 42], [54, 54], [42, 54]]),
      polyline([[22, 54], [10, 54], [10, 42]]),
      rect(17, 29, 6, 6, filled(primary)),
      rect(29, 29, 6, 6, filled(primary)),
      rect(41, 29, 6, 6, filled(primary)),
    ],
  },
  {
    name: 'weather-clear',
    category: 'weather',
    elements: [
      polygon(
        [[28, 22], [36, 22], [42, 28], [42, 36], [36, 42], [28, 42], [22, 36], [22, 28]],
        amber,
      ),
      line(32, 6, 32, 12, amber),
      line(32, 52, 32, 58, amber),
      line(6, 32, 12, 32, amber),
      line(52, 32, 58, 32, amber),
      line(47, 17, 51, 13, amber),
      line(47, 47, 51, 51, amber),
      line(17, 47, 13, 51, amber),
      line(17, 17, 13, 13, amber),
    ],
  },
  {
    name: 'weather-partly-cloudy',
    category: 'weather',
    elements: [
      polyline([[34, 20], [34, 18], [38, 14], [46, 14], [50, 18], [50, 26]], amber),
      line(42, 4, 42, 6, amber),
      line(56, 22, 58, 22, amber),
      line(53, 11, 55, 9, amber),
      line(31, 11, 29, 9, amber),
      cloud(-4, 16),
    ],
  },
  {
    name: 'weather-cloudy',
    category: 'weather',
    elements: [
      polyline([[30, 16], [34, 12], [46, 12], [52, 18], [52, 22], [58, 28], [58, 34]]),
      cloud(-4, 14),
    ],
  },
  {
    name: 'weather-fog',
    category: 'weather',
    elements: [
      cloud(0, -4),
      line(8, 42, 34, 42),
      line(44, 42, 56, 42),
      line(8, 52, 18, 52),
      line(28, 52, 56, 52),
    ],
  },
  {
    name: 'weather-rain',
    category: 'weather',
    elements: [cloud(0, -4), rain(22, 42, 8), rain(36, 42, 8), rain(50, 42, 8)],
  },
  {
    name: 'weather-heavy-rain',
    category: 'weather',
    elements: [
      cloud(0, -4),
      rain(18, 40, 18),
      rain(30, 40, 18),
      rain(42, 40, 18),
      rain(54, 40, 18),
    ],
  },
  {
    name: 'weather-snow',
    category: 'weather',
    elements: [cloud(0, -4), ...flake(16, 46), ...flake(32, 54), ...flake(48, 46)],
  },
  {
    name: 'weather-storm',
    category: 'weather',
    elements: [
      cloud(0, -6),
      polygon(
        [[32, 36], [42, 36], [36, 44], [44, 44], [26, 60], [30, 50], [22, 50]],
        filled(accent),
      ),
    ],
  },
  {
    name: 'weather-sleet',
    category: 'weather',
    elements: [
      cloud(0, -4),
      rain(20, 42, 10),
      ...flake(32, 48),
      rain(50, 42, 10),
    ],
  },
  {
    name: 'weather-wind',
    category: 'weather',
    elements: [
      polyline([[8, 26], [36, 26], [42, 20], [36, 14], [30, 14]]),
      polyline([[8, 38], [48, 38], [54, 44], [48, 50], [42, 50]]),
      line(8, 50, 28, 50),
    ],
  },
];

export function renderIconSvg(icon) {
  return svgDocument(
    tokens.icon.size,
    {
      stroke: primary,
      'stroke-width': tokens.icon.strokeWidth,
      'stroke-linecap': tokens.stroke.linecap,
      'stroke-linejoin': tokens.stroke.linejoin,
    },
    icon.elements,
  );
}

// --- Weather mapping ------------------------------------------------------

// Semantic labels only. Numeric Watch Face Studio condition values are
// deliberately absent: they must be read from the installed WFS version.
export const weatherMapping = {
  description:
    'Maps semantic weather labels to the consolidated Syswatch 01 weather icon names.',
  wfsNumericMapping: {
    status: 'unverified',
    values: null,
    note:
      'Numeric Watch Face Studio weather-condition values are intentionally not included. ' +
      'They must be verified against the installed Watch Face Studio version before ' +
      'integration; do not infer them from this file.',
  },
  fallback: 'weather-unknown',
  labels: {
    'breezy': 'weather-wind',
    'clear': 'weather-clear',
    'cloudy': 'weather-cloudy',
    'drizzle': 'weather-rain',
    'fog': 'weather-fog',
    'freezing-rain': 'weather-sleet',
    'haze': 'weather-fog',
    'heavy-rain': 'weather-heavy-rain',
    'heavy-snow': 'weather-snow',
    'light-rain': 'weather-rain',
    'light-snow': 'weather-snow',
    'mist': 'weather-fog',
    'mostly-clear': 'weather-partly-cloudy',
    'mostly-cloudy': 'weather-cloudy',
    'overcast': 'weather-cloudy',
    'partly-cloudy': 'weather-partly-cloudy',
    'rain': 'weather-rain',
    'showers': 'weather-rain',
    'sleet': 'weather-sleet',
    'snow': 'weather-snow',
    'storm': 'weather-storm',
    'sunny': 'weather-clear',
    'thunderstorm': 'weather-storm',
    'unknown': 'weather-unknown',
    'wind': 'weather-wind',
  },
};
