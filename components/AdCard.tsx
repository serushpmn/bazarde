import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Ad, ItemCondition } from '../types';
import { formatPrice, getTimeAgo, toPersianDigits } from '../lib/formatters';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { StorageService } from '../services/storage';
import { useToast } from './ui/Toast';
import AdImage from './AdImage';
import { Bookmark, MapPin, Camera, Clock, Eye } from 'lucide-react';
import { cardHover } from '../lib/designTokens';

const CONDITION_LABELS: Record<ItemCondition, string> = {
  NEW: 'نو',
  LIKE_NEW: 'در حد نو',
  USED: 'کارکرده',
  FOR_PARTS: 'اسقاطی',
};

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

  const listCategoryName = useMemo(() => {
    const cat = StorageService.getCategories().find((c) => c.id === ad.categoryId);
    const sub = cat?.subcategories.find((s) => s.id === ad.subCategoryId);
    if (sub) return `${cat?.name} · ${sub.name}`;
    return cat?.name;
  }, [ad.categoryId, ad.subCategoryId]);

  const locationTime = (
    <div className="flex items-center gap-1 text-[11px] text-text-muted dark:text-gray-500 truncate">
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
        className={`group flex-shrink-0 w-[34vw] sm:w-[120px] md:w-[128px] bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-lg shadow-card overflow-hidden flex flex-col ${cardHover}`}
      >
        <div className="aspect-[4/3] max-h-[72px] bg-[#F1F3F5] dark:bg-gray-800 relative overflow-hidden">
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
        <div className="p-1.5 flex-1 flex flex-col gap-0.5">
          <h3 className="font-medium text-[10px] text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {ad.title}
          </h3>
          <p className="text-[10px] font-bold text-text-primary dark:text-white dir-ltr font-mono mt-auto">
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
        className={`group bg-surface dark:bg-gray-900 border border-border dark:border-gray-800 rounded-xl p-3 sm:p-4 shadow-card flex flex-row items-stretch gap-4 min-h-[140px] sm:min-h-[156px] overflow-hidden ${cardHover}`}
      >
        <div className="w-32 sm:w-40 self-stretch min-h-[116px] rounded-xl bg-[#F1F3F5] dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
          <AdImage
            images={ad.images}
            alt={ad.title}
            categoryId={ad.categoryId}
            seed={ad.id}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            containerClassName="w-full h-full"
          />
          {imageCount > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>{toPersianDigits(imageCount)}</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2 py-0.5">
          <div className="space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 space-y-1">
                {listCategoryName && (
                  <span className="text-[10px] text-text-muted dark:text-gray-500 block truncate">
                    {listCategoryName}
                  </span>
                )}
                <h3 className="font-semibold text-base sm:text-[17px] text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {ad.title}
                </h3>
              </div>
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

            {ad.description && (
              <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-2 leading-relaxed hidden sm:block">
                {ad.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-muted dark:text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" />
                {ad.district ? `${ad.district}، ` : ''}{ad.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 shrink-0" />
                {getTimeAgo(ad.createdAt)}
              </span>
              {typeof ad.viewsCount === 'number' && ad.viewsCount > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 shrink-0" />
                  {toPersianDigits(ad.viewsCount)} بازدید
                </span>
              )}
              {ad.condition && (
                <span className="text-text-secondary">{CONDITION_LABELS[ad.condition]}</span>
              )}
              {ad.isUrgent && (
                <span className="text-primary font-medium">فوری</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border dark:border-gray-800">
            <p className="text-lg sm:text-xl font-bold text-text-primary dark:text-white dir-ltr font-mono">
              {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
            </p>
            {ad.isNegotiable && !ad.isFree && (
              <span className="text-[10px] text-text-muted">قابل مذاکره</span>
            )}
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
      <div className="aspect-[4/3] max-h-[140px] sm:max-h-[160px] bg-[#F1F3F5] dark:bg-gray-800 relative overflow-hidden">
        <AdImage
          images={ad.images}
          alt={ad.title}
          categoryId={ad.categoryId}
          seed={ad.id}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          containerClassName="w-full h-full"
          iconClassName="w-7 h-7"
        />
        <button
          type="button"
          onClick={handleBookmarkToggle}
          aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن آگهی'}
          className={`absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all focus-visible:ring-2 focus-visible:ring-primary ${
            isBookmarked
              ? 'bg-surface text-primary shadow-card'
              : 'bg-black/40 text-white hover:bg-black/55'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-primary' : ''}`} strokeWidth={1.75} />
        </button>
        {imageCount > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <Camera className="w-3 h-3" />
            <span>{toPersianDigits(imageCount)}</span>
          </div>
        )}
      </div>

      <div className="p-2.5 sm:p-3 flex-1 flex flex-col gap-1.5">
        <h3 className="font-semibold text-sm text-text-primary dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
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
