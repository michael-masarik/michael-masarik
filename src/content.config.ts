// Content collections. Every file under content/ is validated at build time, and a
// bad field fails the build naming the file. See doc/content.md for every field.
// Text fields in profile.yaml accept inline Markdown: [links](url), **bold**, *italic*.
import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** A path under public/images/ that exists, written as it is served: `/images/...`. */
const publicImage = z
  .string()
  .startsWith('/images/', 'image paths start with /images/ (served from public/images/)')
  .refine((path) => existsSync(`public${path}`), { error: (issue) => `image not found: public${issue.input}` });

/** "2024" or "2024-08". Quote it in YAML if it would otherwise parse as a number. */
const month = z.union([z.number().int(), z.string()]).transform(String).pipe(z.string().regex(/^\d{4}(-\d{2})?$/, 'expected YYYY or YYYY-MM'));

/** Leave an entry out of the site without deleting it. */
const hidden = z.boolean().default(false);

/** One position held: its title, dates, and what you did in it. */
const role = {
  title: z.string(),
  start: month,
  /** Leave out for a current role. */
  end: month.optional(),
  highlights: z.array(z.string()).default([]),
};

/** What every job has: the company and one summary of the work there. */
const company = { org: z.string(), url: z.url().optional(), summary: z.string(), hidden };

/**
 * A job: either one role's fields directly, or `roles` (newest first) for several
 * positions at the same company, such as a promotion. Both become `roles`.
 */
const job = z
  .union([
    z.strictObject({ ...company, ...role }),
    z.strictObject({ ...company, roles: z.array(z.strictObject(role)).min(1) }),
  ], {
    error: 'expected org and one summary for the company, plus either title and start (one role) or roles, each with title, start, and highlights (no summary per role)',
  })
  .transform((entry) => {
    if ('roles' in entry) return entry;
    const { title, start, end, highlights, ...rest } = entry;
    return { ...rest, roles: [{ title, start, end, highlights }] };
  });

const posts = defineCollection({
  // The file name is the slug: content/posts/hello-world.mdx -> /blog/hello-world
  loader: glob({ base: './content/posts', pattern: '**/*.mdx' }),
  schema: z.strictObject({
    title: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    /** One sentence, used for SEO, RSS, and post lists. */
    summary: z.string(),
    /** Social preview image. */
    image: publicImage.optional(),
    showToc: z.boolean().default(true),
    /** The Bluesky post whose replies appear as comments. */
    blueskyPostUrl: z
      .url()
      .regex(/^https:\/\/bsky\.app\/profile\/[^/]+\/post\/[^/]+$/, 'expected https://bsky.app/profile/<handle>/post/<id>')
      .optional(),
    /** Drafts build in dev only; see getPosts() in src/lib/posts.ts. */
    draft: z.boolean().default(false),
  }),
});

/** content/profile.yaml: who you are, for Home and About. */
const profile = defineCollection({
  loader: glob({ base: './content', pattern: 'profile.yaml' }),
  schema: z.strictObject({
    name: z.string(),
    /** One line under your name on Home. */
    tagline: z.string(),
    location: z.string(),
    /** The default search and social-preview description. */
    description: z.string(),
    feed: z.strictObject({ title: z.string(), description: z.string() }),
    /** A square photo or avatar for the GitHub card on Home, e.g. /images/avatar.png. */
    avatar: z.string().startsWith('/', 'a served path like /images/avatar.png').optional(),
    links: z.strictObject({ email: z.email(), github: z.url(), linkedin: z.url().optional() }),
    /** Labels for Home's contact links. */
    contact: z.strictObject({ email: z.string(), linkedin: z.string().optional() }),
    /** Home's text, around the GitHub card and the post list. */
    home: z.strictObject({
      intro: z.array(z.string()),
      writing: z.string(),
      closing: z.array(z.string()).default([]),
    }),
    /** Each page's opening line, under its title; also its search description. */
    pages: z.strictObject({
      /** About's experience tab. */
      about: z.string(),
      education: z.string().optional(),
      projects: z.string(),
      blog: z.string(),
      now: z.string(),
    }),
    experience: z.array(job),
    education: z.array(
      z.strictObject({
        school: z.string(),
        degree: z.string(),
        start: month,
        end: month.optional(),
        details: z.array(z.string()).default([]),
        hidden,
      }),
    ),
  }),
});

const projects = defineCollection({
  // A body makes /projects/<file name> a write-up page; without one the project is only listed.
  loader: glob({ base: './content/projects', pattern: '**/*.mdx' }),
  schema: z.strictObject({
    title: z.string(),
    summary: z.string(),
    role: z.string().optional(),
    /** e.g. "2023" or "2022–2024" */
    years: z.string(),
    links: z.strictObject({ repo: z.url().optional(), demo: z.url().optional() }).default({}),
    /** Lower comes first. */
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

/** content/now.mdx: what you're doing now. */
const now = defineCollection({
  loader: glob({ base: './content', pattern: 'now.mdx' }),
  schema: z.strictObject({ updatedAt: z.coerce.date() }),
});

export const collections = { posts, profile, projects, now };
