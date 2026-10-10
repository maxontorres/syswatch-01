// Numeral laboratory: three original bitmap numeral families for the Syswatch 01
// main clock. Every glyph is plain SVG geometry on a shared metric box, so the
// families can be compared like for like and assigned to Watch Face Studio's
// per-digit bitmap slots.
//
// Each glyph also lists `gapProbes`: pixels inside its small intentional gaps that
// must still be fully transparent after PNG export.

import { tokens, el, polyline, polygon, rect, group, filled } from './svg-helpers.mjs';

const { primary } = tokens.color;

export const DIGIT = { width: 72, height: 112 };
export const COLON = { width: 28, height: 112 };
export const CHARACTERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];

export const glyphSize = (char) => (char === ':' ? COLON : DIGIT);
/** File name stem for a character; ":" is not a valid Windows file name. */
export const fileStem = (char) => (char === ':' ? 'colon' : char);

// Shared metrics. Ink stays inside x 12-60, cap line y 16, baseline y 96.
const LEFT = 12;
const RIGHT = 60;
const CAP = 16;
const BASE = 96;
const CENTRE_Y = (CAP + BASE) / 2;

// --- SYS-STENCIL ----------------------------------------------------------
// Continuous 10-unit strokes on a centreline skeleton. Outer turns are cut at
// 45 degrees and selected joints are left open by a 4-unit stencil cut.

const stencilStroke = 10;
const sx0 = LEFT + stencilStroke / 2; // left stem centreline
const sx1 = RIGHT - stencilStroke / 2; // right stem centreline
const sy0 = CAP + stencilStroke / 2; // top bar centreline
const sy1 = BASE - stencilStroke / 2; // bottom bar centreline
const sym = CENTRE_Y;
const CH = 10; // chamfer leg, measured along the centreline

/** Expand every [x, y, leg] corner into a 45-degree chamfer; [x, y] stays sharp. */
function chamfer(points) {
  return points.flatMap(([x, y, leg], i) => {
    if (!leg) return [[x, y]];
    const toward = ([qx, qy]) => {
      const d = Math.hypot(qx - x, qy - y);
      return [x + (leg * (qx - x)) / d, y + (leg * (qy - y)) / d];
    };
    return [
      toward(points[(i - 1 + points.length) % points.length]),
      toward(points[(i + 1) % points.length]),
    ];
  });
}

const stencilAttrs = {
  stroke: primary,
  'stroke-width': stencilStroke,
  'stroke-linecap': 'butt',
  'stroke-linejoin': 'miter',
};
const stencil = (strokes, gapProbes, closed = []) => ({
  elements: [
    group(stencilAttrs, [
      ...closed.map((points) => polygon(chamfer(points))),
      ...strokes.map((points) => polyline(chamfer(points))),
    ]),
  ],
  gapProbes,
});

// Where a bar meets a stem across a cut, the stem runs through the corner and the
// bar stops 4 units short of it: x 26 beside the left stem, x 46 beside the right.
const cutL = sx0 + stencilStroke / 2 + 4;
const cutR = sx1 - stencilStroke / 2 - 4;

const stencilGlyphs = {
  0: stencil(
    [
      [[40, sy0], [sx0, sy0, CH], [sx0, sy1, CH], [28, sy1]],
      [[32, sy1], [sx1, sy1, CH], [sx1, sy0, CH], [44, sy0]],
    ],
    [[42, 21], [30, 91]],
  ),
  1: stencil(
    [
      [[16, sy0], [36, sy0, 6], [36, 82]],
      [[19, sy1], [53, sy1]],
    ],
    [[36, 84]],
  ),
  2: stencil(
    [
      [[LEFT, sy0], [sx1, sy0, CH], [sx1, sym], [cutL, sym]],
      [[sx0, sym - 5], [sx0, sy1, CH], [RIGHT, sy1]],
    ],
    [[23, 56]],
  ),
  3: stencil(
    [
      [[LEFT, sy0], [sx1, sy0, CH], [sx1, sy1, CH], [LEFT, sy1]],
      [[26, sym], [cutR, sym]],
    ],
    [[47, 56]],
  ),
  4: stencil(
    [
      [[sx0, CAP], [sx0, 62, CH], [cutR, 62]],
      [[sx1, CAP], [sx1, BASE]],
    ],
    [[47, 62]],
  ),
  5: stencil(
    [
      [[RIGHT, sy0], [sx0, sy0], [sx0, sym + 5]],
      [[cutL, sym], [sx1, sym, CH], [sx1, sy1, CH], [LEFT, sy1]],
    ],
    [[23, 56]],
  ),
  6: stencil(
    [[[RIGHT, sy0], [sx0, sy0, CH], [sx0, sy1, CH], [sx1, sy1, CH], [sx1, sym, CH], [cutL, sym]]],
    [[23, 56]],
  ),
  7: stencil(
    [
      [[LEFT, sy0], [38, sy0]],
      [[42, sy0], [sx1, sy0, CH], [sx1, 46], [37, 64], [37, BASE]],
    ],
    [[39, 21]],
  ),
  8: stencil(
    [[[sx0 + stencilStroke / 2, sym], [cutR, sym]]],
    [[47, 56]],
    [[[sx0, sy0, CH], [sx1, sy0, CH], [sx1, sy1, CH], [sx0, sy1, CH]]],
  ),
  9: stencil(
    [[[LEFT, sy1], [sx1, sy1, CH], [sx1, sy0, CH], [sx0, sy0, CH], [sx0, sym, CH], [cutR, sym]]],
    [[47, 56]],
  ),
  // Two square nodes, each with one corner cut away.
  ':': {
    elements: [
      group(filled(primary), [
        polygon([[13, 36], [19, 36], [19, 46], [9, 46], [9, 40]]),
        polygon([[9, 66], [19, 66], [19, 72], [15, 76], [9, 76]]),
      ]),
    ],
    gapProbes: [],
  },
};

