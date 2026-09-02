// Utility functions for Persian formatting, numbers, Euro/Toman currencies, and dates

export const toPersianDigits = (n: number | string): string => {
  if (n === null || n === undefined) return '';
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return n.toString().replace(/\d/g, x => farsiDigits[parseInt(x, 10)]);
};

export const formatPrice = (
  price: number,
  isNegotiable?: boolean,
  isFree?: boolean,
  currency: 'EUR' | 'TOMAN' = 'EUR'
): string => {
  if (isFree) return 'رایگان';
  if (isNegotiable || price === 0) return 'توافقی';
  
  const formatted = new Intl.NumberFormat('de-DE').format(price);
  if (currency === 'TOMAN') {
    return `${toPersianDigits(formatted)} تومان`;
  }
  return `${formatted} €`;
};

export const formatShortPrice = (
  price: number,
  isNegotiable?: boolean,
  isFree?: boolean,
  currency: 'EUR' | 'TOMAN' = 'EUR'
): string => {
  if (isFree) return 'رایگان';
  if (isNegotiable || price === 0) return 'توافقی';

  const formatted = new Intl.NumberFormat('de-DE').format(price);
  if (currency === 'TOMAN') {
    return `${toPersianDigits(formatted)} تومان`;
  }
  return `${formatted} €`;
};

// Converts Euro or Toman number to Persian verbal text (e.g. 250 -> دویست و پنجاه یورو / تومان)
export const numberToPersianWords = (num: number, currency: 'EUR' | 'TOMAN' = 'EUR'): string => {
  if (!num || isNaN(num) || num <= 0) return '';
  
  const yekan = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const dahgan = ['', 'ده', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const dahyek = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const sadgan = ['', 'صد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const scales = ['', 'هزار', 'میلیون', 'میلیارد'];

  const convertThreeDigit = (n: number): string => {
    let result = '';
    const sad = Math.floor(n / 100);
    const dah = Math.floor((n % 100) / 10);
    const yek = n % 10;

    if (sad > 0) result += sadgan[sad];
    
    if (dah === 1) {
      if (result) result += ' و ';
      result += dahyek[yek];
    } else {
      if (dah > 0) {
        if (result) result += ' و ';
        result += dahgan[dah];
      }
      if (yek > 0) {
        if (result) result += ' و ';
        result += yekan[yek];
      }
    }
    return result;
  };

  let numStr = Math.floor(num).toString();
  const chunks: number[] = [];
  while (numStr.length > 0) {
    chunks.push(parseInt(numStr.slice(-3), 10));
    numStr = numStr.slice(0, -3);
  }

  const parts: string[] = [];
  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];
    if (chunk > 0) {
      const text = convertThreeDigit(chunk);
      const scale = scales[i];
      parts.push(scale ? `${text} ${scale}` : text);
    }
  }

  const unit = currency === 'TOMAN' ? 'تومان' : 'یورو';
  return parts.length > 0 ? `${parts.join(' و ')} ${unit}` : '';
};

export const getTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'لحظاتی پیش';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${toPersianDigits(minutes)} دقیقه پیش`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toPersianDigits(hours)} ساعت پیش`;
  
  const days = Math.floor(hours / 24);
  if (days === 1) return 'دیروز';
  if (days < 7) return `${toPersianDigits(days)} روز پیش`;
  if (days < 30) return `${toPersianDigits(Math.floor(days / 7))} هفته پیش`;
  return `${toPersianDigits(Math.floor(days / 30))} ماه پیش`;
};

// Generates direct WhatsApp click-to-chat URL
export const getWhatsAppUrl = (phone: string, adTitle?: string): string => {
  if (!phone) return '';
  // Clean phone number: remove non-digits
  let cleanDigits = phone.replace(/\D/g, '');
  // If starts with 00, replace with nothing (standard international prefix)
  if (cleanDigits.startsWith('00')) {
    cleanDigits = cleanDigits.substring(2);
  }
  // If Iranian mobile starts with 09..., convert to 989...
  if (cleanDigits.startsWith('09') && cleanDigits.length === 11) {
    cleanDigits = '98' + cleanDigits.substring(1);
  }
  // If German mobile starts with 015/016/017 and is local, convert to 49...
  if (cleanDigits.startsWith('01') && (cleanDigits.length === 11 || cleanDigits.length === 12)) {
    cleanDigits = '49' + cleanDigits.substring(1);
  }
  
  const message = adTitle
    ? `سلام، در رابطه با آگهی «${adTitle}» در بازار پیام می‌دهم.`
    : 'سلام، در رابطه با آگهی شما در بازار پیام می‌دهم.';
    
  return `https://wa.me/${cleanDigits}?text=${encodeURIComponent(message)}`;
};

export const normalizeTelegramId = (id: string): string =>
  id.trim().replace(/^@+/, '');

export const getTelegramUrl = (telegramId: string): string => {
  const username = normalizeTelegramId(telegramId);
  if (!username) return '';
  return `https://t.me/${username}`;
};

export const formatTelegramId = (telegramId: string): string => {
  const username = normalizeTelegramId(telegramId);
  return username ? `@${username}` : '';
};

export const getConditionLabel = (_condition?: string): { text: string; bg: string; color: string } | null => {
  return null;
};
