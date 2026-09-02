import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import { StorageService } from '../services/storage';
import {
  Ad,
  AdStatus,
  Category,
  User,
  UserRole,
  SupportMessage,
  Banner,
  ViolationReport
} from '../types';
import { CategoryIcon } from '../components/CategoryIcon';
import AdImage from '../components/AdImage';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { formatPrice, getTimeAgo, toPersianDigits } from '../lib/formatters';
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Layers,
  MapPin,
  MessageSquare,
  Image as ImageIcon,
  Users,
  Plus,
  Edit2,
  Flame,
  ShieldAlert,
  Search,
  Send,
  RotateCcw,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Eye,
  X,
  Phone,
  AlertTriangle,
  Flag,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab from URL params or default to 'ads'
  const initialTab = (searchParams.get('tab') as any) || 'ads';
  const highlightedReportId = searchParams.get('reportId');

  const [activeTab, setActiveTab] = useState<'ads' | 'reports' | 'categories' | 'cities' | 'support' | 'banners' | 'users'>(
    ['ads', 'reports', 'categories', 'cities', 'support', 'banners', 'users'].includes(initialTab) ? initialTab : 'ads'
  );

  // Data State
  const [ads, setAds] = useState<Ad[]>([]);
  const [reports, setReports] = useState<ViolationReport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Ads Filter
  const [adStatusFilter, setAdStatusFilter] = useState<'ALL' | AdStatus>('ALL');
  const [adSearchTerm, setAdSearchTerm] = useState('');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');

  // Preview Modal for Ads
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [rejectModalAd, setRejectModalAd] = useState<Ad | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Handle Escape key for Preview Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewAd) {
        setPreviewAd(null);
      }
    };
    if (previewAd) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewAd]);

  // Category Modal / Form
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Layers');
  const [selectedCatForSub, setSelectedCatForSub] = useState<string>('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubSlug, setNewSubSlug] = useState('');

  // City Form
  const [newCityName, setNewCityName] = useState('');

  // Support Reply Form
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  // Banner Form
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerLink, setNewBannerLink] = useState('');

  const loadAll = () => {
    setAds(StorageService.getAds());
    setReports(StorageService.getViolationReports());
    setCategories(StorageService.getCategories());
    setCities(StorageService.getCities());
    setUsers(StorageService.getUsers());
    setSupportMessages(StorageService.getSupportMessages());
    setBanners(StorageService.getBanners());
  };

  useEffect(() => {
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.EDITOR)) {
      navigate('/login');
      return;
    }
    loadAll();
  }, [user, navigate]);

  // Sync tab change to URL
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // Ads Moderation Actions
  const handleUpdateAdStatus = (adId: string, status: AdStatus, rejectionReason?: string) => {
    const ad = StorageService.getAdById(adId);
    if (ad) {
      ad.status = status;
      if (status === AdStatus.REJECTED) {
        ad.rejectionReason = rejectionReason?.trim() || undefined;
      } else if (status === AdStatus.APPROVED) {
        ad.rejectionReason = undefined;
      }
      StorageService.saveAd(ad);
      StorageService.addNotification({
        userId: ad.userId,
        title: status === AdStatus.APPROVED ? 'آگهی شما تایید شد' : 'آگهی شما رد شد',
        message:
          status === AdStatus.APPROVED
            ? `آگهی «${ad.title}» توسط ناظرین تایید و در بازار آلمان منتشر شد.`
            : `آگهی «${ad.title}» تایید نشد.${rejectionReason?.trim() ? ` دلیل: ${rejectionReason.trim()}` : ''}`,
        type: status === AdStatus.APPROVED ? 'SUCCESS' : 'ERROR',
        link: status === AdStatus.APPROVED ? `/ad/${ad.id}` : '/profile?tab=my_ads'
      });
      loadAll();
    }
  };

  const handleConfirmReject = () => {
    if (!rejectModalAd) return;
    if (!rejectReason.trim()) return;
    handleUpdateAdStatus(rejectModalAd.id, AdStatus.REJECTED, rejectReason.trim());
    if (previewAd?.id === rejectModalAd.id) setPreviewAd(null);
    setRejectModalAd(null);
    setRejectReason('');
  };

  const handleDeleteAd = (adId: string) => {
    if (window.confirm('آیا از حذف دائم این آگهی اطمینان دارید؟')) {
      StorageService.deleteAd(adId);
      if (previewAd?.id === adId) setPreviewAd(null);
      loadAll();
    }
  };

  // Violation Report Actions
  const handleResolveReport = (reportId: string, action: 'RESOLVE_KEEP' | 'RESOLVE_DELETE_AD' | 'DISMISS', adId?: string) => {
    if (action === 'RESOLVE_DELETE_AD' && adId) {
      if (window.confirm('آیا مایلید آگهی متخلف حذف و وضعیت گزارش به عنوان رسیدگی‌شده ثبت شود؟')) {
        StorageService.deleteAd(adId);
        StorageService.updateViolationReportStatus(reportId, 'RESOLVED');
      }
    } else if (action === 'RESOLVE_KEEP') {
      StorageService.updateViolationReportStatus(reportId, 'RESOLVED');
    } else {
      StorageService.updateViolationReportStatus(reportId, 'DISMISSED');
    }
    loadAll();
  };

  const handleDeleteReport = (reportId: string) => {
    StorageService.deleteViolationReport(reportId);
    loadAll();
  };

  // Category Actions
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catId = newCatSlug.trim() || `cat-${Date.now()}`;
    const newCategory: Category = {
      id: catId,
      name: newCatName.trim(),
      slug: catId,
      icon: newCatIcon,
      subcategories: []
    };
    StorageService.saveCategory(newCategory);
    setNewCatName('');
    setNewCatSlug('');
    loadAll();
  };

  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatForSub || !newSubName.trim()) return;
    const cat = categories.find(c => c.id === selectedCatForSub);
    if (cat) {
      const subId = newSubSlug.trim() || `sub-${Date.now()}`;
      cat.subcategories.push({
        id: subId,
        name: newSubName.trim(),
        slug: subId
      });
      StorageService.saveCategory(cat);
      setNewSubName('');
      setNewSubSlug('');
      loadAll();
    }
  };

  const handleDeleteCategory = (catId: string) => {
    if (window.confirm('با حذف این دسته تمام زیردسته‌های آن نیز حذف خواهند شد. ادامه می‌دهید؟')) {
      StorageService.deleteCategory(catId);
      loadAll();
    }
  };

  // City Actions
  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    StorageService.addCity(newCityName.trim());
    setNewCityName('');
    loadAll();
  };

  const handleDeleteCity = (cityName: string) => {
    if (window.confirm(`آیا از حذف شهر/ایالت ${cityName} اطمینان دارید؟`)) {
      StorageService.removeCity(cityName);
      loadAll();
    }
  };

  // Support Message Actions
  const handleReplyMessage = (msgId: string) => {
    const text = replyTextMap[msgId];
    if (!text || !text.trim()) return;
    StorageService.replyToMessage(msgId, text.trim());
    setReplyTextMap(prev => ({ ...prev, [msgId]: '' }));
    loadAll();
  };

  // Banner Actions
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerImg.trim() || !newBannerTitle.trim()) return;
    const newBanner: Banner = {
      id: `banner-${Date.now()}`,
      imageUrl: newBannerImg.trim(),
      title: newBannerTitle.trim(),
      link: newBannerLink.trim() || '/',
      position: 'HOME_TOP',
      altText: newBannerTitle.trim()
    };
    StorageService.saveBanner(newBanner);
    setNewBannerImg('');
    setNewBannerTitle('');
    setNewBannerLink('');
    loadAll();
  };

  const handleDeleteBanner = (bannerId: string) => {
    StorageService.deleteBanner(bannerId);
    loadAll();
  };

  // Filter Ads
  const filteredAds = ads.filter(ad => {
    const matchesStatus = adStatusFilter === 'ALL' || ad.status === adStatusFilter;
    const matchesCity = selectedCityFilter === 'ALL' || ad.city === selectedCityFilter;
    const matchesSearch =
      !adSearchTerm.trim() ||
      ad.title.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
      ad.contactPhone.includes(adSearchTerm);
    return matchesStatus && matchesCity && matchesSearch;
  });

  const pendingAdsCount = ads.filter(a => a.status === AdStatus.PENDING).length;
  const pendingReportsCount = reports.filter(r => r.status === 'PENDING').length;
  const unrepliedSupportCount = supportMessages.filter(s => !s.isReplied).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              پنل مدیریت و نظارت نیازمندی‌های آلمان
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-primary font-bold text-xs">
              {user?.role === UserRole.ADMIN ? 'مدیر ارشد' : 'ناظر محتوا'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            بررسی و تایید آگهی‌ها، رسیدگی به گزارش‌های تخلف، مدیریت دسته‌ها، شهرها و پشتیبانی
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('آیا می‌خواهید داده‌های تستی آلمان بازیابی شوند؟')) {
              StorageService.resetToDefaults();
              loadAll();
            }
          }}
          className="px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold flex items-center gap-1.5 transition-colors self-end sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازنشانی آگهی‌های تستی آلمان</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'ads', label: 'نظارت بر آگهی‌ها', count: pendingAdsCount, icon: SlidersHorizontal },
          { id: 'reports', label: 'گزارش‌های تخلف', count: pendingReportsCount, icon: Flag, isWarning: true },
          { id: 'categories', label: 'دسته‌بندی‌ها', icon: Layers },
          { id: 'cities', label: 'ایالت‌ها و شهرها', icon: MapPin },
          { id: 'support', label: 'پیام‌های پشتیبانی', count: unrepliedSupportCount, icon: MessageSquare },
          { id: 'banners', label: 'بنرهای تبلیغاتی', icon: ImageIcon },
          { id: 'users', label: 'کاربران', icon: Users }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-white text-primary'
                      : tab.isWarning
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-primary text-white'
                  }`}
                >
                  {toPersianDigits(tab.count)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. ADS TAB */}
      {activeTab === 'ads' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="جستجو در عنوان، متن، یا شماره آگهی‌دهنده..."
                value={adSearchTerm}
                onChange={e => setAdSearchTerm(e.target.value)}
                className="w-full pl-4 pr-9 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={adStatusFilter}
                onChange={e => setAdStatusFilter(e.target.value as any)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium flex-1 sm:flex-initial"
              >
                <option value="ALL">همه وضعیت‌ها ({ads.length})</option>
                <option value={AdStatus.APPROVED}>تایید شده / منتشر شده ({ads.filter(a => a.status === AdStatus.APPROVED).length})</option>
                <option value={AdStatus.PENDING}>در انتظار تایید ({ads.filter(a => a.status === AdStatus.PENDING).length})</option>
                <option value={AdStatus.REJECTED}>رد شده ({ads.filter(a => a.status === AdStatus.REJECTED).length})</option>
              </select>

              <select
                value={selectedCityFilter}
                onChange={e => setSelectedCityFilter(e.target.value)}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium flex-1 sm:flex-initial"
              >
                <option value="ALL">همه شهرهای آلمان</option>
                {cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ads List */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            {filteredAds.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                هیچ آگهی با شرایط انتخاب‌شده یافت نشد.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredAds.map(item => {
                  const isApproved = item.status === AdStatus.APPROVED;
                  const isPending = item.status === AdStatus.PENDING;
                  const isRejected = item.status === AdStatus.REJECTED;

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 border border-gray-200 dark:border-gray-700 relative">
                          <AdImage
                            images={item.images}
                            alt={item.title}
                            categoryId={item.categoryId}
                            seed={item.id}
                            containerClassName="w-full h-full"
                            iconClassName="w-6 h-6"
                          />
                          {item.isUrgent && (
                            <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] px-1 rounded font-bold">
                              فوری
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h3>
                            
                            {/* Explicit Green Checkmark Tick for Approved Ads */}
                            {isApproved && (
                              <span
                                title="آگهی تایید شده و فعال است"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-black flex-shrink-0"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>تایید شده ✓</span>
                              </span>
                            )}

                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-[10px] font-bold flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>در انتظار بررسی</span>
                              </span>
                            )}

                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-[10px] font-bold flex-shrink-0">
                                <XCircle className="w-3 h-3" />
                                <span>رد شده</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {formatPrice(item.price, item.isNegotiable, item.isFree, item.currency)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary" />
                              <span>{item.city}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span className="dir-ltr text-left font-mono">{item.contactPhone}</span>
                            </span>
                            <span>•</span>
                            <span>{getTimeAgo(item.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Moderation Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => setPreviewAd(item)}
                          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 text-xs font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>پیش‌نمایش</span>
                        </button>

                        <Link
                          to={`/ad/${item.id}`}
                          target="_blank"
                          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:text-primary hover:bg-gray-100 text-xs"
                          title="مشاهده صفحه اصلی آگهی"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {!isApproved && (
                          <button
                            onClick={() => handleUpdateAdStatus(item.id, AdStatus.APPROVED)}
                            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                            title="تایید و انتشار آگهی"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>تایید</span>
                          </button>
                        )}

                        {!isRejected && (
                          <button
                            onClick={() => {
                              setRejectModalAd(item);
                              setRejectReason('');
                            }}
                            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold flex items-center gap-1"
                            title="رد آگهی"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رد</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteAd(item.id)}
                          className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors"
                          title="حذف دائمی آگهی"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VIOLATION REPORTS TAB (بخش نظارت و رسیدگی به تخلفات) */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200/80 dark:border-rose-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                در این بخش تمامی گزارش‌های ارسالی کاربران در مورد تخلف آگهی‌ها یا محتوای مشکوک ثبت می‌گردد.
              </span>
            </div>
            <span className="text-xs text-rose-600 dark:text-rose-400 font-bold">
              {reports.length} گزارش کل
            </span>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
            {reports.length === 0 ? (
              <div className="p-12 text-center text-xs text-gray-400">
                هیچ گزارش تخلفی تاکنون ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {reports.map(rep => {
                  const isHighlighted = rep.id === highlightedReportId;
                  const isPending = rep.status === 'PENDING';
                  const isResolved = rep.status === 'RESOLVED';
                  const isDismissed = rep.status === 'DISMISSED';

                  return (
                    <div
                      key={rep.id}
                      className={`p-5 space-y-4 transition-all ${
                        isHighlighted ? 'bg-amber-50/80 dark:bg-amber-950/40 border-2 border-amber-400' : ''
                      }`}
                    >
                      {/* Top Header of report */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                              isPending
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse'
                                : isResolved
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            <Flag className="w-3 h-3" />
                            <span>
                              {isPending ? 'نیازمند بررسی' : isResolved ? 'رسیدگی و حل شد' : 'رد گزارش (بدون تخلف)'}
                            </span>
                          </span>

                          <span className="text-xs text-gray-400">
                            ثبت شده: {getTimeAgo(rep.createdAt)}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <span>گزارش‌دهنده: <strong className="text-gray-800 dark:text-gray-200">{rep.reporterName || 'کاربر مهمان'}</strong></span>
                          {rep.reporterContact && (
                            <span className="dir-ltr">({rep.reporterContact})</span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Reason & Details */}
                      <div className="space-y-2 bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="text-xs font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>علت تخلف: {rep.reason}</span>
                        </div>
                        {rep.details && (
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed pr-5">
                            توضیحات تکمیلی کاربر: {rep.details}
                          </p>
                        )}
                      </div>

                      {/* Bottom: Ad Card Summary & Moderator Actions */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                        {/* Target Ad Info */}
                        <div className="flex items-center gap-3">
                          {rep.adImage && (
                            <img
                              src={rep.adImage}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                            />
                          )}
                          <div>
                            <div className="text-xs font-bold text-gray-900 dark:text-white">
                              آگهی مورد گزارش: {rep.adTitle}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-2">
                              <span>شهر: {rep.adCity}</span>
                              <span>•</span>
                              <span>قیمت: {formatPrice(rep.adPrice || 0, false, false)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Moderator Decision Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/ad/${rep.adId}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>مشاهده صفحه آگهی</span>
                          </Link>

                          {isPending && (
                            <>
                              <button
                                onClick={() => handleResolveReport(rep.id, 'RESOLVE_DELETE_AD', rep.adId)}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
                                title="حذف آگهی متخلف و بستن گزارش"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>تایید تخلف و حذف آگهی</span>
                              </button>

                              <button
                                onClick={() => handleResolveReport(rep.id, 'DISMISS')}
                                className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-xs font-bold"
                              >
                                رد گزارش (آگهی مشکلی ندارد)
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleDeleteReport(rep.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg"
                            title="حذف گزارش از تاریخچه"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن دسته‌بندی جدید</h3>
            
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">نام دسته</label>
                <input
                  type="text"
                  placeholder="مثلاً: خدمات حقوقی و مالی"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">شناسه انگلیسی (slug)</label>
                <input
                  type="text"
                  placeholder="legal-services"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none font-mono dir-ltr"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت دسته اصلی</span>
              </button>
            </form>

            <hr className="border-gray-100 dark:border-gray-800 my-4" />

            <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن زیردسته</h3>
            <form onSubmit={handleAddSubCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">انتخاب دسته والد</label>
                <select
                  value={selectedCatForSub}
                  onChange={e => setSelectedCatForSub(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                  required
                >
                  <option value="">-- انتخاب کنید --</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">نام زیردسته</label>
                <input
                  type="text"
                  placeholder="مثلاً: ترجمه رسمی و مدارک"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gray-800 dark:bg-gray-700 hover:bg-gray-900 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت زیردسته</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                دسته‌بندی‌های فعال ({categories.length})
              </h3>

              <div className="space-y-3">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CategoryIcon name={cat.icon} className="w-5 h-5 text-primary" />
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{cat.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({cat.id})</span>
                      </div>

                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-200/60 dark:border-gray-700/60">
                        {cat.subcategories.map(sub => (
                          <span
                            key={sub.id}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-700 dark:text-gray-300 font-medium"
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CITIES TAB */}
      {activeTab === 'cities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن شهر یا ایالت آلمان</h3>
            <form onSubmit={handleAddCity} className="space-y-3">
              <input
                type="text"
                placeholder="مثلاً: برمن (Bremen)"
                value={newCityName}
                onChange={e => setNewCityName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                required
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت شهر</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">
              شهرهای تحت پوشش در آلمان ({cities.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {cities.map(cityName => (
                <div
                  key={cityName}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{cityName}</span>
                  <button
                    onClick={() => handleDeleteCity(cityName)}
                    className="text-gray-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPPORT MESSAGES TAB */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs divide-y divide-gray-100 dark:divide-gray-800">
          {supportMessages.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400">
              هیچ پیام پشتیبانی جدیدی وجود ندارد.
            </div>
          ) : (
            supportMessages.map(msg => (
              <div key={msg.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white">{msg.name}</span>
                    <span className="text-[11px] text-gray-400 dir-ltr font-mono">({msg.contact})</span>
                  </div>
                  <span className="text-[11px] text-gray-400">{getTimeAgo(msg.createdAt)}</span>
                </div>

                <div className="font-semibold text-xs text-primary">{msg.subject}</div>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl">
                  {msg.message}
                </p>

                {msg.reply ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                    <strong className="block mb-1">پاسخ ارسال‌شده توسط پشتیبان:</strong>
                    {msg.reply}
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="متن پاسخ برای کاربر..."
                      value={replyTextMap[msg.id] || ''}
                      onChange={e => setReplyTextMap({ ...replyTextMap, [msg.id]: e.target.value })}
                      className="flex-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                    />
                    <button
                      onClick={() => handleReplyMessage(msg.id)}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-secondary flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5 rotate-180" />
                      <span>ارسال پاسخ</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. BANNERS TAB */}
      {activeTab === 'banners' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">افزودن بنر اسلایدر صفحه اصلی</h3>
            <form onSubmit={handleAddBanner} className="space-y-3">
              <input
                type="text"
                placeholder="عنوان بنر"
                value={newBannerTitle}
                onChange={e => setNewBannerTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none"
                required
              />
              <input
                type="url"
                placeholder="آدرس اینترنتی تصویر (Image URL)"
                value={newBannerImg}
                onChange={e => setNewBannerImg(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none dir-ltr"
                required
              />
              <input
                type="text"
                placeholder="لینک مقصد بنر (مثلاً: /?cat=vehicles)"
                value={newBannerLink}
                onChange={e => setNewBannerLink(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none dir-ltr"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت بنر</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            {banners.map(banner => (
              <div
                key={banner.id}
                className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-24 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{banner.title}</h4>
                  <span className="text-[10px] text-gray-400 dir-ltr block truncate">{banner.link}</span>
                </div>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. USERS TAB */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 font-bold text-xs text-gray-700 dark:text-gray-300">
            کاربران ثبت‌نام شده ({users.length})
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map(u => (
              <div key={u.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">{u.name}</div>
                    <div dir="ltr" className="text-[11px] text-gray-400 font-mono">{u.phone}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                  {u.role === UserRole.ADMIN ? 'مدیر ارشد' : u.role === UserRole.EDITOR ? 'ناظر محتوا' : 'کاربر عادی'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Ad Preview Modal */}
      {previewAd && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewAd(null)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-sm text-gray-900 dark:text-white">
                پیش‌نمایش آگهی: {previewAd.title}
              </h3>
              <button onClick={() => setPreviewAd(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos */}
            {hasValidAdImage(previewAd.images) ? (
              <div className="grid grid-cols-3 gap-2">
                {previewAd.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="aspect-video rounded-xl object-cover w-full" />
                ))}
              </div>
            ) : (
              <div className="aspect-video rounded-xl overflow-hidden">
                <AdImage
                  images={[]}
                  alt={previewAd.title}
                  categoryId={previewAd.categoryId}
                  seed={previewAd.id}
                  containerClassName="w-full h-full"
                />
              </div>
            )}

            <div className="space-y-2 text-xs">
              {(() => {
                const cat = categories.find(c => c.id === previewAd.categoryId);
                const sub = cat?.subcategories.find(s => s.id === previewAd.subCategoryId);
                return (
                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                    {cat && (
                      <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        دسته: <strong>{cat.name}</strong>
                      </span>
                    )}
                    {sub && (
                      <span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        زیردسته: <strong>{sub.name}</strong>
                      </span>
                    )}
                  </div>
                );
              })()}

              <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <span>قیمت: <strong>{formatPrice(previewAd.price, previewAd.isNegotiable, previewAd.isFree, previewAd.currency)}</strong></span>
                <span>شهر: <strong>{previewAd.city} ({previewAd.district || 'مرکز'})</strong></span>
                <span>تلفن: <strong className="dir-ltr text-left font-mono">{previewAd.contactPhone}</strong></span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                {previewAd.description}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setPreviewAd(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                بستن
              </button>

              {previewAd.status !== AdStatus.REJECTED && (
                <button
                  onClick={() => {
                    setRejectModalAd(previewAd);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>رد آگهی</span>
                </button>
              )}
              
              {previewAd.status !== AdStatus.APPROVED && (
                <button
                  onClick={() => {
                    handleUpdateAdStatus(previewAd.id, AdStatus.APPROVED);
                    setPreviewAd(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>تایید و انتشار</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Ad Modal */}
      {rejectModalAd && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setRejectModalAd(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">رد آگهی</h3>
              <button onClick={() => setRejectModalAd(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              لطفاً دلیل رد آگهی «{rejectModalAd.title}» را برای اطلاع آگهی‌دهنده بنویسید:
            </p>
            <textarea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="مثلاً: تصاویر نامرتبط، قیمت غیرواقعی، اطلاعات ناقص..."
              className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary leading-relaxed"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRejectModalAd(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-secondary disabled:opacity-50 text-white text-xs font-bold"
              >
                ثبت رد آگهی
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