// --- SYS-MATRIX -----------------------------------------------------------
// A rigid 5 x 10 grid of 8 x 6 rectangular cells with 2-unit gutters. Corner
// cells are left out so turns read as steps, and a few interior cells are
// dropped on purpose (the open joint of 4, the detached core of 0).

const cell = { width: 8, height: 6, gap: 2, cols: 5, rows: 10 };
const cellPitchX = cell.width + cell.gap;
const cellPitchY = cell.height + cell.gap;
const matrixTop = CENTRE_Y - (cell.rows * cellPitchY - cell.gap) / 2;

function matrix(rows, left = LEFT) {
  const on = (c, r) => rows[r]?.[c] === 'X';
  const x = (c) => left + c * cellPitchX;
  const y = (r) => matrixTop + r * cellPitchY;
  const cells = [];
  const gapProbes = [];
  rows.forEach((row, r) =>
    [...row].forEach((_, c) => {
      if (!on(c, r)) return;
      cells.push(rect(x(c), y(r), cell.width, cell.height));
      // Gutters between lit neighbours must survive export.
      if (on(c + 1, r)) gapProbes.push([x(c) + cell.width, y(r) + 2]);
      if (on(c, r + 1)) gapProbes.push([x(c) + 3, y(r) + cell.height]);
    }),
  );
  return { elements: [group(filled(primary), cells)], gapProbes };
}

const matrixGlyphs = {
  0: matrix([
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    'X.X.X',
    'X.X.X',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.',
  ]),
  1: matrix([
    '.XX..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    'XXXXX',
  ]),
  2: matrix([
    'XXXX.',
    '....X',
    '....X',
    '....X',
    '.XXX.',
    'X....',
    'X....',
    'X....',
    'X....',
    '.XXXX',
  ]),
  3: matrix([
    'XXXX.',
    '....X',
    '....X',
    '....X',
    '..XX.',
    '....X',
    '....X',
    '....X',
    '....X',
    'XXXX.',
  ]),
  4: matrix([
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    'XXX.X',
    '....X',
    '....X',
    '....X',
    '....X',
  ]),
  5: matrix([
    'XXXXX',
    'X....',
    'X....',
    'X....',
    'XXXX.',
    '....X',
    '....X',
    '....X',
    '....X',
    'XXXX.',
  ]),
  6: matrix([
    '.XXX.',
    'X....',
    'X....',
    'X....',
    'XXXX.',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.',
  ]),
  7: matrix([
    'XXXX.',
    '....X',
    '....X',
    '....X',
    '...X.',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
    '..X..',
  ]),
  8: matrix([
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    'X...X',
    '.XXX.',
  ]),
  9: matrix([
    '.XXX.',
    'X...X',
    'X...X',
    'X...X',
    '.XXXX',
    '....X',
    '....X',
    '....X',
    '....X',
    '.XXX.',
  ]),
  // Two nodes of two stacked cells on the digit row grid.
  ':': matrix(['', '', 'X', 'X', '', '', 'X', 'X'], (COLON.width - cell.width) / 2),
};

// --- SYS-BUS --------------------------------------------------------------
// Separated modular strokes on a 10-unit track. Vertical runs are two parallel
// 3-unit lines (a bus), horizontal runs are single 6-unit traces, and every
// junction where strokes meet is a hollow square pad. A stem with no junction
// runs uninterrupted, so the skeleton is not a fixed set of segments.

const TRACK = 10;
const PAD_GAP = 3; // clearance between a pad and the stroke leaving it
const bL = LEFT;
const bC = (LEFT + RIGHT - TRACK) / 2;
const bR = RIGHT - TRACK;
const bT = CAP;
const bM = CENTRE_Y - TRACK / 2;
const bB = BASE - TRACK;
// Stroke limits between pads.
const hIn = bL + TRACK + PAD_GAP; // 25
const hOut = bR - PAD_GAP; // 47
const vUpper = [bT + TRACK + PAD_GAP, bM - PAD_GAP]; // 29-48
const vLower = [bM + TRACK + PAD_GAP, bB - PAD_GAP]; // 64-83
const vFull = [vUpper[0], vLower[1]];

