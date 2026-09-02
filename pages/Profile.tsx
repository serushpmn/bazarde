import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth, useCity } from '../App';
import { StorageService } from '../services/storage';
import { Ad, AdStatus, User, UserRole, CITIES_DATA } from '../types';
import AdCard from '../components/AdCard';
import AdImage from '../components/AdImage';
import { toPersianDigits, getTimeAgo, formatPrice } from '../lib/formatters';
import {
  User as UserIcon,
  Bookmark,
  Layers,
  History,
  Settings,
  PlusCircle,
  Edit2,
  Trash2,
  Eye,
  LogOut,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Phone
} from 'lucide-react';

export const Profile: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'my_ads' | 'saved' | 'recent' | 'settings'>('my_ads');
  
  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [recentAds, setRecentAds] = useState<Ad[]>([]);

  // Settings form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'برلین (Berlin)');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'saved') setActiveTab('saved');
    else if (tab === 'recent') setActiveTab('recent');
    else if (tab === 'settings') setActiveTab('settings');
    else setActiveTab('my_ads');
  }, [searchParams]);

  const loadData = () => {
    const allAds = StorageService.getAds();
    
    // My ads
    if (user) {
      setMyAds(allAds.filter(a => a.userId === user.id));
    } else {
      setMyAds([]);
    }

    // Saved ads
    const bookmarkedIds = StorageService.getBookmarkedAdIds(user?.id);
    setSavedAds(allAds.filter(a => bookmarkedIds.includes(a.id)));

    // Recent views
    setRecentAds(StorageService.getRecentViewedAds());
  };

  useEffect(() => {
    loadData();
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setCity(user.city || 'برلین (Berlin)');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleTabChange = (tab: 'my_ads' | 'saved' | 'recent' | 'settings') => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleDeleteAd = (adId: string) => {
    if (window.confirm('آیا از حذف این آگهی اطمینان دارید؟')) {
      StorageService.deleteAd(adId);
      loadData();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!phone.trim()) return;
    const updated: User = {
      ...user,
      name: name.trim(),
      phone: phone.trim(),
      city,
      avatar: avatar.trim() || undefined
    };
    StorageService.saveUser(updated);
    login(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">ورود به حساب کاربری</h2>
          <p className="text-xs text-gray-500 mt-1">برای مدیریت آگهی‌ها و تنظیمات حساب خود، لطفاً ابتدا وارد شوید.</p>
        </div>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary"
        >
          <span>ورود / ثبت‌نام در بازار آلمان</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Profile Header Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl overflow-hidden border-2 border-primary/20">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span>{user.name.charAt(0)}</span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-gray-900 dark:text-white">{user.name}</h1>
              {user.role === UserRole.ADMIN && (
                <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                  مدیر ارشد
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{user.city || 'آلمان'}</span>
              </span>
              <span>•</span>
              <span className="dir-ltr text-left font-mono">{user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/new-ad"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>ثبت آگهی رایگان</span>
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="خروج از حساب"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'my_ads', label: 'آگهی‌های من', count: myAds.length, icon: Layers },
          { id: 'saved', label: 'نشان‌شده‌ها', count: savedAds.length, icon: Bookmark },
          { id: 'recent', label: 'بازدیدهای اخیر', count: recentAds.length, icon: History },
          { id: 'settings', label: 'تنظیمات حساب', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {toPersianDigits(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: My Ads */}
      {activeTab === 'my_ads' && (
        <div className="space-y-4">
          {myAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">هنوز آگهی ثبت نکرده‌اید</h3>
              <p className="text-xs text-gray-400">کالا، خدمات یا مسکن خود را به صورت رایگان برای هزاران مخاطب در آلمان آگهی کنید.</p>
              <Link
                to="/new-ad"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-xs hover:bg-secondary mt-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>ثبت اولین آگهی</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myAds.map(item => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="aspect-[16/10] rounded-2xl overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                      <AdImage
                        images={item.images}
                        alt={item.title}
                        categoryId={item.categoryId}
                        seed={item.id}
                        containerClassName="w-full h-full"
                        iconClassName="w-8 h-8"
                      />
                      <div className="absolute top-2 right-2">
                        {item.status === AdStatus.APPROVED && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>منتشر شده ✓</span>
                          </span>
                        )}
                        {item.status === AdStatus.PENDING && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>در حال بررسی</span>
                          </span>
                        )}
                        {item.status === AdStatus.REJECTED && (
                          <span className="px-2 py-0.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>رد شده</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-black text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">
                        {item.title}
                      </h4>
                      {item.status === AdStatus.REJECTED && item.rejectionReason && (
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                          دلیل رد: {item.rejectionReason}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.price, item.isNegotiable, item.isFree, item.currency)}
                        </span>
                        <span>{item.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/ad/${item.id}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده</span>
                      </Link>

                      <Link
                        to={`/edit/${item.id}`}
                        className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-primary hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => handleDeleteAd(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                      title="حذف آگهی"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Saved Ads */}
      {activeTab === 'saved' && (
        <div>
          {savedAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
              <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">هیچ آگهی نشان نشده است</h3>
              <p className="text-xs text-gray-400">با زدن روی علامت نشان در صفحه آگهی‌ها، آن‌ها را در این بخش ذخیره کنید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedAds.map(item => (
                <AdCard key={item.id} ad={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Recent Ads */}
      {activeTab === 'recent' && (
        <div>
          {recentAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
              <History className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">تاریخچه بازدیدی ثبت نشده است</h3>
              <p className="text-xs text-gray-400">آگهی‌هایی که اخیراً باز کرده‌اید اینجا نمایش داده می‌شوند.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentAds.map(item => (
                <AdCard key={item.id} ad={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
          <div>
            <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">ویرایش مشخصات حساب کاربری</h3>
            <p className="text-xs text-gray-400 mt-1">مشخصات شما در هنگام ثبت آگهی‌ها به خریداران نمایش داده می‌شود.</p>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>مشخصات با موفقیت به‌روزرسانی شد.</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                نام و نام خانوادگی
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  شماره موبایل / واتس‌اپ در آلمان *
                </label>
                <input
                  type="tel"
                  placeholder="+49 176 12345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-bold text-left font-mono [unicode-bidi:plaintext]"
                />
                <p className="text-[10px] text-gray-400 mt-1">این شماره در تمام آگهی‌های شما به‌عنوان راه تماس و واتس‌اپ استفاده می‌شود.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  شهر / ایالت سکونت در آلمان
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                >
                  {CITIES_DATA.map(c => (
                    <option key={c.name} value={c.name}>{c.name} - {c.province}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                آدرس تصویر پروفایل (Avatar URL)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={avatar}
                onChange={e => setAvatar(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-mono text-xs dir-ltr text-left"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-xs transition-all"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
