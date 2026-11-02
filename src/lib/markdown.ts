import { href } from './paths';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/**
 * Inline Markdown for short text fields (content/profile.yaml): `code`, [links](url), **bold**, and *italic* or _italic_. Everything else is
 * escaped, so the result is safe for set:html.
 *
 * @example inline('Contributor to [pandas](https://pandas.pydata.org)')
 *   // 'Contributor to <a href="https://pandas.pydata.org">pandas</a>'
 */
export const inline = (text: string) =>
  text
    .replace(/[&<>"']/g, (c) => ESCAPES[c])
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text: string, url: string) => `<a href="${href(url)}">${text}</a>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*|(?<!\w)_(.+?)_(?!\w)/g, '<em>$1$2</em>');

/** The same text with inline Markdown removed, for meta descriptions. */
export const plain = (text: string) =>
  text
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
    .replace(/\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`/g, '$1$2$3');
