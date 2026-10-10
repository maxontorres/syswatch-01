// Validates the numeral laboratory output in dist/. Exits non-zero if any check fails.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { parseSvg } from '../src/svg-parse.mjs';
import { distDir } from '../src/asset-catalog.mjs';
import {
  CHARACTERS, buildNumeralCatalog, fileStem, numeralFamilies,
} from '../src/numeral-definitions.mjs';

const EXPECTED_FAMILIES = ['sys-stencil', 'sys-matrix', 'sys-bus'];
const EXPECTED_CHARACTERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':'];
const DIGIT = { width: 72, height: 112 };
const COLON = { width: 28, height: 112 };
const ALLOWED_COLOURS = ['#79EEFF', '#087DA6', 'none'];

const results = [];
const check = (label, failures) => results.push({ label, failures });
const read = (rel) => readFileSync(join(distDir, rel), 'utf8').replace(/\r\n/g, '\n');
const missingFrom = (expected, actual) => expected.filter((n) => !actual.includes(n));
const sameSet = (expected, actual) => [
  ...missingFrom(expected, actual).map((n) => `missing ${n}`),
  ...missingFrom(actual, expected).map((n) => `unexpected ${n}`),
];
const onDisk = (dir, ext) =>
  existsSync(join(distDir, dir))
    ? readdirSync(join(distDir, dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length))
    : [];

const catalog = buildNumeralCatalog();
const label = (g) => `${g.family}/${fileStem(g.char)}`;
const isDigit = (g) => g.char !== ':';
const expectedSize = (g) => (isDigit(g) ? DIGIT : COLON);

// --- Presence -------------------------------------------------------------

check('the three numeral families are defined', sameSet(EXPECTED_FAMILIES, numeralFamilies.map((f) => f.id)));
check('every family defines all 11 characters (0-9 and colon)', [
  ...sameSet(EXPECTED_CHARACTERS, CHARACTERS),
  ...numeralFamilies.flatMap((f) =>
    sameSet(EXPECTED_CHARACTERS, Object.keys(f.glyphs)).map((m) => `${f.id}: ${m}`),
  ),
]);
const stems = EXPECTED_CHARACTERS.map(fileStem);
for (const [dir, ext] of [['svg', '.svg'], ['png', '.png']]) {
  check(
    `dist/${dir}/numerals holds exactly the 11 files of every family`,
    EXPECTED_FAMILIES.flatMap((id) =>
      sameSet(stems, onDisk(`${dir}/numerals/${id}`, ext)).map((m) => `${id}: ${m}`),
    ),
  );
}

// --- SVG ------------------------------------------------------------------

const parsed = new Map();
const parseFailures = [];
const staleFailures = [];
for (const glyph of catalog) {
  if (!existsSync(join(distDir, glyph.svgPath))) continue;
  const source = read(glyph.svgPath);
  if (source !== glyph.svg) staleFailures.push(`${glyph.svgPath} differs from its definition`);
  try {
    parsed.set(label(glyph), parseSvg(source));
    await sharp(Buffer.from(source)).metadata(); // second opinion from librsvg
  } catch (error) {
    parseFailures.push(`${glyph.svgPath}: ${error.message}`);
  }
}
check('numeral SVG files parse successfully', parseFailures);
check('numeral SVG files match the JavaScript definitions (not hand-edited or stale)', staleFailures);

const viewBoxFailures = (list) =>
  list.flatMap((g) => {
    const { width, height } = expectedSize(g);
    const root = parsed.get(label(g))?.[0].attrs;
    if (!root) return [`${label(g)}: not parsed`];
    const ok =
      root.viewBox === `0 0 ${width} ${height}` &&
      root.width === String(width) &&
      root.height === String(height);
    return ok ? [] : [`${label(g)}: viewBox="${root.viewBox}" width="${root.width}" height="${root.height}"`];
  });
check('digit SVGs use viewBox 0 0 72 112', viewBoxFailures(catalog.filter(isDigit)));
check('colon SVGs use viewBox 0 0 28 112', viewBoxFailures(catalog.filter((g) => !isDigit(g))));

const forbidden = (describe, test) =>
  check(
    describe,
    catalog.flatMap((g) =>
      (parsed.get(label(g)) ?? []).filter(test).map((e) => `${label(g)}: <${e.name}>`),
    ),
  );
const attrText = (e) => Object.entries(e.attrs).map(([k, v]) => `${k}=${v}`).join(' ');
forbidden('numeral SVGs contain no text elements or fonts', (e) =>
  /^(text|tspan|textPath|font|font-face|glyph)$/.test(e.name) || /font-/.test(attrText(e)));
forbidden('numeral SVGs contain no image elements or embedded rasters', (e) =>
  e.name === 'image' || /data:|href=/.test(attrText(e)));
forbidden('numeral SVGs contain no filters, blur or shadows', (e) =>
  /^(filter|fe[A-Z]\w*)$/.test(e.name) || /filter=|blur|shadow/i.test(attrText(e)));
