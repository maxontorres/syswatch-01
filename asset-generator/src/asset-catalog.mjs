// The single list of every asset the generator produces, shared by the generate,
// preview and validate scripts.

import { fileURLToPath } from 'node:url';
import { tokens } from './svg-helpers.mjs';
import { icons, renderIconSvg } from './icon-definitions.mjs';
import { structuralAssets, renderStructuralSvg } from './structural-definitions.mjs';

export const distDir = fileURLToPath(new URL('../dist/', import.meta.url));

const entry = (name, category, size, transparent, svg) => ({
  name,
  category,
  width: size,
  height: size,
  transparent,
  svgPath: `svg/${name}.svg`,
  pngPath: `png/${name}.png`,
  svg,
});

/** Every asset in definition order, with its rendered SVG source. */
export function buildCatalog() {
  return [
    ...icons.map((icon) =>
      entry(icon.name, `icon-${icon.category}`, tokens.icon.size, true, renderIconSvg(icon)),
    ),
    ...structuralAssets.map((asset) =>
      entry(asset.name, 'structural', tokens.watchFace.size, asset.transparent, renderStructuralSvg(asset)),
    ),
  ];
}

export const isIcon = (asset) => asset.category.startsWith('icon-');
