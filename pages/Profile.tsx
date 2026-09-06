import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { StorageService } from '../services/storage';
import {
  Ad,
  AdStatus,
  User,
  UserRole,
  CITIES_DATA,
  GERMAN_PROVINCES,
  Appeal,
  AppNotification,
} from '../types';
import AdCard from '../components/AdCard';
import AdImage from '../components/AdImage';
import { NotificationList } from '../components/NotificationList';
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
  Bell,
  Scale,
  Ban,
  Timer,
  ShieldAlert,
  X,
} from 'lucide-react';

type ProfileTab = 'my_ads' | 'notifications' | 'appeals' | 'saved' | 'recent' | 'settings';
type SoldFeedback = NonNullable<Ad['soldFeedback']>;

const TAB_IDS: ProfileTab[] = [
  'my_ads',
  'notifications',
  'appeals',
  'saved',
  'recent',
  'settings',
];

export const Profile: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>('my_ads');

  const [myAds, setMyAds] = useState<Ad[]>([]);
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
  const [recentAds, setRecentAds] = useState<Ad[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);

  // Settings form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || 'برلین (Berlin)');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Delete ad modal
  const [deleteModalAd, setDeleteModalAd] = useState<Ad | null>(null);
  const [soldFeedback, setSoldFeedback] = useState<SoldFeedback | null>(null);

  // Appeal modal
  const [appealModalAd, setAppealModalAd] = useState<Ad | null>(null);
  const [appealMessage, setAppealMessage] = useState('');
  const [appealError, setAppealError] = useState('');

  // Delete account confirm
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab') as ProfileTab | null;
    if (tab && TAB_IDS.includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('my_ads');
    }
  }, [searchParams]);

  const loadData = () => {
    const allAds = StorageService.getAds();

    if (user) {
      setMyAds(allAds.filter(a => a.userId === user.id));
      setNotifications(StorageService.getNotifications(user.id, user.role));
      setAppeals(StorageService.getAppealsByUser(user.id));
    } else {
      setMyAds([]);
      setNotifications([]);
      setAppeals([]);
    }

    const bookmarkedIds = StorageService.getBookmarkedAdIds(user?.id);
    setSavedAds(allAds.filter(a => bookmarkedIds.includes(a.id)));
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

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const openDeleteModal = (ad: Ad) => {
    setDeleteModalAd(ad);
    setSoldFeedback(null);
  };

  const confirmDeleteAd = () => {
    if (!user || !deleteModalAd || !soldFeedback) return;
    StorageService.deleteAdByUser(deleteModalAd.id, user.id, soldFeedback);
    setDeleteModalAd(null);
    setSoldFeedback(null);
    loadData();
  };

  const openAppealModal = (ad: Ad) => {
    setAppealModalAd(ad);
    setAppealMessage('');
    setAppealError('');
  };

  const submitAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !appealModalAd) return;
    const msg = appealMessage.trim();
    if (msg.length < 10) {
      setAppealError('لطفاً توضیح اعتراض را حداقل در ۱۰ کاراکتر بنویسید.');
      return;
    }

    const isRemoval = appealModalAd.status === AdStatus.REMOVED;
    StorageService.saveAppeal({
      adId: appealModalAd.id,
      adTitle: appealModalAd.title,
      userId: user.id,
      type: isRemoval ? 'REMOVAL' : 'REJECTION',
      originalReason:
        (isRemoval ? appealModalAd.removalReason : appealModalAd.rejectionReason) ||
        'بدون دلیل ثبت‌شده',
      message: msg,
    });

    setAppealModalAd(null);
    setAppealMessage('');
    setAppealError('');
    loadData();
    handleTabChange('appeals');
  };

  const handleOpenNotification = (n: AppNotification) => {
    StorageService.markNotificationRead(n.id);
    loadData();
    if (n.link) {
      navigate(n.link);
    }
  };

  const handleMarkAllNotifications = () => {
    if (!user) return;
    StorageService.markAllNotificationsRead(user.id, user.role);
    loadData();
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
      avatar: avatar.trim() || undefined,
    };
    StorageService.saveUser(updated);
    login(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    StorageService.deleteUserAccount(user.id);
    setShowDeleteAccount(false);
    logout();
    navigate('/');
  };

  const hasPendingAppealForAd = (adId: string) =>
    appeals.some(a => a.adId === adId && a.status === 'PENDING');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">ورود به حساب کاربری</h2>
          <p className="text-xs text-gray-500 mt-1">
            برای مدیریت آگهی‌ها و تنظیمات حساب خود، لطفاً ابتدا وارد شوید.
          </p>
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

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              {user.role === UserRole.EDITOR && (
                <span className="px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[10px] font-bold">
                  ناظر
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
            type="button"
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
        {(
          [
            { id: 'my_ads' as const, label: 'آگهی‌های من', count: myAds.length, icon: Layers },
            {
              id: 'notifications' as const,
              label: 'اعلان‌ها',
              count: unreadCount,
              icon: Bell,
            },
            { id: 'appeals' as const, label: 'اعتراض‌ها', count: appeals.length, icon: Scale },
            { id: 'saved' as const, label: 'نشان‌شده‌ها', count: savedAds.length, icon: Bookmark },
            {
              id: 'recent' as const,
              label: 'بازدیدهای اخیر',
              count: recentAds.length,
              icon: History,
            },
            { id: 'settings' as const, label: 'تنظیمات حساب', icon: Settings },
          ] as const
        ).map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {'count' in tab && typeof tab.count === 'number' && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {toPersianDigits(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB: My Ads */}
      {activeTab === 'my_ads' && (
        <div className="space-y-4">
          {myAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
              <Layers className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">هنوز آگهی ثبت نکرده‌اید</h3>
              <p className="text-xs text-gray-400">
                کالا، خدمات یا مسکن خود را به صورت رایگان برای هزاران مخاطب در آلمان آگهی کنید.
              </p>
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
                        {item.status === AdStatus.EXPIRED && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            <span>منقضی شده</span>
                          </span>
                        )}
                        {item.status === AdStatus.REMOVED && (
                          <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            <span>حذف‌شده</span>
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
                      {item.status === AdStatus.REMOVED && item.removalReason && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1 leading-relaxed">
                          دلیل حذف: {item.removalReason}
                        </p>
                      )}
                      {item.status === AdStatus.EXPIRED && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                          برای انتشار دوباره، آگهی را ویرایش و ارسال کنید.
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

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/ad/${item.id}`}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده</span>
                        </Link>

                        {item.status !== AdStatus.REMOVED && (
                          <Link
                            to={`/edit/${item.id}`}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-primary hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-1"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>ویرایش</span>
                          </Link>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => openDeleteModal(item)}
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl"
                        title="حذف آگهی"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {(item.status === AdStatus.REJECTED || item.status === AdStatus.REMOVED) && (
                      <div>
                        {hasPendingAppealForAd(item.id) ? (
                          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <Scale className="w-3 h-3" />
                            اعتراض شما در صف بررسی است
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openAppealModal(item)}
                            className="w-full px-3 py-2 rounded-xl bg-primary/10 text-primary text-[11px] font-bold hover:bg-primary/20 flex items-center justify-center gap-1.5"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>
                              {item.status === AdStatus.REMOVED
                                ? 'ثبت اعتراض به حذف آگهی'
                                : 'ثبت اعتراض به رد آگهی'}
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-black text-sm text-gray-900 dark:text-white">اعلان‌های شما</h3>
          </div>
          <NotificationList
            items={notifications}
            onOpen={handleOpenNotification}
            onMarkAll={handleMarkAllNotifications}
            emptyText="اعلانی برای نمایش وجود ندارد."
          />
        </div>
      )}

      {/* TAB: Appeals */}
      {activeTab === 'appeals' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            <h3 className="font-black text-sm text-gray-900 dark:text-white">اعتراض‌های ثبت‌شده</h3>
          </div>

          {appeals.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
              <Scale className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">اعتراضی ثبت نشده است</h3>
              <p className="text-xs text-gray-400">
                در صورت رد یا حذف آگهی توسط ناظر، می‌توانید از بخش آگهی‌های من اعتراض ثبت کنید.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appeals.map(a => (
                <div
                  key={a.id}
                  className="bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-2"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-gray-900 dark:text-white">{a.adTitle}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {a.type === 'REJECTION' ? 'اعتراض به رد' : 'اعتراض به حذف'} ·{' '}
                        {getTimeAgo(a.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                        a.status === 'PENDING'
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : a.status === 'ACCEPTED'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {a.status === 'PENDING'
                        ? 'در انتظار بررسی'
                        : a.status === 'ACCEPTED'
                          ? 'پذیرفته شد'
                          : 'رد شد'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    <strong>دلیل اولیه ناظر:</strong> {a.originalReason}
                  </p>
                  <p className="text-[11px] text-gray-800 dark:text-gray-200 leading-relaxed">
                    <strong>متن اعتراض شما:</strong> {a.message}
                  </p>
                  {a.adminReply && (
                    <p className="text-[11px] text-primary bg-primary/5 rounded-xl p-2.5">
                      <strong>پاسخ ناظر:</strong> {a.adminReply}
                    </p>
                  )}
                  <Link
                    to={`/ad/${a.adId}`}
                    className="inline-flex text-[11px] font-bold text-primary hover:underline"
                  >
                    مشاهده آگهی ←
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Saved Ads */}
      {activeTab === 'saved' && (
        <div>
          {savedAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
              <Bookmark className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">هیچ آگهی نشان نشده است</h3>
              <p className="text-xs text-gray-400">
                با زدن روی علامت نشان در صفحه آگهی‌ها، آن‌ها را در این بخش ذخیره کنید.
              </p>
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

      {/* TAB: Recent Ads */}
      {activeTab === 'recent' && (
        <div>
          {recentAds.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-800 shadow-xs space-y-2">
              <History className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                تاریخچه بازدیدی ثبت نشده است
              </h3>
              <p className="text-xs text-gray-400">
                آگهی‌هایی که اخیراً باز کرده‌اید اینجا نمایش داده می‌شوند.
              </p>
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

      {/* TAB: Settings */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
            <div>
              <h3 className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                ویرایش مشخصات حساب کاربری
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                مشخصات شما در هنگام ثبت آگهی‌ها به خریداران نمایش داده می‌شود.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-[11px] text-sky-900 dark:text-sky-200 leading-relaxed flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
              <div>
                <strong className="font-bold">حریم خصوصی (GDPR):</strong> داده اصلی شخصی شما{' '}
                <strong>شماره تلفن</strong> است و به‌عنوان شناسه تماس و ورود استفاده می‌شود. نام نمایشی
                برای شناسایی در پلتفرم لازم است؛ شهر اختیاری است. ما حداقل داده ضروری را نگه می‌داریم.
              </div>
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
                  <p className="text-[10px] text-gray-400 mt-1">
                    این شماره داده اصلی حساب شماست و در آگهی‌ها به‌عنوان راه تماس استفاده می‌شود.
                  </p>
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
                    {GERMAN_PROVINCES.map(province => (
                      <optgroup key={province} label={province}>
                        {CITIES_DATA.filter(c => c.province === province).map(c => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
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
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-mono dir-ltr text-left"
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

          {/* Delete account */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/40 shadow-xs space-y-3">
            <h3 className="font-black text-sm text-rose-700 dark:text-rose-300">حذف حساب کاربری</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              با حذف حساب، پروفایل، آگهی‌ها و اعلان‌های شما پاک می‌شوند (حق فراموشی مطابق GDPR). این عمل
              قابل بازگشت نیست.
            </p>
            {!showDeleteAccount ? (
              <button
                type="button"
                onClick={() => setShowDeleteAccount(true)}
                className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                درخواست حذف حساب
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  بله، حساب را برای همیشه حذف کن
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600"
                >
                  انصراف
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Ad Modal — sold feedback */}
      {deleteModalAd && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDeleteModalAd(null)}
          role="presentation"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-xl space-y-4"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ad-title"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  id="delete-ad-title"
                  className="font-black text-sm text-gray-900 dark:text-white"
                >
                  حذف آگهی
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">«{deleteModalAd.title}»</p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalAd(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">آیا کالا فروش رفت؟</p>

            <div className="space-y-2">
              {(
                [
                  { value: 'SOLD' as const, label: 'بله، فروخته شد' },
                  { value: 'NOT_SOLD' as const, label: 'خیر، فروش نرفت' },
                  { value: 'PREFER_NOT_SAY' as const, label: 'ترجیح می‌دهم نگویم' },
                ] as const
              ).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSoldFeedback(opt.value)}
                  className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-bold border transition-all ${
                    soldFeedback === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteModalAd(null)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={!soldFeedback}
                onClick={confirmDeleteAd}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                حذف آگهی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {appealModalAd && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setAppealModalAd(null)}
          role="presentation"
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 w-full max-w-md border border-gray-100 dark:border-gray-800 shadow-xl space-y-4"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="appeal-title"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 id="appeal-title" className="font-black text-sm text-gray-900 dark:text-white">
                  {appealModalAd.status === AdStatus.REMOVED
                    ? 'اعتراض به حذف آگهی'
                    : 'اعتراض به رد آگهی'}
                </h3>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">«{appealModalAd.title}»</p>
              </div>
              <button
                type="button"
                onClick={() => setAppealModalAd(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <strong>دلیل ناظر:</strong>{' '}
              {(appealModalAd.status === AdStatus.REMOVED
                ? appealModalAd.removalReason
                : appealModalAd.rejectionReason) || 'بدون دلیل ثبت‌شده'}
            </p>

            <form onSubmit={submitAppeal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  توضیح اعتراض شما
                </label>
                <textarea
                  rows={4}
                  value={appealMessage}
                  onChange={e => {
                    setAppealMessage(e.target.value);
                    setAppealError('');
                  }}
                  placeholder="چرا فکر می‌کنید این تصمیم نادرست است؟"
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary resize-none"
                  required
                />
                {appealError && (
                  <p className="text-[10px] text-rose-600 mt-1 font-bold">{appealError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAppealModalAd(null)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold"
                >
                  ارسال اعتراض
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
