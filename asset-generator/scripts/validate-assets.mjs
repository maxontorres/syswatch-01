// Validates the generated output in dist/. Exits non-zero if any check fails.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { parseSvg } from '../src/svg-parse.mjs';
import { weatherMapping } from '../src/icon-definitions.mjs';
import { buildCatalog, distDir, isIcon } from '../src/asset-catalog.mjs';

const EXPECTED_ICONS = [
  'calendar', 'heart', 'battery', 'compass',
  'weather-unknown', 'weather-clear', 'weather-partly-cloudy', 'weather-cloudy',
  'weather-fog', 'weather-rain', 'weather-heavy-rain', 'weather-snow',
  'weather-storm', 'weather-sleet', 'weather-wind',
];
const EXPECTED_STRUCTURAL = [
  'background-grid', 'hud-frame', 'seconds-ring-base', 'seconds-ring-active',
];
const FORBIDDEN_ELEMENTS = /^(text|tspan|textPath|image|foreignObject|filter|fe[A-Z]\w*|linearGradient|radialGradient|pattern|style|script)$/;

const results = [];
const check = (label, failures) => results.push({ label, failures });
const read = (rel) => readFileSync(join(distDir, rel), 'utf8').replace(/\r\n/g, '\n');

const catalog = buildCatalog();
const icons = catalog.filter(isIcon);
const structural = catalog.filter((a) => !isIcon(a));
const names = (list) => list.map((a) => a.name);
const missingFrom = (expected, actual) => expected.filter((n) => !actual.includes(n));
const sameSet = (expected, actual) => [
  ...missingFrom(expected, actual).map((n) => `missing ${n}`),
  ...missingFrom(actual, expected).map((n) => `unexpected ${n}`),
];
const onDisk = (dir, ext) =>
  existsSync(join(distDir, dir))
    ? readdirSync(join(distDir, dir)).filter((f) => f.endsWith(ext)).map((f) => f.slice(0, -ext.length))
    : [];

// --- Presence -------------------------------------------------------------

check('exactly 15 icons are defined', [
  ...(icons.length === 15 ? [] : [`found ${icons.length}`]),
  ...sameSet(EXPECTED_ICONS, names(icons)),
]);
check('all 4 structural assets are defined', sameSet(EXPECTED_STRUCTURAL, names(structural)));
check('dist/svg contains exactly the expected files', sameSet(names(catalog), onDisk('svg', '.svg')));
check('dist/png contains exactly the expected files', sameSet(names(catalog), onDisk('png', '.png')));

// --- SVG ------------------------------------------------------------------

const parsed = new Map();
const parseFailures = [];
const staleFailures = [];
for (const asset of catalog) {
  if (!existsSync(join(distDir, asset.svgPath))) continue;
  const source = read(asset.svgPath);
  if (source !== asset.svg) staleFailures.push(`${asset.svgPath} differs from its definition`);
  try {
    parsed.set(asset.name, parseSvg(source));
    await sharp(Buffer.from(source)).metadata(); // second opinion from librsvg
  } catch (error) {
    parseFailures.push(`${asset.svgPath}: ${error.message}`);
  }
}
check('SVG files parse successfully', parseFailures);
check('SVG files match the JavaScript definitions (not hand-edited or stale)', staleFailures);

const viewBoxFailures = (list, size) =>
  list.flatMap((a) => {
    const root = parsed.get(a.name)?.[0].attrs;
    if (!root) return [`${a.name}: not parsed`];
    const ok =
      root.viewBox === `0 0 ${size} ${size}` && root.width === String(size) && root.height === String(size);
    return ok ? [] : [`${a.name}: viewBox="${root.viewBox}" width="${root.width}" height="${root.height}"`];
  });
check('icon SVGs use viewBox 0 0 64 64', viewBoxFailures(icons, 64));
check('structural SVGs use viewBox 0 0 450 450', viewBoxFailures(structural, 450));

const forbidden = (describe, test) =>
  check(
    describe,
    catalog.flatMap((a) =>
      (parsed.get(a.name) ?? []).filter(test).map((e) => `${a.name}: <${e.name}>`),
    ),
  );
const attrText = (e) => Object.entries(e.attrs).map(([k, v]) => `${k}=${v}`).join(' ');
forbidden('SVGs contain no text elements', (e) => /^(text|tspan|textPath)$/.test(e.name));
forbidden('SVGs contain no image elements or embedded rasters', (e) =>
  e.name === 'image' || /data:|href=/.test(attrText(e)));
forbidden('SVGs contain no filters, blur or shadows', (e) =>
  /^(filter|fe[A-Z]\w*)$/.test(e.name) || /filter=|blur|shadow/i.test(attrText(e)));
