// Small string-building helpers for deterministic SVG output.
// Every number goes through fmt() so the generated files are byte-stable.

import { readFileSync } from 'node:fs';

export const tokens = JSON.parse(
  readFileSync(new URL('../design-tokens.json', import.meta.url), 'utf8'),
);

/** Round to 3 decimals and print without trailing zeros or negative zero. */
export function fmt(n) {
  const r = Math.round(n * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
}

function attrs(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => ` ${k}="${typeof v === 'number' ? fmt(v) : v}"`)
    .join('');
}

function indent(lines) {
  return lines
    .flatMap((l) => l.split('\n'))
    .map((l) => `  ${l}`)
    .join('\n');
}

/** Build an element. Omit `children` for a self-closing tag. */
export function el(name, a = {}, children) {
  if (children === undefined) return `<${name}${attrs(a)}/>`;
  return `<${name}${attrs(a)}>\n${indent(children)}\n</${name}>`;
}

/** True when every segment of the point list is horizontal or vertical. */
export function isAxisAligned(points, closed = false) {
  const pts = closed ? [...points, points[0]] : points;
  return pts.every((p, i) => i === 0 || p[0] === pts[i - 1][0] || p[1] === pts[i - 1][1]);
}

// Axis-aligned geometry is snapped to the pixel grid; diagonals stay anti-aliased.
const crisp = (on) => (on ? { 'shape-rendering': 'crispEdges' } : {});
const pointList = (points) => points.map(([x, y]) => `${fmt(x)},${fmt(y)}`).join(' ');

export function line(x1, y1, x2, y2, extra = {}) {
  return el('line', { x1, y1, x2, y2, ...crisp(x1 === x2 || y1 === y2), ...extra });
}

export function polyline(points, extra = {}) {
  return el('polyline', { points: pointList(points), ...crisp(isAxisAligned(points)), ...extra });
}

export function polygon(points, extra = {}) {
  return el('polygon', { points: pointList(points), ...crisp(isAxisAligned(points, true)), ...extra });
}

export function rect(x, y, width, height, extra = {}) {
  return el('rect', { x, y, width, height, ...crisp(true), ...extra });
}

export function group(a, children) {
  return el('g', a, children);
}

/** Solid shape with no outline. */
export const filled = (color) => ({ fill: color, stroke: 'none' });

/** Point on a circle; 0 degrees is 12 o'clock, angles increase clockwise. */
export function polar(cx, cy, radius, degrees) {
  const rad = (degrees * Math.PI) / 180;
  return [cx + radius * Math.sin(rad), cy - radius * Math.cos(rad)];
}

/** Wrap children in a square SVG document. Ends with a single newline. */
export function svgDocument(size, rootAttrs, children) {
  return `${el(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: `0 0 ${size} ${size}`,
      fill: 'none',
      ...rootAttrs,
    },
    children,
  )}\n`;
}
