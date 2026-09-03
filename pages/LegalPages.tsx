import React from 'react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Shield, Ban, FileText, ArrowRight } from 'lucide-react';

const LegalShell: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary mb-4">
      <ArrowRight className="w-3.5 h-3.5" />
      بازگشت
    </Link>
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 sm:p-8 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">{icon}</div>
        <h1 className="text-xl font-black text-gray-900 dark:text-white">{title}</h1>
      </div>
      {children}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 text-xs">
        <Link to="/rules" className="text-primary hover:underline">قوانین انتشار</Link>
        <Link to="/banned" className="text-primary hover:underline">کالاهای ممنوعه</Link>
        <Link to="/privacy" className="text-primary hover:underline">حریم خصوصی (GDPR)</Link>
        <Link to="/safety" className="text-primary hover:underline">معامله امن</Link>
        <Link to="/contact" className="text-primary hover:underline">تماس با ما</Link>
      </div>
    </div>
  </div>
);

export const RulesPage: React.FC = () => {
  const settings = StorageService.getSettings();
  return (
    <LegalShell title="قوانین و مقررات انتشار آگهی" icon={<FileText className="w-5 h-5" />}>
      <p className="text-xs text-gray-500 leading-relaxed">
        این قوانین برای شفافیت، امنیت کاربران و رعایت الزامات DSA نوشته شده‌اند و در پنل مدیریت قابل ویرایش هستند.
      </p>
      <div className="text-sm text-gray-800 dark:text-gray-200 leading-8 whitespace-pre-line">{settings.publishingRules}</div>
    </LegalShell>
  );
};

export const PrivacyPage: React.FC = () => {
  const settings = StorageService.getSettings();
  return (
    <LegalShell title="حریم خصوصی و GDPR" icon={<Shield className="w-5 h-5" />}>
      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200">
        اصل حداقل‌سازی داده: داده اصلی تماس ذخیره‌شده، <strong>شماره تلفن</strong> است.
      </div>
      <div className="text-sm text-gray-800 dark:text-gray-200 leading-8 whitespace-pre-line">{settings.privacyPolicy}</div>
    </LegalShell>
  );
};

export const BannedItemsPage: React.FC = () => {
  const settings = StorageService.getSettings();
  return (
    <LegalShell title="فهرست کالا و خدمات ممنوعه" icon={<Ban className="w-5 h-5" />}>
      <p className="text-xs text-gray-500 leading-relaxed">
        انتشار موارد زیر در بازار ممنوع است و منجر به رد یا حذف آگهی با ذکر دلیل می‌شود. فهرست از پنل مدیریت قابل ویرایش است.
      </p>
      <ul className="space-y-2">
        {settings.bannedItems.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800"
          >
            <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </LegalShell>
  );
};

export default RulesPage;
