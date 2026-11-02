/** The deploy's base path without a trailing slash: '' at a domain root, '/blueprint' on GitHub Pages. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/**
 * A link to a page or file on this site, with the base path in front (see `base` in
 * astro.config.mjs): `/blog` becomes `/blueprint/blog` under a sub-path, and stays `/blog`
 * at a domain root. Anything else (external URLs, #anchors) passes through unchanged.
 */
export const href = (path: string) =>
  path.startsWith('/') && !path.startsWith('//') ? `${BASE}${path}`.replace(/(.)\/$/, '$1') : path;

/**
 * The page's path within the site, without the base path. Builds see file paths
 * (`/index.html`, `/blog/x.html`, see `build.format` in astro.config.mjs); dev sees clean
 * URLs. Both become `/` and `/blog/x`.
 */
export const cleanPath = (pathname: string) =>
  (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname).replace(/(\/index)?\.html$|\/$/, '') || '/';

/** A URL fragment for a heading: "Example Corp" -> "example-corp". */
export const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
