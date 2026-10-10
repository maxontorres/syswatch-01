// Minimal SVG well-formedness parser shared by the validation scripts.

/**
 * Returns the flat element list, or throws on unbalanced tags, malformed markup
 * or stray character data.
 */
export function parseSvg(source) {
  const token =
    /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<(\/?)([A-Za-z_][\w:.-]*)((?:\s+[\w:.-]+\s*=\s*"[^"<]*")*)\s*(\/?)>|([^<]+)|(<)/g;
  const elements = [];
  const stack = [];
  let roots = 0;
  for (const m of source.matchAll(token)) {
    const [, closing, name, rawAttrs, selfClosing, chars, stray] = m;
    if (stray) throw new Error(`malformed markup at offset ${m.index}`);
    if (chars !== undefined) {
      if (chars.trim()) throw new Error(`unexpected character data "${chars.trim().slice(0, 20)}"`);
      continue;
    }
    if (!name) continue;
    if (closing) {
      const open = stack.pop();
      if (open !== name) throw new Error(`</${name}> closes <${open ?? 'nothing'}>`);
      continue;
    }
    if (stack.length === 0) roots += 1;
    const attrs = Object.fromEntries(
      [...rawAttrs.matchAll(/([\w:.-]+)\s*=\s*"([^"]*)"/g)].map((a) => [a[1], a[2]]),
    );
    elements.push({ name, attrs, parent: stack.at(-1) });
    if (!selfClosing) stack.push(name);
  }
  if (stack.length) throw new Error(`unclosed <${stack.at(-1)}>`);
  if (roots !== 1 || elements[0]?.name !== 'svg') throw new Error('expected a single <svg> root');
  return elements;
}
