import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { StorageService } from '../services/storage';
import { User, UserRole, CITIES_DATA, GERMAN_PROVINCES } from '../types';
import {
  getAccountStatus,
  formatDeletionDate,
} from '../lib/accountLifecycle';
import {
  Phone,
  User as UserIcon,
} from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('برلین (Berlin)');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const [deactivatedUser, setDeactivatedUser] = useState<User | null>(null);

  const finishLogin = (u: User) => {
    login(u);
    navigate(u.role === UserRole.ADMIN || u.role === UserRole.EDITOR ? '/admin' : '/profile');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setPendingUser(null);
    setDeactivatedUser(null);

    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
      setErrorMsg('لطفاً شماره موبایل خود را وارد فرمایید.');
      return;
    }

    const restriction = StorageService.isPhoneRestricted(trimmedPhone);
    if (restriction) {
      setErrorMsg('این شماره امکان ثبت‌نام یا ورود ندارد. با پشتیبانی تماس بگیرید.');
      return;
    }

    const existing = StorageService.findUserByPhone(trimmedPhone);

    if (existing) {
      const status = getAccountStatus(existing);

      if (status === 'BANNED' || status === 'SUSPENDED') {
        setErrorMsg(
          status === 'BANNED'
            ? 'این حساب مسدود است و امکان ورود وجود ندارد.'
            : 'این حساب معلق است. با پشتیبانی تماس بگیرید.'
        );
        return;
      }

      if (status === 'PENDING_DELETION') {
        login(existing);
        setPendingUser(existing);
        return;
      }

      if (status === 'DEACTIVATED') {
        login(existing);
        setDeactivatedUser(existing);
        return;
      }

      if (status === 'ACTIVE') {
        if (isRegister) {
          setErrorMsg('حساب کاربری با این شماره قبلاً ثبت شده است. لطفاً وارد شوید.');
          return;
        }
        finishLogin(existing);
        return;
      }

      // ANONYMIZED / DELETED with empty phone shouldn't match findUserByPhone
    }

    // No blocking account — create / register
    if (isRegister) {
      if (!name.trim()) {
        setErrorMsg('لطفاً نام و نام خانوادگی خود را وارد فرمایید.');
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: name.trim(),
        phone: trimmedPhone,
        city,
        role: UserRole.USER,
        accountStatus: 'ACTIVE',
        createdAt: Date.now(),
        phoneVerifiedAt: Date.now(),
      };
      StorageService.saveUser(newUser);
      finishLogin(newUser);
      return;
    }

    // Login branch historically auto-created — keep for UX but as new ACTIVE account
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim() || 'کاربر گرامی',
      phone: trimmedPhone,
      city,
      role: UserRole.USER,
      accountStatus: 'ACTIVE',
      createdAt: Date.now(),
    };
    StorageService.saveUser(newUser);
    finishLogin(newUser);
  };

  const handleRestorePending = () => {
    if (!pendingUser) return;
    const res = StorageService.cancelAccountDeletion(pendingUser.id);
    if (!res.ok) {
      setErrorMsg(res.error || 'بازیابی ناموفق بود.');
      return;
    }
    const fresh = StorageService.getUserById(pendingUser.id)!;
    setPendingUser(null);
    finishLogin(fresh);
  };

  const handleReactivate = () => {
    if (!deactivatedUser) return;
    const res = StorageService.reactivateAccount(deactivatedUser.id);
    if (!res.ok) {
      setErrorMsg(res.error || 'فعال‌سازی ناموفق بود.');
      return;
    }
    const fresh = StorageService.getUserById(deactivatedUser.id)!;
    setDeactivatedUser(null);
    finishLogin(fresh);
  };

  const handleQuickLogin = (role: 'ADMIN' | 'EDITOR' | 'USER') => {
    const users = StorageService.getUsers();
    if (role === 'ADMIN') {
      const admin = users.find(u => u.role === UserRole.ADMIN) || {
        id: 'admin-1',
        name: 'مدیر ارشد سامانه',
        phone: '+49 170 0000000',
        city: 'برلین (Berlin)',
        role: UserRole.ADMIN,
        accountStatus: 'ACTIVE' as const,
      };
      finishLogin(admin);
    } else if (role === 'EDITOR') {
      const editor = users.find(u => u.role === UserRole.EDITOR) || {
        id: 'editor-1',
        name: 'ناظر آگهی‌ها در آلمان',
        phone: '+49 171 0000000',
        city: 'فرانکفورت (Frankfurt am Main)',
        role: UserRole.EDITOR,
        accountStatus: 'ACTIVE' as const,
      };
      finishLogin(editor);
    } else {
      const regular = users.find(u => u.role === UserRole.USER && u.id !== 'admin-1') || {
        id: 'user-demo',
        name: 'سروش پیمانی',
        phone: '+49 176 12345678',
        city: 'کلن (Köln)',
        role: UserRole.USER,
        accountStatus: 'ACTIVE' as const,
      };
      finishLogin(regular);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-14">
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            ب
          </div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">
            {isRegister ? 'ثبت‌نام در بازار آلمان' : 'ورود به حساب کاربری'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isRegister
              ? 'برای ثبت آگهی رایگان و ارتباط با فروشندگان در آلمان حساب خود را بسازید'
              : 'شماره موبایل خود را برای ورود وارد فرمایید'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {pendingUser && (
          <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/30 space-y-3">
            <h2 className="text-sm font-bold text-rose-800 dark:text-rose-200">حساب در صف حذف است</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
              این شماره به حسابی متصل است که برای حذف زمان‌بندی شده.
              {pendingUser.deletionScheduledAt && (
                <> حذف نهایی: <strong>{formatDeletionDate(pendingUser.deletionScheduledAt)}</strong>.</>
              )}
            </p>
            <p className="text-[11px] text-gray-500">
              تا قبل از آن تاریخ می‌توانید حساب را بازیابی کنید. ساخت حساب جدید با همین شماره ممکن نیست.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRestorePending}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
              >
                بازیابی حساب
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingUser(null);
                  navigate('/profile?tab=settings');
                }}
                className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600"
              >
                ادامه حذف (مشاهده وضعیت در پروفایل)
              </button>
            </div>
          </div>
        )}

        {deactivatedUser && (
          <div className="p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 space-y-3">
            <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200">حساب موقتاً غیرفعال است</h2>
            <p className="text-[11px] text-gray-600 dark:text-gray-300">
              برای ادامه فعالیت، حساب را دوباره فعال کنید. آگهی‌ها خودکار منتشر نمی‌شوند.
            </p>
            <button
              type="button"
              onClick={handleReactivate}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-xs font-bold"
            >
              فعال‌سازی مجدد
            </button>
          </div>
        )}

        {!pendingUser && !deactivatedUser && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="مثلاً: آرش رستمی"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                  />
                  <UserIcon className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                شماره موبایل / واتس‌اپ در آلمان *
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+49 176 12345678"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-bold text-left font-mono [unicode-bidi:plaintext]"
                />
                <Phone className="w-4 h-4 text-gray-400 absolute right-3.5 top-3" />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold mb-1.5 text-gray-700 dark:text-gray-300">
                  شهر / ایالت سکونت در آلمان
                </label>
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                >
                  {GERMAN_PROVINCES.map(province => (
                    <optgroup key={province} label={province}>
                      {CITIES_DATA.filter(c => c.province === province).map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isRegister ? 'ایجاد حساب کاربری در آلمان' : 'ورود به حساب'}
            </button>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg('');
              setPendingUser(null);
              setDeactivatedUser(null);
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            {isRegister ? 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید' : 'حساب کاربری ندارید؟ ثبت‌نام سریع'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
          <div className="text-[11px] font-bold text-gray-400 text-center">ورود سریع آزمایشی به عنوان:</div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('USER')}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-[11px] font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center"
            >
              کاربر عادی
            </button>
            <button
              onClick={() => handleQuickLogin('EDITOR')}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 text-[11px] font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-center"
            >
              ناظر محتوا
            </button>
            <button
              onClick={() => handleQuickLogin('ADMIN')}
              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-[11px] font-bold text-primary border border-red-200 dark:border-red-800 text-center"
            >
              مدیر ارشد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