forbidden('numeral SVGs contain no gradients', (e) =>
  /Gradient$/.test(e.name) || /url\(/.test(attrText(e)));
forbidden('numeral SVGs contain no other disallowed elements', (e) =>
  /^(foreignObject|pattern|style|script|use|mask|clipPath)$/.test(e.name));
forbidden('numeral SVGs use only the primary and secondary colours at full opacity', (e) =>
  ['fill', 'stroke'].some((k) => e.attrs[k] !== undefined && !ALLOWED_COLOURS.includes(e.attrs[k])) ||
  /opacity/.test(attrText(e)));

// --- PNG ------------------------------------------------------------------

const sizeFailures = [];
const alphaFailures = [];
const gapFailures = [];
const pngSizes = new Map();
const inkBounds = new Map();
for (const glyph of catalog) {
  const file = join(distDir, glyph.pngPath);
  if (!existsSync(file)) continue;
  const meta = await sharp(file).metadata();
  pngSizes.set(label(glyph), meta);
  const { width, height } = expectedSize(glyph);
  if (meta.format !== 'png' || meta.width !== width || meta.height !== height) {
    sizeFailures.push(`${glyph.pngPath}: ${meta.format} ${meta.width}x${meta.height}`);
    continue;
  }
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const alphaAt = (x, y) => data[(y * info.width + x) * info.channels + info.channels - 1];
  let clear = 0;
  let solid = 0;
  let top = info.height;
  let bottom = -1;
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const a = alphaAt(x, y);
      if (a === 0) clear += 1;
      if (a === 255) solid += 1;
      if (a > 0) {
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  inkBounds.set(label(glyph), { top, bottom: bottom + 1 });
  // Transparent background: an alpha channel, clear corners, mostly empty, some solid ink.
  const corners = [[0, 0], [info.width - 1, 0], [0, info.height - 1], [info.width - 1, info.height - 1]];
  if (
    !meta.hasAlpha ||
    corners.some(([x, y]) => alphaAt(x, y) !== 0) ||
    clear < (info.width * info.height) / 2 ||
    solid === 0
  ) {
    alphaFailures.push(`${glyph.pngPath}: expected a transparent background with visible content`);
  }
  for (const [x, y] of glyph.gapProbes) {
    if (alphaAt(x, y) !== 0) gapFailures.push(`${glyph.pngPath}: gap at ${x},${y} has alpha ${alphaAt(x, y)}`);
  }
}
check('digit PNGs are exactly 72x112', sizeFailures.filter((f) => !f.includes('/colon.png')));
check('colon PNGs are exactly 28x112', sizeFailures.filter((f) => f.includes('/colon.png')));
check('numeral PNGs have transparent backgrounds', alphaFailures);
check('small internal gaps are still fully transparent in the PNGs', gapFailures);

const perFamily = (test) =>
  numeralFamilies.flatMap((f) =>
    test(catalog.filter((g) => g.family === f.id && isDigit(g))).map((m) => `${f.id}: ${m}`),
  );
const distinct = (values) => [...new Set(values)];
check(
  'digit widths are identical within each family',
  perFamily((digits) => {
    const svgWidths = distinct(digits.map((g) => parsed.get(label(g))?.[0].attrs.width));
    const pngWidths = distinct(digits.map((g) => pngSizes.get(label(g))?.width));
    return [
      ...(svgWidths.length === 1 ? [] : [`SVG widths ${svgWidths.join(', ')}`]),
      ...(pngWidths.length === 1 ? [] : [`PNG widths ${pngWidths.join(', ')}`]),
    ];
  }),
);
check(
  'digits share one cap height and baseline within each family',
  perFamily((digits) => {
    const bounds = digits.map((g) => inkBounds.get(label(g))).filter(Boolean);
    const tops = distinct(bounds.map((b) => b.top));
    const bottoms = distinct(bounds.map((b) => b.bottom));
    return tops.length === 1 && bottoms.length === 1
      ? []
      : [`cap lines ${tops.join(', ')}; baselines ${bottoms.join(', ')}`];
  }),
);

// --- Comparison page ------------------------------------------------------

const labFailures = [];
if (!existsSync(join(distDir, 'previews/numeral-lab.html'))) {
  labFailures.push('previews/numeral-lab.html is missing');
} else {
  const html = read('previews/numeral-lab.html');
  labFailures.push(
    ...catalog.filter((g) => !html.includes(`../${g.pngPath}`)).map((g) => `${label(g)} is not shown`),
  );
  if (/(?:src|href)\s*=\s*"(?:https?:)?\/\//i.test(html) || /url\(\s*['"]?https?:/i.test(html) || /@import/.test(html)) {
    labFailures.push('references a network resource');
  }
}
check('numeral lab shows every glyph and uses no network resources', labFailures);

// --- Report ---------------------------------------------------------------

for (const { label: name, failures } of results) {
  console.log(`${failures.length ? 'FAIL' : 'PASS'}  ${name}`);
  for (const failure of failures) console.log(`        ${failure}`);
}
const failed = results.filter((r) => r.failures.length).length;
console.log(`\n${results.length - failed}/${results.length} numeral checks passed`);
if (failed) process.exit(1);
