import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Ad } from '../types';
import { formatPrice, getTimeAgo, toPersianDigits } from '../lib/formatters';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { StorageService } from '../services/storage';
import { useToast } from './ui/Toast';
import AdImage from './AdImage';
import { Bookmark, MapPin, Camera } from 'lucide-react';
import { cardHover } from '../lib/designTokens';

interface Props {
  ad: Ad;
  viewMode?: 'grid' | 'list';
  size?: 'default' | 'compact';
  onBookmarkChange?: () => void;
}

export const AdCard: React.FC<Props> = ({
  ad,
  viewMode = 'grid',
  size = 'default',
  onBookmarkChange,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(() =>
    StorageService.isAdBookmarked(ad.id, user?.id)
  );

  useEffect(() => {
    setIsBookmarked(StorageService.isAdBookmarked(ad.id, user?.id));
  }, [ad.id, user?.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = StorageService.toggleBookmarkAd(ad.id, user?.id);
    setIsBookmarked(updated);
    if (updated) showToast('آگهی به ذخیره‌شده‌ها اضافه شد.');
    if (onBookmarkChange) onBookmarkChange();
  };

  const imageCount = hasValidAdImage(ad.images)
    ? ad.images.filter((image) => image && image.trim()).length
    : 0;

  const locationTime = (
    <div className="flex items-center gap-1 text-xs text-text-muted dark:text-gray-500 truncate">
      <MapPin className="w-3 h-3 shrink-0" strokeWidth={1.75} />
      <span className="truncate">
        {ad.district ? `${ad.district}، ` : ''}{ad.city}
      </span>
      <span aria-hidden>·</span>
      <span className="shrink-0">{getTimeAgo(ad.createdAt)}</span>
    </div>
  );

  if (size === 'compact') {
    return (
      <Link
        to={`/ad/${ad.id}`}
        className={`group flex-shrink-0 w-[38vw] sm:w-[148px] md:w-[160px] bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-xl shadow-card overflow-hidden flex flex-col ${cardHover}`}
      >
        <div className="aspect-[4/3] bg-[#F1F3F5] dark:bg-gray-800 relative overflow-hidden">
          <AdImage
            images={ad.images}
            alt={ad.title}
            categoryId={ad.categoryId}
            seed={ad.id}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            containerClassName="w-full h-full"
            iconClassName="w-6 h-6"
          />
        </div>
        <div className="p-2.5 flex-1 flex flex-col gap-1">
          <h3 className="font-semibold text-xs text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {ad.title}
          </h3>
          <p className="text-xs font-bold text-text-primary dark:text-white dir-ltr font-mono mt-auto">
            {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
          </p>
        </div>
      </Link>
    );
  }

  if (viewMode === 'list') {
    return (
      <Link
        to={`/ad/${ad.id}`}
        className={`group bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl p-3 shadow-card flex flex-row items-center gap-4 overflow-hidden ${cardHover}`}
      >
        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#F1F3F5] dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
          <AdImage
            images={ad.images}
            alt={ad.title}
            categoryId={ad.categoryId}
            seed={ad.id}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            containerClassName="w-full h-full"
          />
          {imageCount > 1 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>{toPersianDigits(imageCount)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 py-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
              {ad.title}
            </h3>
            <button
              type="button"
              onClick={handleBookmarkToggle}
              aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن'}
              className={`p-1.5 rounded-lg transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary ${
                isBookmarked
                  ? 'text-primary bg-primary-light dark:bg-red-950/40'
                  : 'text-text-muted hover:text-text-secondary hover:bg-canvas dark:hover:bg-gray-800'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} strokeWidth={1.75} />
            </button>
          </div>
          <div className="flex items-end justify-between gap-2 pt-2 border-t border-border dark:border-gray-800">
            <p className="text-base font-bold text-text-primary dark:text-white dir-ltr font-mono">
              {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
            </p>
            {locationTime}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/ad/${ad.id}`}
      className={`group bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-2xl shadow-card flex flex-col overflow-hidden ${cardHover}`}
    >
      <div className="aspect-[4/3] bg-[#F1F3F5] dark:bg-gray-800 relative overflow-hidden">
        <AdImage
          images={ad.images}
          alt={ad.title}
          categoryId={ad.categoryId}
          seed={ad.id}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          containerClassName="w-full h-full"
        />
        <button
          type="button"
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن آگهی'}
          className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-lg flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary ${
            isBookmarked
              ? 'bg-surface text-primary shadow-card'
              : 'bg-black/40 text-white hover:bg-black/55'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} strokeWidth={1.75} />
        </button>
        {imageCount > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1">
            <Camera className="w-3.5 h-3.5" />
            <span>{toPersianDigits(imageCount)}</span>
          </div>
        )}
      </div>

      <div className="p-3 flex-1 flex flex-col gap-2">
        <h3 className="font-semibold text-sm text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
          {ad.title}
        </h3>
        <div className="pt-2 border-t border-border dark:border-gray-800 mt-auto space-y-1">
          <p className="text-base font-bold text-text-primary dark:text-white dir-ltr font-mono">
            {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
          </p>
          {locationTime}
        </div>
      </div>
    </Link>
  );
};

export default AdCard;
