/**
 * Single-colour icon artwork (Freddy mark, event glyphs, the split-view glyph)
 * is drawn as an image with its light-theme colour baked in, so it cannot read
 * `--color-icon-*`. Registering it here adds a dark-theme rule that re-lights
 * the image (invert + hue-rotate keeps the hue and flips the lightness), so it
 * follows the theme switch without every consumer having to re-render.
 */
const registered = new Set<string>();
let style: HTMLStyleElement | undefined;

export function monoIcon(url: string): string {
  if (typeof document === 'undefined' || registered.has(url)) return url;
  registered.add(url);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('data-mono-icons', '');
    document.head.appendChild(style);
  }
  const attr = url.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const selector = `img[src="${attr}"]`;
  style.appendChild(
    document.createTextNode(
      `.dew-dark-theme ${selector}, [data-surface='dark'] ${selector} { filter: invert(1) hue-rotate(180deg); }\n`
    )
  );
  return url;
}
