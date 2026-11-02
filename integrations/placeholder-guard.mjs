// @ts-check
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MARKER = 'TODO(content)';
const DIRS = ['content', 'src'];

/**
 * Placeholder copy is marked TODO(content). This fails production deploys (Vercel sets
 * VERCEL_ENV=production) while any marker remains, naming each file, and only warns on
 * preview deploys and local builds.
 * @returns {import('astro').AstroIntegration}
 */
export default function placeholderGuard() {
  return {
    name: 'placeholder-guard',
    hooks: {
      'astro:build:start': ({ logger }) => {
        const files = DIRS.flatMap((dir) =>
          readdirSync(dir, { recursive: true, encoding: 'utf8' })
            .map((file) => join(dir, file))
            .filter((path) => statSync(path).isFile() && readFileSync(path, 'utf8').includes(MARKER)),
        );
        if (!files.length) return;

        const message = `${MARKER} placeholders remain in:\n  ${files.join('\n  ')}`;
        if (process.env.VERCEL_ENV === 'production') throw new Error(message);
        logger.warn(message);
      },
    },
  };
}
