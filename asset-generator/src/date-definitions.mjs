// The date line of the watch-face previews: weekday and DD/MM/YYYY in Share Tech
// Mono, centred between the main clock and the next-event strip. The date shown is
// preview sample content; the Watch Face Studio component will be dynamic.
//
// Share Tech Mono is monospaced, so its numerals are tabular as drawn. The line is
// laid out from the unaltered outlines, like the other interface text.

import { tokens, group, svgDocument } from './svg-helpers.mjs';
import { layout } from './structural-definitions.mjs';
import { layoutText, loadFont, shiftText, textPaths } from './font-definitions.mjs';

const { primary } = tokens.color;
const SIZE = tokens.watchFace.size;
const interfaceType = tokens.typography.interface;

export const DATE_FONT = interfaceType.font;

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const two = (n) => String(n).padStart(2, '0');

/** A date as "SAT · 10/10/2026": uppercase weekday, then DD/MM/YYYY. */
export const formatDate = (date) =>
  `${WEEKDAYS[date.getDay()]} · ${two(date.getDate())}/${two(date.getMonth() + 1)}/${date.getFullYear()}`;

export const DATE_SAMPLE = formatDate(new Date(2026, 9, 10));

/**
 * The date line with its ink centred on the face and its capitals centred between
 * the bottom of the clock ink (`clockInkBottom`, in face pixels) and the top of the
 * next-event strip, so the gap above it equals the gap below.
 */
export function dateRun(clockInkBottom, text = DATE_SAMPLE) {
  const font = loadFont(DATE_FONT);
  const capHeight = (font.tables.os2.sCapHeight * interfaceType.dateSize) / font.unitsPerEm;
  const run = layoutText(DATE_FONT, text, {
    size: interfaceType.dateSize,
    x: 0,
    baseline: Math.round((clockInkBottom + layout.event.y + capHeight) / 2),
    tracking: interfaceType.dateTracking,
  });
  return shiftText(run, Math.round((SIZE - (run.inkRight - run.inkLeft)) / 2 - run.inkLeft));
}

/** The date line alone on a transparent face-sized canvas, to overlay on an HTML mock face. */
export const dateOverlaySvg = (clockInkBottom) =>
  svgDocument(SIZE, { class: 'date', role: 'img', 'aria-label': DATE_SAMPLE }, [
    group({ fill: primary }, textPaths(dateRun(clockInkBottom))),
  ]).trim();
