import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import { Appeal, ActivityLog, PlatformSettings, User } from '../types';
import { getTimeAgo, toPersianDigits } from '../lib/formatters';
import { DEFAULT_PLATFORM_SETTINGS } from '../lib/platformDefaults';
import { Save, Scale, ScrollText, Settings2 } from 'lucide-react';

export const AdminSettingsPanel: React.FC<{ user: User; onSaved: () => void }> = ({ user, onSaved }) => {
  const [settings, setSettings] = useState<PlatformSettings>(() => StorageService.getSettings());
  const [bannedText, setBannedText] = useState(settings.bannedItems.join('\n'));
  const [reportText, setReportText] = useState(settings.reportReasons.join('\n'));
  const [rejectText, setRejectText] = useState(settings.rejectReasonTemplates.join('\n'));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const next: PlatformSettings = {
      ...settings,
      adExpiryDays: Math.max(1, Number(settings.adExpiryDays) || 60),
      bannedItems: bannedText.split('\n').map(s => s.trim()).filter(Boolean),
      reportReasons: reportText.split('\n').map(s => s.trim()).filter(Boolean),
      rejectReasonTemplates: rejectText.split('\n').map(s => s.trim()).filter(Boolean),
    };
    StorageService.saveSettings(next, {
      id: user.id,
      name: user.name,
      role: user.role === 'EDITOR' ? 'EDITOR' : 'ADMIN',
    });
    setSettings(next);
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2000);
  };

  const resetDefaults = () => {
    setSettings({ ...DEFAULT_PLATFORM_SETTINGS });
    setBannedText(DEFAULT_PLATFORM_SETTINGS.bannedItems.join('\n'));
    setReportText(DEFAULT_PLATFORM_SETTINGS.reportReasons.join('\n'));
    setRejectText(DEFAULT_PLATFORM_SETTINGS.rejectReasonTemplates.join('\n'));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            تنظیمات پلتفرم، قوانین و GDPR
          </h2>
          <p className="text-[11px] text-gray-500 mt-1">انقضای آگهی، دلایل گزارش DSA، لیست ممنوعه و متون قانونی قابل ویرایش هستند.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={resetDefaults} className="px-3 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700">
            بازگردانی پیش‌فرض
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            ذخیره تنظیمات
          </button>
        </div>
      </div>
      {saved && <p className="text-xs text-emerald-600 font-bold">تنظیمات ذخیره شد.</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <label className="block text-xs font-bold">مدت اعتبار آگهی (روز)</label>
          <input
            type="number"
            min={1}
            value={settings.adExpiryDays}
            onChange={e => setSettings({ ...settings, adExpiryDays: Number(e.target.value) })}
            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm"
          />
          <p className="text-[11px] text-gray-500">پیش‌فرض ۶۰ روز. پس از این مدت آگهی‌های تاییدشده منقضی می‌شوند.</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <label className="block text-xs font-bold">دلایل گزارش تخلف (DSA) — هر خط یک مورد</label>
          <textarea rows={6} value={reportText} onChange={e => setReportText(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <label className="block text-xs font-bold">قالب‌های دلیل رد آگهی — هر خط یک مورد</label>
          <textarea rows={6} value={rejectText} onChange={e => setRejectText(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3">
          <label className="block text-xs font-bold">کالا و خدمات ممنوعه — هر خط یک مورد</label>
          <textarea rows={6} value={bannedText} onChange={e => setBannedText(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3 lg:col-span-2">
          <label className="block text-xs font-bold">متن قوانین انتشار آگهی</label>
          <textarea rows={10} value={settings.publishingRules} onChange={e => setSettings({ ...settings, publishingRules: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs leading-relaxed" />
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-3 lg:col-span-2">
          <label className="block text-xs font-bold">سیاست حریم خصوصی (GDPR)</label>
          <textarea rows={10} value={settings.privacyPolicy} onChange={e => setSettings({ ...settings, privacyPolicy: e.target.value })} className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs leading-relaxed" />
        </div>
      </div>
    </div>
  );
};

export const AdminAppealsPanel: React.FC<{ user: User; appeals: Appeal[]; onChanged: () => void }> = ({
  user,
  appeals,
  onChanged,
}) => {
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const resolve = (id: string, status: 'ACCEPTED' | 'REJECTED') => {
    const reply = (replyMap[id] || '').trim();
    if (!reply) return;
    StorageService.resolveAppeal(id, status, reply, {
      id: user.id,
      name: user.name,
      role: user.role === 'EDITOR' ? 'EDITOR' : 'ADMIN',
    });
    onChanged();
  };

  return (
    <div className="space-y-4">
      <h2 className="font-black text-sm flex items-center gap-2">
        <Scale className="w-4 h-4 text-primary" />
        اعتراض به رد / حذف آگهی
      </h2>
      {appeals.length === 0 ? (
        <p className="text-xs text-gray-500 py-8 text-center">اعتراضی در صف نیست.</p>
      ) : (
        appeals.map(a => (
          <div key={a.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold">{a.adTitle}</p>
                <p className="text-[11px] text-gray-500">
                  نوع: {a.type === 'REJECTION' ? 'اعتراض به رد' : 'اعتراض به حذف'} · {getTimeAgo(a.createdAt)}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                a.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : a.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {a.status === 'PENDING' ? 'در انتظار' : a.status === 'ACCEPTED' ? 'پذیرفته' : 'رد شده'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600"><strong>دلیل اولیه:</strong> {a.originalReason}</p>
            <p className="text-[11px] text-gray-800 dark:text-gray-200"><strong>متن اعتراض:</strong> {a.message}</p>
            {a.status === 'PENDING' && (
              <div className="space-y-2 pt-2">
                <textarea
                  rows={2}
                  placeholder="پاسخ ناظر (الزامی)"
                  value={replyMap[a.id] || ''}
                  onChange={e => setReplyMap({ ...replyMap, [a.id]: e.target.value })}
                  className="w-full p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-xs"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => resolve(a.id, 'ACCEPTED')} className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
                    پذیرش اعتراض
                  </button>
                  <button type="button" onClick={() => resolve(a.id, 'REJECTED')} className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold">
                    رد اعتراض
                  </button>
                </div>
              </div>
            )}
            {a.adminReply && <p className="text-[11px] text-gray-500">پاسخ ناظر: {a.adminReply}</p>}
          </div>
        ))
      )}
    </div>
  );
};

export const AdminLogsPanel: React.FC<{ logs: ActivityLog[] }> = ({ logs }) => (
  <div className="space-y-4">
    <h2 className="font-black text-sm flex items-center gap-2">
      <ScrollText className="w-4 h-4 text-primary" />
      لاگ کامل فعالیت‌ها ({toPersianDigits(logs.length)})
    </h2>
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
      <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {logs.length === 0 ? (
          <p className="text-xs text-gray-500 p-6 text-center">هنوز لاگی ثبت نشده است.</p>
        ) : (
          logs.map(log => (
            <div key={log.id} className="p-3 text-xs space-y-1">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="font-bold text-gray-900 dark:text-white">{log.action}</span>
                <span className="text-gray-400">{getTimeAgo(log.createdAt)}</span>
              </div>
              <p className="text-gray-500">
                {log.actorRole || 'SYSTEM'}
                {log.actorName ? ` · ${log.actorName}` : ''}
                {log.targetType ? ` · ${log.targetType}` : ''}
                {log.targetId ? ` · ${log.targetId}` : ''}
              </p>
              {log.details && <p className="text-gray-700 dark:text-gray-300">{log.details}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
