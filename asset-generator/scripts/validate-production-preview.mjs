// Validates the production preview face and page. Exits non-zero if any check fails.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { distDir } from '../src/asset-catalog.mjs';
import { fontById } from '../src/font-definitions.mjs';
import { buildProductionFace } from '../src/production-definitions.mjs';

const EXPECTED = {
  clock: { font: 'departure-mono', size: 99, texts: ['6:42'] },
  meridiem: { font: 'departure-mono', texts: ['PM'] },
  date: { font: 'share-tech-mono', size: 20, texts: ['SAT · 10/10/2026'] },
  event: { font: 'share-tech-mono', texts: ['14:30  SYSTEM REVIEW'] },
  label: { font: 'share-tech-mono', texts: ['HR', 'BATT', 'RAIN'] },
  value: { font: 'share-tech-mono', texts: ['072', '84%', '18%'] },
};
const MAX_INACTIVE_OPACITY = 0.48;
const MIN_DATE_GAP = 10;
const FACE = tokens.watchFace.size;

const results = [];
const check = (label, failures) => results.push({ label, failures });
const rgba = (input) => sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const production = buildProductionFace();
const departure = fontById('departure-mono');

// --- Definition -----------------------------------------------------------

check(
  'the face shows exactly the expected content',
  Object.entries(EXPECTED).flatMap(([role, { texts }]) => {
    const shown = production.runs.filter((r) => r.role === role).map((r) => r.text);
    return shown.join('|') === texts.join('|') ? [] : [`${role}: shows "${shown.join('", "')}"`];
  }),
);
check(
  'Departure Mono sets only the clock and AM/PM; Share Tech Mono sets everything else',
  production.runs.filter((r) => r.fontId !== EXPECTED[r.role].font).map((r) => `${r.role} "${r.text}" uses ${r.fontId}`),
);
check(
  'the clock is 99 px and the date is 20 px',
  production.runs
    .filter((r) => EXPECTED[r.role].size && r.size !== EXPECTED[r.role].size)
    .map((r) => `${r.role} is ${r.size} px`),
);
check(
  'Departure Mono sizes are whole multiples of the 11 px design size',
  production.runs
    .filter((r) => r.fontId === 'departure-mono' && r.size % departure.pixelsPerEm !== 0)
    .map((r) => `${r.role} is ${r.size} px`),
);
check(
  'every glyph origin and baseline is a whole pixel',
  production.runs
    .filter((r) => !Number.isInteger(r.baseline) || r.glyphs.some((g) => !Number.isInteger(g.x)))
    .map((r) => `${r.role} "${r.text}"`),
);
check('the clock stays inside the HUD frame', production.clockMargin >= 0 ? [] : [`overruns by ${-production.clockMargin} px a side`]);

const { gapAbove, gapBelow, offCentre } = production.date;
check('the date is centred on the face', Math.abs(offCentre) <= 0.5 ? [] : [`ink centre is ${offCentre} px off`]);
check(`the date is at least ${MIN_DATE_GAP} px clear of the clock and the event strip, evenly`, [
  ...(gapAbove >= MIN_DATE_GAP ? [] : [`${gapAbove} px below the clock`]),
  ...(gapBelow >= MIN_DATE_GAP ? [] : [`${gapBelow} px above the event strip`]),
  ...(Math.abs(gapAbove - gapBelow) <= 1 ? [] : [`gaps are ${gapAbove} and ${gapBelow} px`]),
]);
check(
  'only the date separator is amber',
  /<g id="date-separator" fill="#FFB347">\s*<path [^>]*\/>\s*<\/g>/.test(production.faceSvg)
    ? []
    : ['the date-separator group is not a single amber glyph'],
);
check(
  `inactive ring segments are at most ${MAX_INACTIVE_OPACITY} opacity and elapsed segments are full primary`,
  [
    ...(tokens.secondsRing.inactiveOpacity <= MAX_INACTIVE_OPACITY ? [] : [`inactiveOpacity is ${tokens.secondsRing.inactiveOpacity}`]),
    ...(new RegExp(`<g fill="${tokens.color.primary}">\\s*<polygon`).test(production.faceSvg) ? [] : ['elapsed segments are not plain primary']),
  ],
);

// --- Render ---------------------------------------------------------------

const renderFailures = [];
const file = join(distDir, production.pngPath);
if (!existsSync(file)) {
  renderFailures.push(`${production.pngPath} is missing`);
} else {
  const meta = await sharp(file).metadata();
  if (meta.format !== 'png' || meta.width !== FACE || meta.height !== FACE) {
    renderFailures.push(`${production.pngPath}: ${meta.format} ${meta.width}x${meta.height}`);
  } else {
    const [saved, fresh] = await Promise.all([rgba(file), rgba(Buffer.from(production.faceSvg))]);
    if (!saved.data.equals(fresh.data)) renderFailures.push(`${production.pngPath} differs from its definition`);
  }
}
check('the render is a 450x450 PNG that matches the JavaScript definition', renderFailures);

const { data } = await rgba(Buffer.from(production.clockSvg));
let partial = 0;
for (let i = 3; i < data.length; i += 4) if (data[i] !== 0 && data[i] !== 255) partial += 1;
check('Departure Mono text has no font smoothing (every pixel fully on or off)', partial ? [`${partial} partially covered pixels`] : []);

// --- Page -----------------------------------------------------------------

const pageFailures = [];
if (!existsSync(join(distDir, production.htmlPath))) {
  pageFailures.push(`${production.htmlPath} is missing`);
} else {
  const html = readFileSync(join(distDir, production.htmlPath), 'utf8');
  if (!html.includes(`src="${production.name}.png"`)) pageFailures.push('the render is not shown');
  if (/(?:src|href)\s*=\s*"(?:https?:)?\/\//i.test(html) || /url\(\s*['"]?https?:/i.test(html) || /@import/.test(html)) {
    pageFailures.push('references a network resource');
  }
}
check('the preview page shows the render and uses no network resources', pageFailures);

// --- Report ---------------------------------------------------------------

for (const { label, failures } of results) {
  console.log(`${failures.length ? 'FAIL' : 'PASS'}  ${label}`);
  for (const failure of failures) console.log(`        ${failure}`);
}
const failed = results.filter((r) => r.failures.length).length;
console.log(`\n${results.length - failed}/${results.length} production preview checks passed`);
if (failed) process.exit(1);
