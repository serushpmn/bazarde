import { AccountStatus, AdStatus, User } from '../types';

/** Grace period before final anonymization (ms) */
export const ACCOUNT_DELETION_GRACE_MS = 30 * 24 * 60 * 60 * 1000;

export const MAX_ACTIVE_ADS_PER_USER = 5;

export const OTP_TTL_MS = 5 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RATE_LIMIT_MS = 60 * 1000;
export const OTP_MAX_SENDS_PER_HOUR = 5;

/** Ad statuses that count toward the 5-ad limit */
export const ACTIVE_AD_STATUSES: AdStatus[] = [
  AdStatus.APPROVED,
  AdStatus.PENDING,
];

/** Ads hidden from public listing/search */
export const PUBLIC_AD_STATUSES: AdStatus[] = [AdStatus.APPROVED];

export const getAccountStatus = (user: User | null | undefined): AccountStatus =>
  user?.accountStatus || 'ACTIVE';

export const isAccountActive = (user: User | null | undefined): boolean =>
  getAccountStatus(user) === 'ACTIVE';

export const canUserPostAds = (user: User | null | undefined): boolean => {
  const s = getAccountStatus(user);
  return s === 'ACTIVE';
};

export const canUserNormalActivity = (user: User | null | undefined): boolean => {
  const s = getAccountStatus(user);
  return s === 'ACTIVE';
};

/** Phone still reserved — cannot create a brand-new account */
export const phoneBlocksNewRegistration = (status: AccountStatus): boolean =>
  status === 'ACTIVE' ||
  status === 'PENDING_DELETION' ||
  status === 'DEACTIVATED' ||
  status === 'SUSPENDED' ||
  status === 'BANNED';

export const formatDeletionDate = (ts: number): string => {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString();
  }
};

export const ACCOUNT_DELETION_REASON_OPTIONS: {
  code: import('../types').AccountDeletionReasonCode;
  label: string;
  offerSupport?: boolean;
}[] = [
  { code: 'NO_LONGER_NEED', label: 'دیگر به سرویس نیاز ندارم' },
  { code: 'NOT_FOUND_WHAT_LOOKING', label: 'آنچه می‌خواستم را پیدا نکردم' },
  { code: 'BAD_EXPERIENCE', label: 'تجربه بد داشتم', offerSupport: true },
  { code: 'TOO_MANY_NOTIFICATIONS', label: 'اعلان‌های زیاد' },
  { code: 'CREATED_ANOTHER_ACCOUNT', label: 'حساب دیگری ساختم' },
  { code: 'TECHNICAL_PROBLEMS', label: 'مشکلات فنی', offerSupport: true },
  { code: 'OTHER', label: 'سایر' },
];