const pad = (x, y) => ({
  element: el('path', {
    d: `M${x} ${y}h${TRACK}v${TRACK}h${-TRACK}zM${x + 3} ${y + 3}h4v4h-4z`,
    'fill-rule': 'evenodd',
    'shape-rendering': 'crispEdges',
  }),
  gapProbes: [[x + 4, y + 4]],
});
const trace = (x0, x1, y) => ({ element: rect(x0, y + 2, x1 - x0, 6), gapProbes: [] });
const busLine = (x, [y0, y1]) => ({
  element: group({}, [rect(x, y0, 3, y1 - y0), rect(x + 7, y0, 3, y1 - y0)]),
  gapProbes: [[x + 4, Math.floor((y0 + y1) / 2)]],
});
const bus = (...parts) => ({
  elements: [group(filled(primary), parts.map((p) => p.element))],
  gapProbes: parts.flatMap((p) => p.gapProbes),
});

const busGlyphs = {
  0: bus(
    pad(bL, bT), trace(hIn, hOut, bT), pad(bR, bT),
    busLine(bL, vFull), busLine(bR, vFull),
    pad(bL, bB), trace(hIn, hOut, bB), pad(bR, bB),
  ),
  1: bus(
    trace(14, bC - PAD_GAP, bT), pad(bC, bT),
    busLine(bC, vFull),
    trace(14, bC - PAD_GAP, bB), pad(bC, bB), trace(bC + TRACK + PAD_GAP, 58, bB),
  ),
  2: bus(
    trace(LEFT, hOut, bT), pad(bR, bT),
    busLine(bR, vUpper),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bL, vLower),
    pad(bL, bB), trace(hIn, RIGHT, bB),
  ),
  3: bus(
    trace(LEFT, hOut, bT), pad(bR, bT),
    busLine(bR, vUpper),
    trace(31, hOut, bM), pad(bR, bM),
    busLine(bR, vLower),
    trace(LEFT, hOut, bB), pad(bR, bB),
  ),
  4: bus(
    busLine(bL, [CAP, vUpper[1]]), busLine(bR, [CAP, vUpper[1]]),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bR, [vLower[0], BASE]),
  ),
  5: bus(
    pad(bL, bT), trace(hIn, RIGHT, bT),
    busLine(bL, vUpper),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bR, vLower),
    trace(LEFT, hOut, bB), pad(bR, bB),
  ),
  6: bus(
    pad(bL, bT), trace(hIn, RIGHT, bT),
    busLine(bL, vUpper),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bL, vLower), busLine(bR, vLower),
    pad(bL, bB), trace(hIn, hOut, bB), pad(bR, bB),
  ),
  7: bus(
    trace(LEFT, hOut, bT), pad(bR, bT),
    busLine(bR, [vUpper[0], BASE]),
  ),
  8: bus(
    pad(bL, bT), trace(hIn, hOut, bT), pad(bR, bT),
    busLine(bL, vUpper), busLine(bR, vUpper),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bL, vLower), busLine(bR, vLower),
    pad(bL, bB), trace(hIn, hOut, bB), pad(bR, bB),
  ),
  9: bus(
    pad(bL, bT), trace(hIn, hOut, bT), pad(bR, bT),
    busLine(bL, vUpper), busLine(bR, vUpper),
    pad(bL, bM), trace(hIn, hOut, bM), pad(bR, bM),
    busLine(bR, vLower),
    trace(LEFT, hOut, bB), pad(bR, bB),
  ),
  // Two junction pads.
  ':': bus(pad(9, 36), pad(9, 66)),
};

// --- Families -------------------------------------------------------------

export const numeralFamilies = [
  {
    id: 'sys-stencil',
    label: 'SYS-STENCIL',
    description: 'Continuous chamfered strokes with stencil cuts at selected joints.',
    glyphs: stencilGlyphs,
  },
  {
    id: 'sys-matrix',
    label: 'SYS-MATRIX',
    description: 'Rigid 5 × 10 grid of rectangular cells with selected cells left out.',
    glyphs: matrixGlyphs,
  },
  {
    id: 'sys-bus',
    label: 'SYS-BUS',
    description: 'Separated strokes: parallel-line buses, single traces and hollow junction pads.',
    glyphs: busGlyphs,
  },
];

export function renderNumeralSvg(family, char) {
  const { width, height } = glyphSize(char);
  return `${el(
    'svg',
    { xmlns: 'http://www.w3.org/2000/svg', width, height, viewBox: `0 0 ${width} ${height}`, fill: 'none' },
    family.glyphs[char].elements,
  )}\n`;
}

/** Every numeral asset in family then character order, with its rendered SVG source. */
export function buildNumeralCatalog() {
  return numeralFamilies.flatMap((family) =>
    CHARACTERS.filter((char) => family.glyphs[char]).map((char) => ({
      family: family.id,
      char,
      ...glyphSize(char),
      svgPath: `svg/numerals/${family.id}/${fileStem(char)}.svg`,
      pngPath: `png/numerals/${family.id}/${fileStem(char)}.png`,
      svg: renderNumeralSvg(family, char),
      gapProbes: family.glyphs[char].gapProbes,
    })),
  );
}
