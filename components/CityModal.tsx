import React, { useState, useMemo, useEffect } from 'react';
import { CITIES_DATA } from '../types';
import { MapPin, Search, X, Check, Globe } from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCity: string | null;
  onSelectCity: (city: string) => void;
  availableCities: string[];
}

export const CityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCity,
  onSelectCity,
  availableCities
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const popularCities = ['برلین', 'مونیخ', 'فرانکفورت', 'کلن', 'هامبورگ', 'اشتوتگارت', 'دوسلدورف', 'هانوفر'];

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return availableCities;
    return availableCities.filter(c => c.toLowerCase().includes(term));
  }, [searchTerm, availableCities]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-primary">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">انتخاب شهر و ایالت</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">نمایش آگهی‌های اختصاصی شهر یا ایالت مورد نظر در آلمان</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <input
              type="text"
              placeholder="جستجوی نام شهر یا ایالت (مثلاً برلین، مونیخ، فرانکفورت...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-11 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:text-white placeholder:text-gray-400 transition-all"
              autoFocus
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3.5 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 sm:space-y-5 flex-1 no-scrollbar">
          {/* All Cities Option */}
          <div>
            <button
              onClick={() => {
                onSelectCity('ALL');
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                selectedCity === 'ALL' || !selectedCity
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary text-primary font-bold shadow-xs'
                  : 'bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700/80 text-gray-700 dark:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  selectedCity === 'ALL' || !selectedCity ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <span>همه ایالت‌ها و شهرهای آلمان (سراسری)</span>
              </div>
              {(selectedCity === 'ALL' || !selectedCity) && <Check className="w-4 h-4 text-primary" />}
            </button>
          </div>

          {/* Popular Cities Chips (Only if not searching) */}
          {!searchTerm && (
            <div>
              <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2.5">شهرهای پرمخاطب در آلمان</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {popularCities.map((c) => {
                  const matchingCity = availableCities.find(ac => ac.includes(c)) || c;
                  const isSel = selectedCity === matchingCity || (selectedCity && selectedCity.includes(c));
                  return (
                    <button
                      key={c}
                      onClick={() => {
                        onSelectCity(matchingCity);
                        onClose();
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSel
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Cities Grid */}
          <div>
            <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-2.5">
              {searchTerm ? `نتایج جستجو (${toPersianDigits(filteredCities.length)} شهر)` : 'تمامی شهرهای آلمان'}
            </div>
            
            {filteredCities.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                شهری با عنوان «{searchTerm}» یافت نشد.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredCities.map((city) => {
                  const isSel = selectedCity === city;
                  return (
                    <button
                      key={city}
                      onClick={() => {
                        onSelectCity(city);
                        onClose();
                      }}
                      className={`p-2.5 rounded-xl text-right text-xs font-medium border flex items-center justify-between transition-all ${
                        isSel
                          ? 'bg-red-50 dark:bg-red-950/40 border-primary text-primary font-bold'
                          : 'bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="truncate">{city}</span>
                      {isSel && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
