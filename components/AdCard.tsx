import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import { Ad } from '../types';
import { formatPrice, getTimeAgo, toPersianDigits } from '../lib/formatters';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { StorageService } from '../services/storage';
import AdImage from './AdImage';
import {
  Bookmark,
  MapPin,
  Camera
} from 'lucide-react';

interface Props {
  ad: Ad;
  viewMode?: 'grid' | 'list';
  size?: 'default' | 'compact';
  onBookmarkChange?: () => void;
}

export const AdCard: React.FC<Props> = ({ ad, viewMode = 'grid', size = 'default', onBookmarkChange }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(() => StorageService.isAdBookmarked(ad.id, user?.id));

  useEffect(() => {
    setIsBookmarked(StorageService.isAdBookmarked(ad.id, user?.id));
  }, [ad.id, user?.id]);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = StorageService.toggleBookmarkAd(ad.id, user?.id);
    setIsBookmarked(updated);
    if (onBookmarkChange) onBookmarkChange();
  };

  const imageCount = hasValidAdImage(ad.images) ? ad.images.filter((image) => image && image.trim()).length : 0;

  if (size === 'compact') {
    return (
      <Link
        to={`/ad/${ad.id}`}
        className="group flex-shrink-0 w-[38vw] sm:w-[140px] md:w-[150px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-red-200 dark:hover:border-red-900/50 rounded-xl shadow-xs hover:shadow-sm transition-all duration-200 flex flex-col overflow-hidden"
      >
        <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
          <AdImage
            images={ad.images}
            alt={ad.title}
            categoryId={ad.categoryId}
            seed={ad.id}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            containerClassName="w-full h-full"
            iconClassName="w-5 h-5"
          />
          {imageCount > 1 && (
            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 py-0.5 rounded flex items-center gap-0.5">
              <Camera className="w-2.5 h-2.5" />
              <span>{toPersianDigits(imageCount)}</span>
            </div>
          )}
        </div>
        <div className="p-2 flex-1 flex flex-col gap-1">
          <h3 className="font-bold text-[10px] text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {ad.title}
          </h3>
          <div className="text-[10px] font-bold text-gray-900 dark:text-white mt-auto">
            {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
          </div>
          <div className="text-[9px] text-gray-400 truncate">
            {ad.district ? `${ad.district}، ` : ''}{ad.city}
          </div>
        </div>
      </Link>
    );
  }

  if (viewMode === 'list') {
    return (
      <Link
        to={`/ad/${ad.id}`}
        className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-red-200 dark:hover:border-red-900/50 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all duration-200 flex flex-row items-center gap-4 overflow-hidden"
      >
        {/* Thumbnail */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 relative">
          <AdImage
            images={ad.images}
            alt={ad.title}
            categoryId={ad.categoryId}
            seed={ad.id}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            containerClassName="w-full h-full"
            iconClassName="w-7 h-7"
          />

          {imageCount > 1 && (
            <div className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium">
              <Camera className="w-3 h-3" />
              <span>{toPersianDigits(imageCount)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-28 sm:h-36 py-0.5">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed">
                {ad.title}
              </h3>
              <button
                onClick={handleBookmarkToggle}
                className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
                  isBookmarked
                    ? 'text-primary bg-red-50 dark:bg-red-950/40'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">
              {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span>{ad.district ? `${ad.district}، ` : ''}{ad.city}</span>
              <span>•</span>
              <span>{getTimeAgo(ad.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid View (Standard Divar/Bazaar card)
  return (
    <Link
      to={`/ad/${ad.id}`}
      className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800/80 hover:border-red-200 dark:hover:border-red-900/50 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden"
    >
      {/* Image Frame */}
      <div className="aspect-[4/3] bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        <AdImage
          images={ad.images}
          alt={ad.title}
          categoryId={ad.categoryId}
          seed={ad.id}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          containerClassName="w-full h-full"
        />

        {/* Top Left Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isBookmarked
              ? 'bg-white text-primary shadow-md'
              : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          title={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن آگهی'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
        </button>

        {/* Bottom Right Image Count */}
        {imageCount > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 font-medium">
            <Camera className="w-3.5 h-3.5" />
            <span>{toPersianDigits(imageCount)}</span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2 leading-relaxed mb-2">
            {ad.title}
          </h3>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="font-bold text-base text-gray-900 dark:text-white mb-1.5">
            {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500">
            <span className="truncate max-w-[130px]">
              {ad.district ? `${ad.district}، ` : ''}{ad.city}
            </span>
            <span>{getTimeAgo(ad.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default AdCard;
