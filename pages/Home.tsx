import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Ad, AdStatus, Category, Banner } from '../types';
import { useCity } from '../App';
import AdCard from '../components/AdCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { toPersianDigits } from '../lib/formatters';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Camera,
  X,
  RotateCcw,
  ArrowUpDown,
  Layers,
  Euro,
  Coins
} from 'lucide-react';

export const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCity } = useCity();

  // State
  const [ads, setAds] = useState<Ad[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('cat') || 'ALL');
  const [activeSubCategory, setActiveSubCategory] = useState<string>(searchParams.get('sub') || 'ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'views'>('newest');
  
  // Advanced Filter Drawer
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [onlyPhotos, setOnlyPhotos] = useState(false);
  const [currencyFilter, setCurrencyFilter] = useState<'ALL' | 'EUR' | 'TOMAN'>('ALL');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Load initial data
  useEffect(() => {
    setAds(StorageService.getAds());
    setCategories(StorageService.getCategories());
    setBanners(StorageService.getBanners().filter(b => b.position === 'HOME_TOP'));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  // Sync with URL params
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const cat = searchParams.get('cat') || 'ALL';
    const sub = searchParams.get('sub') || 'ALL';
    setSearchQuery(q);
    setActiveCategory(cat);
    setActiveSubCategory(sub);
  }, [searchParams]);

  // Handle Escape key for Filter Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };
    if (isFilterModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFilterModalOpen]);

  // Handle Category Click
  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveSubCategory('ALL');
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'ALL') {
      newParams.delete('cat');
      newParams.delete('sub');
    } else {
      newParams.set('cat', catId);
      newParams.delete('sub');
    }
    setSearchParams(newParams);
  };

  // Handle SubCategory Click
  const handleSelectSubCategory = (subId: string) => {
    setActiveSubCategory(subId);
    const newParams = new URLSearchParams(searchParams);
    if (subId === 'ALL') {
      newParams.delete('sub');
    } else {
      newParams.set('sub', subId);
    }
    setSearchParams(newParams);
  };

  // Handle Search Submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('q', searchQuery.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('ALL');
    setActiveSubCategory('ALL');
    setOnlyPhotos(false);
    setCurrencyFilter('ALL');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams(new URLSearchParams());
  };

  // Filtered & Sorted Ads
  const filteredAds = useMemo(() => {
    return ads
      .filter((ad) => {
        // Status check
        if (ad.status !== AdStatus.APPROVED) return false;

        // City Filter
        if (selectedCity && selectedCity !== 'ALL') {
          if (ad.city !== selectedCity) return false;
        }

        // Category Filter
        if (activeCategory !== 'ALL') {
          if (ad.categoryId !== activeCategory) return false;
        }

        // Subcategory Filter
        if (activeSubCategory !== 'ALL') {
          if (ad.subCategoryId !== activeSubCategory) return false;
        }

        // Currency Filter
        if (currencyFilter !== 'ALL') {
          const adCurr = ad.currency || 'EUR';
          if (adCurr !== currencyFilter) return false;
        }

        // Search Query
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const matchTitle = ad.title.toLowerCase().includes(query);
          const matchDesc = ad.description.toLowerCase().includes(query);
          const matchDistrict = ad.district?.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchDistrict) return false;
        }

        // Advanced Filters
        if (onlyPhotos && !hasValidAdImage(ad.images)) return false;

        // Price range
        const parsedMin = minPrice ? parseInt(minPrice, 10) : 0;
        const parsedMax = maxPrice ? parseInt(maxPrice, 10) : Infinity;
        if (!isNaN(parsedMin) && parsedMin > 0 && ad.price < parsedMin) return false;
        if (!isNaN(parsedMax) && parsedMax > 0 && ad.price > parsedMax) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return b.createdAt - a.createdAt;
        }
        if (sortBy === 'price_asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price_desc') {
          return b.price - a.price;
        }
        if (sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        return 0;
      });
  }, [
    ads,
    selectedCity,
    activeCategory,
    activeSubCategory,
    searchQuery,
    onlyPhotos,
    currencyFilter,
    minPrice,
    maxPrice,
    sortBy
  ]);

  const activeCategoryObj = categories.find(c => c.id === activeCategory);
  const activeFiltersCount = [
    activeCategory !== 'ALL',
    activeSubCategory !== 'ALL',
    onlyPhotos,
    currencyFilter !== 'ALL',
    Boolean(minPrice),
    Boolean(maxPrice)
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {banners.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xs">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`transition-opacity duration-500 ${index === activeBannerIndex ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
            >
              {banner.link ? (
                <Link to={banner.link} className="block">
                  <img
                    src={banner.imageUrl}
                    alt={banner.altText || banner.title || 'بنر تبلیغاتی'}
                    className="w-full h-40 sm:h-52 md:h-60 object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={banner.imageUrl}
                  alt={banner.altText || banner.title || 'بنر تبلیغاتی'}
                  className="w-full h-40 sm:h-52 md:h-60 object-cover"
                />
              )}
              {banner.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4 sm:p-6">
                  <h2 className="text-white font-black text-sm sm:text-lg">{banner.title}</h2>
                </div>
              )}
            </div>
          ))}

          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  onClick={() => setActiveBannerIndex(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeBannerIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                  aria-label={`نمایش بنر ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Top Search & Filter Hero Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="جستجو در تمام آگهی‌ها و خدمات ایرانیان آلمان (مثلاً مسکن، خودرو، لپ‌تاپ...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700/80 rounded-2xl text-xs sm:text-sm outline-none focus:border-primary focus:ring-3 focus:ring-primary/10 dark:text-white transition-all placeholder:text-gray-400"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-4 top-3.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  const newParams = new URLSearchParams(searchParams);
                  newParams.delete('q');
                  setSearchParams(newParams);
                }}
                className="absolute left-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                activeFiltersCount > 0
                  ? 'bg-red-50 dark:bg-red-950/40 border-primary text-primary shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فیلترها</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-bold">
                  {toPersianDigits(activeFiltersCount)}
                </span>
              )}
            </button>

            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>جستجو</span>
            </button>
          </div>
        </form>

        {/* Category Carousel Pills */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleSelectCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                activeCategory === 'ALL'
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>همه دسته‌ها</span>
            </button>

            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-xs font-bold'
                      : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Subcategories Carousel if category is selected */}
          {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-2 border-t border-dashed border-gray-100 dark:border-gray-800/80 no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">زیردسته‌ها:</span>
              <button
                onClick={() => handleSelectSubCategory('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                  activeSubCategory === 'ALL'
                    ? 'bg-red-100 dark:bg-red-950/60 text-primary font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                همه
              </button>
              {activeCategoryObj.subcategories.map((sub) => {
                const isSubSel = activeSubCategory === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectSubCategory(sub.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-colors ${
                      isSubSel
                        ? 'bg-red-100 dark:bg-red-950/60 text-primary font-bold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-4">
        
        {/* Feed Header: Title, Counts, Sorting, View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xs">
          <div>
            <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span>آگهی‌های {selectedCity && selectedCity !== 'ALL' ? selectedCity : 'سراسر آلمان'}</span>
              {activeCategoryObj && (
                <>
                  <span className="text-gray-300 dark:text-gray-700">•</span>
                  <span className="text-primary font-bold">{activeCategoryObj.name}</span>
                </>
              )}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              نمایش <span className="dir-ltr inline-block font-mono">{toPersianDigits(filteredAds.length)}</span> آگهی فعال
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-200 outline-none cursor-pointer focus:border-primary"
              >
                <option value="newest">جدیدترین</option>
                <option value="price_asc">ارزان‌ترین</option>
                <option value="price_desc">گران‌ترین</option>
                <option value="views">پربازدیدترین</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                title="نمای شبکه‌ای"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary shadow-xs'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
                title="نمای لیستی"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium">فیلترهای فعال:</span>
            {activeCategory !== 'ALL' && activeCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-primary text-xs font-semibold">
                دسته: {activeCategoryObj.name}
                <button onClick={() => handleSelectCategory('ALL')}><X className="w-3 h-3 hover:text-red-700" /></button>
              </span>
            )}
            {currencyFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                ارز: {currencyFilter === 'EUR' ? 'یورو' : 'تومان'}
                <button onClick={() => setCurrencyFilter('ALL')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {onlyPhotos && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium">
                فقط عکس‌دار
                <button onClick={() => setOnlyPhotos(false)}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline font-semibold mr-1 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>حذف همه فیلترها</span>
            </button>
          </div>
        )}

        {/* Ads Grid / List */}
        {filteredAds.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
              <Search className="w-8 h-8 stroke-1" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">آگهی مورد نظر پیدا نشد</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
                هیچ آگهی با فیلترهای انتخابی شما در این ایالت/شهر یافت نشد. می‌توانید فیلترها را حذف کنید یا عبارت دیگری را جستجو فرمایید.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>مشاهده تمامی آگهی‌ها</span>
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-3'}>
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">فیلترهای پیشرفته</span>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Currency Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  واحد پول آگهی
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrencyFilter('ALL')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      currencyFilter === 'ALL'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    همه
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyFilter('EUR')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      currencyFilter === 'EUR'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Euro className="w-3.5 h-3.5" />
                    <span>یورو (€)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrencyFilter('TOMAN')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      currencyFilter === 'TOMAN'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5" />
                    <span>تومان</span>
                  </button>
                </div>
              </div>

              {/* Photo toggle */}
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <Camera className="w-4 h-4 text-gray-500" />
                    <span>فقط آگهی‌های دارای عکس</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyPhotos}
                    onChange={(e) => setOnlyPhotos(e.target.checked)}
                    className="w-4 h-4 text-primary rounded focus:ring-primary accent-primary"
                  />
                </label>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  محدوده قیمت
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">حداقل مبلغ:</span>
                    <input
                      type="number"
                      placeholder="مثلاً 50"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary dir-ltr text-left font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block mb-1">حداکثر مبلغ:</span>
                    <input
                      type="number"
                      placeholder="مثلاً 2000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary dir-ltr text-left font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setOnlyPhotos(false);
                  setCurrencyFilter('ALL');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-xs text-gray-500 hover:text-primary"
              >
                پاک کردن فیلترها
              </button>

              <button
                type="button"
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary"
              >
                اعمال فیلترها ({toPersianDigits(filteredAds.length)} آگهی)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
