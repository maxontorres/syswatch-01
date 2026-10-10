// Clock font comparison: renders complete watch faces with Departure Mono as the main
// clock font at every candidate size and tracking, and writes
// dist/previews/clock-font.html. Output is deterministic and stale renders are
// removed. Nothing outside dist/previews/clock-font* is touched.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { layout } from '../src/structural-definitions.mjs';
import { distDir } from '../src/asset-catalog.mjs';
import { fontById } from '../src/font-definitions.mjs';
import {
  CLOCK_FONT, CLOCK_SIZES, INTERFACE_FONT, SAMPLE_TIMES, TRACKING_STEPS, buildClockFontVariants,
} from '../src/clock-font-definitions.mjs';

const variants = buildClockFontVariants();
const outDir = join(distDir, 'previews/clock-font');

// --- Renders --------------------------------------------------------------

mkdirSync(outDir, { recursive: true });
const expected = new Set(variants.map((v) => `${v.name}.png`));
for (const file of readdirSync(outDir)) {
  if (file.endsWith('.png') && !expected.has(file)) {
    rmSync(join(outDir, file));
    console.log(`removed stale previews/clock-font/${file}`);
  }
}

for (const v of variants) {
  await sharp(Buffer.from(v.faceSvg)).png({ compressionLevel: 9 }).toFile(join(distDir, v.pngPath));
}

// --- Comparison page ------------------------------------------------------

const { background, primary, secondary, accent } = tokens.color;
const face = tokens.watchFace.size;
const clockFont = fontById(CLOCK_FONT);
const interfaceFont = fontById(INTERFACE_FONT);

const trackingLabel = (v) =>
  v.tracking === 0 ? 'default tracking' : `tracking ${v.tracking} px (${v.trackingStep} design px)`;
const fitLabel = (v) =>
  v.margin >= 0
    ? `${v.margin} px clear of the frame`
    : `<span class="over">overruns the frame by ${-v.margin} px a side</span>`;

const faceCard = (v) => `        <figure class="card">
          <div class="face"><img src="clock-font/${v.name}.png" width="${face}" height="${face}" alt="${v.time} ${v.meridiem} at ${v.size} px, ${trackingLabel(v)}"></div>
          <figcaption>${v.time} ${v.meridiem} &middot; ${trackingLabel(v)}<br><span class="note">ink ${v.inkWidth} px wide &middot; ${fitLabel(v)}</span></figcaption>
        </figure>`;

const sizeSection = (size) => {
  const ofSize = variants.filter((v) => v.size === size);
  return `  <section id="size-${size}">
    <h2>${size} px &middot; ${ofSize[0].scale}&times; the ${clockFont.pixelsPerEm} px design size</h2>
    <p>Each design pixel is a ${ofSize[0].scale}&times;${ofSize[0].scale} block. Digits are ${5 * ofSize[0].scale} px wide and ${8 * ofSize[0].scale} px tall on a ${7 * ofSize[0].scale} px advance.</p>
${SAMPLE_TIMES.map(
  (sample) => `    <div class="row">
${ofSize.filter((v) => v.time === sample.time).map(faceCard).join('\n')}
    </div>`,
).join('\n')}
  </section>`;
};

const summaryRow = (size, step) => {
  const cells = SAMPLE_TIMES.map((sample) => {
    const v = variants.find((x) => x.size === size && x.time === sample.time && x.trackingStep === step);
    return `<td${v.margin < 0 ? ' class="over"' : ''}>${v.inkWidth} (${v.margin >= 0 ? '+' : ''}${v.margin})</td>`;
  });
  const first = variants.find((x) => x.size === size && x.trackingStep === step);
  return `      <tr><th>${size} px</th><td>${first.tracking} px</td>${cells.join('')}</tr>`;
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Syswatch 01 clock font comparison</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 24px; background: ${background}; color: ${primary};
    font: 13px/1.5 Consolas, "Lucida Console", monospace; }
  h1 { font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; }
  h2 { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: ${accent};
    border-bottom: 1px solid ${secondary}; padding-bottom: 4px; margin: 40px 0 8px; }
  p { color: ${secondary}; margin: 0 0 16px; max-width: 90ch; }
  nav a { color: ${primary}; margin-right: 16px; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
  .card { margin: 0; padding: 12px; border: 1px solid ${secondary}; background: #000; }
  figcaption { margin-top: 8px; }
  .note { color: ${secondary}; }
  .over { color: ${accent}; }
  /* The renders are shown 1:1 and must never be resampled by the browser. */
  img { display: block; image-rendering: pixelated; }
  .face { width: ${face}px; height: ${face}px; border-radius: 50%; overflow: hidden; flex: none; }
  table { border-collapse: collapse; margin-bottom: 16px; }
  th, td { border: 1px solid ${secondary}; padding: 4px 10px; text-align: right; }
  thead th { color: ${accent}; }
</style>
</head>
<body>
  <h1>Syswatch 01 clock font comparison</h1>
  <p>Generated by scripts/generate-clock-font.mjs. ${clockFont.family} ${clockFont.version} by
    ${clockFont.designer} (SIL Open Font License 1.1, ${clockFont.source}) is the
    production clock font, locked at ${tokens.typography.clock.size} px. It sets the main clock numerals, the colon and AM/PM only. The date,
    event text, heart rate, battery and weather are ${interfaceFont.family} ${interfaceFont.version}. All
    values are sample content.</p>
  <p>The clock is drawn from the unmodified font outlines at whole multiples of
    ${clockFont.pixelsPerEm} px, with one uniform scale, whole-pixel glyph origins and
    anti-aliasing off. Tracking only moves glyphs closer together; the glyphs themselves are
    untouched. AM/PM is ${tokens.typography.clock.meridiemSize} px. The clock area of the HUD
    frame is ${layout.clock.width} px wide.</p>
  <nav>${CLOCK_SIZES.map((s) => `<a href="#size-${s}">${s} px</a>`).join('')}<a href="production-preview.html">Production preview</a><a href="index.html">Asset preview</a><a href="numeral-lab.html">Numeral lab</a></nav>

  <h2>Clock ink width in px (clearance to the frame per side)</h2>
  <table>
    <thead><tr><th>Size</th><th>Tracking</th>${SAMPLE_TIMES.map((s) => `<th>${s.time} ${s.meridiem}</th>`).join('')}</tr></thead>
    <tbody>
${CLOCK_SIZES.flatMap((size) => TRACKING_STEPS.map((step) => summaryRow(size, step))).join('\n')}
    </tbody>
  </table>

${CLOCK_SIZES.map(sizeSection).join('\n\n')}
</body>
</html>
`;

writeFileSync(join(distDir, 'previews/clock-font.html'), html);

console.log(
  `rendered ${variants.length} clock font faces (${CLOCK_SIZES.join(', ')} px x ${SAMPLE_TIMES.length} times x ${TRACKING_STEPS.length} trackings)`,
);
console.log('wrote previews/clock-font.html');
