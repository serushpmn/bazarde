import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Ad, AdStatus, Category, UserRole } from '../types';
import { useAuth } from '../App';
import {
  formatPrice,
  numberToPersianWords,
  getTimeAgo,
  toPersianDigits,
  getWhatsAppUrl,
  getTelegramUrl,
  formatTelegramId,
} from '../lib/formatters';
import AdCard from '../components/AdCard';
import AdImage from '../components/AdImage';
import TrustSignals from '../components/TrustSignals';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
import { container, priceLg, btnPrimary } from '../lib/designTokens';
import {
  MapPin,
  Clock,
  Eye,
  Bookmark,
  Share2,
  ShieldAlert,
  Phone,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
  Lock,
  LogIn,
  PhoneCall,
  Flag,
  Send,
} from 'lucide-react';

export const AdDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [ad, setAd] = useState<Ad | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [brokenImageIndices, setBrokenImageIndices] = useState<Set<number>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedTelegram, setCopiedTelegram] = useState(false);

  // Contact / Deposit Warning Modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Similar Ads
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Image gallery scroll & drag
  const galleryRef = useRef<HTMLDivElement>(null);
  const isDraggingGallery = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  // Handle Escape key to close any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsContactModalOpen(false);
        setIsReportOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!id) return;
    const foundAd = StorageService.getAdById(id);
    if (foundAd) {
      const isOwner = user?.id === foundAd.userId;
      const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR;
      if (foundAd.status === AdStatus.APPROVED || isOwner || isStaff) {
        StorageService.incrementAdViews(foundAd.id);
        StorageService.addRecentViewedAd(foundAd.id);
      }
      setAd(foundAd);
      setIsBookmarked(StorageService.getBookmarkedAdIds(user?.id).includes(foundAd.id));
      setActiveImageIndex(0);
      setBrokenImageIndices(new Set());
      requestAnimationFrame(() => {
        if (galleryRef.current) {
          galleryRef.current.scrollLeft = 0;
        }
      });

      // Find similar ads in same category or city
      const allAds = StorageService.getAds();
      const similar = allAds.filter(
        a => a.id !== foundAd.id &&
        a.status === AdStatus.APPROVED &&
        (a.categoryId === foundAd.categoryId || a.city === foundAd.city)
      ).slice(0, 4);
      setSimilarAds(similar);
    }
    setCategories(StorageService.getCategories());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, user?.id]);

  if (!ad) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 text-primary flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">آگهی یافت نشد یا حذف شده است</h2>
        <p className="text-xs text-gray-500">ممکن است این آگهی منقضی شده باشد یا توسط فروشنده حذف گردیده باشد.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    );
  }

  const categoryObj = categories.find(c => c.id === ad.categoryId);
  const subCategoryObj = categoryObj?.subcategories.find(s => s.id === ad.subCategoryId);
  const isOwner = user?.id === ad.userId;
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR;

  if (ad.status !== AdStatus.APPROVED && !isOwner && !isStaff) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">این آگهی هنوز منتشر نشده است</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          {ad.status === AdStatus.PENDING
            ? 'این آگهی در حال بررسی توسط ناظر است و پس از تایید در بازار نمایش داده می‌شود.'
            : 'این آگهی تایید نشده و در حال حاضر قابل مشاهده نیست.'}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به صفحه اصلی</span>
        </Link>
      </div>
    );
  }

  const verbalPrice = ad.price > 0 ? numberToPersianWords(ad.price, ad.currency) : '';
  const whatsappLink = getWhatsAppUrl(ad.whatsappPhone || ad.contactPhone, ad.title);
  const telegramLink = ad.telegramId ? getTelegramUrl(ad.telegramId) : '';
  const showPhoneContact = ad.showPhone !== false && Boolean(ad.contactPhone);
  const showWhatsappContact = ad.allowWhatsapp === true && Boolean(ad.whatsappPhone || ad.contactPhone);
  const showTelegramContact = Boolean(ad.showTelegram && ad.telegramId);
  const images = hasValidAdImage(ad.images) ? ad.images.filter((image) => image && image.trim()) : [];

  const handleBookmarkToggle = () => {
    const isSaved = StorageService.toggleBookmarkAd(ad.id, user?.id);
    setIsBookmarked(isSaved);
    if (isSaved) showToast('آگهی به ذخیره‌شده‌ها اضافه شد.');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: `${ad.title} - در بازار آلمان`,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to copy link
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPhone = () => {
    if (ad.contactPhone) {
      navigator.clipboard.writeText(ad.contactPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2500);
    }
  };

  const handleCopyTelegram = () => {
    if (ad.telegramId) {
      navigator.clipboard.writeText(formatTelegramId(ad.telegramId));
      setCopiedTelegram(true);
      setTimeout(() => setCopiedTelegram(false), 2500);
    }
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;
    
    StorageService.saveViolationReport({
      adId: ad.id,
      adTitle: ad.title,
      adCity: ad.city,
      adPrice: ad.price,
      adImage: ad.images?.[0],
      adUserId: ad.userId,
      reporterName: user?.name || 'کاربر سامانه',
      reporterContact: user?.phone || undefined,
      reason: reportReason,
      details: reportDetails.trim() || undefined
    });

    setReportSent(true);
    setTimeout(() => {
      setIsReportOpen(false);
      setReportSent(false);
      setReportReason('');
      setReportDetails('');
    }, 2000);
  };

  const syncActiveIndexFromScroll = () => {
    const el = galleryRef.current;
    if (!el || images.length === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveImageIndex(Math.min(Math.max(index, 0), images.length - 1));
  };

  const scrollToImage = (index: number) => {
    const el = galleryRef.current;
    if (!el) return;
    const clamped = Math.min(Math.max(index, 0), images.length - 1);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
    setActiveImageIndex(clamped);
  };

  const handleGalleryPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el || images.length <= 1 || e.pointerType !== 'mouse') return;
    isDraggingGallery.current = true;
    dragStartX.current = e.clientX;
    dragScrollLeft.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  };

  const handleGalleryPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el || !isDraggingGallery.current) return;
    e.preventDefault();
    el.scrollLeft = dragScrollLeft.current - (e.clientX - dragStartX.current);
  };

  const handleGalleryPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el) return;
    if (isDraggingGallery.current) {
      isDraggingGallery.current = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
      syncActiveIndexFromScroll();
    }
  };

  const handleGalleryWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el || images.length <= 1) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      el.scrollLeft += e.deltaY;
      syncActiveIndexFromScroll();
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 animate-in fade-in">
      
      {/* ============================================================ */}
      {/* MOBILE TOP BAR (Replaces Global Header on Mobile) */}
      {/* ============================================================ */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between shadow-xs">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="p-2 -mr-2 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-bold"
          aria-label="بازگشت"
        >
          <ArrowRight className="w-5 h-5 text-gray-800 dark:text-gray-100" />
          <span>بازگشت</span>
        </button>

        {/* Center: Truncated Title or City */}
        <div className="font-bold text-xs text-gray-800 dark:text-gray-200 truncate max-w-[150px] px-2 text-center">
          {ad.title}
        </div>

        {/* Actions: Share & Bookmark */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            title="اشتراک‌گذاری آگهی"
          >
            {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
          </button>

          <button
            onClick={handleBookmarkToggle}
            className={`p-2 rounded-xl transition-colors ${
              isBookmarked
                ? 'text-primary'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={isBookmarked ? 'حذف از نشان‌ها' : 'نشان کردن'}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>
      </div>

      <div className={`${container} px-0 sm:px-6 lg:px-8 pt-0 sm:pt-6 space-y-6`}>
        
        <Breadcrumbs
          className="hidden md:flex px-4 sm:px-0"
          items={[
            { label: 'بازار آلمان', to: '/' },
            ...(categoryObj ? [{ label: categoryObj.name, to: `/?cat=${categoryObj.id}` }] : []),
            ...(subCategoryObj ? [{ label: subCategoryObj.name, to: `/?cat=${ad.categoryId}&sub=${subCategoryObj.id}` }] : []),
            { label: ad.title },
          ]}
        />

        {isOwner && ad.status === AdStatus.PENDING && (
          <div className="mx-4 sm:mx-0 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300">
            <strong>وضعیت: در حال بررسی.</strong> آگهی شما پس از تایید ناظر در صفحه اصلی بازار نمایش داده خواهد شد.
          </div>
        )}

        {isOwner && ad.status === AdStatus.REJECTED && (
          <div className="mx-4 sm:mx-0 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-300 space-y-1">
            <p><strong>وضعیت: رد شده.</strong> این آگهی توسط ناظر تایید نشده است. می‌توانید آن را ویرایش و مجدداً ارسال کنید.</p>
            {ad.rejectionReason && (
              <p className="text-gray-500 dark:text-gray-400">
                <strong>دلیل رد:</strong> {ad.rejectionReason}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Gallery Column */}
          <div className="lg:col-span-7 space-y-3 order-1">
            <div
              className="relative w-full aspect-[4/3] sm:rounded-2xl bg-[#F1F3F5] dark:bg-gray-800 overflow-hidden select-none cursor-zoom-in"
              onClick={() => images.length > 0 && setIsLightboxOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && images.length > 0 && setIsLightboxOpen(true)}
              aria-label="بزرگ‌نمایی تصویر"
            >
              {images.length > 0 ? (
                <div
                  ref={galleryRef}
                  dir="ltr"
                  className={`flex h-full w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar touch-pan-x ${
                    images.length > 1 ? 'cursor-grab active:cursor-grabbing' : ''
                  }`}
                  onScroll={syncActiveIndexFromScroll}
                  onPointerDown={handleGalleryPointerDown}
                  onPointerMove={handleGalleryPointerMove}
                  onPointerUp={handleGalleryPointerUp}
                  onPointerCancel={handleGalleryPointerUp}
                  onWheel={handleGalleryWheel}
                >
                  {images.map((image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="w-full h-full flex-shrink-0 snap-center snap-always"
                    >
                      {!brokenImageIndices.has(index) ? (
                        <img
                          src={image}
                          alt={`${ad.title} - ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                          draggable={false}
                          onError={() => {
                            setBrokenImageIndices((prev) => new Set(prev).add(index));
                          }}
                        />
                      ) : (
                        <AdImage
                          images={[]}
                          alt={ad.title}
                          categoryId={ad.categoryId}
                          seed={`${ad.id}-${index}`}
                          containerClassName="w-full h-full"
                          iconClassName="w-12 h-12"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <AdImage
                  images={[]}
                  alt={ad.title}
                  categoryId={ad.categoryId}
                  seed={ad.id}
                  containerClassName="w-full h-full"
                  iconClassName="w-12 h-12"
                />
              )}

              {/* Navigation Arrows on Photo */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => scrollToImage(activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="عکس قبلی"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollToImage(activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95"
                    aria-label="عکس بعدی"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  {/* Image Counter Badge */}
                  <div className="absolute bottom-3 left-3 z-10 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 pointer-events-none">
                    <span>{toPersianDigits(activeImageIndex + 1)}</span>
                    <span>از</span>
                    <span>{toPersianDigits(images.length)}</span>
                  </div>

                  {/* Pagination Dots */}
                  <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full pointer-events-none">
                    {images.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all ${
                          activeImageIndex === idx ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="hidden sm:flex gap-2 px-4 sm:px-0 overflow-x-auto no-scrollbar">
                {images.map((image, index) => (
                  <button
                    key={`thumb-${index}`}
                    type="button"
                    onClick={() => scrollToImage(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      activeImageIndex === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sticky Product Panel */}
          <div className="lg:col-span-5 px-4 sm:px-0 order-2 lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="flex flex-wrap items-center gap-1.5 md:hidden text-xs text-text-muted">
              {categoryObj && <Link to={`/?cat=${categoryObj.id}`} className="hover:text-primary">{categoryObj.name}</Link>}
              {subCategoryObj && (
                <>
                  <span>›</span>
                  <Link to={`/?cat=${ad.categoryId}&sub=${subCategoryObj.id}`} className="hover:text-primary">{subCategoryObj.name}</Link>
                </>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white leading-snug">{ad.title}</h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary dark:text-gray-400">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{ad.district ? `${ad.district}، ` : ''}{ad.city}</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{getTimeAgo(ad.createdAt)}</span>
              {typeof ad.viewsCount === 'number' && (
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{toPersianDigits(ad.viewsCount)} بازدید</span>
              )}
            </div>

            <div className="py-1">
              <p className={priceLg}>{formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}</p>
              {verbalPrice && <p className="text-xs text-text-muted mt-1">معادل: {verbalPrice}</p>}
            </div>

            <TrustSignals ad={ad} seller={null} />

            <button type="button" onClick={() => setIsContactModalOpen(true)} className={`${btnPrimary} w-full h-14 text-base`}>
              <Phone className="w-5 h-5" />
              {showPhoneContact ? 'نمایش شماره تماس' : showTelegramContact ? 'نمایش تلگرام' : 'اطلاعات تماس'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleBookmarkToggle}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 ${
                  isBookmarked ? 'border-primary text-primary bg-primary-light dark:bg-red-950/30' : 'border-border dark:border-gray-700 text-text-secondary'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
                {isBookmarked ? 'ذخیره شده' : 'ذخیره'}
              </button>
              <button type="button" onClick={handleShare} className="flex-1 py-2.5 rounded-xl border border-border dark:border-gray-700 text-text-secondary text-xs font-medium flex items-center justify-center gap-1.5">
                {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                {copiedLink ? 'کپی شد' : 'اشتراک'}
              </button>
            </div>

            <Link to="/safety" className="flex items-center justify-between py-2 text-xs text-primary font-semibold hover:underline">
              <span>زنگ خطر</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="px-4 sm:px-0 space-y-5">
            {/* Attributes */}
            {ad.attributes && Object.keys(ad.attributes).length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                  مشخصات و ویژگی‌های ثبت‌شده
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {Object.entries(ad.attributes).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 text-xs"
                    >
                      <span className="text-gray-500 dark:text-gray-400">{key}</span>
                      <span className="font-bold text-gray-900 dark:text-white dir-ltr text-left font-sans">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Description */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white pb-2 border-b border-gray-100 dark:border-gray-800">
                توضیحات آگهی
              </h3>
              <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line font-normal">
                {ad.description}
              </div>
            </div>

            {/* 7. Safety Deal Advisory */}
            <div className="space-y-2 py-2">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300">
                نکات مهم برای خرید و اجاره امن در آلمان
              </h3>
              <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1 list-disc pr-4 leading-relaxed">
                <li>برای اجاره مسکن یا خرید کالا، هرگز قبل از رویت حضوری و قرارداد معتبر، بیعانه یا ودیعه واریز نکنید.</li>
                <li>در صورت خرید کالاهای دست دوم، پرداخت نقدی هنگام تحویل یا روش‌های امن بانکی را ترجیح دهید.</li>
                <li>در صورت مشاهده موارد مشکوک یا تقاضای ودیعه غیرحضوری، بلافاصله گزارش تخلف ثبت فرمایید.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-xs text-text-muted hover:text-primary flex items-center gap-1.5 py-2"
            >
              <Flag className="w-3.5 h-3.5" />
              گزارش تخلف
            </button>
        </div>

        {/* Similar Ads Section */}
        {similarAds.length > 0 && (
          <div className="pt-8 px-4 sm:px-0 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                سایر آگهی‌های مرتبط در {ad.city}
              </h2>
              <Link
                to={`/?cat=${ad.categoryId}`}
                className="text-xs text-primary font-bold hover:underline"
              >
                مشاهده همه آگهی‌های این دسته ←
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {similarAds.map(item => (
                <AdCard key={item.id} ad={item} size="compact" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* STICKY BOTTOM CONTACT BAR FOR MOBILE */}
      {/* ============================================================ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-border dark:border-gray-800 px-4 py-3 shadow-card flex items-center justify-between gap-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <p className={`${priceLg} text-lg truncate min-w-0`}>
          {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
        </p>
        <button
          type="button"
          onClick={() => setIsContactModalOpen(true)}
          className={`${btnPrimary} flex-1 max-w-[220px] h-12 text-sm`}
        >
          <Phone className="w-4 h-4" />
          {showPhoneContact ? 'تماس با فروشنده' : showTelegramContact ? 'تلگرام' : 'اطلاعات تماس'}
        </button>
      </div>

      {/* Lightbox */}
      {isLightboxOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-label="نمایش تصویر"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 left-4 p-2 rounded-lg text-white/80 hover:text-white"
            aria-label="بستن"
          >
            <X className="w-6 h-6" />
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); scrollToImage(activeImageIndex > 0 ? activeImageIndex - 1 : images.length - 1); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                aria-label="تصویر قبلی"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); scrollToImage(activeImageIndex < images.length - 1 ? activeImageIndex + 1 : 0); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white"
                aria-label="تصویر بعدی"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            </>
          )}
          <img
            src={images[activeImageIndex]}
            alt={ad.title}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTACT INFO & DEPOSIT WARNING POPUP (Modal) */}
      {/* ============================================================ */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">اطلاعات تماس</h3>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 space-y-3">
              <div className="flex gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-[10px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                  قبل از دیدن کالا بیعانه نپردازید.{' '}
                  <Link to="/safety" onClick={() => setIsContactModalOpen(false)} className="font-bold text-primary hover:underline">
                    راهنمای امنیت
                  </Link>
                </p>
              </div>

              {user ? (
                <>
                  {(showPhoneContact || showTelegramContact) && (
                    <div className="space-y-2">
                      {showPhoneContact && (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 mb-0.5">شماره</p>
                            <span dir="ltr" className="font-bold text-sm text-primary font-mono block truncate text-left [unicode-bidi:plaintext]">
                              {ad.contactPhone}
                            </span>
                          </div>
                          <button
                            onClick={handleCopyPhone}
                            aria-label={copiedPhone ? 'کپی شد' : 'کپی شماره'}
                            title={copiedPhone ? 'کپی شد' : 'کپی شماره'}
                            className={`w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center transition-all ${
                              copiedPhone
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}

                      {showTelegramContact && (
                        <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700">
                          <div className="min-w-0">
                            <p className="text-[10px] text-gray-500 mb-0.5">تلگرام</p>
                            <span dir="ltr" className="font-bold text-sm text-primary font-mono block truncate text-left">
                              {formatTelegramId(ad.telegramId!)}
                            </span>
                          </div>
                          <button
                            onClick={handleCopyTelegram}
                            aria-label={copiedTelegram ? 'کپی شد' : 'کپی آیدی'}
                            title={copiedTelegram ? 'کپی شد' : 'کپی آیدی'}
                            className={`w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center transition-all ${
                              copiedTelegram
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {copiedTelegram ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {(showPhoneContact || showWhatsappContact || showTelegramContact) && (
                    <div className="flex items-center justify-center gap-2 pt-0.5">
                      {showPhoneContact && (
                        <a
                          href={`tel:${ad.contactPhone}`}
                          aria-label="تماس مستقیم"
                          title="تماس مستقیم"
                          className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center justify-center shadow-sm transition-colors"
                        >
                          <PhoneCall className="w-5 h-5" />
                        </a>
                      )}
                      {showWhatsappContact && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="واتس‌اپ"
                          title="واتس‌اپ"
                          className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-emerald-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </a>
                      )}
                      {showTelegramContact && (
                        <a
                          href={telegramLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="تلگرام"
                          title="تلگرام"
                          className="w-11 h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sky-500 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Send className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}

                  {!showPhoneContact && !showWhatsappContact && !showTelegramContact && (
                    <p className="text-xs text-gray-500 text-center py-2">راه ارتباطی ثبت نشده است.</p>
                  )}
                </>
              ) : (
                <div className="py-3 text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed px-2">
                    برای مشاهده اطلاعات تماس وارد شوید.
                  </p>
                  <Link
                    to="/login"
                    onClick={() => setIsContactModalOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>ورود / ثبت‌نام</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VIOLATION REPORT MODAL */}
      {/* ============================================================ */}
      {isReportOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsReportOpen(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 space-y-4 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>گزارش تخلف این آگهی به ناظرین</span>
              </h3>
              <button onClick={() => setIsReportOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSent ? (
              <div className="p-4 text-center text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl font-bold">
                گزارش شما با موفقیت ثبت شد و در بخش نظارت مدیریت مورد بررسی قرار خواهد گرفت.
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  لطفاً دلیل تخلف این آگهی را انتخاب فرمایید:
                </p>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                >
                  <option value="">-- انتخاب دلیل تخلف --</option>
                  <option value="اطلاعات نادرست، تقلبی یا گمراه‌کننده">اطلاعات نادرست، تقلبی یا گمراه‌کننده</option>
                  <option value="قیمت غیرواقعی یا نامتعارف">قیمت غیرواقعی یا نامتعارف</option>
                  <option value="کالای ممنوعه یا غیرقانونی در آلمان">کالای ممنوعه یا غیرقانونی در آلمان</option>
                  <option value="درخواست ودیعه قبل از بازدید یا کلاهبرداری">درخواست ودیعه قبل از بازدید یا کلاهبرداری</option>
                  <option value="شماره تماس نامعتبر یا پاسخگو نبودن">شماره تماس نامعتبر یا پاسخگو نبودن</option>
                  <option value="آگهی تکراری یا اسپم">آگهی تکراری یا اسپم</option>
                </select>

                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">توضیحات تکمیلی (اختیاری):</label>
                  <textarea
                    rows={3}
                    placeholder="در صورت لزوم جزییات بیشتری از تخلف را شرح دهید..."
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-gray-500 hover:bg-gray-100"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm"
                  >
                    ثبت و ارسال گزارش
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default AdDetails;
