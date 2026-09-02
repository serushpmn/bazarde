import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  HelpCircle,
  PhoneCall,
  Home,
  CreditCard,
  FileText,
  Lock,
  ExternalLink
} from 'lucide-react';

export const SafetyGuide: React.FC = () => {
  const navigate = useNavigate();

  const redFlags = [
    {
      title: 'درخواست بیعانه یا ودیعه (Kaution) قبل از بازدید',
      desc: 'بزرگ‌ترین زنگ خطر! هرگونه درخواست پول پیش، ودیعه یا بیعانه برای رزرو مسکن یا کالا قبل از رویت حضوری، ۱۰۰٪ کلاهبرداری است.',
      icon: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
      tag: 'خطر فوری'
    },
    {
      title: 'داستان «من در آلمان نیستم و کلید را با پست می‌فرستم»',
      desc: 'کلاهبرداران مسکن ادعا می‌کنند صاحبخانه هستند اما به دلیل شغل در انگلستان یا اسپانیا زندگی می‌کنند و کلید را از طریق Airbnb، DHL یا شرکت واسط می‌فرستند مشروط به اینکه پول را واریز کنید.',
      icon: <Home className="w-5 h-5 text-rose-500 flex-shrink-0" />,
      tag: 'کلاهبرداری مسکن'
    },
    {
      title: 'قیمت بسیار پایین‌تر از عرف بازار (Ungewöhnlich günstig)',
      desc: 'وقتی خانه لوکس در مرکز برلین یا مونیخ با قیمت ۵۰۰ یورو یا آیفون ۱۵ نو با قیمت ۳۰۰ یورو آگهی می‌شود، قطعاً طعمه‌ای برای کلاهبرداری و جلب توجه است.',
      icon: <CreditCard className="w-5 h-5 text-amber-500 flex-shrink-0" />,
      tag: 'قیمت غیرواقعی'
    },
    {
      title: 'اصرار به پرداخت با PayPal Friends & Family یا کریپتو',
      desc: 'روش‌های انتقال پول بدون قابلیت بازگشت (مانند PayPal Freunde، Western Union، کارت هدیه یا رمزارز) هیچ‌گونه امنیت خریدار (Käuferschutz) ندارند.',
      icon: <Lock className="w-5 h-5 text-rose-500 flex-shrink-0" />,
      tag: 'روش پرداخت ناامن'
    },
    {
      title: 'درخواست تصویر پاسپورت، کارت اقامت یا مدرک شناسایی',
      desc: 'هرگز مدارک هویتی خود را برای اشخاص ناشناس در چت ارسال نکنید. کلاهبرداران از مدارک شما برای احراز هویت در سایت‌های فیک و فریب قربانیان بعدی استفاده می‌کنند (سرقت هویت).',
      icon: <FileText className="w-5 h-5 text-rose-500 flex-shrink-0" />,
      tag: 'سرقت هویت'
    },
    {
      title: 'ارسال لینک‌های مشکوک برای دریافت پول یا درگاه بانکی',
      desc: 'پیامک‌ها یا لینک‌هایی که ادعا می‌کنند از طرف پست آلمان، DHL یا بانک هستند و از شما اطلاعات کارت بانکی یا حساب می‌خواهند را هرگز باز نکنید.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
      tag: 'فیشینگ'
    }
  ];

  const safeSteps = [
    {
      step: '۱',
      title: 'معامله حضوری و بررسی سلامت کالا',
      desc: 'همواره قرار ملاقات را در مکان‌های عمومی و در طول روز تنظیم کنید و قبل از پرداخت پول، کالا را کاملاً آزمایش نمایید.'
    },
    {
      step: '۲',
      title: 'بازدید حضوری از مسکن و قرارداد معتبر',
      desc: 'برای اجاره خانه، حتماً از ملک به صورت حضوری بازدید کنید، با صاحبخانه اصلی یا Verwaltung قرارداد معتبر (Mietvertrag) امضا کنید و ودیعه را به حساب مشخص‌شده در قرارداد واریز نمایید.'
    },
    {
      step: '۳',
      title: 'استفاده از روش‌های امن پرداخت',
      desc: 'در معاملات حضوری پرداخت نقدی (Bar) یا انتقال لحظه‌ای (Echtzeit-Überweisung) در هنگام تحویل، و در ارسال پستی استفاده از روش‌های دارای ضمانت مانند PayPal با گزینه Güter und Dienstleistungen توصیه می‌شود.'
    },
    {
      step: '۴',
      title: 'گزارش فوری آگهی‌های مشکوک',
      desc: 'در صورت برخورد با هرگونه رفتار نامتعارف، فوراً از طریق دکمه «گزارش تخلف» ناظرین سامانه بازار را مطلع فرمایید تا آگهی حذف و کاربر مسدود گردد.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 animate-in fade-in">
      
      {/* Top Header / Back Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت</span>
        </button>

        <Link
          to="/"
          className="text-xs text-primary font-bold hover:underline"
        >
          صفحه اصلی بازار آلمان
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-red-600 to-red-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs text-red-200 font-semibold uppercase tracking-wider block">راهنمای امنیتی بازار</span>
            <h1 className="text-xl sm:text-3xl font-black">
              زنگ خطرهای قبل از معامله و پیشگیری از کلاهبرداری
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-red-100 leading-relaxed max-w-2xl">
          جهت محافظت از سرمایه و اطلاعات شخصی شما در آلمان، مطالعه این راهنما قبل از هرگونه پرداخت وجه یا اجاره مسکن ضروری است.
        </p>
      </div>

      {/* Main Red Flags Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
            شایع‌ترین شگردهای کلاهبرداری در معاملات و نیازمندی‌ها
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {redFlags.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xs hover:border-red-200 dark:hover:border-red-900/40 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-50 dark:bg-red-950/40 text-primary flex-shrink-0">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Golden Steps for Safe Trading */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
            ۴ قانون طلایی برای یک معامله ۱۰۰٪ امن
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {safeSteps.map((s, idx) => (
            <div key={idx} className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center flex-shrink-0">
                {s.step}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact & Reporting Box */}
      <div className="bg-amber-50/70 dark:bg-amber-950/30 rounded-3xl p-6 border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-300">
              با مورد مشکوکی برخورد کرده‌اید؟
            </h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400/80 mt-0.5">
              از طریق دکمه گزارش تخلف در صفحه آگهی یا تماس با پشتیبانی سریعاً به ما اطلاع دهید.
            </p>
          </div>
        </div>
        <Link
          to="/contact"
          className="px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 flex-shrink-0"
        >
          <PhoneCall className="w-4 h-4" />
          <span>تماس با پشتیبانی</span>
        </Link>
      </div>

    </div>
  );
};

export default SafetyGuide;
