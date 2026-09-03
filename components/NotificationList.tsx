import React from 'react';
import { Link } from 'react-router-dom';
import { AppNotification } from '../types';
import { getTimeAgo } from '../lib/formatters';
import { Bell, CheckCheck, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

const typeIcon = (type: AppNotification['type']) => {
  if (type === 'SUCCESS') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  if (type === 'ERROR') return <XCircle className="w-4 h-4 text-rose-500" />;
  if (type === 'WARNING') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  return <Info className="w-4 h-4 text-sky-500" />;
};

interface NotificationListProps {
  items: AppNotification[];
  onOpen: (n: AppNotification) => void;
  onMarkAll?: () => void;
  emptyText?: string;
  compact?: boolean;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  items,
  onOpen,
  onMarkAll,
  emptyText = 'اعلانی وجود ندارد.',
  compact,
}) => (
  <div className={compact ? '' : 'space-y-3'}>
    {onMarkAll && items.some(n => !n.isRead) && (
      <div className="flex justify-end mb-2">
        <button type="button" onClick={onMarkAll} className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline">
          <CheckCheck className="w-3.5 h-3.5" />
          خواندن همه
        </button>
      </div>
    )}
    {items.length === 0 ? (
      <p className="text-xs text-gray-500 text-center py-6">{emptyText}</p>
    ) : (
      <ul className={compact ? 'divide-y divide-gray-100 dark:divide-gray-800' : 'space-y-2'}>
        {items.map(n => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onOpen(n)}
              className={`w-full text-right p-3 transition-colors ${
                compact ? 'hover:bg-gray-50 dark:hover:bg-gray-800/60' : 'rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary/30'
              } ${!n.isRead ? 'bg-primary/5' : ''}`}
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                <div className="min-w-0 flex-1">
                  {n.title && <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{n.title}</p>}
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{getTimeAgo(n.createdAt)}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
              </div>
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

interface HomeNotificationBannerProps {
  items: AppNotification[];
  onOpen: (n: AppNotification) => void;
  onDismissAll: () => void;
}

export const HomeNotificationBanner: React.FC<HomeNotificationBannerProps> = ({ items, onOpen, onDismissAll }) => {
  const unread = items.filter(n => !n.isRead).slice(0, 3);
  if (unread.length === 0) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/80 dark:bg-amber-950/30 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <Bell className="w-4 h-4" />
          <span className="text-xs font-bold">اعلان‌های مهم شما</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/profile?tab=notifications" className="text-[11px] font-bold text-primary hover:underline">
            همه اعلان‌ها
          </Link>
          <button type="button" onClick={onDismissAll} className="text-[11px] text-gray-500 hover:text-gray-700">
            خواندن همه
          </button>
        </div>
      </div>
      <ul className="space-y-1.5">
        {unread.map(n => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onOpen(n)}
              className="w-full text-right text-[11px] text-gray-700 dark:text-gray-300 hover:text-primary truncate"
            >
              <span className="font-bold">{n.title || 'اعلان'}: </span>
              {n.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationList;
