// Numeral laboratory: writes every numeral family as SVG, exports each glyph to
// PNG with Sharp, and writes dist/previews/numeral-lab.html for comparison.
// Output is deterministic and stale glyph files are removed. Nothing outside the
// numerals directories and the lab page is touched.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { layout, structuralAssets } from '../src/structural-definitions.mjs';
import { distDir } from '../src/asset-catalog.mjs';
import {
  CHARACTERS, buildNumeralCatalog, fileStem, glyphSize, numeralFamilies,
} from '../src/numeral-definitions.mjs';
import { dateOverlaySvg } from '../src/date-definitions.mjs';

const catalog = buildNumeralCatalog();

// --- Assets ---------------------------------------------------------------

for (const family of numeralFamilies) {
  for (const [dir, ext] of [['svg', '.svg'], ['png', '.png']]) {
    const rel = `${dir}/numerals/${family.id}`;
    mkdirSync(join(distDir, rel), { recursive: true });
    const expected = new Set(CHARACTERS.map((c) => `${fileStem(c)}${ext}`));
    for (const file of readdirSync(join(distDir, rel))) {
      if (file.endsWith(ext) && !expected.has(file)) {
        rmSync(join(distDir, rel, file));
        console.log(`removed stale ${rel}/${file}`);
      }
    }
  }
}

for (const glyph of catalog) {
  writeFileSync(join(distDir, glyph.svgPath), glyph.svg);
  await sharp(Buffer.from(glyph.svg))
    .resize(glyph.width, glyph.height)
    .png({ compressionLevel: 9 })
    .toFile(join(distDir, glyph.pngPath));
}

// --- Comparison page ------------------------------------------------------

const { background, primary, secondary, accent } = tokens.color;
const face = tokens.watchFace.size;
const SAMPLES = ['0123456789', '10:08', '6:42', '12:59'];
const FACE_TIME = '10:08';
// Baseline of every numeral family inside its 112 px glyph box (see numeral-definitions.mjs).
const NUMERAL_BASELINE = 96;

const glyphImg = (family, char) => {
  const { width, height } = glyphSize(char);
  return `<img src="../png/numerals/${family.id}/${fileStem(char)}.png" width="${width}" height="${height}" alt="${char}">`;
};
const run = (family, text) => [...text].map((c) => glyphImg(family, c)).join('');
const box = (a) => `left:${a.x}px;top:${a.y}px;width:${a.width}px;height:${a.height}px`;
const layer = (a) =>
  `<img class="${a.name === 'seconds-ring-active' ? 'ring-active' : 'layer'}" src="../png/${a.name}.png" width="${face}" height="${face}" alt="${a.name}">`;

// Sample content for the mock only; none of this text exists in the assets.
const moduleSamples = [
  ['heart', '072'],
  ['battery', '84%'],
  ['weather-partly-cloudy', '18&deg;'],
];

const familySection = (family) => `  <section id="${family.id}">
    <h2>${family.label}</h2>
    <p>${family.description}</p>
    <div class="row">
      <div class="samples">
${SAMPLES.map(
  (text) => `        <figure class="card">
          <div class="run">${run(family, text)}</div>
          <figcaption>${text}</figcaption>
        </figure>`,
).join('\n')}
        <figure class="card">
          <div class="natives">
${CHARACTERS.map((c) => `            <span class="checker">${glyphImg(family, c)}</span>`).join('\n')}
          </div>
          <figcaption>Individual characters at native resolution &middot; digits 72&times;112 &middot; colon 28&times;112 &middot; transparent</figcaption>
        </figure>
      </div>
      <figure class="card">
        <div class="face">
${structuralAssets.map((a) => `          ${layer(a)}`).join('\n')}
          <div class="meridiem">PM</div>
          <div class="clock" style="top:${layout.clock.y}px">${run(family, FACE_TIME)}</div>
          ${dateOverlaySvg(layout.clock.y + NUMERAL_BASELINE)}
          <div class="area event" style="${box(layout.event)}">14:30 &nbsp;SYSTEM REVIEW</div>
${layout.modules
  .map(
    (m, i) =>
      `          <div class="area module" style="${box(m)}"><img src="../svg/${moduleSamples[i][0]}.svg" width="28" height="28" alt="${moduleSamples[i][0]}"><span>${moduleSamples[i][1]}</span></div>`,
  )
  .join('\n')}
        </div>
        <figcaption>${face}&times;${face} face &middot; ${FACE_TIME} PM <span class="note">(numerals are PNG; the date is Share Tech Mono; other text is placeholder HTML)</span></figcaption>
      </figure>
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Syswatch 01 numeral lab</title>
<style>
  :root { color-scheme: dark; }
  body { margin: 0; padding: 24px; background: ${background}; color: ${primary};
    font: 13px/1.5 Consolas, "Lucida Console", monospace; }
  h1 { font-size: 18px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 4px; }
  h2 { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: ${accent};
    border-bottom: 1px solid ${secondary}; padding-bottom: 4px; margin: 40px 0 8px; }
  p { color: ${secondary}; margin: 0 0 16px; max-width: 80ch; }
  nav a { color: ${primary}; margin-right: 16px; }
  .row { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-start; }
  .samples { display: flex; flex-direction: column; gap: 12px; align-items: flex-start; }
  .card { margin: 0; padding: 12px; border: 1px solid ${secondary}; background: #000; }
  figcaption { margin-top: 8px; }
  .note { color: ${secondary}; }
  img { display: block; }
  .run { display: flex; }
  .natives { display: flex; flex-wrap: wrap; gap: 8px; }
  .checker { background: repeating-conic-gradient(#0a1420 0% 25%, #050b12 0% 50%) 0 0 / 16px 16px; }
  .face { position: relative; width: ${face}px; height: ${face}px; border-radius: 50%;
    overflow: hidden; background: #000; flex: none; }
  .face > img, .face > .date { position: absolute; inset: 0; }
  .face .ring-active { clip-path: polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 50% 100%); }
  .clock { position: absolute; left: 0; right: 0; display: flex; justify-content: center; }
  .meridiem { position: absolute; right: ${face - (layout.clock.x + layout.clock.width) + 4}px;
    top: ${layout.clock.y - 22}px; font-size: 13px; letter-spacing: 2px; }
  .area { position: absolute; display: flex; align-items: center; justify-content: center; }
  .event { justify-content: flex-start; padding-left: 22px; box-sizing: border-box;
    letter-spacing: 1px; }
  .module { gap: 6px; font-size: 15px; }
</style>
</head>
<body>
  <h1>Syswatch 01 numeral lab</h1>
  <p>Generated by scripts/generate-numerals.mjs. Three candidate bitmap numeral families for the
    main clock, shown as the exported PNG files at 1:1. AM/PM stays in the small interface font.
    No family has been selected.</p>
  <nav>${numeralFamilies.map((f) => `<a href="#${f.id}">${f.label}</a>`).join('')}<a href="index.html">Asset preview</a></nav>

${numeralFamilies.map(familySection).join('\n\n')}
</body>
</html>
`;

mkdirSync(join(distDir, 'previews'), { recursive: true });
writeFileSync(join(distDir, 'previews/numeral-lab.html'), html);

console.log(
  `generated ${numeralFamilies.length} numeral families, ${catalog.length} glyphs (SVG + PNG)`,
);
console.log('wrote previews/numeral-lab.html');
