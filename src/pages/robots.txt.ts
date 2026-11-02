// robots.txt, pointing crawlers at the sitemap on the site's own address (astro.config.mjs).
import type { APIContext } from 'astro';
import { href } from '../lib/paths';

export const GET = ({ site }: APIContext) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(href('/sitemap-index.xml'), site)}\n`);
