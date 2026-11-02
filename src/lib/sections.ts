import { getCollection } from 'astro:content';
import { published } from './posts';

/**
 * The site's sections, in nav order. Each is one "sheet" of the drawing: the title
 * block numbers sheets and drawings from this list. Home is reached by the f. mark.
 */
export const SECTIONS = [
  { href: '/', label: 'home' },
  { href: '/about', label: 'about' },
  { href: '/projects', label: 'projects' },
  { href: '/blog', label: 'blog' },
  { href: '/now', label: 'now' },
] as const;

/** Tabs within About (components/Tabs.astro). */
export const ABOUT_TABS = [
  { href: '/about', label: 'experience' },
  { href: '/about/education', label: 'education' },
];

type Section = (typeof SECTIONS)[number];

/**
 * The sections shown in the nav and numbered in the title block. Projects is left out
 * until at least one project is published, so the nav never leads to an empty page.
 */
export async function getSections(): Promise<Section[]> {
  const hasProjects = (await getCollection('projects', published)).length > 0;
  return SECTIONS.filter(({ href }) => href !== '/projects' || hasProjects);
}

/** The section a clean path belongs to (`/blog/x` is in `/blog`), or -1. */
export const sectionIndex = (path: string, sections: readonly Section[] = SECTIONS) =>
  sections.findIndex(({ href }) => (href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`)));
