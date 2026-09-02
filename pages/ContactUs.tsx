import React, { useState } from 'react';
import { StorageService } from '../services/storage';
import {
  Phone,
  MapPin,
  Send,
  ShieldCheck,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  MessageSquare,
  Clock
} from 'lucide-react';

export const ContactUs: React.FC = () => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [subject, setSubject] = useState('پیشنهاد یا انتقاد');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim() || !message.trim()) return;

    StorageService.saveSupportMessage({
      name: name.trim(),
      contact: contact.trim(),
      subject,
      message: message.trim()
    });

    setSentSuccess(true);
    setName('');
    setContact('');
    setMessage('');
    setTimeout(() => setSentSuccess(false), 4000);
  };

  const faqs = [
    {
      q: 'چگونه در بازار آلمان آگهی رایگان ثبت کنم؟',
      a: 'کافیست از بالای صفحه روی دکمه سرخ‌رنگ «ثبت آگهی» کلیک کنید. دسته‌بندی و شهر یا ایالت مورد نظر در آلمان را مشخص نموده و پس از بارگذاری عکس، عنوان، مشخصات و قیمت به یورو، آگهی خود را منتشر فرمایید.'
    },
    {
      q: 'چطور از امن بودن معامله و عدم کلاهبرداری مطمئن شوم؟',
      a: 'مهم‌ترین اصل در آلمان: هرگز و تحت هیچ عنوان قبل از رویت حضوری کالا یا مسکن و اطمینان از صحت مدارک و سلامت آن، بیعانه یا ودیعه (Kaution) پرداخت نکنید. قرار ملاقات را در ساعات روز و اماکن عمومی تنظیم فرمایید.'
    },
    {
      q: 'آیا ثبت آگهی در بازار نیازمندی‌های آلمان شامل هزینه است؟',
      a: 'خیر، ثبت آگهی عادی در تمام دسته‌بندی‌ها و شهرهای آلمان کاملاً رایگان است. فقط در صورت تمایل به قرارگیری در صدر نتایج، می‌توانید از امکان «نردبان» استفاده نمایید.'
    },
    {
      q: 'چگونه گزارش تخلف یا آگهی‌های مشکوک را ثبت کنم؟',
      a: 'در صفحه هر آگهی، دکمه «گزارش تخلف» تعبیه شده است. با کلیک روی آن و انتخاب علت مغایرت، گزارش شما مستقیماً به بخش نظارت و مدیریت ارسال و بررسی می‌گردد.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Page Title */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
          تماس با پشتیبانی بازار آلمان
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          تیم پشتیبانی نیازمندی‌های ایرانیان آلمان آماده پاسخگویی، دریافت نظرات و راهنمایی شماست.
        </p>
      </div>

      {/* Grid: Contact Info & Message Form */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Contact Info & Safe Deal Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">راه‌های ارتباطی در آلمان</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-gray-400 text-[10px]">شماره تماس و پشتیبانی واتس‌اپ</div>
                  <div className="font-bold text-gray-900 dark:text-white dir-ltr text-left font-mono [unicode-bidi:plaintext]">+49 30 12345678</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-gray-400 text-[10px]">دفتر هماهنگی</div>
                  <div className="font-medium text-gray-900 dark:text-white leading-relaxed">
                    Friedrichstraße 120, 10117 Berlin, Germany
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-800">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <div className="text-gray-400 text-[10px]">ساعات پاسخگویی (به وقت آلمان)</div>
                  <div className="font-medium text-gray-900 dark:text-white leading-relaxed">
                    دوشنبه تا جمعه: ۹:۰۰ الی ۱۸:۰۰
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50/60 dark:bg-red-950/20 rounded-3xl p-6 border border-red-200/80 dark:border-red-900/40 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-primary">
              <ShieldCheck className="w-4 h-4" />
              <span>امنیت معاملات و مقابله با کلاهبرداری</span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
              اگر در هنگام خرید یا اجاره مسکن در آلمان با مورد مشکوک یا تقاضای بیعانه قبل از بازدید مواجه شدید، بلافاصله از طریق دکمه «گزارش تخلف» به ناظرین اطلاع دهید.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span>ارسال پیام و ثبت تیکت پشتیبانی</span>
            </h3>

            {sentSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>پیام شما با موفقیت دریافت شد و کارشناسان پشتیبانی به زودی با شما تماس خواهند گرفت.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    placeholder="مثلاً: نیما راد"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">شماره موبایل *</label>
                  <input
                    type="tel"
                    placeholder="+49 176 12345678"
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    required
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary text-left font-mono [unicode-bidi:plaintext]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">موضوع پیام</label>
                <select
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary font-medium"
                >
                  <option value="پیشنهاد یا انتقاد">پیشنهاد یا انتقاد</option>
                  <option value="مشکل در ثبت آگهی">مشکل در ثبت آگهی</option>
                  <option value="گزارش تخلف یا کلاهبرداری">گزارش تخلف یا کلاهبرداری</option>
                  <option value="همکاری و درج آگهی تجاری">همکاری و درج آگهی تجاری</option>
                  <option value="سایر موارد">سایر موارد</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-gray-700 dark:text-gray-300">متن پیام *</label>
                <textarea
                  rows={5}
                  placeholder="متن پیام یا پرسش خود را شرح دهید..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                  className="w-full p-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-primary hover:bg-secondary text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 rotate-180" />
                <span>ارسال پیام به پشتیبانی</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          <span>سوالات متداول کاربران در آلمان (Häufige Fragen)</span>
        </h3>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-right text-xs sm:text-sm font-bold text-gray-800 dark:text-gray-200 hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="pt-2.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed animate-in fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
