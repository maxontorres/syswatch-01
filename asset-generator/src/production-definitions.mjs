// Production preview: the one 450x450 watch face with the locked typography. The main
// clock and AM/PM are Departure Mono; the date, event text and data modules are Share
// Tech Mono. Every value is sample content, not a production asset.
//
// Visual hierarchy, brightest and largest first: main clock, date, next event, data
// modules, then the grid and the decorative HUD elements.

import { tokens, group, polygon, svgDocument } from './svg-helpers.mjs';
import { icons } from './icon-definitions.mjs';
import { layout, ringSegments } from './structural-definitions.mjs';
import { layoutText, loadFont, textPaths } from './font-definitions.mjs';
import { dateRun } from './date-definitions.mjs';
import {
  CLOCK_FONT, INTERFACE_FONT, SAMPLE_SECONDS, clockRun, eventRun, meridiemRun, pixelText,
  structuralElements,
} from './clock-font-definitions.mjs';

const { primary, secondary, accent } = tokens.color;
const SIZE = tokens.watchFace.size;
const clockType = tokens.typography.clock;
const interfaceType = tokens.typography.interface;

export const PRODUCTION_NAME = 'production-preview';
export const PRODUCTION_TIME = { time: '6:42', meridiem: 'PM' };
/** Icon, label and value of each data module, left to right. */
export const PRODUCTION_MODULES = [
  ['heart', 'HR', '072'],
  ['battery', 'BATT', '84%'],
  ['weather-rain', 'RAIN', '18%'],
];
const DATE_SEPARATOR = '·';

const capHeight = (size) => {
  const font = loadFont(INTERFACE_FONT);
  return (font.tables.os2.sCapHeight * size) / font.unitsPerEm;
};

/** Icon beside a label stacked over its value, centred as a block in the module. */
function moduleContent(area, [iconName, label, value]) {
  const { moduleLabelSize, moduleValueSize, moduleLineGap, moduleIconSize, moduleGap } = interfaceType;
  const font = loadFont(INTERFACE_FONT);
  const advance = font.charToGlyph('0').advanceWidth / font.unitsPerEm;
  const textWidth = Math.round(
    Math.max([...label].length * moduleLabelSize, [...value].length * moduleValueSize) * advance,
  );
  const left = area.x + Math.floor((area.width - (moduleIconSize + moduleGap + textWidth)) / 2);
  const textHeight = capHeight(moduleLabelSize) + moduleLineGap + capHeight(moduleValueSize);
  const labelBaseline = area.y + Math.round((area.height - textHeight) / 2 + capHeight(moduleLabelSize));
  const x = left + moduleIconSize + moduleGap;

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
  return {
    icon,
    label: layoutText(INTERFACE_FONT, label, { size: moduleLabelSize, x, baseline: labelBaseline }),
    value: layoutText(INTERFACE_FONT, value, {
      size: moduleValueSize,
      x,
      baseline: labelBaseline + moduleLineGap + Math.round(capHeight(moduleValueSize)),
    }),
  };
}

const only = (run, keep) => ({ ...run, glyphs: run.glyphs.filter((g) => keep(g.char)) });

/** The production face, its renders and the measurements the validator checks. */
export function buildProductionFace() {
  const clock = clockRun(PRODUCTION_TIME.time, clockType.size, clockType.tracking);
  const meridiem = meridiemRun(PRODUCTION_TIME.meridiem);
  // The clock ink ends on its baseline: no clock glyph descends below it.
  const date = dateRun(clock.baseline);
  const event = eventRun();
  const modules = layout.modules.map((area, i) => moduleContent(area, PRODUCTION_MODULES[i]));

  const clockLayer = pixelText([clock, meridiem]);
  const faceSvg = svgDocument(SIZE, {}, [
    ...structuralElements('background-grid'),
    ...structuralElements('hud-frame'),
    ...structuralElements('seconds-ring-base'),
    group({ fill: primary }, ringSegments().slice(0, SAMPLE_SECONDS).map((pts) => polygon(pts))),
    clockLayer,
    group(
      { id: 'interface', fill: primary },
      [only(date, (c) => c !== DATE_SEPARATOR), event, ...modules.map((m) => m.value)].flatMap(textPaths),
    ),
    // The separator dot is the date's one amber signal.
    group({ id: 'date-separator', fill: accent }, textPaths(only(date, (c) => c === DATE_SEPARATOR))),
    group({ id: 'labels', fill: secondary }, modules.flatMap((m) => textPaths(m.label))),
    ...modules.map((m) => m.icon),
  ]);

  const dateCap = capHeight(date.size);
  return {
    name: PRODUCTION_NAME,
    pngPath: `previews/${PRODUCTION_NAME}.png`,
    htmlPath: `previews/${PRODUCTION_NAME}.html`,
    faceSvg,
    // The clock and AM/PM alone on a transparent canvas, for pixel validation.
    clockSvg: svgDocument(SIZE, {}, [clockLayer]),
    runs: [
      { role: 'clock', ...clock },
      { role: 'meridiem', ...meridiem },
      { role: 'date', ...date },
      { role: 'event', ...event },
      ...modules.flatMap((m) => [{ role: 'label', ...m.label }, { role: 'value', ...m.value }]),
    ],
    date: {
      // Clear space between the date capitals and the clock ink above / event strip below.
      gapAbove: date.baseline - dateCap - clock.baseline,
      gapBelow: layout.event.y - date.baseline,
      // Offset of the ink centre from the centre of the face.
      offCentre: (date.inkLeft + date.inkRight) / 2 - SIZE / 2,
    },
    clockMargin: Math.min(clock.inkLeft - layout.clock.x, layout.clock.x + layout.clock.width - clock.inkRight),
  };
}

export { CLOCK_FONT, INTERFACE_FONT };
