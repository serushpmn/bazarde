import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth, useCity } from '../App';
import { StorageService } from '../services/storage';
import { Ad, AdStatus, Category, CITIES_DATA, UserRole } from '../types';
import { numberToPersianWords } from '../lib/formatters';
import { CategoryIcon } from '../components/CategoryIcon';
import {
  Upload,
  X,
  Plus,
  Trash2,
  Phone,
  MapPin,
  Tag,
  CheckCircle2,
  AlertCircle,
  Euro,
  Coins,
  MessageCircle,
  Loader2,
  Lock
} from 'lucide-react';

export const NewAd: React.FC = () => {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);
  const { user } = useAuth();
  const { selectedCity } = useCity();

  const [categories, setCategories] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [city, setCity] = useState(
    selectedCity && selectedCity !== 'ALL' ? selectedCity : 'برلین (Berlin)'
  );
  const [district, setDistrict] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'TOMAN'>('EUR');
  const [price, setPrice] = useState<string>('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [description, setDescription] = useState('');
  const [allowWhatsapp, setAllowWhatsapp] = useState(true);
  const [images, setImages] = useState<string[]>([]);

  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([
    { key: '', value: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.EDITOR;
  const userPhone = user?.phone?.trim() || '';

  useEffect(() => {
    const cats = StorageService.getCategories();
    setCategories(cats);

    if (isEditMode && editId) {
      const existingAd = StorageService.getAdById(editId);
      if (!existingAd) {
        navigate('/');
        return;
      }
      if (user && existingAd.userId !== user.id && !isStaff) {
        navigate(`/ad/${editId}`);
        return;
      }

      setTitle(existingAd.title);
      setSelectedCategory(existingAd.categoryId);
      setSelectedSubCategory(existingAd.subCategoryId || '');
      setCity(existingAd.city);
      setDistrict(existingAd.district || '');
      setCurrency(existingAd.currency || 'EUR');
      setPrice(existingAd.price > 0 ? String(existingAd.price) : '');
      setIsNegotiable(Boolean(existingAd.isNegotiable));
      setIsFree(Boolean(existingAd.isFree));
      setDescription(existingAd.description);
      setAllowWhatsapp(existingAd.allowWhatsapp !== false);
      setImages(existingAd.images || []);
      setAttributes(
        existingAd.attributes
          ? Object.entries(existingAd.attributes).map(([key, value]) => ({ key, value }))
          : [{ key: '', value: '' }]
      );
      return;
    }

    if (cats.length > 0) {
      setSelectedCategory(cats[0].id);
    }
  }, [editId, isEditMode, isStaff, navigate, user]);

  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const activeCityData = CITIES_DATA.find(c => c.name === city);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string].slice(0, 6));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addAttributeRow = () => {
    setAttributes([...attributes, { key: '', value: '' }]);
  };

  const updateAttribute = (idx: number, field: 'key' | 'value', val: string) => {
    const updated = [...attributes];
    updated[idx][field] = val;
    setAttributes(updated);
  };

  const removeAttribute = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const resolveAdStatus = (existingStatus?: AdStatus): AdStatus => {
    if (isStaff) {
      return existingStatus || AdStatus.APPROVED;
    }
    return AdStatus.PENDING;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      setErrorMsg('برای ثبت آگهی باید وارد حساب کاربری شوید.');
      return;
    }

    if (!userPhone) {
      setErrorMsg('شماره موبایل در حساب کاربری شما ثبت نشده است. لطفاً ابتدا در تنظیمات حساب، شماره تماس خود را وارد کنید.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('لطفاً عنوان آگهی را وارد فرمایید.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('لطفاً توضیحات آگهی را تکمیل فرمایید.');
      return;
    }

    const numPrice = isFree || isNegotiable ? 0 : parseInt(price.replace(/,/g, ''), 10) || 0;
    const existingAd = isEditMode && editId ? StorageService.getAdById(editId) : undefined;

    setIsSubmitting(true);

    const attributesMap: Record<string, string> = {};
    attributes.forEach(attr => {
      if (attr.key.trim() && attr.value.trim()) {
        attributesMap[attr.key.trim()] = attr.value.trim();
      }
    });

    const adStatus = resolveAdStatus(existingAd?.status);

    const newAd: Ad = {
      id: isEditMode && editId ? editId : `ad-${Date.now()}`,
      userId: existingAd?.userId || user.id,
      title: title.trim(),
      description: description.trim(),
      price: numPrice,
      currency,
      isNegotiable,
      isFree,
      city,
      state: activeCityData?.province,
      district: district.trim() || undefined,
      categoryId: selectedCategory,
      subCategoryId: selectedSubCategory || undefined,
      images,
      status: adStatus,
      createdAt: existingAd?.createdAt || Date.now(),
      contactPhone: userPhone,
      whatsappPhone: allowWhatsapp ? userPhone : undefined,
      allowWhatsapp,
      viewsCount: existingAd?.viewsCount || 0,
      attributes: Object.keys(attributesMap).length > 0 ? attributesMap : undefined
    };

    StorageService.saveAd(newAd);

    if (!isEditMode) {
      StorageService.addNotification({
        userId: user.id,
        title: 'آگهی شما ثبت شد',
        message: isStaff
          ? `آگهی «${newAd.title}» منتشر گردید.`
          : `آگهی «${newAd.title}» در صف بررسی قرار گرفت و پس از تایید ناظر در بازار نمایش داده می‌شود.`,
        type: isStaff ? 'SUCCESS' : 'INFO',
        link: '/profile?tab=my_ads'
      });

      if (!isStaff) {
        StorageService.addNotification({
          userId: 'ADMIN',
          title: 'آگهی جدید در انتظار بررسی',
          message: `آگهی «${newAd.title}» توسط ${user.name} ثبت شد و نیاز به تایید دارد.`,
          type: 'WARNING',
          link: '/admin?tab=ads'
        });
      }
    } else if (!isStaff) {
      StorageService.addNotification({
        userId: user.id,
        title: 'آگهی ویرایش شد',
        message: `تغییرات آگهی «${newAd.title}» ثبت شد و مجدداً در صف بررسی ناظر قرار گرفت.`,
        type: 'INFO',
        link: '/profile?tab=my_ads'
      });
    }

    setIsSubmitting(false);
    navigate(isStaff ? `/ad/${newAd.id}` : '/profile?tab=my_ads');
  };

  const parsedPriceNumber = parseInt(price.replace(/,/g, ''), 10);
  const verbalPrice = !isFree && !isNegotiable && parsedPriceNumber > 0 ? numberToPersianWords(parsedPriceNumber, currency) : '';

  if (!user) {
    return null;
  }

  if (!userPhone) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
          <Phone className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">شماره موبایل ثبت نشده</h2>
        <p className="text-xs text-gray-500 leading-relaxed">
          برای ثبت آگهی، ابتدا باید شماره موبایل خود را در حساب کاربری ثبت کنید. این شماره به‌عنوان راه تماس و واتس‌اپ آگهی استفاده می‌شود و در فرم آگهی قابل تغییر نیست.
        </p>
        <Link
          to="/profile?tab=settings"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md hover:bg-secondary"
        >
          رفتن به تنظیمات حساب
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">

        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">
            {isEditMode ? 'ویرایش آگهی' : 'ثبت رایگان آگهی در بازار'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isEditMode
              ? isStaff
                ? 'تغییرات خود را ذخیره کنید.'
                : 'پس از ویرایش، آگهی مجدداً برای بررسی ناظر ارسال می‌شود.'
              : isStaff
                ? 'مشخصات آگهی را تکمیل کنید تا منتشر شود.'
                : 'پس از ثبت، آگهی شما در صف بررسی ناظر قرار می‌گیرد و پس از تایید منتشر می‌شود.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              <span>انتخاب دسته‌بندی *</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedSubCategory('');
                    }}
                    className={`p-3 rounded-2xl border text-right flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'border-primary bg-red-50/50 dark:bg-red-950/30 text-primary font-bold shadow-xs'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {activeCategoryObj && activeCategoryObj.subcategories && activeCategoryObj.subcategories.length > 0 && (
              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
                  زیردسته (جهت جستجوی دقیق‌تر):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeCategoryObj.subcategories.map(sub => {
                    const isSubSelected = selectedSubCategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setSelectedSubCategory(isSubSelected ? '' : sub.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          isSubSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span>موقعیت مکانی در آلمان *</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">شهر یا ایالت:</label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold outline-none focus:border-primary"
                >
                  {CITIES_DATA.map(c => (
                    <option key={c.name} value={c.name}>
                      {c.name} - {c.province}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-gray-500 mb-1">منطقه شهری یا کد پستی (PLZ):</label>
                <input
                  type="text"
                  placeholder="مثلاً Mitte, Schwabing, 10115 یا ..."
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary dir-ltr text-left font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-primary" />
              <span>تصاویر آگهی (حداکثر ۶ عکس)</span>
            </label>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {images.map((img, index) => (
                <div key={index} className="aspect-square rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 relative group bg-gray-100 dark:bg-gray-800">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {images.length < 6 && (
                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-primary">
                  <Upload className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-bold">افزودن عکس</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-400">آگهی‌های دارای تصویر واقعی، بازخورد و تماس بیشتری دریافت می‌کنند.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900 dark:text-white">
              عنوان آگهی *
            </label>
            <input
              type="text"
              placeholder="عنوان دقیق و شفاف (مثلاً: اجاره آپارتمان مبله در برلین یا آیفون ۱۵ پرو ۲۵۶ گیگابایت)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="space-y-4 p-4 sm:p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Euro className="w-4 h-4 text-emerald-600" />
                <span>قیمت‌گذاری و واحد پول *</span>
              </label>

              <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl p-1 border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    currency === 'EUR'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <Euro className="w-3.5 h-3.5" />
                  <span>یورو (€)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrency('TOMAN')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    currency === 'TOMAN'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>تومان</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  placeholder={currency === 'EUR' ? 'مبلغ به یورو (مثلاً ۱۲۰۰)' : 'مبلغ به تومان (مثلاً ۵۰۰۰۰۰۰۰)'}
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  disabled={isNegotiable || isFree}
                  className="w-full pl-16 pr-3 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 outline-none focus:border-primary disabled:opacity-50 font-bold text-base dir-ltr text-left font-mono"
                />
                <span className="absolute left-3 top-3.5 text-xs font-bold text-gray-500 dark:text-gray-400">
                  {currency === 'EUR' ? '€ یورو' : 'تومان'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={e => {
                      setIsNegotiable(e.target.checked);
                      if (e.target.checked) setIsFree(false);
                    }}
                    className="w-4 h-4 text-primary rounded accent-primary"
                  />
                  <span>توافقی</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={e => {
                      setIsFree(e.target.checked);
                      if (e.target.checked) setIsNegotiable(false);
                    }}
                    className="w-4 h-4 text-primary rounded accent-primary"
                  />
                  <span>رایگان</span>
                </label>
              </div>
            </div>

            {verbalPrice && (
              <div className="text-xs text-primary font-bold pt-1">
                معادل: {verbalPrice}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-900 dark:text-white">
                مشخصات و جزئیات تکمیلی (اختیاری)
              </label>
              <button
                type="button"
                onClick={addAttributeRow}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن مشخصه</span>
              </button>
            </div>

            <div className="space-y-2">
              {attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="عنوان (مثلاً مدل، متراژ، ودیعه، ساعت کاری)"
                    value={attr.key}
                    onChange={e => updateAttribute(idx, 'key', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    placeholder="مقدار (مثلاً ۲۰۲۴، ۸۵ متر، بدون حیوان خانگی)"
                    value={attr.value}
                    onChange={e => updateAttribute(idx, 'value', e.target.value)}
                    className="flex-1 p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary"
                  />
                  {attributes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-900 dark:text-white">
              توضیحات کامل آگهی *
            </label>

            <textarea
              rows={6}
              placeholder="توضیحات کامل در مورد کالا یا خدمت، شرایط بازدید یا تحویل، و نحوه ارتباط با خریداران..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary leading-relaxed font-normal"
            />
          </div>

          <div className="p-4 sm:p-5 rounded-3xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-4">
            <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" />
              <span>شماره تماس و واتس‌اپ</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                <Lock className="w-3.5 h-3.5" />
                <span>شماره موبایل حساب شما (غیرقابل تغییر در آگهی)</span>
              </div>
              <div
                dir="ltr"
                className="font-black text-base text-primary font-mono text-left [unicode-bidi:plaintext]"
              >
                {userPhone}
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                شماره واتس‌اپ همان شماره موبایل ثبت‌شده در حساب کاربری شماست.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowWhatsapp}
                onChange={e => setAllowWhatsapp(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
              />
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <MessageCircle className="w-4 h-4" />
                <span>نمایش دکمه پیام در واتس‌اپ برای این آگهی</span>
              </div>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-100"
            >
              انصراف
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isEditMode ? 'ذخیره تغییرات آگهی' : isStaff ? 'انتشار آگهی' : 'ثبت آگهی برای بررسی'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAd;
