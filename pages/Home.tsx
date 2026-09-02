import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Ad, AdStatus, Category, Banner } from '../types';
import { useCity } from '../App';
import AdCard from '../components/AdCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { ListingFilters } from '../components/ListingFilters';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { toPersianDigits } from '../lib/formatters';
import { container } from '../lib/designTokens';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  RotateCcw,
  Layers,
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

  const clearAdvancedFilters = () => {
    setOnlyPhotos(false);
    setCurrencyFilter('ALL');
    setMinPrice('');
    setMaxPrice('');
  };

  const pageTitle = activeCategoryObj
    ? activeCategoryObj.name
    : `آگهی‌های ${selectedCity && selectedCity !== 'ALL' ? selectedCity : 'سراسر آلمان'}`;

  return (
    <div className={`${container} py-5 sm:py-6 space-y-5`}>

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
      
      {/* Category Navigation */}
      <div className="bg-surface dark:bg-gray-900 rounded-2xl p-4 border border-border dark:border-gray-800 shadow-card">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => handleSelectCategory('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeCategory === 'ALL'
                ? 'bg-primary text-white border-primary'
                : 'bg-canvas dark:bg-gray-800 border-border dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:border-primary/30'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>همه</span>
          </button>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'bg-surface dark:bg-gray-800/80 border-border dark:border-gray-700 text-text-secondary dark:text-gray-300 hover:bg-canvas dark:hover:bg-gray-800'
                }`}
              >
                <CategoryIcon name={cat.icon} className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-border dark:border-gray-800 no-scrollbar">
            <span className="text-xs font-medium text-text-muted whitespace-nowrap ml-2">زیردسته:</span>
            <button
              onClick={() => handleSelectSubCategory('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                activeSubCategory === 'ALL'
                  ? 'bg-primary-light dark:bg-red-950/40 text-primary font-semibold'
                  : 'text-text-secondary hover:bg-canvas dark:hover:bg-gray-800'
              }`}
            >
              همه
            </button>
            {activeCategoryObj.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSelectSubCategory(sub.id)}
                className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
                  activeSubCategory === sub.id
                    ? 'bg-primary-light dark:bg-red-950/40 text-primary font-semibold'
                    : 'text-text-secondary hover:bg-canvas dark:hover:bg-gray-800'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block sticky top-24 bg-surface dark:bg-gray-900 rounded-2xl p-4 border border-border dark:border-gray-800 shadow-card space-y-4">
          <h2 className="text-sm font-semibold text-text-primary dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-primary" />
            فیلتر
          </h2>
          <ListingFilters
            currencyFilter={currencyFilter}
            setCurrencyFilter={setCurrencyFilter}
            onlyPhotos={onlyPhotos}
            setOnlyPhotos={setOnlyPhotos}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            onClear={clearAdvancedFilters}
            resultCount={filteredAds.length}
          />
        </aside>

        <div className="space-y-4 min-w-0">
          {/* Page header + controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">{pageTitle}</h1>
              <p className="text-sm text-text-secondary dark:text-gray-400 mt-1">
                {toPersianDigits(filteredAds.length)} آگهی
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-xl border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 text-xs font-semibold text-text-secondary"
              >
                <SlidersHorizontal className="w-4 h-4" />
                فیلتر
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center">
                    {toPersianDigits(activeFiltersCount)}
                  </span>
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                aria-label="مرتب‌سازی"
                className="bg-canvas dark:bg-gray-800 border border-border dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-medium text-text-secondary dark:text-gray-200 outline-none cursor-pointer focus:border-primary"
              >
                <option value="newest">جدیدترین</option>
                <option value="price_asc">ارزان‌ترین</option>
                <option value="price_desc">گران‌ترین</option>
                <option value="views">پربازدیدترین</option>
              </select>

              <div className="flex items-center p-0.5 rounded-xl bg-canvas dark:bg-gray-800 border border-border dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-label="نمای شبکه‌ای"
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-surface dark:bg-gray-700 text-primary shadow-card' : 'text-text-muted'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-label="نمای لیستی"
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-surface dark:bg-gray-700 text-primary shadow-card' : 'text-text-muted'}`}
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-light dark:bg-red-950/40 border border-border text-primary text-xs font-medium">
                ارز: {currencyFilter === 'EUR' ? 'یورو' : 'تومان'}
                <button type="button" onClick={() => setCurrencyFilter('ALL')} aria-label="حذف فیلتر"><X className="w-3 h-3" /></button>
              </span>
            )}
            {onlyPhotos && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-canvas dark:bg-gray-800 border border-border text-text-secondary text-xs font-medium">
                فقط عکس‌دار
                <button type="button" onClick={() => setOnlyPhotos(false)} aria-label="حذف فیلتر"><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>حذف همه فیلترها</span>
            </button>
          </div>
        )}

        {filteredAds.length === 0 ? (
          <EmptyState
            icon={Search}
            title="هیچ آگهی‌ای پیدا نشد"
            description="فیلترها یا عبارت جستجو را تغییر دهید."
            actionLabel="پاک کردن فیلترها"
            onAction={handleResetFilters}
          />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-3'}>
            {filteredAds.map((ad) => (
              <AdCard key={ad.id} ad={ad} viewMode={viewMode} />
            ))}
          </div>
        )}
        </div>
      </div>

      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="فیلترها"
        mobileDrawer
        footer={
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={clearAdvancedFilters} className="text-xs text-text-secondary hover:text-primary">
              پاک کردن
            </button>
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(false)}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold"
            >
              نمایش {toPersianDigits(filteredAds.length)} نتیجه
            </button>
          </div>
        }
      >
        <ListingFilters
          currencyFilter={currencyFilter}
          setCurrencyFilter={setCurrencyFilter}
          onlyPhotos={onlyPhotos}
          setOnlyPhotos={setOnlyPhotos}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
        />
      </Modal>
    </div>
  );
};

export default Home;
