import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, AccountDeletionReasonCode } from '../types';
import { StorageService } from '../services/storage';
import { OtpService } from '../lib/otpService';
import {
  ACCOUNT_DELETION_REASON_OPTIONS,
  formatDeletionDate,
  getAccountStatus,
} from '../lib/accountLifecycle';
import { AlertTriangle, PauseCircle, Trash2, ShieldAlert } from 'lucide-react';
import { toPersianDigits } from '../lib/formatters';

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
}

type DeleteStep =
  | 'idle'
  | 'consequences'
  | 'reason'
  | 'support_offer'
  | 'otp'
  | 'done';

export const AccountLifecyclePanel: React.FC<Props> = ({ user, onUserUpdated }) => {
  const status = getAccountStatus(user);
  const activeAds = StorageService.countActiveAdsForUser(user.id);

  const [deleteStep, setDeleteStep] = useState<DeleteStep>('idle');
  const [reason, setReason] = useState<AccountDeletionReasonCode | ''>('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [pauseConfirm, setPauseConfirm] = useState(false);

  // Change phone
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneDemoOtp, setPhoneDemoOtp] = useState('');
  const [phoneMsg, setPhoneMsg] = useState('');

  const refreshUser = () => {
    const fresh = StorageService.getUserById(user.id);
    if (fresh) onUserUpdated(fresh);
  };

  const selectedReasonMeta = useMemo(
    () => ACCOUNT_DELETION_REASON_OPTIONS.find(o => o.code === reason),
    [reason]
  );

  const sendDeletionOtp = () => {
    setError('');
    const res = OtpService.requestOtp({
      phone: user.phone,
      purpose: 'account_deletion',
      userId: user.id,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setDemoOtp(res.demoCode);
    setDeleteStep('otp');
    StorageService.addActivityLog({
      actorId: user.id,
      actorRole: 'USER',
      action: 'account_deletion_otp_sent',
      targetType: 'USER',
      targetId: user.id,
    });
  };

  const confirmDeletion = () => {
    setError('');
    const res = StorageService.requestAccountDeletion({
      userId: user.id,
      otpCode,
      reason: reason || 'SKIPPED',
      reasonDetails: reason === 'OTHER' ? reasonDetails : undefined,
    });
    if (!res.ok) {
      setError(res.error || 'خطا');
      return;
    }
    StorageService.addActivityLog({
      actorId: user.id,
      actorRole: 'USER',
      action: 'account_deletion_otp_verified',
      targetType: 'USER',
      targetId: user.id,
    });
    setDeleteStep('done');
    refreshUser();
  };

  const handleRestore = () => {
    setError('');
    const res = StorageService.cancelAccountDeletion(user.id);
    if (!res.ok) {
      setError(res.error || 'خطا');
      return;
    }
    setInfo('حساب بازیابی شد. آگهی‌ها به‌صورت خودکار منتشر نمی‌شوند.');
    setDeleteStep('idle');
    refreshUser();
  };

  const handlePause = () => {
    setError('');
    const res = StorageService.deactivateAccount(user.id);
    if (!res.ok) {
      setError(res.error || 'خطا');
      return;
    }
    setPauseConfirm(false);
    refreshUser();
  };

  const handleReactivate = () => {
    const res = StorageService.reactivateAccount(user.id);
    if (!res.ok) {
      setError(res.error || 'خطا');
      return;
    }
    refreshUser();
  };

  const sendPhoneOtp = () => {
    setPhoneMsg('');
    if (!newPhone.trim()) {
      setPhoneMsg('شماره جدید را وارد کنید.');
      return;
    }
    const res = OtpService.requestOtp({
      phone: newPhone.trim(),
      purpose: 'change_phone',
      userId: user.id,
    });
    if (!res.ok) {
      setPhoneMsg(res.error);
      return;
    }
    setPhoneDemoOtp(res.demoCode);
    setPhoneMsg('کد تأیید ارسال شد (حالت دمو زیر نمایش داده می‌شود).');
  };

  const confirmPhoneChange = () => {
    setPhoneMsg('');
    const res = StorageService.changeUserPhone({
      userId: user.id,
      newPhone: newPhone.trim(),
      otpCode: phoneOtp,
    });
    if (!res.ok) {
      setPhoneMsg(res.error || 'خطا');
      return;
    }
    setPhoneMsg('شماره با موفقیت تغییر کرد.');
    setNewPhone('');
    setPhoneOtp('');
    setPhoneDemoOtp('');
    refreshUser();
  };

  if (status === 'BANNED' || status === 'SUSPENDED') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/40 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm">
          <ShieldAlert className="w-4 h-4" />
          حساب محدود شده
        </div>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          این حساب {status === 'BANNED' ? 'مسدود' : 'معلق'} است. حذف حساب برای دور زدن محدودیت ممکن نیست.
          در صورت نیاز با پشتیبانی تماس بگیرید.
        </p>
        <Link to="/contact" className="text-xs font-bold text-primary hover:underline">
          تماس با پشتیبانی
        </Link>
      </div>
    );
  }

  if (status === 'PENDING_DELETION') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-rose-200 dark:border-rose-900/40 space-y-4">
        <h3 className="font-black text-sm text-rose-700 dark:text-rose-300">حساب در صف حذف</h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          حساب شما برای حذف نهایی زمان‌بندی شده است.
        </p>
        {user.deletionScheduledAt && (
          <p className="text-xs font-bold text-gray-900 dark:text-white">
            تاریخ حذف نهایی: {formatDeletionDate(user.deletionScheduledAt)}
          </p>
        )}
        <p className="text-[11px] text-gray-500 leading-relaxed">
          تا این تاریخ می‌توانید درخواست را لغو و حساب را بازیابی کنید. آگهی‌ها از دید عموم خارج شده‌اند و پس
          از بازیابی به‌صورت خودکار منتشر نمی‌شوند.
        </p>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        {info && <p className="text-xs text-emerald-600">{info}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleRestore}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
          >
            بازیابی حساب
          </button>
          <span className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
            ادامه حذف (نیازی به اقدام نیست)
          </span>
        </div>
      </div>
    );
  }

  if (status === 'DEACTIVATED') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-amber-100 dark:border-amber-900/40 space-y-4">
        <h3 className="font-black text-sm text-amber-800 dark:text-amber-200">حساب موقتاً غیرفعال است</h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          پروفایل و آگهی‌ها مخفی هستند. داده‌ها حذف نشده‌اند. با فعال‌سازی مجدد، آگهی‌ها خودکار منتشر نمی‌شوند.
        </p>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <button
          type="button"
          onClick={handleReactivate}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
        >
          فعال‌سازی مجدد حساب
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Change phone */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 space-y-3">
        <h3 className="font-black text-sm text-gray-900 dark:text-white">تغییر شماره موبایل</h3>
        <p className="text-[11px] text-gray-500">
          شماره جدید با OTP تأیید می‌شود و نباید متعلق به حساب فعال دیگری باشد.
        </p>
        <input
          type="tel"
          dir="ltr"
          placeholder="+49 ..."
          value={newPhone}
          onChange={e => setNewPhone(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-mono text-left"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={sendPhoneOtp} className="px-3 py-2 rounded-xl bg-gray-800 text-white text-[11px] font-bold">
            ارسال کد به شماره جدید
          </button>
        </div>
        {phoneDemoOtp && (
          <p className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
            کد دمو: {phoneDemoOtp}
          </p>
        )}
        <input
          type="text"
          inputMode="numeric"
          placeholder="کد ۶ رقمی"
          value={phoneOtp}
          onChange={e => setPhoneOtp(e.target.value)}
          className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs font-mono dir-ltr text-left"
        />
        <button type="button" onClick={confirmPhoneChange} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">
          تأیید و ذخیره شماره
        </button>
        {phoneMsg && <p className="text-[11px] text-gray-600 dark:text-gray-300">{phoneMsg}</p>}
      </div>

      {/* Pause */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 space-y-3">
        <h3 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
          <PauseCircle className="w-4 h-4 text-amber-600" />
          توقف موقت حساب (Pause)
        </h3>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          پروفایل و آگهی‌ها موقتاً مخفی می‌شوند. داده شخصی حذف نمی‌شود و هر زمان می‌توانید حساب را دوباره فعال کنید.
          این با «حذف حساب» متفاوت است.
        </p>
        {!pauseConfirm ? (
          <button
            type="button"
            onClick={() => setPauseConfirm(true)}
            className="px-4 py-2 rounded-xl border border-amber-200 text-amber-800 dark:text-amber-200 text-xs font-bold hover:bg-amber-50"
          >
            توقف موقت حساب
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handlePause} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold">
              تأیید توقف موقت
            </button>
            <button type="button" onClick={() => setPauseConfirm(false)} className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600">
              انصراف
            </button>
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-rose-100 dark:border-rose-900/40 space-y-3">
        <h3 className="font-black text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          حذف حساب کاربری
        </h3>

        {deleteStep === 'idle' && (
          <>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              حذف حساب فوری نیست: پس از تأیید OTP، حساب غیرفعال می‌شود و ۳۰ روز فرصت بازیابی دارید. سپس داده‌های
              شخصی حذف یا ناشناس می‌شوند.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteStep('consequences');
                setError('');
              }}
              className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-600 text-xs font-bold hover:bg-rose-50"
            >
              درخواست حذف حساب
            </button>
          </>
        )}

        {deleteStep === 'consequences' && (
          <div className="space-y-3 text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 space-y-2">
              <p className="font-bold text-rose-800 dark:text-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> پیامدهای حذف
              </p>
              <ul className="list-disc pr-4 space-y-1">
                <li>پروفایل از دسترس عمومی خارج می‌شود.</li>
                <li>آگهی‌های فعال از جستجو و لیست‌ها مخفی می‌شوند.</li>
                <li>تا ۳۰ روز می‌توانید حساب را بازیابی کنید.</li>
                <li>پس از بازیابی، آگهی‌ها خودکار منتشر نمی‌شوند.</li>
                <li>پس از پایان مهلت، داده‌های شخصی حذف/ناشناس می‌شوند.</li>
              </ul>
              {activeAds > 0 && (
                <p className="font-semibold text-rose-700 dark:text-rose-300 pt-1">
                  شما هم‌اکنون {toPersianDigits(activeAds)} آگهی فعال/در انتظار دارید که از دید عموم خارج خواهند شد.
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setDeleteStep('reason')}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                ادامه
              </button>
              <button
                type="button"
                onClick={() => setDeleteStep('idle')}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600"
              >
                انصراف
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'reason' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-500">دلیل حذف اختیاری است — می‌توانید رد شوید.</p>
            <div className="space-y-1.5">
              {ACCOUNT_DELETION_REASON_OPTIONS.map(opt => (
                <label key={opt.code} className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="radio"
                    name="del-reason"
                    checked={reason === opt.code}
                    onChange={() => setReason(opt.code)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {reason === 'OTHER' && (
              <textarea
                rows={2}
                value={reasonDetails}
                onChange={e => setReasonDetails(e.target.value)}
                placeholder="توضیح اختیاری..."
                className="w-full p-2.5 rounded-xl border text-xs bg-transparent"
              />
            )}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedReasonMeta?.offerSupport) setDeleteStep('support_offer');
                  else sendDeletionOtp();
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
              >
                ادامه به تأیید هویت
              </button>
              <button
                type="button"
                onClick={() => {
                  setReason('SKIPPED');
                  sendDeletionOtp();
                }}
                className="px-4 py-2 rounded-xl border text-xs font-bold text-gray-600"
              >
                رد شدن از دلیل
              </button>
              <button type="button" onClick={() => setDeleteStep('idle')} className="px-4 py-2 text-xs text-gray-400">
                انصراف
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'support_offer' && (
          <div className="space-y-3 text-[11px]">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              مایلید قبل از حذف حساب، برای رفع مشکل با پشتیبانی صحبت کنید؟
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/contact" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">
                تماس با پشتیبانی
              </Link>
              <button type="button" onClick={sendDeletionOtp} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                ادامه حذف حساب
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'otp' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-500 leading-relaxed">
              برای امنیت، کد تأیید به شماره {user.phone} ارسال می‌شود. بدون OTP معتبر، حذف ثبت نمی‌شود.
            </p>
            {demoOtp && (
              <p className="text-[11px] font-mono text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-xl">
                کد دمو (به‌جای SMS): {demoOtp}
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value)}
              placeholder="کد ۶ رقمی"
              className="w-full p-2.5 rounded-xl border text-xs font-mono dir-ltr text-left bg-transparent"
            />
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={confirmDeletion} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                تأیید OTP و ثبت حذف
              </button>
              <button type="button" onClick={sendDeletionOtp} className="px-4 py-2 rounded-xl border text-xs font-bold">
                ارسال مجدد کد
              </button>
              <button type="button" onClick={() => setDeleteStep('idle')} className="px-4 py-2 text-xs text-gray-400">
                انصراف
              </button>
            </div>
          </div>
        )}

        {deleteStep === 'done' && (
          <p className="text-xs text-emerald-700 dark:text-emerald-300">
            درخواست حذف ثبت شد. حساب در وضعیت حذف موقت است.
          </p>
        )}

        {error && deleteStep !== 'otp' && <p className="text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  );
};
