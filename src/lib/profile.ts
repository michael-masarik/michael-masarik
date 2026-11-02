import { getEntry } from 'astro:content';

/** content/profile.yaml, with `hidden: true` entries removed. */
export async function getProfile() {
  const entry = await getEntry('profile', 'profile');
  if (!entry) throw new Error(
      "content/profile.yaml wasn't loaded. Check that it exists and that the terminal shows no validation error for it; if you just fixed one, restart `bun run dev`.",
    );
  const { data } = entry;
  const visible = <T extends { hidden: boolean }>(entries: T[]) => entries.filter((entry) => !entry.hidden);
  return {
    ...data,
    experience: visible(data.experience),
    education: visible(data.education),
  };
}

const monthFormat = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2024-08" -> "Aug 2024"; "2018" stays "2018". */
const formatMonth = (value: string) => (value.length === 4 ? value : monthFormat.format(new Date(`${value}-01`)));

/** "Aug 2024 – Present", "2018 – 2022" */
export const formatSpan = (start: string, end?: string) => `${formatMonth(start)} – ${end ? formatMonth(end) : 'Present'}`;
