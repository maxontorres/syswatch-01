// 450x450 structural assets for Syswatch 01: background grid, HUD frame and the
// two seconds rings. The watch is round, so everything except the grid stays
// inside the circle inscribed in the canvas.

import {
  tokens, line, polyline, polygon, rect, group, filled, polar, svgDocument,
} from './svg-helpers.mjs';

const { background, primary, secondary, accent } = tokens.color;
const SIZE = tokens.watchFace.size;
const C = SIZE / 2;

const strokeAttrs = (color) => ({
  stroke: color,
  'stroke-width': tokens.stroke.width,
  'stroke-linecap': tokens.stroke.linecap,
  'stroke-linejoin': tokens.stroke.linejoin,
});

// --- Layout ---------------------------------------------------------------

/** Content areas framed by the HUD. Shared with the preview's mock watch face. */
export const layout = {
  clock: { x: 75, y: 100, width: 300, height: 112 },
  event: { x: 65, y: 228, width: 320, height: 38 },
  modules: [
    { x: 87, y: 284, width: 84, height: 60 },
    { x: 183, y: 284, width: 84, height: 60 },
    { x: 279, y: 284, width: 84, height: 60 },
  ],
};

// --- Background grid ------------------------------------------------------

function backgroundGrid() {
  const { pitch, offset, majorEvery, minorOpacity, majorOpacity, markOpacity } = tokens.grid;
  // One-pixel lines on pixel columns offset, offset + pitch, ... The offset makes
  // the grid mirror-symmetric on the even-sized canvas.
  const positions = [];
  for (let p = offset; p < SIZE; p += pitch) positions.push(p + 0.5);
  const isMajor = (i) => i % majorEvery === 1;

  const lines = (major) =>
    positions.flatMap((p, i) =>
      isMajor(i) === major ? [line(p, 0, p, SIZE), line(0, p, SIZE, p)] : [],
    );
  const majors = positions.filter((_, i) => isMajor(i));
  const marks = majors.flatMap((x) =>
    majors.flatMap((y) => [line(x - 3, y, x + 3, y), line(x, y - 3, x, y + 3)]),
  );

  return [
    rect(0, 0, SIZE, SIZE, { fill: background }),
    group({ stroke: secondary, 'stroke-width': 1, 'stroke-opacity': minorOpacity }, lines(false)),
    group({ stroke: secondary, 'stroke-width': 1, 'stroke-opacity': majorOpacity }, lines(true)),
    group({ stroke: primary, 'stroke-width': 1, 'stroke-opacity': markOpacity }, marks),
  ];
}

// --- HUD frame ------------------------------------------------------------

/** L-shaped bracket at corner (x, y) with arms pointing along (sx, sy). */
const bracket = (x, y, sx, sy, arm) =>
  polyline([[x, y + sy * arm], [x, y], [x + sx * arm, y]]);

function hudFrame() {
  const { clock, event, modules } = layout;
  const right = (a) => a.x + a.width;
  const bottom = (a) => a.y + a.height;

  const dim = [
    // Cardinal ticks at 3, 6 and 9 o'clock.
    line(SIZE - 50, C, SIZE - 34, C),
    line(C, SIZE - 50, C, SIZE - 34),
    line(34, C, 50, C),
    // Next-event strip, chamfered on two opposite corners.
    polygon([
      [event.x, event.y], [right(event) - 12, event.y], [right(event), event.y + 12],
      [right(event), bottom(event)], [event.x + 12, bottom(event)], [event.x, bottom(event) - 12],
    ]),
    ...modules.map((m) => rect(m.x, m.y, m.width, m.height)),
  ];

  const bright = [
    line(C, 34, C, 50),
    bracket(clock.x, clock.y, 1, 1, 22),
    bracket(right(clock), clock.y, -1, 1, 22),
    bracket(right(clock), bottom(clock), -1, -1, 22),
    bracket(clock.x, bottom(clock), 1, -1, 22),
    ...modules.flatMap((m) => [
      bracket(m.x, m.y, 1, 1, 14),
      bracket(right(m), bottom(m), -1, -1, 14),
    ]),
  ];

  return [
    group(strokeAttrs(secondary), dim),
    group(strokeAttrs(primary), bright),
    rect(event.x + 8, event.y + 8, 4, event.height - 16, filled(accent)),
  ];
}

// --- Seconds rings --------------------------------------------------------

/**
 * Corner points of the 60 ring segments. Segment i fills the 6-degree cell that
 * starts at i * 6 degrees clockwise from 12 o'clock, inset by half the gap on each
 * side, so a clockwise sweep to s * 6 degrees reveals exactly s whole segments.
 */
export function ringSegments() {
  const { segments, innerRadius, outerRadius, gapDegrees } = tokens.secondsRing;
  const cell = 360 / segments;
  return Array.from({ length: segments }, (_, i) => {
    const start = i * cell + gapDegrees / 2;
    const end = (i + 1) * cell - gapDegrees / 2;
    return [
      polar(C, C, innerRadius, start),
      polar(C, C, outerRadius, start),
      polar(C, C, outerRadius, end),
      polar(C, C, innerRadius, end),
    ];
  });
}

const secondsRing = (fillAttrs) => [
  group({ id: 'segments', ...fillAttrs }, ringSegments().map((pts) => polygon(pts))),
];

// --- Assets ---------------------------------------------------------------

export const structuralAssets = [
  { name: 'background-grid', transparent: false, elements: backgroundGrid() },
  { name: 'hud-frame', transparent: true, elements: hudFrame() },
  {
    name: 'seconds-ring-base',
    transparent: true,
    elements: secondsRing({ fill: secondary, 'fill-opacity': tokens.secondsRing.inactiveOpacity }),
  },
  { name: 'seconds-ring-active', transparent: true, elements: secondsRing({ fill: primary }) },
];

export function renderStructuralSvg(asset) {
  return svgDocument(SIZE, {}, asset.elements);
}