forbidden('SVGs contain no gradients', (e) =>
  /Gradient$/.test(e.name) || /url\(/.test(attrText(e)));
forbidden('SVGs contain no other disallowed elements', (e) => FORBIDDEN_ELEMENTS.test(e.name));

// --- Seconds rings --------------------------------------------------------

const ringPolygons = (name) =>
  (parsed.get(name) ?? []).filter((e) => e.name === 'polygon').map((e) => e.attrs.points);

function ringFailures(name) {
  const { segments, innerRadius, outerRadius } = tokens.secondsRing;
  const centre = tokens.watchFace.size / 2;
  const polygons = ringPolygons(name);
  if (polygons.length !== 60) return [`${name}: ${polygons.length} segments`];
  const cell = 360 / segments;
  return polygons.flatMap((points, i) => {
    const pts = points.split(' ').map((p) => p.split(',').map(Number));
    const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length - centre;
    const cy = pts.reduce((s, p) => s + p[1], 0) / pts.length - centre;
    const angle = ((Math.atan2(cx, -cy) * 180) / Math.PI + 360) % 360;
    const radii = pts.map((p) => Math.hypot(p[0] - centre, p[1] - centre));
    const failures = [];
    if (Math.abs(angle - (i + 0.5) * cell) > 0.01) {
      failures.push(`${name}: segment ${i} centred at ${angle.toFixed(3)} degrees`);
    }
    if (Math.min(...radii) < innerRadius - 0.01 || Math.max(...radii) > outerRadius + 0.01) {
      failures.push(`${name}: segment ${i} leaves the ${innerRadius}-${outerRadius} band`);
    }
    return failures;
  });
}
check('seconds-ring-base has exactly 60 evenly spaced segments', ringFailures('seconds-ring-base'));
check('seconds-ring-active has exactly 60 evenly spaced segments', ringFailures('seconds-ring-active'));
check(
  'seconds rings share identical segment geometry',
  ringPolygons('seconds-ring-base').join('|') === ringPolygons('seconds-ring-active').join('|') &&
    ringPolygons('seconds-ring-base').length > 0
    ? []
    : ['base and active polygons differ'],
);

// --- PNG ------------------------------------------------------------------

const sizeFailures = [];
const alphaFailures = [];
for (const asset of catalog) {
  const file = join(distDir, asset.pngPath);
  if (!existsSync(file)) continue;
  const image = sharp(file);
  const meta = await image.metadata();
  if (meta.format !== 'png' || meta.width !== asset.width || meta.height !== asset.height) {
    sizeFailures.push(`${asset.pngPath}: ${meta.format} ${meta.width}x${meta.height}`);
  }
  const { channels } = await image.stats();
  const alpha = meta.hasAlpha ? channels[channels.length - 1] : null;
  if (asset.transparent) {
    // Must have fully transparent pixels and also some visible content.
    if (!alpha || alpha.min !== 0 || alpha.max === 0) {
      alphaFailures.push(`${asset.pngPath}: expected a transparent background with visible content`);
    }
  } else if (alpha && alpha.min !== 255) {
    alphaFailures.push(`${asset.pngPath}: expected a fully opaque image`);
  }
}
const sizeOf = (list) => sizeFailures.filter((f) => list.some((a) => f.startsWith(a.pngPath)));
check('icon PNGs are exactly 64x64', sizeOf(icons));
check('structural PNGs are exactly 450x450', sizeOf(structural));
check('PNGs preserve transparency where required (background-grid is opaque)', alphaFailures);

// --- Manifest, mapping, preview -------------------------------------------

const manifestFailures = [];
if (!existsSync(join(distDir, 'manifest.json'))) {
  manifestFailures.push('manifest.json is missing');
} else {
  const manifest = JSON.parse(read('manifest.json'));
  const listed = manifest.assets.map((a) => a.name);
  manifestFailures.push(...sameSet(names(catalog), listed));
  if (listed.join() !== [...listed].sort().join()) manifestFailures.push('entries are not sorted');
  for (const entry of manifest.assets) {
    for (const rel of [entry.svg, entry.png]) {
      if (!existsSync(join(distDir, rel))) manifestFailures.push(`${entry.name}: ${rel} does not exist`);
    }
  }
}
check('every expected asset appears in manifest.json', manifestFailures);

const mappingFailures = [];
if (!existsSync(join(distDir, 'weather-mapping.json'))) {
  mappingFailures.push('weather-mapping.json is missing');
} else {
  const mapping = JSON.parse(read('weather-mapping.json'));
  const weatherIcons = names(icons).filter((n) => n.startsWith('weather-'));
  const targets = [...Object.values(mapping.labels), mapping.fallback];
  mappingFailures.push(
    ...missingFrom(targets, weatherIcons).map((n) => `maps to unknown icon ${n}`),
    ...missingFrom(weatherIcons, targets).map((n) => `no label maps to ${n}`),
  );
  if (!mapping.wfsNumericMapping?.note || mapping.wfsNumericMapping.values !== null) {
    mappingFailures.push('must carry the WFS verification note and no numeric values');
  }
  if (JSON.stringify(mapping) !== JSON.stringify(weatherMapping)) {
    mappingFailures.push('differs from the definition in icon-definitions.mjs');
  }
}
check('weather-mapping.json targets real icons and invents no WFS numeric values', mappingFailures);

const previewFailures = [];
if (!existsSync(join(distDir, 'previews/index.html'))) {
  previewFailures.push('previews/index.html is missing');
} else {
  const html = read('previews/index.html');
  previewFailures.push(
    ...names(catalog).filter((n) => !html.includes(`svg/${n}.svg`)).map((n) => `${n} is not shown`),
  );
  if (/(?:src|href)\s*=\s*"(?:https?:)?\/\//i.test(html) || /url\(\s*['"]?https?:/i.test(html) || /@import/.test(html)) {
    previewFailures.push('references a network resource');
  }
}
check('preview shows every asset and uses no network resources', previewFailures);

// --- Report ---------------------------------------------------------------

for (const { label, failures } of results) {
  console.log(`${failures.length ? 'FAIL' : 'PASS'}  ${label}`);
  for (const failure of failures) console.log(`        ${failure}`);
}
const failed = results.filter((r) => r.failures.length).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
if (failed) process.exit(1);
