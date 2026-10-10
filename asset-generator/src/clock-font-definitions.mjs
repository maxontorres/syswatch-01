// Clock font comparison: complete 450x450 watch faces with the main clock set in
// Departure Mono at each candidate size and tracking, and everything else in Share
// Tech Mono. These are evaluation renders, not production assets.
//
// Departure Mono is drawn from its unaltered outlines at whole multiples of its
// 11 px design size, with one uniform scale, whole-pixel glyph origins and
// anti-aliasing switched off, so every design pixel becomes an exact square block.

import { tokens, group, polygon, svgDocument } from './svg-helpers.mjs';
import { icons } from './icon-definitions.mjs';
import { layout, ringSegments, structuralAssets } from './structural-definitions.mjs';
import { fontById, layoutText, loadFont, shiftText, textPaths } from './font-definitions.mjs';
import { dateRun } from './date-definitions.mjs';

const { primary } = tokens.color;
const SIZE = tokens.watchFace.size;
const clockType = tokens.typography.clock;
const interfaceType = tokens.typography.interface;

export const CLOCK_FONT = clockType.font;
export const INTERFACE_FONT = interfaceType.font;
export const CLOCK_SIZES = clockType.comparisonSizes;
export const TRACKING_STEPS = clockType.trackingSteps;
export const SAMPLE_TIMES = [
  { time: '10:08', meridiem: 'PM' },
  { time: '6:42', meridiem: 'AM' },
  { time: '12:59', meridiem: 'PM' },
];
/** Seconds shown by the active ring in every comparison face. */
export const SAMPLE_SECONDS = 30;

// Sample content for the comparison only; none of it is a production asset.
export const EVENT_SAMPLE = '14:30  SYSTEM REVIEW';
const MODULE_SAMPLES = [
  ['heart', '072'],
  ['battery', '84%'],
  ['weather-partly-cloudy', '18°'],
];

/** Device pixels per Departure Mono design pixel at a font size. */
export const pixelScale = (size) => size / fontById(CLOCK_FONT).pixelsPerEm;

/** Tracking in whole device pixels for a step given in design pixels. */
export const trackingPx = (size, step) => Math.round(step * pixelScale(size));

const capHeight = (fontId, size) => {
  const font = loadFont(fontId);
  return (font.tables.os2.sCapHeight * size) / font.unitsPerEm;
};

/** Baseline that centres the capitals of a font vertically in an area. */
export const centredBaseline = (area, fontId, size) =>
  area.y + Math.round((area.height + capHeight(fontId, size)) / 2);

// --- Clock ----------------------------------------------------------------

/** The time, with its ink centred on the face and its capitals centred in the clock area. */
export function clockRun(time, size, tracking) {
  const run = layoutText(CLOCK_FONT, time, {
    size,
    x: 0,
    baseline: centredBaseline(layout.clock, CLOCK_FONT, size),
    tracking,
  });
  return shiftText(run, Math.floor((SIZE - (run.inkRight - run.inkLeft)) / 2 - run.inkLeft));
}

/** AM/PM above the clock area, right-aligned 8 px inside its right edge. */
export function meridiemRun(meridiem) {
  const run = layoutText(CLOCK_FONT, meridiem, {
    size: clockType.meridiemSize,
    x: 0,
    baseline: layout.clock.y - 6,
  });
  return shiftText(run, layout.clock.x + layout.clock.width - 8 - run.inkRight);
}

// --- Interface text -------------------------------------------------------

export function eventRun() {
  return layoutText(INTERFACE_FONT, EVENT_SAMPLE, {
    size: interfaceType.eventSize,
    x: layout.event.x + 22,
    baseline: centredBaseline(layout.event, INTERFACE_FONT, interfaceType.eventSize),
    tracking: interfaceType.eventTracking,
  });
}

