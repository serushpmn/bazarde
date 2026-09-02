import React from 'react';
import { Camera, Euro, Coins } from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';
import { labelSm, inputBase } from '../lib/designTokens';

interface ListingFiltersProps {
  currencyFilter: 'ALL' | 'EUR' | 'TOMAN';
  setCurrencyFilter: (v: 'ALL' | 'EUR' | 'TOMAN') => void;
  onlyPhotos: boolean;
  setOnlyPhotos: (v: boolean) => void;
  minPrice: string;
  setMinPrice: (v: string) => void;
  maxPrice: string;
  setMaxPrice: (v: string) => void;
  onClear?: () => void;
  resultCount?: number;
  compact?: boolean;
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  currencyFilter,
  setCurrencyFilter,
  onlyPhotos,
  setOnlyPhotos,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  onClear,
  resultCount,
  compact = false,
}) => (
  <div className={`space-y-5 ${compact ? '' : ''}`}>
    <div className="space-y-2">
      <label className={labelSm}>واحد پول</label>
      <div className="grid grid-cols-3 gap-2">
        {(['ALL', 'EUR', 'TOMAN'] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCurrencyFilter(c)}
            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-1 ${
              currencyFilter === c
                ? 'bg-primary text-white border-primary'
                : 'bg-canvas dark:bg-gray-800 border-border dark:border-gray-700 text-text-secondary dark:text-gray-300'
            }`}
          >
            {c === 'EUR' && <Euro className="w-3.5 h-3.5" />}
            {c === 'TOMAN' && <Coins className="w-3.5 h-3.5" />}
            <span>{c === 'ALL' ? 'همه' : c === 'EUR' ? 'یورو' : 'تومان'}</span>
          </button>
        ))}
      </div>
    </div>

    <label className="flex items-center justify-between p-3 rounded-xl border border-border dark:border-gray-700 cursor-pointer hover:bg-canvas dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Camera className="w-4 h-4" />
        <span>فقط آگهی‌های دارای عکس</span>
      </div>
      <input
        type="checkbox"
        checked={onlyPhotos}
        onChange={(e) => setOnlyPhotos(e.target.checked)}
        className="w-4 h-4 accent-primary rounded"
      />
    </label>

    <div>
      <label className={labelSm}>محدوده قیمت</label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="حداقل"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className={`${inputBase} text-xs dir-ltr font-mono py-2.5`}
        />
        <input
          type="number"
          placeholder="حداکثر"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={`${inputBase} text-xs dir-ltr font-mono py-2.5`}
        />
      </div>
    </div>

    {onClear && (
      <button
        type="button"
        onClick={onClear}
        className="text-xs text-text-secondary hover:text-primary font-medium transition-colors"
      >
        پاک کردن فیلترها
      </button>
    )}

    {typeof resultCount === 'number' && (
      <p className="text-xs text-text-muted pt-2 border-t border-border dark:border-gray-800">
        {toPersianDigits(resultCount)} نتیجه
      </p>
    )}
  </div>
);

export default ListingFilters;
