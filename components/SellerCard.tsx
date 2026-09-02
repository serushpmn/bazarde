import React from 'react';
import { Link } from 'react-router-dom';
import { User as UserType } from '../types';
import { MapPin } from 'lucide-react';
import { caption } from '../lib/designTokens';

interface SellerCardProps {
  seller: UserType | null;
  onContact?: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onContact }) => {
  if (!seller) return null;

  const roleLabel =
    seller.role === 'ADMIN' || seller.role === 'EDITOR' ? 'فروشنده تأییدشده' : 'کاربر عادی';

  return (
    <div className="bg-canvas dark:bg-gray-800/50 rounded-2xl p-4 border border-border dark:border-gray-800 space-y-3">
      <h3 className="text-sm font-semibold text-text-primary dark:text-white">فروشنده</h3>
      <div className="flex items-start gap-3">
        {seller.avatar ? (
          <img
            src={seller.avatar}
            alt={seller.name}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-primary-light dark:bg-red-950/30 text-primary flex items-center justify-center font-bold text-lg shrink-0">
            {seller.name.charAt(0)}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-text-primary dark:text-white truncate">
            {seller.name}
          </p>
          <p className={caption}>{roleLabel}</p>
          <div className={`${caption} flex items-center gap-1 mt-1`}>
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>{seller.city}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {onContact && (
          <button
            type="button"
            onClick={onContact}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            نمایش شماره تماس
          </button>
        )}
      </div>
    </div>
  );
};

export default SellerCard;
