// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import placeholderGuard from './integrations/placeholder-guard.mjs';

// Static output, deployed to Vercel with no adapter.
// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Your site's address: used for canonical links, the sitemap, RSS, robots.txt, and
  // social previews. Change it before you deploy. SITE_URL and BASE_PATH override it, for
  // hosting under a sub-path such as GitHub Pages (https://you.github.io/repo, base /repo;
  // see .github/workflows/pages.yml).
  site: process.env.SITE_URL ?? 'https://example.com',
  base: process.env.BASE_PATH ?? '/',
  // URLs have no trailing slash (/blog/hello-world). Pages build to
  // blog/hello-world.html, served extensionless by vercel.json's cleanUrls.
  trailingSlash: 'never',
  build: { format: 'file' },
  // Code colours come from the design tokens (see "Code blocks" in site.css).
  markdown: { shikiConfig: { theme: 'css-variables' } },
  // The sitemap lists every built page; drafts aren't built in production.
  integrations: [mdx(), sitemap(), placeholderGuard()],
});
