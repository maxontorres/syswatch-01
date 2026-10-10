// Fonts used by Syswatch 01 and the helpers that turn their outlines into SVG paths.
// The original font files live under assets/fonts/<id>/ next to their licence and are
// never modified: text is laid out glyph by glyph from the unaltered outlines.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { fmt } from './svg-helpers.mjs';

export const fontsDir = fileURLToPath(new URL('../assets/fonts/', import.meta.url));

export const fonts = [
  {
    id: 'departure-mono',
    family: 'Departure Mono',
    role: 'clock',
    usage: ['main clock numerals', 'colon', 'AM/PM'],
    version: '1.500',
    designer: 'Helena Zhang',
    license: 'OFL-1.1',
    source: 'https://github.com/rektdeckard/departure-mono',
    release: 'https://github.com/rektdeckard/departure-mono/releases/download/v1.500/DepartureMono-1.500.zip',
    file: 'DepartureMono-Regular.otf',
    licenseFile: 'LICENSE',
    // Pixel font: one design pixel per 1/11 em, so sizes must be multiples of 11 px.
    pixelsPerEm: 11,
  },
  {
    id: 'share-tech-mono',
    family: 'Share Tech Mono',
    role: 'interface',
    usage: ['date', 'event text', 'heart rate', 'battery', 'weather', 'small interface labels'],
    version: '1.003',
    designer: 'Ralph Oliver du Carrois',
    license: 'OFL-1.1',
    source: 'https://github.com/google/fonts/tree/main/ofl/sharetechmono',
    file: 'ShareTechMono-Regular.ttf',
    licenseFile: 'OFL.txt',
  },
];

export const fontById = (id) => {
  const font = fonts.find((f) => f.id === id);
  if (!font) throw new Error(`unknown font ${id}`);
  return font;
};

export const fontPath = (font, file = font.file) => `${fontsDir}${font.id}/${file}`;

const parsed = new Map();

/** The parsed opentype.js font for a font id. */
export function loadFont(id) {
  if (!parsed.has(id)) {
    const bytes = readFileSync(fontPath(fontById(id)));
    parsed.set(id, opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)));
  }
  return parsed.get(id);
}

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

/** Manifest entries for every font. Paths are relative to dist/, like the asset paths. */
export function fontManifest() {
  return fonts
    .map((font) => ({
      name: font.id,
      family: font.family,
      role: font.role,
      usage: font.usage,
      version: font.version,
      designer: font.designer,
      license: font.license,
      source: font.source,
      file: `../assets/fonts/${font.id}/${font.file}`,
      licenseFile: `../assets/fonts/${font.id}/${font.licenseFile}`,
      sha256: sha256(fontPath(font)),
      licenseSha256: sha256(fontPath(font, font.licenseFile)),
    }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

// --- Text layout ----------------------------------------------------------

/** SVG path data for one glyph, scaled uniformly, with its origin at (x, baseline). */
export function glyphPathData(fontId, char, size, x, baseline) {
  const font = loadFont(fontId);
  const k = size / font.unitsPerEm;
  const px = (v) => fmt(x + v * k);
  const py = (v) => fmt(baseline - v * k);
  return font
    .charToGlyph(char)
    .path.commands.map((c) => {
      switch (c.type) {
        case 'M': return `M${px(c.x)} ${py(c.y)}`;
        case 'L': return `L${px(c.x)} ${py(c.y)}`;
        case 'Q': return `Q${px(c.x1)} ${py(c.y1)} ${px(c.x)} ${py(c.y)}`;
        case 'C': return `C${px(c.x1)} ${py(c.y1)} ${px(c.x2)} ${py(c.y2)} ${px(c.x)} ${py(c.y)}`;
        default: return 'Z';
      }
    })
    .join('');
}

/**
 * Lay out a single line of text. Glyph origins are always whole pixels: the advance
 * (plus `tracking` px) is accumulated exactly and each origin is rounded on its own.
 * `x` is the origin of the first glyph. Returns the glyphs and the ink extent.
 */
export function layoutText(fontId, text, { size, x, baseline, tracking = 0 }) {
  const font = loadFont(fontId);
  const k = size / font.unitsPerEm;
  const chars = [...text];
  let pen = 0;
  const glyphs = chars.map((char) => {
    const glyph = font.charToGlyph(char);
    const origin = x + Math.round(pen);
    pen += glyph.advanceWidth * k + tracking;
    const box = glyph.getBoundingBox();
    return {
      char,
      x: origin,
      inkLeft: origin + box.x1 * k,
      inkRight: origin + box.x2 * k,
      empty: glyph.path.commands.length === 0,
    };
  });
  const inked = glyphs.filter((g) => !g.empty);
  return {
    fontId,
    text,
    size,
    baseline,
    tracking,
    glyphs,
    inkLeft: Math.min(...inked.map((g) => g.inkLeft)),
    inkRight: Math.max(...inked.map((g) => g.inkRight)),
  };
}

/** Shift a laid-out line horizontally by a whole number of pixels. */
export function shiftText(run, dx) {
  return {
    ...run,
    glyphs: run.glyphs.map((g) => ({ ...g, x: g.x + dx, inkLeft: g.inkLeft + dx, inkRight: g.inkRight + dx })),
    inkLeft: run.inkLeft + dx,
    inkRight: run.inkRight + dx,
  };
}

/** One <path> per inked glyph of a laid-out line. */
export function textPaths(run) {
  return run.glyphs
    .filter((g) => !g.empty)
    .map((g) => `<path d="${glyphPathData(run.fontId, g.char, run.size, g.x, run.baseline)}"/>`);
}