/** Icon and value of one data module, centred as a pair. */
function moduleContent(area, [iconName, value]) {
  const { moduleSize, moduleIconSize, moduleGap } = interfaceType;
  const font = loadFont(INTERFACE_FONT);
  const textWidth = Math.round(([...value].length * font.charToGlyph('0').advanceWidth * moduleSize) / font.unitsPerEm);
  const left = area.x + Math.floor((area.width - (moduleIconSize + moduleGap + textWidth)) / 2);
  const run = layoutText(INTERFACE_FONT, value, {
    size: moduleSize,
    x: left + moduleIconSize + moduleGap,
    baseline: centredBaseline(area, INTERFACE_FONT, moduleSize),
  });
  const iconY = area.y + (area.height - moduleIconSize) / 2;
  const icon = group(
    {
      transform: `translate(${left} ${iconY}) scale(${moduleIconSize / tokens.icon.size})`,
      stroke: primary,
      'stroke-width': tokens.icon.strokeWidth,
      'stroke-linecap': tokens.stroke.linecap,
      'stroke-linejoin': tokens.stroke.linejoin,
    },
    icons.find((i) => i.name === iconName).elements,
  );
  return { run, icon };
}

// --- Faces ----------------------------------------------------------------

// Whole-pixel outlines with anti-aliasing off: no font smoothing.
export const pixelText = (runs) =>
  group({ id: 'clock', fill: primary, 'shape-rendering': 'crispEdges' }, runs.flatMap(textPaths));

export const structuralElements = (name) => structuralAssets.find((a) => a.name === name).elements;

function variant(size, sample, step) {
  const tracking = trackingPx(size, step);
  const clock = clockRun(sample.time, size, tracking);
  const meridiem = meridiemRun(sample.meridiem);
  // The clock ink ends on its baseline: no clock glyph descends below it.
  const date = dateRun(clock.baseline);
  const event = eventRun();
  const modules = layout.modules.map((area, i) => moduleContent(area, MODULE_SAMPLES[i]));
  const stem = `${sample.time.replace(':', '')}${sample.meridiem.toLowerCase()}`;
  const name = `${CLOCK_FONT}-${size}-${stem}-track${tracking}`;

  const clockLayer = pixelText([clock, meridiem]);
  const faceSvg = svgDocument(SIZE, {}, [
    ...structuralElements('background-grid'),
    ...structuralElements('hud-frame'),
    ...structuralElements('seconds-ring-base'),
    group({ fill: primary }, ringSegments().slice(0, SAMPLE_SECONDS).map((pts) => polygon(pts))),
    clockLayer,
    group({ id: 'interface', fill: primary }, [date, event, ...modules.map((m) => m.run)].flatMap(textPaths)),
    ...modules.map((m) => m.icon),
  ]);

  const inkWidth = clock.inkRight - clock.inkLeft;
  return {
    name,
    size,
    scale: pixelScale(size),
    time: sample.time,
    meridiem: sample.meridiem,
    trackingStep: step,
    tracking,
    pngPath: `previews/clock-font/${name}.png`,
    faceSvg,
    // The clock and AM/PM alone on a transparent canvas, for pixel validation.
    clockSvg: svgDocument(SIZE, {}, [clockLayer]),
    runs: [
      { role: 'clock', ...clock },
      { role: 'meridiem', ...meridiem },
      { role: 'date', ...date },
      { role: 'event', ...event },
      ...modules.map((m) => ({ role: 'module', ...m.run })),
    ],
    inkWidth,
    // Clearance between the clock ink and the left/right edges of the clock area.
    // Negative means the numerals overrun the frame brackets.
    margin: Math.min(clock.inkLeft - layout.clock.x, layout.clock.x + layout.clock.width - clock.inkRight),
  };
}

/** Every comparison face: size, then sample time, then tracking step. */
export function buildClockFontVariants() {
  return CLOCK_SIZES.flatMap((size) =>
    SAMPLE_TIMES.flatMap((sample) => TRACKING_STEPS.map((step) => variant(size, sample, step))),
  );
}
