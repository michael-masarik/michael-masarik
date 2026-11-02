// RSS feed of published posts at /rss.xml (drafts are excluded by getPosts).
// Item links and GUIDs match the old feed exactly, so subscribers don't see posts again.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';
import { getProfile } from '../lib/profile';
import { href } from '../lib/paths';

export async function GET({ site }: APIContext) {
  const [posts, profile] = await Promise.all([getPosts(), getProfile()]);
  return rss({
    title: profile.feed.title,
    description: profile.feed.description,
    site: new URL(href('/'), site).href,
    trailingSlash: false,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    customData: `<atom:link href="${new URL(href('/rss.xml'), site)}" rel="self" type="application/rss+xml"/>`,
    items: posts.map(({ id, data }) => ({
      title: data.title,
      description: data.summary,
      pubDate: data.publishedAt,
      link: href(`/blog/${id}`),
    })),
  });
}
