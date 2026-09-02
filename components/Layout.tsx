import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth, useTheme, useCity } from '../App';
import { StorageService } from '../services/storage';
import { AppNotification, Category } from '../types';
import { CategoryIcon } from './CategoryIcon';
import { CityModal } from './CityModal';
import { toPersianDigits, getTimeAgo } from '../lib/formatters';
import {
  MapPin,
  Search,
  PlusCircle,
  User as UserIcon,
  Moon,
  Sun,
  Bell,
  Bookmark,
  ChevronDown,
  Layers,
  Home,
  LogOut,
  SlidersHorizontal,
  X,
  PhoneCall,
  Menu,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Car,
  Laptop,
  Sofa,
  Briefcase,
  Wrench,
  ChevronLeft
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { selectedCity, setSelectedCity, cities } = useCity();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [activeHoverCategory, setActiveHoverCategory] = useState<Category | null>(null);
  const [expandedMobileCatId, setExpandedMobileCatId] = useState<string | null>(null);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Load categories & notifications
  useEffect(() => {
    const cats = StorageService.getCategories();
    setCategories(cats);
    if (cats.length > 0 && !activeHoverCategory) {
      setActiveHoverCategory(cats[0]);
    }
  }, []);

  const refreshNotifications = () => {
    if (user) {
      const list = StorageService.getNotifications(user.id);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refreshNotifications();
  }, [user]);

  // Close dropdowns on outside click or touch
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(target)) {
        // Only close desktop mega menu if not mobile modal
        if (window.innerWidth >= 768) {
          setIsCategoryMenuOpen(false);
        }
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Handle Escape key to close any popup/menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsUserMenuOpen(false);
        setIsCityModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsCategoryMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleMarkAllNotifsRead = () => {
    if (user) {
      StorageService.markAllNotificationsRead(user.id, user.role);
      refreshNotifications();
    }
  };

  const handleNotificationClick = (n: AppNotification) => {
    StorageService.markNotificationRead(n.id);
    refreshNotifications();
    setIsNotificationsOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleSelectCity = (city: string) => {
    setSelectedCity(city);
  };

  const isAdDetailsPage = location.pathname.startsWith('/ad/');

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-[#0d1117] text-gray-900 dark:text-gray-100 transition-colors">
      {/* City Selection Modal */}
      <CityModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        availableCities={cities}
      />

      {/* Top Navbar (Hidden on mobile for Ad Details pages) */}
      <header className={`sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-xs ${isAdDetailsPage ? 'hidden md:block' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-6">
            
            {/* Right: Logo & City Trigger */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                  <span className="font-black text-lg sm:text-xl tracking-tighter">ب</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-sm sm:text-lg tracking-tight text-primary leading-tight">بازار آلمان</span>
                  <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium hidden sm:block">خرید و فروش امن</span>
                </div>
              </Link>

              {/* City Selector Button */}
              <button
                onClick={() => setIsCityModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-800/90 hover:bg-gray-100 dark:hover:bg-gray-700 text-[11px] sm:text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors flex-shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="truncate max-w-[70px] sm:max-w-[140px]">
                  {selectedCity && selectedCity !== 'ALL' ? selectedCity : 'انتخاب شهر'}
                </span>
                <ChevronDown className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </button>
            </div>

            {/* Middle: Category Menu Trigger (Desktop) */}
            <div className="hidden md:flex items-center gap-2 relative" ref={categoryMenuRef}>
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isCategoryMenuOpen
                    ? 'bg-red-50 dark:bg-red-950/30 border-primary text-primary'
                    : 'bg-transparent border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Layers className="w-4 h-4 text-primary" />
                <span>دسته‌بندی‌ها</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Mega Menu Flyout */}
              {isCategoryMenuOpen && (
                <div className="absolute top-12 right-0 w-[640px] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Category List */}
                  <div className="w-56 bg-gray-50/80 dark:bg-gray-800/40 p-2 space-y-1 border-l border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[380px] no-scrollbar">
                    {categories.map((cat) => {
                      const isActive = (activeHoverCategory || categories[0])?.id === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onMouseEnter={() => setActiveHoverCategory(cat)}
                          onClick={() => {
                            navigate(`/?cat=${cat.id}`);
                            setIsCategoryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-right transition-colors ${
                            isActive
                              ? 'bg-white dark:bg-gray-800 text-primary shadow-xs font-bold'
                              : 'text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-800/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <CategoryIcon name={cat.icon} className="w-4 h-4 text-primary" />
                            <span>{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400">›</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Subcategories Subpanel */}
                  <div className="flex-1 p-5 overflow-y-auto max-h-[380px]">
                    {activeHoverCategory && (
                      <div>
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-800">
                          <Link
                            to={`/?cat=${activeHoverCategory.id}`}
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center gap-2"
                          >
                            <span>همه آگهی‌های {activeHoverCategory.name}</span>
                            <span className="text-xs text-primary font-normal">نمایش همه ←</span>
                          </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {activeHoverCategory.subcategories?.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/?cat=${activeHoverCategory.id}&sub=${sub.id}`}
                              onClick={() => setIsCategoryMenuOpen(false)}
                              className="p-2 rounded-lg text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-colors"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Left Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isDark ? 'حالت روشن' : 'حالت تاریک'}
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Bookmarks Quick Link (Desktop only, mobile has bottom bar) */}
              <Link
                to="/profile?tab=saved"
                className="hidden sm:flex p-2 rounded-xl text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                title="آگهی‌های نشان‌شده"
              >
                <Bookmark className="w-4 h-4" />
              </Link>

              {/* Notifications Dropdown */}
              {user && (
                <div className="relative" ref={notifMenuRef}>
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    title="اعلان‌ها و پیام‌ها"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div 
                      className="fixed sm:absolute inset-x-3 top-16 sm:top-auto sm:inset-x-auto sm:left-0 sm:mt-2 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
                        <span className="font-bold text-xs">پیام‌ها و اعلان‌های سیستم</span>
                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllNotifsRead}
                              className="text-[11px] text-primary hover:underline"
                            >
                              خوانده شدن همه
                            </button>
                          )}
                          <button
                            onClick={() => setIsNotificationsOpen(false)}
                            className="sm:hidden p-1 text-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            پیام جدیدی وجود ندارد.
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 text-xs transition-colors cursor-pointer ${
                                !n.isRead ? 'bg-red-50/40 dark:bg-red-950/20 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-gray-900 dark:text-white text-xs">{n.title}</span>
                                <span className="text-[10px] text-gray-400">{getTimeAgo(n.createdAt)}</span>
                              </div>
                              <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-[11px]">
                                {n.message}
                              </div>
                              {n.link && (
                                <div className="mt-1.5 text-[10px] text-primary font-bold flex items-center gap-1">
                                  <span>مشاهده جزییات ←</span>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Account Button / Dropdown */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-xs font-semibold"
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] sm:text-xs">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <span className="hidden sm:inline truncate max-w-[100px]">{user.name}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                  </button>

                  {isUserMenuOpen && (
                    <div 
                      className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in zoom-in-95"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
                        <div className="font-bold text-xs text-gray-900 dark:text-white truncate">{user.name}</div>
                        <div className="text-[11px] text-gray-400 dir-ltr text-left font-mono">{user.phone}</div>
                      </div>
                      <div className="p-1.5 space-y-0.5 text-xs">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-gray-400" />
                          <span>حساب کاربری و آگهی‌های من</span>
                        </Link>
                        <Link
                          to="/profile?tab=saved"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-gray-400" />
                          <span>آگهی‌های نشان‌شده</span>
                        </Link>
                        {(user.role === 'ADMIN' || user.role === 'EDITOR') && (
                          <Link
                            to="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-primary font-bold hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <SlidersHorizontal className="w-4 h-4 text-primary" />
                            <span>پنل مدیریت و نظارت</span>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-right"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>خروج از حساب</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-primary" />
                  <span>ورود<span className="hidden sm:inline"> / ثبت‌نام</span></span>
                </Link>
              )}

              {/* Post Ad Button (Desktop only - On mobile, it's prominently centered in bottom bar) */}
              <Link
                to="/new-ad"
                className="hidden md:flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex-shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ثبت آگهی رایگان</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Categories Modal / Drawer */}
      {isCategoryMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsCategoryMenuOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full rounded-t-3xl shadow-2xl border-t border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">دسته‌بندی آگهی‌ها</h3>
              </div>
              <button
                onClick={() => setIsCategoryMenuOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 no-scrollbar">
              <Link
                to="/"
                onClick={() => setIsCategoryMenuOpen(false)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 text-xs font-bold text-gray-900 dark:text-white"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-primary" />
                  <span>همه دسته‌ها (صفحه اصلی)</span>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Link>

              {categories.map((cat) => {
                const isExpanded = expandedMobileCatId === cat.id;
                return (
                  <div key={cat.id} className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-850">
                    <button
                      onClick={() => setExpandedMobileCatId(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-3 text-xs font-bold text-right text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CategoryIcon name={cat.icon} className="w-4 h-4 text-primary" />
                        <span>{cat.name}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="p-3 bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                        <Link
                          to={`/?cat=${cat.id}`}
                          onClick={() => setIsCategoryMenuOpen(false)}
                          className="block p-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                        >
                          همه آگهی‌های {cat.name} ←
                        </Link>
                        {cat.subcategories?.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/?cat=${cat.id}&sub=${sub.id}`}
                            onClick={() => setIsCategoryMenuOpen(false)}
                            className="block p-2 rounded-xl text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main className={`flex-1 ${isAdDetailsPage ? 'pb-24 md:pb-12' : 'pb-20 md:pb-12'}`}>
        {children}
      </main>

      {/* Mobile Bottom Sticky Navigation (Hidden on Ad Details pages because it has its own sticky contact bar) */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-2 py-1.5 shadow-lg ${isAdDetailsPage ? 'hidden' : ''}`}>
        <div className="grid grid-cols-5 items-center text-center">
          <Link
            to="/"
            className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
              location.pathname === '/' && !location.search.includes('cat=')
                ? 'text-primary font-bold'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>آگهی‌ها</span>
          </Link>

          <button
            onClick={() => setIsCategoryMenuOpen(true)}
            className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
              isCategoryMenuOpen ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span>دسته‌ها</span>
          </button>

          <Link
            to="/new-ad"
            className="flex flex-col items-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white dark:border-gray-900 active:scale-95 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-primary mt-0.5">ثبت آگهی</span>
          </Link>

          <Link
            to="/profile?tab=saved"
            className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
              location.search.includes('tab=saved') ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Bookmark className="w-5 h-5" />
            <span>نشان‌ها</span>
          </Link>

          <Link
            to={user ? "/profile" : "/login"}
            className={`flex flex-col items-center gap-1 py-1 text-[10px] font-medium transition-colors ${
              location.pathname === '/profile' || location.pathname === '/login'
                ? 'text-primary font-bold'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span>حساب من</span>
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <footer className="hidden md:block bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-black">
                  ب
                </div>
                <span className="font-black text-lg text-primary">بازار نیازمندی‌های آلمان</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                پلتفرم نیازمندی‌ها، خرید و فروش بدون واسطه کالاهای نو و دست دوم، مسکن، خودرو، استخدام و خدمات فارسی‌زبانان مقیم آلمان.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-3">دسته‌بندی‌های برگزیده</h4>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li><Link to="/?cat=real-estate" className="hover:text-primary transition-colors">املاک و مسکن با Anmeldung</Link></li>
                <li><Link to="/?cat=vehicles" className="hover:text-primary transition-colors">خودرو و وسایل نقلیه</Link></li>
                <li><Link to="/?cat=digital" className="hover:text-primary transition-colors">کالای دیجیتال، موبایل و لپ‌تاپ</Link></li>
                <li><Link to="/?cat=home-appliances" className="hover:text-primary transition-colors">لوازم منزل و مبلمان</Link></li>
                <li><Link to="/?cat=services" className="hover:text-primary transition-colors">خدمات، ترجمه رسمی و مشاوره</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-3">راهنمای کاربران</h4>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                <li><Link to="/safety" className="hover:text-primary transition-colors">راهنمای خرید و معامله امن</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">قوانین و مقررات انتشار آگهی</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">تماس با پشتیبانی بازار</Link></li>
                <li><Link to="/new-ad" className="hover:text-primary transition-colors">ثبت آگهی رایگان در آلمان</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-xs text-gray-900 dark:text-white mb-3">شهرهای پرمخاطب در آلمان</h4>
              <div className="flex flex-wrap gap-1.5">
                {['برلین', 'مونیخ', 'فرانکفورت', 'کلن', 'هامبورگ', 'اشتوتگارت', 'دوسلدورف', 'هانوفر'].map(cityName => (
                  <button
                    key={cityName}
                    onClick={() => {
                      const found = cities.find(c => c.includes(cityName));
                      if (found) setSelectedCity(found);
                      navigate('/');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-primary/10 hover:text-primary text-[11px] text-gray-600 dark:text-gray-300 font-medium transition-colors"
                  >
                    {cityName}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3">
                ارتباط در واتس‌اپ و پشتیبانی کاربران سراسر آلمان
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-3">
            <div>
              تمامی حقوق مادی و معنوی متعلق به پلتفرم نیازمندی‌های ایرانیان آلمان می‌باشد.
            </div>
            <div className="flex items-center gap-1 text-[11px] dir-ltr text-left font-mono">
              <span>© {new Date().getFullYear()} Bazaar Germany</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
