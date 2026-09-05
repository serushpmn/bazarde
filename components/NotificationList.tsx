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
  /** When true, shows as centered popup (no page navigation required to read). */
  asPopup?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const HomeNotificationBanner: React.FC<HomeNotificationBannerProps> = ({
  items,
  onOpen,
  onDismissAll,
  asPopup = false,
  isOpen = true,
  onClose,
}) => {
  const unread = items.filter(n => !n.isRead).slice(0, 5);
  if (unread.length === 0) return null;
  if (asPopup && !isOpen) return null;

  const body = (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
        <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
          اعلان‌های مهم مربوط به آگهی‌ها و حساب شما. می‌توانید همین‌جا بخوانید و ببندید.
        </p>
      </div>
      <ul className="space-y-2 max-h-[50vh] overflow-y-auto">
        {unread.map(n => (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onOpen(n)}
              className="w-full text-right p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/50 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{typeIcon(n.type)}</span>
                <div className="min-w-0 flex-1">
                  {n.title && (
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{n.title}</p>
                  )}
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed mt-0.5">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">{getTimeAgo(n.createdAt)}</p>
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          to="/profile?tab=notifications"
          onClick={onClose}
          className="text-[11px] font-bold text-primary hover:underline"
        >
          همه اعلان‌ها
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDismissAll}
            className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            خواندن همه
          </button>
          {asPopup && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11px] font-bold"
            >
              بستن
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (!asPopup) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-3">
          <Bell className="w-4 h-4" />
          <span className="text-xs font-bold">اعلان‌های مهم شما</span>
        </div>
        {body}
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="اعلان‌های مهم"
    >
      <div
        className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">اعلان‌های مهم</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="بستن"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-4">{body}</div>
      </div>
    </div>
  );
};

export default NotificationList;
