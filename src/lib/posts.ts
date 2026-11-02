import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Collection filter: drafts are included in dev (to preview them) and left out of
 * production builds, so they never reach pages, RSS, or the sitemap.
 */
export const published = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

/** Published posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', published);
  return posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());
}

/** Minutes to read at 230 words a minute, at least 1. */
export const readingMinutes = (body = '') => Math.max(1, Math.round(body.split(/\s+/).length / 230));

// Frontmatter dates have no time, so they parse as UTC midnight; format them in UTC.
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** "Jun 3, 2024" */
export const formatDate = (date: Date) => dateFormat.format(date);

/** "Jun 3", for lists already grouped by year. */
export const formatDay = (date: Date) => dayFormat.format(date);

/** "2024.06.03", the title block's revision format. */
export const formatRevision = (date: Date) => date.toISOString().slice(0, 10).replaceAll('-', '.');
