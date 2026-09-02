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
  getWhatsAppUrl
} from '../lib/formatters';
import AdCard from '../components/AdCard';
import AdImage from '../components/AdImage';
import { hasValidAdImage } from '../lib/adImagePlaceholders';
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
  ExternalLink,
  Flag,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const AdDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ad, setAd] = useState<Ad | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [brokenImageIndices, setBrokenImageIndices] = useState<Set<number>>(new Set());
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Contact / Deposit Warning Modal
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Report Modal
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Similar Ads
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);

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
  const images = hasValidAdImage(ad.images) ? ad.images.filter((image) => image && image.trim()) : [];

  const handleBookmarkToggle = () => {
    const isSaved = StorageService.toggleBookmarkAd(ad.id, user?.id);
    setIsBookmarked(isSaved);
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

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 pt-0 sm:pt-6 space-y-6">
        
        {/* Desktop Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 overflow-x-auto pb-1 no-scrollbar">
          <Link to="/" className="hover:text-primary transition-colors flex-shrink-0">بازار آلمان</Link>
          <span>›</span>
          {categoryObj && (
            <>
              <Link to={`/?cat=${categoryObj.id}`} className="hover:text-primary transition-colors flex-shrink-0">
                {categoryObj.name}
              </Link>
              <span>›</span>
            </>
          )}
          {subCategoryObj && (
            <>
              <Link to={`/?cat=${ad.categoryId}&sub=${subCategoryObj.id}`} className="hover:text-primary transition-colors flex-shrink-0">
                {subCategoryObj.name}
              </Link>
              <span>›</span>
            </>
          )}
          <span className="text-gray-800 dark:text-gray-200 font-semibold truncate">{ad.title}</span>
        </nav>

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

        {/* Main Grid: Info on Right (7 cols), Gallery & Desktop Contact Card on Left (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-6 lg:gap-8 items-start">
          
          {/* ============================================================ */}
          {/* IMAGE CAROUSEL / FULL-WIDTH ON MOBILE (Order-1 on Mobile) */}
          {/* ============================================================ */}
          <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
            
            {/* Main Image Frame (Full-width on mobile, rounded on desktop) */}
            <div className="relative w-full aspect-[4/3] sm:rounded-3xl bg-gray-900 overflow-hidden select-none">
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

            {/* Desktop Contact Card (Only on md+ screens) */}
            <div className="hidden md:block bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>اطلاعات تماس آگهی‌دهنده</span>
                </h3>
              </div>

              {/* Contact Button triggering Warning Modal */}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-secondary text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Phone className="w-4 h-4" />
                <span>مشاهده اطلاعات تماس و شماره تلفن</span>
              </button>

              {/* Utility actions for Desktop */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs">
                <button
                  onClick={handleBookmarkToggle}
                  className={`py-2 rounded-xl border font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isBookmarked
                      ? 'bg-red-50 dark:bg-red-950/40 border-primary text-primary font-bold'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-primary' : ''}`} />
                  <span>{isBookmarked ? 'نشان شده' : 'نشان کردن'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'کپی شد' : 'اشتراک‌گذاری'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* DETAILS & CONTENT COLUMN (Order-2 on Mobile) */}
          {/* ============================================================ */}
          <div className="lg:col-span-7 px-4 sm:px-0 space-y-5 order-2 lg:order-1">
            
            {/* 1. Category Pill & Breadcrumb (Mobile View) */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1 sm:pt-0">
              {categoryObj && (
                <Link
                  to={`/?cat=${categoryObj.id}`}
                  className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition-colors text-[11px]"
                >
                  {categoryObj.name}
                </Link>
              )}
              {subCategoryObj && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">›</span>
                  <Link
                    to={`/?cat=${ad.categoryId}&sub=${subCategoryObj.id}`}
                    className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:text-primary transition-colors text-[11px]"
                  >
                    {subCategoryObj.name}
                  </Link>
                </>
              )}
            </div>

            {/* 2. Title & Metadata Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-7 border border-gray-100 dark:border-gray-800 shadow-xs space-y-3">
              <h1 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white leading-snug">
                {ad.title}
              </h1>

              {/* Meta Row: Time, City, Views */}
              <div className="flex flex-wrap items-center gap-3.5 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{getTimeAgo(ad.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>{ad.district ? `${ad.district}، ` : ''}{ad.city}</span>
                </div>

                {typeof ad.viewsCount === 'number' && (
                  <div className="flex items-center gap-1.5 mr-auto">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-mono">{toPersianDigits(ad.viewsCount)} بازدید</span>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Price */}
            <div className="flex items-baseline justify-between gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-gray-400">قیمت</span>
              <div className="text-sm font-bold text-gray-900 dark:text-white dir-ltr font-mono">
                {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
              </div>
            </div>
            {verbalPrice && (
              <p className="text-[10px] text-gray-400 -mt-2">
                معادل: {verbalPrice}
              </p>
            )}

            {/* 4. Scam Warning */}
            <Link
              to="/safety"
              className="flex items-center justify-between py-2 text-xs text-primary font-semibold hover:underline"
            >
              <span>زنگ خطر</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>

            {/* 5. Attributes & Specifications Table */}
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

            {/* 8. Violation Report Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Flag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">گزارش تخلف یا محتوای نامناسب</h4>
                  <p className="text-[10px] text-gray-400">آیا این آگهی مشکوک یا حاوی اطلاعات نادرست است؟</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 text-primary hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold border border-gray-200 dark:border-gray-700 transition-colors flex-shrink-0"
              >
                ثبت گزارش تخلف
              </button>
            </div>

          </div>
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        {/* Price display on the right */}
        <div className="flex flex-col min-w-0">
          <span className="text-[9px] text-gray-400">قیمت</span>
          <span className="text-xs font-bold text-gray-900 dark:text-white dir-ltr font-mono truncate">
            {formatPrice(ad.price, ad.isNegotiable, ad.isFree, ad.currency)}
          </span>
        </div>

        {/* Big Contact Info Button */}
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="flex-1 py-3 px-4 rounded-2xl bg-primary hover:bg-secondary text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4" />
          <span>اطلاعات تماس و شماره</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* CONTACT INFO & DEPOSIT WARNING POPUP (Modal) */}
      {/* ============================================================ */}
      {isContactModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsContactModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-gray-900 dark:text-white">
                  اطلاعات تماس آگهی‌دهنده
                </h3>
              </div>
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 no-scrollbar">
              
              {/* Advance Payment / Deposit Warning Box (هشدار پرداخت بیعانه) */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm">
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-primary" />
                  <span>هشدار بسیار مهم: هرگز بیعانه پرداخت نکنید!</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  تحت هیچ عنوان و به هیچ بهانه‌ای (رزرو مسکن، پست کردن کلید، نگه داشتن کالا یا تخفیف ویژه) قبل از رویت حضوری و اطمینان از سلامت کالا، بیعانه یا ودیعه (Kaution) واریز نکنید.
                </p>
                <div className="pt-1">
                  <Link
                    to="/safety"
                    onClick={() => setIsContactModalOpen(false)}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>مطالعه روش‌های رایج کلاهبرداری در آلمان ←</span>
                  </Link>
                </div>
              </div>

              {/* User Logged-in vs Guest State */}
              {user ? (
                <div className="space-y-4">
                  {/* Phone Number Display Box */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                      شماره تماس فروشنده:
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span
                        dir="ltr"
                        className="font-black text-lg sm:text-xl tracking-wider text-primary font-mono text-left [unicode-bidi:plaintext]"
                      >
                        {ad.contactPhone}
                      </span>
                      
                      {/* Copy Phone Button */}
                      <button
                        onClick={handleCopyPhone}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                          copiedPhone
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300'
                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {copiedPhone ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600" />
                            <span>کپی شد!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>کپی شماره</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Direct Call Button */}
                    <a
                      href={`tel:${ad.contactPhone}`}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <PhoneCall className="w-4 h-4" />
                      <span>تماس مستقیم تلفنی</span>
                    </a>
                  </div>

                  {/* Direct WhatsApp Button */}
                  {ad.allowWhatsapp !== false && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>ارسال پیام در واتس‌اپ (WhatsApp)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                    </a>
                  )}

                </div>
              ) : (
                /* Guest State */
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                      جهت مشاهده اطلاعات تماس وارد شوید
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      برای محافظت از حریم خصوصی آگهی‌دهندگان، شماره تلفن و راه‌های ارتباطی فقط به کاربران عضو نمایش داده می‌شود.
                    </p>
                  </div>
                  <Link
                    to="/login"
                    onClick={() => setIsContactModalOpen(false)}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>ورود / ثبت‌نام رایگان در ۱ دقیقه</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex justify-end">
              <button
                onClick={() => setIsContactModalOpen(false)}
                className="px-5 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                بستن
              </button>
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
