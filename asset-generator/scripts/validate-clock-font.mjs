// Validates the fonts, their manifest entries and the clock font comparison output.
// Exits non-zero if any check fails.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { distDir } from '../src/asset-catalog.mjs';
import { fontById, fontPath, fonts, loadFont } from '../src/font-definitions.mjs';
import { buildClockFontVariants } from '../src/clock-font-definitions.mjs';

const EXPECTED_FONTS = ['departure-mono', 'share-tech-mono'];
const EXPECTED_SIZES = [88, 99, 110];
const EXPECTED_TIMES = ['10:08 PM', '6:42 AM', '12:59 PM'];
const CLOCK_CHARACTERS = [...'0123456789:APM'];
const FONT_FOR_ROLE = {
  clock: 'departure-mono',
  meridiem: 'departure-mono',
  date: 'share-tech-mono',
  event: 'share-tech-mono',
  module: 'share-tech-mono',
};
const FACE = tokens.watchFace.size;

const results = [];
const check = (label, failures) => results.push({ label, failures });
const missingFrom = (expected, actual) => expected.filter((n) => !actual.includes(n));
const sameSet = (expected, actual) => [
  ...missingFrom(expected, actual).map((n) => `missing ${n}`),
  ...missingFrom(actual, expected).map((n) => `unexpected ${n}`),
];
const distinct = (values) => [...new Set(values)];
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const rgba = (input) => sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const variants = buildClockFontVariants();
const departure = fontById('departure-mono');

// --- Fonts and licences ---------------------------------------------------

check('Departure Mono and Share Tech Mono are the only defined fonts', sameSet(EXPECTED_FONTS, fonts.map((f) => f.id)));
check(
  'every font file sits beside its licence under assets/fonts/<id>/',
  fonts.flatMap((f) =>
    [f.file, f.licenseFile].filter((file) => !existsSync(fontPath(f, file))).map((file) => `${f.id}: ${file} is missing`),
  ),
);
check(
  'licence files are the SIL Open Font License 1.1',
  fonts.flatMap((f) => {
    if (!existsSync(fontPath(f, f.licenseFile))) return [];
    const text = readFileSync(fontPath(f, f.licenseFile), 'utf8');
    return /SIL Open Font License, Version 1\.1/.test(text) && /PERMISSION & CONDITIONS/.test(text)
      ? []
      : [`${f.id}: ${f.licenseFile} is not the OFL 1.1 text`];
  }),
);
check(
  'font files are the declared family and version, and carry the OFL notice',
  fonts.flatMap((f) => {
    if (!existsSync(fontPath(f))) return [];
    const names = loadFont(f.id).names;
    const name = (key) => (names.windows ?? names)[key]?.en ?? '';
    return [
      ...(name('fontFamily') === f.family ? [] : [`${f.id}: family is "${name('fontFamily')}"`]),
      ...(name('version').includes(f.version) ? [] : [`${f.id}: version is "${name('version')}"`]),
      ...(/SIL Open Font License/.test(name('license')) ? [] : [`${f.id}: no OFL notice in the name table`]),
    ];
  }),
);

const manifestFailures = [];
if (!existsSync(join(distDir, 'manifest.json'))) {
  manifestFailures.push('manifest.json is missing');
} else {
  const listed = JSON.parse(readFileSync(join(distDir, 'manifest.json'), 'utf8')).fonts ?? [];
  manifestFailures.push(...sameSet(EXPECTED_FONTS, listed.map((f) => f.name)));
  for (const entry of listed) {
    for (const [rel, hash] of [[entry.file, entry.sha256], [entry.licenseFile, entry.licenseSha256]]) {
      const file = join(distDir, rel);
      if (!existsSync(file)) manifestFailures.push(`${entry.name}: ${rel} does not exist`);
      else if (sha256(file) !== hash) manifestFailures.push(`${entry.name}: ${rel} does not match its sha256`);
    }
    if (entry.license !== 'OFL-1.1') manifestFailures.push(`${entry.name}: license is ${entry.license}`);
  }
}
check('manifest.json lists every font with its licence and matching checksums', manifestFailures);

// --- Pixel geometry of the font -------------------------------------------

