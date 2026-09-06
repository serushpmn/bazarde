import {
  OtpChallenge,
  OtpPurpose,
} from '../types';
import {
  OTP_MAX_ATTEMPTS,
  OTP_MAX_SENDS_PER_HOUR,
  OTP_RATE_LIMIT_MS,
  OTP_TTL_MS,
} from './accountLifecycle';

const OTP_KEY = 'bazaar_de_otps_v1';

const readAll = (): OtpChallenge[] => {
  try {
    return JSON.parse(localStorage.getItem(OTP_KEY) || '[]') as OtpChallenge[];
  } catch {
    return [];
  }
};

const writeAll = (list: OtpChallenge[]) => {
  // Cap growth
  localStorage.setItem(OTP_KEY, JSON.stringify(list.slice(-200)));
};

const generateCode = (): string =>
  String(Math.floor(100000 + Math.random() * 900000));

export type OtpSendResult =
  | { ok: true; challengeId: string; expiresAt: number; /** Demo only */ demoCode: string }
  | { ok: false; error: string };

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Client-side OTP for sensitive actions (SPA demo).
 * Production: replace with SMS provider; store only hashed codes server-side.
 */
export const OtpService = {
  requestOtp: (params: {
    phone: string;
    purpose: OtpPurpose;
    userId?: string;
  }): OtpSendResult => {
    const phone = params.phone.trim();
    if (!phone) return { ok: false, error: 'شماره موبایل نامعتبر است.' };

    const now = Date.now();
    let list = readAll().filter(o => o.expiresAt > now - OTP_TTL_MS * 2);

    const recentSame = list
      .filter(o => o.phone === phone && o.purpose === params.purpose && !o.consumedAt)
      .sort((a, b) => b.createdAt - a.createdAt)[0];

    if (recentSame && now - recentSame.createdAt < OTP_RATE_LIMIT_MS) {
      const waitSec = Math.ceil((OTP_RATE_LIMIT_MS - (now - recentSame.createdAt)) / 1000);
      return { ok: false, error: `لطفاً ${waitSec} ثانیه دیگر صبر کنید و دوباره درخواست دهید.` };
    }

    const hourAgo = now - 60 * 60 * 1000;
    const sendsLastHour = list.filter(
      o => o.phone === phone && o.purpose === params.purpose && o.createdAt >= hourAgo
    ).length;
    if (sendsLastHour >= OTP_MAX_SENDS_PER_HOUR) {
      return { ok: false, error: 'تعداد درخواست کد بیش از حد مجاز است. بعداً تلاش کنید.' };
    }

    // Invalidate previous unused OTPs for same phone+purpose
    list = list.map(o =>
      o.phone === phone && o.purpose === params.purpose && !o.consumedAt
        ? { ...o, consumedAt: now }
        : o
    );

    const code = generateCode();
    const challenge: OtpChallenge = {
      id: `otp-${now}-${Math.random().toString(36).slice(2, 8)}`,
      phone,
      purpose: params.purpose,
      code,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
      createdAt: now,
      userId: params.userId,
    };
    list.push(challenge);
    writeAll(list);

    return {
      ok: true,
      challengeId: challenge.id,
      expiresAt: challenge.expiresAt,
      demoCode: code,
    };
  },

  verifyOtp: (params: {
    phone: string;
    purpose: OtpPurpose;
    code: string;
    challengeId?: string;
  }): OtpVerifyResult => {
    const phone = params.phone.trim();
    const code = params.code.trim();
    const now = Date.now();
    const list = readAll();

    // Prefer latest matching
    const candidates = list
      .map((o, i) => ({ o, i }))
      .filter(
        ({ o }) =>
          o.phone === phone &&
          o.purpose === params.purpose &&
          !o.consumedAt &&
          (!params.challengeId || o.id === params.challengeId)
      )
      .sort((a, b) => b.o.createdAt - a.o.createdAt);

    if (candidates.length === 0) {
      return { ok: false, error: 'کد معتبری یافت نشد. لطفاً دوباره درخواست دهید.' };
    }

    const { o: challenge, i } = candidates[0];

    if (challenge.expiresAt < now) {
      list[i] = { ...challenge, consumedAt: now };
      writeAll(list);
      return { ok: false, error: 'کد منقضی شده است. کد جدید درخواست کنید.' };
    }

    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      list[i] = { ...challenge, consumedAt: now };
      writeAll(list);
      return { ok: false, error: 'تعداد تلاش‌های اشتباه بیش از حد مجاز است.' };
    }

    if (challenge.code !== code) {
      list[i] = { ...challenge, attempts: challenge.attempts + 1 };
      writeAll(list);
      const left = OTP_MAX_ATTEMPTS - (challenge.attempts + 1);
      return {
        ok: false,
        error: left > 0 ? `کد نادرست است. ${left} تلاش باقی مانده.` : 'کد نادرست است.',
      };
    }

    // Single-use
    list[i] = { ...challenge, consumedAt: now };
    writeAll(list);
    return { ok: true };
  },
};
