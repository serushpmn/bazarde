import React from 'react';
import { Camera, Euro, Coins } from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';
import { Category } from '../types';
import { labelSm, inputBase } from '../lib/designTokens';

interface ListingFiltersProps {
  categories: Category[];
  cities: string[];
  activeCategory: string;
  activeSubCategory: string;
  selectedCity: string;
  onCategoryChange: (catId: string) => void;
  onSubCategoryChange: (subId: string) => void;
  onCityChange: (city: string) => void;
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
}

export const ListingFilters: React.FC<ListingFiltersProps> = ({
  categories,
  cities,
  activeCategory,
  activeSubCategory,
  selectedCity,
  onCategoryChange,
  onSubCategoryChange,
  onCityChange,
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
}) => {
  const activeCategoryObj = categories.find((c) => c.id === activeCategory);

  return (
    <div className="space-y-4">
      {/* دسته‌بندی — بدون dropdown */}
      <div className="space-y-2">
        <span className={labelSm}>دسته‌بندی</span>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onCategoryChange('ALL')}
            className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === 'ALL'
                ? 'bg-primary text-white'
                : 'bg-canvas dark:bg-gray-800 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            همه دسته‌ها
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-canvas dark:bg-gray-800 text-text-secondary hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {activeCategoryObj && activeCategoryObj.subcategories.length > 0 && (
        <div className="space-y-2">
          <label className={labelSm} htmlFor="filter-subcategory">
            زیردسته
          </label>
          <select
            id="filter-subcategory"
            value={activeSubCategory}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            className={`${inputBase} text-xs py-2.5 cursor-pointer`}
          >
            <option value="ALL">همه</option>
            {activeCategoryObj.subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* شهر */}
      <div className="space-y-2">
        <label className={labelSm} htmlFor="filter-city">
          شهر
        </label>
        <select
          id="filter-city"
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className={`${inputBase} text-xs py-2.5 cursor-pointer`}
        >
          <option value="ALL">همه شهرها</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      {/* قیمت — هر فیلد در یک ردیف */}
      <div className="space-y-2">
        <label className={labelSm} htmlFor="filter-min-price">
          قیمت از
        </label>
        <input
          id="filter-min-price"
          type="number"
          placeholder="حداقل قیمت"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className={`${inputBase} text-xs dir-ltr font-mono py-2.5`}
        />
      </div>

      <div className="space-y-2">
        <label className={labelSm} htmlFor="filter-max-price">
          قیمت تا
        </label>
        <input
          id="filter-max-price"
          type="number"
          placeholder="حداکثر قیمت"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className={`${inputBase} text-xs dir-ltr font-mono py-2.5`}
        />
      </div>

      <div className="space-y-2 pt-1 border-t border-border dark:border-gray-800">
        <label className={labelSm}>واحد پول</label>
        <div className="grid grid-cols-3 gap-1.5">
          {(['ALL', 'EUR', 'TOMAN'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrencyFilter(c)}
              className={`py-1.5 px-1 rounded-lg text-[11px] font-semibold border transition-colors flex items-center justify-center gap-0.5 ${
                currencyFilter === c
                  ? 'bg-primary text-white border-primary'
                  : 'bg-canvas dark:bg-gray-800 border-border dark:border-gray-700 text-text-secondary'
              }`}
            >
              {c === 'EUR' && <Euro className="w-3 h-3" />}
              {c === 'TOMAN' && <Coins className="w-3 h-3" />}
              <span>{c === 'ALL' ? 'همه' : c === 'EUR' ? '€' : 'ت'}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center justify-between p-2.5 rounded-xl border border-border dark:border-gray-700 cursor-pointer hover:bg-canvas dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
          <Camera className="w-3.5 h-3.5" />
          <span>فقط با عکس</span>
        </div>
        <input
          type="checkbox"
          checked={onlyPhotos}
          onChange={(e) => setOnlyPhotos(e.target.checked)}
          className="w-4 h-4 accent-primary rounded"
        />
      </label>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-text-secondary hover:text-primary font-medium transition-colors w-full text-right"
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
};

export default ListingFilters;