// Departure Mono's outlines must sit on its 11-per-em pixel grid, or no size renders crisply.
const unit = loadFont('departure-mono').unitsPerEm / departure.pixelsPerEm;
const contours = (char) => {
  const out = [];
  for (const c of loadFont('departure-mono').charToGlyph(char).path.commands) {
    if (c.type === 'M') out.push([[c.x, c.y]]);
    else if (c.type === 'L') out.at(-1).push([c.x, c.y]);
    else if (c.type !== 'Z') throw new Error(`${char}: unexpected ${c.type} segment`);
  }
  return out;
};
check(
  'Departure Mono clock glyphs are straight-edged and on the 11 px design grid',
  CLOCK_CHARACTERS.flatMap((char) => {
    try {
      const onGrid = contours(char).flat().every(([x, y]) => x % unit === 0 && y % unit === 0);
      const advance = loadFont('departure-mono').charToGlyph(char).advanceWidth;
      return onGrid && advance % unit === 0 ? [] : [`"${char}" leaves the grid`];
    } catch (error) {
      return [error.message];
    }
  }),
);

/** Non-zero winding test of a point against a glyph's contours, in font units. */
function inside(shapes, px, py) {
  let winding = 0;
  for (const pts of shapes) {
    for (let i = 0; i < pts.length; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[(i + 1) % pts.length];
      if (y1 <= py === y2 <= py) continue;
      if (x1 + ((py - y1) / (y2 - y1)) * (x2 - x1) > px) winding += y2 > y1 ? 1 : -1;
    }
  }
  return winding !== 0;
}

// The design pixels of each glyph, sampled straight from the font at its native 11 px.
const ROWS = { from: -3, to: 11 };
const nativePixels = new Map(
  CLOCK_CHARACTERS.map((char) => {
    const shapes = contours(char);
    const columns = loadFont('departure-mono').charToGlyph(char).advanceWidth / unit;
    const pixels = [];
    for (let row = ROWS.from; row < ROWS.to; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (inside(shapes, (col + 0.5) * unit, (row + 0.5) * unit)) pixels.push([col, row]);
      }
    }
    return [char, pixels];
  }),
);

// --- Comparison definitions -----------------------------------------------

check('comparison sizes are 88, 99 and 110 px', sameSet(EXPECTED_SIZES.map(String), distinct(variants.map((v) => String(v.size)))));
check(
  'every size is a whole multiple of the 11 px design size',
  distinct(variants.map((v) => v.size)).filter((s) => s % departure.pixelsPerEm !== 0).map((s) => `${s} px`),
);
check(
  'every size renders 10:08 PM, 6:42 AM and 12:59 PM',
  EXPECTED_SIZES.flatMap((size) =>
    sameSet(EXPECTED_TIMES, distinct(variants.filter((v) => v.size === size).map((v) => `${v.time} ${v.meridiem}`))).map(
      (m) => `${size} px: ${m}`,
    ),
  ),
);
check(
  'every size and time is shown at default and tighter tracking, never wider',
  EXPECTED_SIZES.flatMap((size) =>
    EXPECTED_TIMES.flatMap((time) => {
      const trackings = variants.filter((v) => v.size === size && `${v.time} ${v.meridiem}` === time).map((v) => v.tracking);
      const ok = trackings.includes(0) && trackings.some((t) => t < 0) && trackings.every((t) => t <= 0 && Number.isInteger(t));
      return ok ? [] : [`${size} px ${time}: trackings ${trackings.join(', ')}`];
    }),
  ),
);
check(
  'Departure Mono sets only the clock and AM/PM; Share Tech Mono sets everything else',
  variants.flatMap((v) =>
    v.runs.filter((r) => r.fontId !== FONT_FOR_ROLE[r.role]).map((r) => `${v.name}: ${r.role} "${r.text}" uses ${r.fontId}`),
  ),
);
check(
  'every glyph origin and baseline is a whole pixel',
  variants.flatMap((v) =>
    v.runs
      .filter((r) => !Number.isInteger(r.baseline) || r.glyphs.some((g) => !Number.isInteger(g.x)))
      .map((r) => `${v.name}: ${r.role} "${r.text}"`),
  ),
);

