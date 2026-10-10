// Generates every SVG from the JavaScript definitions, exports each one to PNG
// with Sharp, then writes manifest.json (assets and fonts) and weather-mapping.json.
// Output is deterministic: no timestamps, sorted manifest, stale files removed.

import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tokens } from '../src/svg-helpers.mjs';
import { weatherMapping } from '../src/icon-definitions.mjs';
import { buildCatalog, distDir } from '../src/asset-catalog.mjs';
import { fontManifest } from '../src/font-definitions.mjs';

const catalog = buildCatalog();

// Create output directories and drop generated files that are no longer defined.
for (const [dir, ext] of [['svg', '.svg'], ['png', '.png']]) {
  const abs = join(distDir, dir);
  mkdirSync(abs, { recursive: true });
  const expected = new Set(catalog.map((a) => `${a.name}${ext}`));
  for (const file of readdirSync(abs)) {
    if (file.endsWith(ext) && !expected.has(file)) {
      rmSync(join(abs, file));
      console.log(`removed stale ${dir}/${file}`);
    }
  }
}

for (const asset of catalog) {
  writeFileSync(join(distDir, asset.svgPath), asset.svg);
  await sharp(Buffer.from(asset.svg))
    .resize(asset.width, asset.height)
    .png({ compressionLevel: 9 })
    .toFile(join(distDir, asset.pngPath));
}

const manifest = {
  name: tokens.name,
  assetCount: catalog.length,
  assets: catalog
    .map(({ name, category, width, height, transparent, svgPath, pngPath }) => ({
      name,
      category,
      width,
      height,
      transparent,
      svg: svgPath,
      png: pngPath,
    }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
  fonts: fontManifest(),
};

const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
writeFileSync(join(distDir, 'manifest.json'), json(manifest));
writeFileSync(join(distDir, 'weather-mapping.json'), json(weatherMapping));

const iconCount = catalog.filter((a) => a.category !== 'structural').length;
console.log(
  `generated ${iconCount} icons and ${catalog.length - iconCount} structural assets (SVG + PNG)`,
);
