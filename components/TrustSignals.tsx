import React from 'react';
import { Ad, AdStatus, User } from '../types';
import { CheckCircle2, Phone, Shield, Send, MessageCircle } from 'lucide-react';
import { getTimeAgo } from '../lib/formatters';
import { caption } from '../lib/designTokens';

interface TrustSignalsProps {
  ad: Ad;
  seller: User | null;
}

export const TrustSignals: React.FC<TrustSignalsProps> = ({ ad, seller }) => {
  const signals: { icon: React.ReactNode; text: string }[] = [];

  if (ad.showPhone !== false && ad.contactPhone) {
    signals.push({
      icon: <Phone className="w-3.5 h-3.5" />,
      text: 'تماس تلفنی فعال',
    });
  }

  if (ad.showTelegram && ad.telegramId) {
    signals.push({
      icon: <Send className="w-3.5 h-3.5" />,
      text: 'تلگرام فعال',
    });
  }

  if (ad.allowWhatsapp === true && ad.contactPhone) {
    signals.push({
      icon: <MessageCircle className="w-3.5 h-3.5" />,
      text: 'واتس‌اپ فعال',
    });
  }

  if (ad.isVerifiedSeller) {
    signals.push({
      icon: <Shield className="w-3.5 h-3.5" />,
      text: 'فروشنده تأییدشده',
    });
  }

  if (seller?.createdAt) {
    signals.push({
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: `عضو از ${getTimeAgo(seller.createdAt)}`,
    });
  }

  if (ad.status === AdStatus.APPROVED) {
    signals.push({
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: 'آگهی فعال',
    });
  }

  if (signals.length === 0) return null;

  return (
    <ul className="space-y-2">
      {signals.map((s, i) => (
        <li key={i} className={`${caption} flex items-center gap-2 text-text-secondary dark:text-gray-400`}>
          <span className="text-primary shrink-0">{s.icon}</span>
          <span>{s.text}</span>
        </li>
      ))}
    </ul>
  );
};

export default TrustSignals;