// --- Renders --------------------------------------------------------------

const onDisk = existsSync(join(distDir, 'previews/clock-font'))
  ? readdirSync(join(distDir, 'previews/clock-font')).filter((f) => f.endsWith('.png')).map((f) => f.slice(0, -4))
  : [];
check('dist/previews/clock-font holds exactly the expected renders', sameSet(variants.map((v) => v.name), onDisk));

const sizeFailures = [];
const staleFailures = [];
const smoothingFailures = [];
const geometryFailures = [];
for (const v of variants) {
  const file = join(distDir, v.pngPath);
  if (!existsSync(file)) continue;

  const meta = await sharp(file).metadata();
  if (meta.format !== 'png' || meta.width !== FACE || meta.height !== FACE) {
    sizeFailures.push(`${v.pngPath}: ${meta.format} ${meta.width}x${meta.height}`);
    continue;
  }
  const [saved, fresh] = await Promise.all([rgba(file), rgba(Buffer.from(v.faceSvg))]);
  if (!saved.data.equals(fresh.data)) staleFailures.push(`${v.pngPath} differs from its definition`);

  // The clock and AM/PM alone: every pixel must be fully on or fully off, and the ink
  // must be exactly the font's design pixels as square blocks at whole-pixel positions.
  const { data } = await rgba(Buffer.from(v.clockSvg));
  const alpha = (x, y) => data[(y * FACE + x) * 4 + 3];
  let ink = 0;
  let partial = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] === 255) ink += 1;
    else if (data[i] !== 0) partial += 1;
  }
  if (partial) smoothingFailures.push(`${v.name}: ${partial} partially covered pixels`);

  let expectedInk = 0;
  const broken = new Set();
  for (const run of v.runs.filter((r) => FONT_FOR_ROLE[r.role] === 'departure-mono')) {
    const block = run.size / departure.pixelsPerEm;
    for (const glyph of run.glyphs) {
      for (const [col, row] of nativePixels.get(glyph.char) ?? []) {
        expectedInk += block * block;
        const left = glyph.x + col * block;
        const top = run.baseline - (row + 1) * block;
        for (let y = top; y < top + block; y += 1) {
          for (let x = left; x < left + block; x += 1) {
            if (alpha(x, y) !== 255) broken.add(`${v.name}: "${glyph.char}" is not a ${block}x scaled copy of the font`);
          }
        }
      }
    }
  }
  geometryFailures.push(...broken);
  if (ink !== expectedInk) geometryFailures.push(`${v.name}: ${ink} ink pixels, expected ${expectedInk}`);
}
check('renders are 450x450 PNG files', sizeFailures);
check('renders match the JavaScript definitions (not hand-edited or stale)', staleFailures);
check('Departure Mono text has no font smoothing (every pixel fully on or off)', smoothingFailures);
check('Departure Mono glyphs keep the original pixel geometry (uniform scale, no stretching)', geometryFailures);

// --- Comparison page ------------------------------------------------------

const pageFailures = [];
if (!existsSync(join(distDir, 'previews/clock-font.html'))) {
  pageFailures.push('previews/clock-font.html is missing');
} else {
  const html = readFileSync(join(distDir, 'previews/clock-font.html'), 'utf8');
  pageFailures.push(
    ...variants.filter((v) => !html.includes(`clock-font/${v.name}.png`)).map((v) => `${v.name} is not shown`),
  );
  if (/(?:src|href)\s*=\s*"(?:https?:)?\/\//i.test(html) || /url\(\s*['"]?https?:/i.test(html) || /@import/.test(html)) {
    pageFailures.push('references a network resource');
  }
}
check('comparison page shows every render and uses no network resources', pageFailures);

// --- Report ---------------------------------------------------------------

for (const { label, failures } of results) {
  console.log(`${failures.length ? 'FAIL' : 'PASS'}  ${label}`);
  for (const failure of failures) console.log(`        ${failure}`);
}
const failed = results.filter((r) => r.failures.length).length;
console.log(`\n${results.length - failed}/${results.length} clock font checks passed`);
if (failed) process.exit(1);
