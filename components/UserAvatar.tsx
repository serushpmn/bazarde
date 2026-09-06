import React from 'react';
import { resolveUserAvatar } from '../lib/defaultAvatars';

interface UserAvatarProps {
  avatar?: string | null;
  name?: string;
  className?: string;
  alt?: string;
}

/** Renders a user's preset avatar, or the shared default when unset. */
export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name = 'کاربر',
  className = 'w-10 h-10 rounded-full object-cover',
  alt,
}) => (
  <img
    src={resolveUserAvatar(avatar)}
    alt={alt || name}
    className={className}
    loading="lazy"
  />
);
