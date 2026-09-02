import React, { useState } from 'react';
import { CategoryIcon } from './CategoryIcon';
import {
  getAdPlaceholderGradient,
  getCategoryIconName,
  getPrimaryAdImage
} from '../lib/adImagePlaceholders';

interface AdImageProps {
  images?: string[] | null;
  alt: string;
  categoryId?: string;
  seed?: string;
  className?: string;
  containerClassName?: string;
  iconClassName?: string;
  showCategoryIcon?: boolean;
  loading?: 'lazy' | 'eager';
}

export const AdImage: React.FC<AdImageProps> = ({
  images,
  alt,
  categoryId,
  seed,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
  iconClassName = 'w-10 h-10',
  showCategoryIcon = true,
  loading = 'lazy'
}) => {
  const primaryImage = getPrimaryAdImage(images);
  const [imageFailed, setImageFailed] = useState(false);

  const showPlaceholder = !primaryImage || imageFailed;
  const gradient = getAdPlaceholderGradient(categoryId, seed || alt);
  const iconName = getCategoryIconName(categoryId);

  if (showPlaceholder) {
    return (
      <div
        className={`${containerClassName} bg-gradient-to-br ${gradient} flex flex-col items-center justify-center relative overflow-hidden`}
        aria-label={alt}
      >
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-white/10 blur-2xl" />

        {showCategoryIcon && (
          <div className="relative z-10 flex flex-col items-center gap-2 text-white/90">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
              <CategoryIcon name={iconName} className={`${iconClassName} text-white`} />
            </div>
            <span className="text-[10px] sm:text-xs font-medium text-white/80 px-3 text-center line-clamp-2">
              بدون تصویر
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={primaryImage}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setImageFailed(true)}
    />
  );
};

export default AdImage;
