// Loads a post's Bluesky thread from the public AppView API and renders its replies,
// most liked first, nested as on Bluesky. See components/Replies.astro.

const API = 'https://public.api.bsky.app/xrpc';

interface ThreadPost {
  post: {
    uri: string;
    likeCount?: number;
    replyCount?: number;
    author: { did: string; handle: string; displayName?: string; avatar?: string };
    record: { text?: string; createdAt?: string };
  };
  replies?: ThreadPost[];
}

const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

async function getJson<T>(method: string, params: Record<string, string>): Promise<T> {
  const response = await fetch(`${API}/${method}?${new URLSearchParams(params)}`);
  if (!response.ok) throw new Error(`${method} returned ${response.status}`);
  return response.json();
}

/** The thread for https://bsky.app/profile/<handle or did>/post/<rkey>. */
async function getThread(url: string): Promise<ThreadPost> {
  const [, , actor, , rkey] = new URL(url).pathname.split('/');
  const did = actor.startsWith('did:')
    ? actor
    : (await getJson<{ did: string }>('com.atproto.identity.resolveHandle', { handle: actor })).did;
  const { thread } = await getJson<{ thread: ThreadPost }>('app.bsky.feed.getPostThread', {
    uri: `at://${did}/app.bsky.feed.post/${rkey}`,
    depth: '10',
  });
  return thread;
}

/** Blocked, deleted, or not-found replies come back without a post; skip them. */
const byLikes = (replies: ThreadPost[] = []) =>
  replies.filter((r) => r.post?.author).sort((a, b) => (b.post.likeCount ?? 0) - (a.post.likeCount ?? 0));

function renderReply(template: HTMLTemplateElement, { post, replies }: ThreadPost): Node {
  const node = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
  const { author, record } = post;
  const profile = `https://bsky.app/profile/${author.handle}`;

  const avatar = node.querySelector('img')!;
  if (author.avatar) avatar.src = author.avatar;
  else avatar.remove();

  node.querySelector<HTMLAnchorElement>('.who')!.href = profile;
  node.querySelector('[data-name]')!.textContent = author.displayName || author.handle;
  node.querySelector('.handle')!.textContent = `@${author.handle}`;

  const time = node.querySelector('time')!;
  if (record.createdAt) {
    time.dateTime = record.createdAt;
    time.textContent = day.format(new Date(record.createdAt));
  }

  node.querySelector('.reply-text')!.textContent = record.text ?? '';
  node.querySelector('.reply-stats')!.textContent = [
    post.replyCount ? count(post.replyCount, 'reply', 'replies') : '',
    post.likeCount ? count(post.likeCount, 'like', 'likes') : '',
  ]
    .filter(Boolean)
    .join(' · ');

  const children = node.querySelector('ol')!;
  byLikes(replies).forEach((reply) => children.append(renderReply(template, reply)));
  if (!children.childElementCount) children.remove();
  return node;
}

document.querySelectorAll<HTMLElement>('[data-bsky]').forEach(async (section) => {
  const status = section.querySelector('[data-status]')!;
  try {
    const replies = byLikes((await getThread(section.dataset.bsky!)).replies);
    const template = section.querySelector('template')!;
    section.querySelector('[data-list]')!.append(...replies.map((reply) => renderReply(template, reply)));
    status.textContent = replies.length ? `${replies.length} on Bluesky` : 'No replies yet';
  } catch {
    status.textContent = "Couldn't load replies";
  }
});
