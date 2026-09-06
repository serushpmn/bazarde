/** Ten preset profile avatars — users pick one; no custom upload. */

export const DEFAULT_AVATARS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarAria&backgroundColor=ffdfbf',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarDylan&backgroundColor=c0aede',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarEden&backgroundColor=b6e3f4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarJade&backgroundColor=d1f4d1',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarLeo&backgroundColor=ffd5dc',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarMia&backgroundColor=f9e2ae',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarNoah&backgroundColor=c9e4de',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarQuinn&backgroundColor=e2cfc4',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarSam&backgroundColor=d4e4ff',
  'https://api.dicebear.com/9.x/notionists/svg?seed=BazaarZoe&backgroundColor=ffe0f0',
] as const;

/** Default avatar for users who have not chosen one */
export const DEFAULT_AVATAR = DEFAULT_AVATARS[0];

export type DefaultAvatarUrl = (typeof DEFAULT_AVATARS)[number];

export const isDefaultAvatar = (url?: string | null): url is DefaultAvatarUrl =>
  Boolean(url && (DEFAULT_AVATARS as readonly string[]).includes(url));

/** Resolve display URL: selected preset, or global default */
export const resolveUserAvatar = (avatar?: string | null): string =>
  isDefaultAvatar(avatar) ? avatar : DEFAULT_AVATAR;

/** Persist only preset URLs; otherwise store undefined (display uses default) */
export const sanitizeUserAvatar = (avatar?: string | null): string | undefined =>
  isDefaultAvatar(avatar) ? avatar : undefined;
