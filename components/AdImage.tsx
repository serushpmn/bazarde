import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getPrimaryAdImage } from '../lib/adImagePlaceholders';

interface AdImageProps {
  images?: string[] | null;
  alt: string;
  categoryId?: string;
  seed?: string;
  className?: string;
  containerClassName?: string;
  iconClassName?: string;
  showPlaceholderLabel?: boolean;
  loading?: 'lazy' | 'eager';
}

export const AdImage: React.FC<AdImageProps> = ({
  images,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = 'w-full h-full',
  iconClassName = 'w-8 h-8',
  showPlaceholderLabel = true,
  loading = 'lazy',
}) => {
  const primaryImage = getPrimaryAdImage(images);
  const [imageFailed, setImageFailed] = useState(false);

  if (!primaryImage || imageFailed) {
    return (
      <div
        className={`${containerClassName} bg-[#F1F3F5] dark:bg-gray-800 flex flex-col items-center justify-center gap-2`}
        aria-label={alt}
        role="img"
      >
        <ImageOff className={`${iconClassName} text-text-muted dark:text-gray-500`} strokeWidth={1.75} />
        {showPlaceholderLabel && (
          <span className="text-xs text-text-muted dark:text-gray-500 font-medium">بدون تصویر</span>
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
