import {
  Ad,
  AdStatus,
  User,
  UserRole,
  DEFAULT_CITIES,
  DEFAULT_CATEGORIES,
  AppNotification,
  SupportMessage,
  Banner,
  Category,
  ChatMessage,
  ViolationReport,
  PlatformSettings,
  Appeal,
  AppealStatus,
  ActivityLog,
  ActivityActor,
  ManagedCity,
  AccountDeletionRequest,
  AccountDeletionReasonCode,
  PhoneRestriction,
} from '../types';
import { DEFAULT_PLATFORM_SETTINGS, MS_PER_DAY } from '../lib/platformDefaults';
import { sanitizeUserAvatar } from '../lib/defaultAvatars';
import {
  ACCOUNT_DELETION_GRACE_MS,
  ACTIVE_AD_STATUSES,
  MAX_ACTIVE_ADS_PER_USER,
  getAccountStatus,
  phoneBlocksNewRegistration,
} from '../lib/accountLifecycle';
import { OtpService } from '../lib/otpService';

const STORAGE_KEYS = {
  USERS: 'bazaar_de_users_v3',
  ADS: 'bazaar_de_ads_v3',
  CURRENT_USER: 'bazaar_de_current_user_v3',
  CITIES: 'bazaar_de_cities_v4',
  CATEGORIES: 'bazaar_de_categories_v3',
  NOTIFICATIONS: 'bazaar_de_notifications_v3',
  SUPPORT_MESSAGES: 'bazaar_de_support_messages_v3',
  BANNERS: 'bazaar_de_banners_v3',
  BOOKMARKS: 'bazaar_de_saved_ads_v3',
  RECENT_VIEWS: 'bazaar_de_recent_views_v3',
  CHATS: 'bazaar_de_chats_v3',
  VIOLATION_REPORTS: 'bazaar_de_violation_reports_v3',
  SETTINGS: 'bazaar_de_settings_v3',
  APPEALS: 'bazaar_de_appeals_v3',
  ACTIVITY_LOGS: 'bazaar_de_activity_logs_v3',
  ACCOUNT_DELETION_REQUESTS: 'bazaar_de_account_deletion_requests_v1',
  PHONE_RESTRICTIONS: 'bazaar_de_phone_restrictions_v1',
};

// Initial Realistic Seed Ads across Germany
const INITIAL_DEMO_ADS: Ad[] = [
  {
    id: 'ad-berlin-apt',
    userId: 'user-berlin-1',
    title: 'اجاره آپارتمان ۲ خوابه مبله کامل با آنملدونگ در برلین میته',
    description: 'یک واحد آپارتمان شیک ۷۵ متری بازسازی شده در منطقه برلین میته (Berlin Mitte).\nدارای ۲ اتاق خواب، پذیرایی پرنور، آشپزخانه مجهز (Einbauküche) با تمام وسایل بوش، ماشین لباسشویی و ظرفشویی.\nاینترنت فیبر نوری پرسرعت فعال، گرمایش شوفاژ مرکزی.\nدسترسی فوق‌العاده: ۳ دقیقه پیاده تا ایستگاه مترو U-Bahn و تراموا، نزدیک فروشگاه‌های Rewe و Edeka.\nامکان ثبت آدرس (Anmeldung möglich). مناسب برای زوج یا ۲ نفر دانشجو/متخصص.',
    price: 1350,
    currency: 'EUR',
    city: 'برلین (Berlin)',
    state: 'برلین (Berlin)',
    district: 'Mitte',
    categoryId: 'real-estate',
    subCategoryId: 're-rent-long',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
    contactPhone: '+49 176 12345678',
    allowWhatsapp: true,
    whatsappPhone: '+49 176 12345678',
    viewsCount: 235,
    attributes: {
      'متراژ': '۷۵ متر مربع',
      'تعداد اتاق': '۲.۵ Zimmer',
      'طبقه': '۳ با آسانسور',
      'وضعیت اجاره': 'Warmmiete (شامل هزینه‌های جانبی)',
      'ثبت آدرس': 'امکان‌پذیر (Mit Anmeldung)',
      'ودیعه (Kaution)': '۲,۵۰۰ یورو',
      'حیوانات خانگی': 'با هماهنگی قبلی'
    }
  },
  {
    id: 'ad-munich-golf',
    userId: 'user-munich-1',
    title: 'فولکس واگن گلف مدل ۲۰۲۱ اتوماتیک کارکرد کم - مونیخ',
    description: 'Volkswagen Golf 8 1.5 eTSI Style اتوماتیک DSG در مونیخ (Schwabing).\nکارکرد واقعی ۴۸,۰۰۰ کیلومتر، دارای TÜV معتبر تا ۲۰۲۶.\nسرویس‌ها تماماً در نمایندگی رسمی VW انجام شده، دفترچه سرویس کامل (Scheckheftgepflegt).\nدارای سنسور پارک ۳۶۰ درجه، کروز کنترل تطبیقی، هدآپ دیسپلی، گرمکن صندلی و فرمان، رینگ آلومینیومی ۱۷ اینچی.\nیک دست لاستیک زمستانی نو (Winterreifen) به همراه رینگ تقدیم خریدار می‌شود.',
    price: 19800,
    currency: 'EUR',
    city: 'مونیخ (München)',
    state: 'بایرن (Bayern)',
    district: 'Schwabing',
    categoryId: 'vehicles',
    subCategoryId: 'v-cars',
    images: [
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 95,
    contactPhone: '+49 172 98765432',
    allowWhatsapp: true,
    whatsappPhone: '+49 172 98765432',
    viewsCount: 412,
    attributes: {
      'سال ساخت': '۲۰۲۱ (Erstzulassung)',
      'کارکرد': '۴۸,۰۰۰ کیلومتر',
      'نوع سوخت': 'بنزینی هیبرید ملایم (Benzin/Elektro)',
      'گیربکس': 'اتوماتیک ۷ دنده DSG',
      'معاینه فنی (TÜV)': 'تا ۰۴/۲۰۲۶',
      'قدرت موتور': '۱۵۰ اسب بخار (110 kW)'
    }
  },
  {
    id: 'ad-frankfurt-macbook',
    userId: 'user-frankfurt-1',
    title: 'مک‌بوک پرو ۱۶ اینچ M3 Max رم ۳۶ گیگابایت ۵۱۲ اس‌اس‌دی فرانکفورت',
    description: 'اپل مک‌بوک پرو ۱۶ اینچ با چیپست قدرتمند M3 Max، رم ۳۶ گیگابایت یکپارچه و حافظه ۵۱۲ گیگابایت SSD فوق‌سریع.\nرنگ مشکی فضایی (Space Black)، کیبورد آلمانی QWERTZ / انگلیسی.\nسلامت باتری ۹۹ درصد، فقط ۲۴ سیکل شارژ، بسیار تمیز بدون کوچکترین خط و خش.\nهمراه با شارژر اورجینال ۱۴۰ وات مگ‌سیف، جعبه اصلی و فاکتور رسمی خرید از Apple Store فرانکفورت.\nامکان تست حضوری در فرانکفورت منطقه Westend یا ارسال بیمه‌شده با DHL.',
    price: 2650,
    currency: 'EUR',
    city: 'فرانکفورت (Frankfurt am Main)',
    state: 'هسن (Hessen)',
    district: 'Westend',
    categoryId: 'digital',
    subCategoryId: 'd-laptop',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 140,
    contactPhone: '+49 160 55443322',
    allowWhatsapp: true,
    whatsappPhone: '+49 160 55443322',
    viewsCount: 380,
    attributes: {
      'پردازنده': 'Apple M3 Max (14-Core CPU, 30-Core GPU)',
      'حافظه رم': '۳۶ گیگابایت',
      'حافظه داخلی': '۵۱۲ گیگابایت SSD',
      'صفحه نمایش': '۱۶.۲ اینچ Liquid Retina XDR 120Hz',
      'سلامت باتری': '۹۹٪ (۲۴ Cycles)',
      'گارانتی': 'AppleCare+ تا اواخر ۲۰۲۵'
    }
  },
  {
    id: 'ad-cologne-sofa',
    userId: 'user-cologne-1',
    title: 'مبل راحتی گوشه‌ای ال شکل و تختخواب‌شو مدرن برند IKEA - کلن',
    description: 'مبل راحتی گوشه‌ای (Ecksofa) برند ایکیا سری Friheten رنگ طوسی تیره بسیار شیک.\nدارای فضای جادار زیر مبل برای نگهداری پتو و بالش (Bettkasten)، در چند ثانیه به یک تخت دونفره راحت تبدیل می‌شود.\nپارچه مقاوم و قابل شستشو، کاملاً تمیز و بدون لکه و پارگی.\nخانه بدون سیگار و بدون حیوان خانگی (Nichtraucherhaushalt, tierfrei).\nبه دلیل اسباب‌کشی به فروش می‌رسد. امکان کمک برای باز کردن و بارگیری در خودرو.',
    price: 240,
    currency: 'EUR',
    isNegotiable: true,
    city: 'کلن (Köln)',
    state: 'نوردراین-وستفالن (NRW)',
    district: 'Ehrenfeld',
    categoryId: 'home-appliances',
    subCategoryId: 'h-furniture',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 200,
    contactPhone: '+49 157 88991122',
    allowWhatsapp: true,
    whatsappPhone: '+49 157 88991122',
    viewsCount: 190,
    attributes: {
      'ابعاد': '۲۳۰ در ۱۵۰ سانتی‌متر',
      'رنگ': 'طوسی تیره (Dunkelgrau)',
      'قابلیت تختخواب‌شو': 'دارد (Schlaffunktion)',
      'محل نگهداری وسایل': 'دارد (Stauraum)'
    }
  },
  {
    id: 'ad-hamburg-translation',
    userId: 'user-hamburg-1',
    title: 'خدمات ترجمه رسمی مدارک آلمانی به فارسی و بالعکس با تاییدیه - هامبورگ',
    description: 'دارالترجمه رسمی قسم‌خورده در دادگاه‌های آلمان (Vereidigter Übersetzer).\nترجمه رسمی انواع مدارک تحصیلی، دانشنامه‌ها، ریزنمرات، مدارک هویتی، شناسنامه، سند ازدواج، گواهی کار و قراردادها.\nپذیرش مدارک به صورت آنلاین و پستی از سراسر آلمان.\nتحویل سریع ۲ تا ۳ روز کاری با مناسب‌ترین تعرفه و بالاترین دقت.\nجهت استعلام قیمت فوری تصویر مدارک خود را در واتس‌اپ ارسال فرمایید.',
    price: 35,
    currency: 'EUR',
    city: 'هامبورگ (Hamburg)',
    state: 'هامبورگ (Hamburg)',
    district: 'Altona',
    categoryId: 'services',
    subCategoryId: 's-translation',
    images: [
      'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 300,
    contactPhone: '+49 152 33445566',
    allowWhatsapp: true,
    whatsappPhone: '+49 152 33445566',
    viewsCount: 520,
    attributes: {
      'نوع خدمات': 'ترجمه رسمی و تایید دادگاه آلمان',
      'مدارک تحت پوشش': 'تحصیلی، شغلی، حقوقی و هویتی',
      'مدت تحویل': '۲ الی ۳ روز کاری',
      'پوشش جغرافیایی': 'سراسر آلمان (ارسال با پست پیشتاز)'
    }
  },
  {
    id: 'ad-stuttgart-bike',
    userId: 'user-stuttgart-1',
    title: 'دوچرخه برقی شهری CUBE مدل ۲۰۲۳ موتور بوش - اشتوتگارت',
    description: 'دوچرخه برقی کوب (Cube Touring Hybrid One 500) در شرایط استثنایی.\nموتور Bosch Performance Line نسل جدید با گشتاور ۶۵ نیوتن‌متر و باتری Bosch PowerPack 500Wh با برد تا ۱۲۰ کیلومتر.\nسایز فریم M (مناسب قد ۱۶۵ تا ۱۸۰ سانتی‌متر)، ترمزهای دیسکی هیدرولیکی شیمانو، دنده ۹ سرعته شیمانو Alivio.\nدارای چراغ‌های LED جلو و عقب متصل به باتری، ترک‌بند مقاوم و گلگیر.\nکارکرد کل فقط ۱,۱۰۰ کیلومتر. شارژر اورجینال ۲ آمپر بوش و ۲ عدد کلید باتری و قفل Abus همراه دوچرخه.',
    price: 1450,
    currency: 'EUR',
    city: 'اشتوتگارت (Stuttgart)',
    state: 'بادن-وورتمبرگ (Baden-Württemberg)',
    district: 'Bad Cannstatt',
    categoryId: 'vehicles',
    subCategoryId: 'v-bicycles',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 420,
    contactPhone: '+49 176 99887766',
    allowWhatsapp: true,
    whatsappPhone: '+49 176 99887766',
    viewsCount: 290,
    attributes: {
      'برند': 'Cube (Germany)',
      'نوع موتور': 'Bosch Performance Line (65 Nm)',
      'ظرفیت باتری': '500 Wh',
      'ترمز': 'هیدرولیک دیسکی Shimano',
      'سایز فریم': 'M (50 cm)'
    }
  },
  {
    id: 'ad-dusseldorf-job',
    userId: 'user-dusseldorf-1',
    title: 'استخدام باریستا و کمک آشپز در رستوران مدرن ایرانی - دوسلدورف',
    description: 'رستوران و کافه در مرکز شهر دوسلدورف (Stadtmitte) جهت تکمیل کادر خود از افراد باانگیزه دعوت به همکاری می‌نماید:\n۱. باریستا مسلط به تهیه انواع قهوه و نوشیدنی‌های گرم و سرد (پاره‌وقت یا تمام‌وقت)\n۲. کمک‌آشپز آشنا به غذاهای سنتی و مدرن ایرانی (تمام‌وقت)\nشرایط: داشتن اجازه کار قانونی در آلمان، تسلط نسبی به زبان آلمانی یا انگلیسی، وقت‌شناسی و روحیه کار تیمی.\nحقوق مکفی بر اساس تعرفه قانونی آلمان + بیمه کامل + وعده غذایی روزانه و پاداش.',
    price: 0,
    currency: 'EUR',
    isNegotiable: true,
    city: 'دوسلدورف (Düsseldorf)',
    state: 'نوردراین-وستفالن (NRW)',
    district: 'Stadtmitte',
    categoryId: 'jobs',
    subCategoryId: 'j-gastronomy',
    images: [
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 500,
    contactPhone: '+49 171 44332211',
    allowWhatsapp: true,
    whatsappPhone: '+49 171 44332211',
    viewsCount: 610,
    attributes: {
      'نوع قرارداد': 'تمام وقت / پاره وقت (Vollzeit / Teilzeit)',
      'میزان دستمزد': 'شروع از ۱۵ یورو بر ساعت + پاداش',
      'بیمه و مزایا': 'بیمه درمان و بازنشستگی کامل',
      'زبان مورد نیاز': 'فارسی و آلمانی (حداقل سطح B1)'
    }
  },
  {
    id: 'ad-hannover-ps5',
    userId: 'user-hannover-1',
    title: 'کنسول بازی پلی‌استیشن ۵ دیسک‌خور با ۲ دسته دوئل‌سنس و ۳ بازی - هانوفر',
    description: 'Sony PlayStation 5 Disc Edition (مدل ۱۲۱۶A ریجن اروپا).\nبسیار تمیز در حد نو، بدون هیچ‌گونه صدای فن یا داغ کردن.\nهمراه با دو دسته بی‌سیم DualSense اورجینال (سفید و مشکی)، کابل HDMI 2.1 و پایه فابریک.\n۳ بازی دیسکی فیزیکی شامل Spider-Man 2, God of War Ragnarök و EA Sports FC 24.\nجعبه اصلی کاملاً سالم موجود است. تحویل حضوری در هانوفر یا ارسال.',
    price: 430,
    currency: 'EUR',
    city: 'هانوفر (Hannover)',
    state: 'نیدرزاکسن (Niedersachsen)',
    district: 'List',
    categoryId: 'digital',
    subCategoryId: 'd-gaming',
    images: [
      'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 600,
    contactPhone: '+49 151 77665544',
    allowWhatsapp: true,
    whatsappPhone: '+49 151 77665544',
    viewsCount: 340,
    attributes: {
      'مدل': 'PlayStation 5 Disc Edition',
      'لوازم همراه': '۲ عدد کنترلر DualSense + ۳ دیسک بازی',
      'حافظه': '۸۲۵ گیگابایت SSD',
      'وضعیت ظاهری': 'بدون خط و خش مشابه نو'
    }
  },
  {
    id: 'ad-leipzig-desk',
    userId: 'user-leipzig-1',
    title: 'میز تحریر چوبی و صندلی اداری ارگونومیک - لایپزیگ',
    description: 'میز تحریر چوبی با ابعاد ۱۲۰×۶۰ سانتی‌متر همراه با صندلی اداری قابل تنظیم ارتفاع.\nمناسب دورکاری و مطالعه. تحویل در لایپزیگ منطقه Zentrum.\nقیمت توافقی - لطفاً تماس بگیرید.',
    price: 0,
    currency: 'EUR',
    isNegotiable: true,
    city: 'لایپزیگ (Leipzig)',
    state: 'زاکسن (Sachsen)',
    district: 'Zentrum',
    categoryId: 'home-appliances',
    subCategoryId: 'h-furniture',
    images: [],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 180,
    contactPhone: '+49 151 22334455',
    allowWhatsapp: true,
    whatsappPhone: '+49 151 22334455',
    viewsCount: 42,
    attributes: {
      'نوع': 'میز تحریر + صندلی',
      'وضعیت': 'دست دوم، سالم'
    }
  },
  {
    id: 'ad-tehran-carpet',
    userId: 'user-berlin-1',
    title: 'فرش دستباف ابریشم دست‌دوز اصیل ایرانی ۶ متری - ارسال مستقیم یا تحویل فرانکفورت',
    description: 'فرش دستباف تمام ابریشم نقشه قم ۶ متری اعلا با گره‌های ریز و رنگ‌های طبیعی گیاهی.\nارزش‌گذاری و پرداخت قابل انجام به تومان یا تحویل در آلمان.\nبسیار چشم‌نواز و مناسب سالن‌های شیک یا سرمایه‌گذاری.',
    price: 180000000,
    currency: 'TOMAN',
    city: 'فرانکفورت (Frankfurt am Main)',
    state: 'هسن (Hessen)',
    district: 'Innenstadt',
    categoryId: 'home-appliances',
    subCategoryId: 'h-furniture',
    images: [
      'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1000&q=80'
    ],
    status: AdStatus.APPROVED,
    createdAt: Date.now() - 1000 * 60 * 750,
    contactPhone: '+49 176 12345678',
    allowWhatsapp: true,
    whatsappPhone: '+49 176 12345678',
    viewsCount: 155,
    attributes: {
      'نقشه': 'اصیل قم ابریشم',
      'ابعاد': '۲ در ۳ متر (۶ متر مربع)',
      'وضعیت': 'نو و دست‌نخورده',
      'نوع پرداخت': 'تومانی / کارت به کارت یا نقدی'
    }
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: 'banner-de-1',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    title: 'خرید، فروش و نیازمندی‌های ایرانیان در سراسر آلمان',
    link: '/',
    position: 'HOME_TOP',
    altText: 'نیازمندی‌های آلمان'
  },
  {
    id: 'banner-de-2',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    title: 'مشاوره و املاک مسکونی در شهرهای بزرگ آلمان با ثبت آدرس',
    link: '/?cat=real-estate',
    position: 'HOME_TOP',
    altText: 'املاک در آلمان'
  }
];

// Initial Violation Reports for Moderation demo
const INITIAL_VIOLATION_REPORTS: ViolationReport[] = [
  {
    id: 'rep-1',
    adId: 'ad-stuttgart-bike',
    adTitle: 'دوچرخه برقی شهری CUBE مدل ۲۰۲۳ موتور بوش - اشتوتگارت',
    adCity: 'اشتوتگارت (Stuttgart)',
    adPrice: 1450,
    adImage: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80',
    adUserId: 'user-stuttgart-1',
    reporterUserId: 'user-demo-reporter',
    reason: 'اطلاعات نادرست و مشکوک به قیمت غیرواقعی',
    details: 'فروشنده در چت قیمت متفاوتی نسبت به متن آگهی اعلام کرده است.',
    createdAt: Date.now() - 1000 * 60 * 45,
    status: 'PENDING'
  }
];

// Seed storage if empty
const seedData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ADS)) {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(INITIAL_DEMO_ADS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CITIES)) {
    localStorage.setItem(
      STORAGE_KEYS.CITIES,
      JSON.stringify(DEFAULT_CITIES.map(name => ({ name, isActive: true })))
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BANNERS)) {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VIOLATION_REPORTS)) {
    localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(INITIAL_VIOLATION_REPORTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin-1',
      name: 'مدیر ارشد سامانه',
      phone: '+49 170 0000000',
      city: 'برلین (Berlin)',
      role: UserRole.ADMIN,
      avatar: undefined,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPEALS)) {
    localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify([]));
  }
};

// Initialize immediately
seedData();

export const StorageService = {
  // Ads
  getAds: (): Ad[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ADS);
      if (!data) {
        seedData();
        return INITIAL_DEMO_ADS;
      }
      const parsed = JSON.parse(data) as Ad[];
      // If data is empty or still old format, fallback to initial demo ads
      if (parsed.length === 0) {
        return INITIAL_DEMO_ADS;
      }
      return parsed;
    } catch {
      return INITIAL_DEMO_ADS;
    }
  },

  getPublicAds: (): Ad[] => {
    StorageService.processExpiredAds();
    return StorageService.getAds().filter(a => a.status === AdStatus.APPROVED);
  },

  computeExpiresAt: (createdAt: number, expiryDays?: number): number => {
    const days = expiryDays ?? StorageService.getSettings().adExpiryDays;
    return createdAt + days * MS_PER_DAY;
  },

  processExpiredAds: (): number => {
    const settings = StorageService.getSettings();
    const ads = StorageService.getAds();
    const now = Date.now();
    let changed = 0;
    ads.forEach(ad => {
      if (ad.status !== AdStatus.APPROVED) return;
      const expiresAt = ad.expiresAt || StorageService.computeExpiresAt(ad.createdAt, settings.adExpiryDays);
      if (!ad.expiresAt) ad.expiresAt = expiresAt;
      if (now >= expiresAt) {
        ad.status = AdStatus.EXPIRED;
        changed += 1;
        StorageService.addNotification({
          userId: ad.userId,
          title: 'آگهی منقضی شد',
          message: `آگهی «${ad.title}» پس از ${settings.adExpiryDays} روز منقضی شد. می‌توانید آن را ویرایش و مجدداً ارسال کنید.`,
          type: 'WARNING',
          category: 'expiry',
          link: '/profile?tab=my_ads',
        });
        StorageService.addActivityLog({
          actorRole: 'SYSTEM',
          action: 'AD_EXPIRED',
          targetType: 'AD',
          targetId: ad.id,
          details: `آگهی «${ad.title}» منقضی شد`,
        });
      }
    });
    if (changed > 0) {
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    }
    return changed;
  },

  getAdById: (id: string): Ad | undefined => {
    const ads = StorageService.getAds();
    return ads.find(a => a.id === id);
  },

  saveAd: (ad: Ad) => {
    const ads = StorageService.getAds();
    const settings = StorageService.getSettings();
    const toSave: Ad = {
      ...ad,
      expiresAt: ad.expiresAt || StorageService.computeExpiresAt(ad.createdAt, settings.adExpiryDays),
    };
    const index = ads.findIndex(a => a.id === toSave.id);
    if (index >= 0) {
      ads[index] = toSave;
    } else {
      ads.unshift(toSave);
    }
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  },

  /** Soft-remove by admin/system with mandatory reason (DSA) */
  removeAdWithReason: (
    id: string,
    reason: string,
    actor: { id?: string; name?: string; role: ActivityActor }
  ) => {
    const ads = StorageService.getAds();
    const idx = ads.findIndex(a => a.id === id);
    if (idx < 0) return null;
    const ad = ads[idx];
    ad.status = AdStatus.REMOVED;
    ad.removalReason = reason.trim();
    ad.removedAt = Date.now();
    ad.removedBy = actor.role === 'SYSTEM' ? 'SYSTEM' : actor.role === 'USER' ? 'USER' : 'ADMIN';
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));

    StorageService.addNotification({
      userId: ad.userId,
      title: 'آگهی شما حذف شد',
      message: `آگهی «${ad.title}» حذف شد. دلیل: ${reason.trim()}. می‌توانید اعتراض ثبت کنید.`,
      type: 'ERROR',
      category: 'moderation',
      link: '/profile?tab=my_ads',
    });
    StorageService.addActivityLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: 'AD_REMOVED',
      targetType: 'AD',
      targetId: ad.id,
      details: reason.trim(),
    });
    return ad;
  },

  /** User self-delete with optional sold feedback */
  deleteAdByUser: (
    id: string,
    userId: string,
    soldFeedback?: Ad['soldFeedback']
  ) => {
    const ads = StorageService.getAds();
    const ad = ads.find(a => a.id === id && a.userId === userId);
    if (!ad) return false;
    const remaining = ads.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(remaining));
    StorageService.addActivityLog({
      actorId: userId,
      actorRole: 'USER',
      action: 'AD_USER_DELETED',
      targetType: 'AD',
      targetId: id,
      details: `فروش: ${soldFeedback || 'نامشخص'} — «${ad.title}»`,
    });
    return true;
  },

  deleteAd: (id: string) => {
    const ads = StorageService.getAds().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  },

  incrementAdViews: (id: string) => {
    const ads = StorageService.getAds();
    const ad = ads.find(a => a.id === id);
    if (ad) {
      ad.viewsCount = (ad.viewsCount || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    }
  },

  // Categories
  getCategories: (options?: { includeInactive?: boolean }): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      const all: Category[] = data ? JSON.parse(data) : DEFAULT_CATEGORIES;
      if (options?.includeInactive) return all;
      return all.filter(c => c.isActive !== false);
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategory: (category: Category) => {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const categories: Category[] = raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES];
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  deleteCategory: (id: string) => {
    const raw = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const categories: Category[] = raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES];
    localStorage.setItem(
      STORAGE_KEYS.CATEGORIES,
      JSON.stringify(categories.filter(c => c.id !== id))
    );
  },

  // Cities — stored as ManagedCity[]; migrates legacy string[]
  getCityRecords: (): ManagedCity[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CITIES);
      if (!data) {
        return DEFAULT_CITIES.map(name => ({ name, isActive: true }));
      }
      const parsed = JSON.parse(data) as unknown;
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_CITIES.map(name => ({ name, isActive: true }));
      }
      if (typeof parsed[0] === 'string') {
        const migrated = (parsed as string[]).map(name => ({ name, isActive: true }));
        localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(migrated));
        return migrated;
      }
      return (parsed as ManagedCity[]).map(c => ({
        name: c.name,
        isActive: c.isActive !== false,
      }));
    } catch {
      return DEFAULT_CITIES.map(name => ({ name, isActive: true }));
    }
  },

  saveCityRecords: (cities: ManagedCity[]) => {
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
  },

  /** Active city names for public UI / filters */
  getCities: (options?: { includeInactive?: boolean }): string[] => {
    const records = StorageService.getCityRecords();
    if (options?.includeInactive) return records.map(c => c.name);
    return records.filter(c => c.isActive !== false).map(c => c.name);
  },

  addCity: (city: string) => {
    const cities = StorageService.getCityRecords();
    if (!cities.some(c => c.name === city)) {
      cities.push({ name: city, isActive: true });
      StorageService.saveCityRecords(cities);
    }
  },

  updateCity: (oldName: string, patch: { name?: string; isActive?: boolean }) => {
    const cities = StorageService.getCityRecords();
    const idx = cities.findIndex(c => c.name === oldName);
    if (idx < 0) return;
    const nextName = patch.name?.trim() || cities[idx].name;
    if (nextName !== oldName && cities.some(c => c.name === nextName)) return;
    cities[idx] = {
      name: nextName,
      isActive: patch.isActive !== undefined ? patch.isActive : cities[idx].isActive !== false,
    };
    StorageService.saveCityRecords(cities);
  },

  removeCity: (city: string) => {
    StorageService.saveCityRecords(
      StorageService.getCityRecords().filter(c => c.name !== city)
    );
  },

  /** Replace stored cities with the full default Bundesländer list */
  resetCitiesToDefaults: () => {
    StorageService.saveCityRecords(
      DEFAULT_CITIES.map(name => ({ name, isActive: true }))
    );
  },

  // Users & Auth
  getUsers: (): User[] => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]') as User[];
      return raw.map(u => ({
        ...u,
        accountStatus: u.accountStatus || 'ACTIVE',
      }));
    } catch {
      return [];
    }
  },

  getUserById: (id: string): User | null =>
    StorageService.getUsers().find(u => u.id === id) || null,

  /** Find non-anonymized account that still holds this phone */
  findUserByPhone: (phone: string): User | null => {
    const trimmed = phone.trim();
    return (
      StorageService.getUsers().find(u => {
        if (!u.phone || u.phone.trim() !== trimmed) return false;
        const s = getAccountStatus(u);
        return s !== 'ANONYMIZED' && s !== 'DELETED';
      }) || null
    );
  },

  saveUser: (user: User) => {
    const sanitized: User = {
      id: user.id,
      name: user.name.trim(),
      phone: user.phone?.trim() || '',
      city: user.city?.trim() || undefined,
      role: user.role,
      avatar: sanitizeUserAvatar(user.avatar),
      createdAt: user.createdAt,
      updatedAt: Date.now(),
      savedAdIds: user.savedAdIds,
      accountStatus: user.accountStatus || 'ACTIVE',
      deletionRequestedAt: user.deletionRequestedAt,
      deletionScheduledAt: user.deletionScheduledAt,
      deletionCancelledAt: user.deletionCancelledAt,
      deletedAt: user.deletedAt,
      anonymizedAt: user.anonymizedAt,
      deletionReason: user.deletionReason,
      deletionReasonDetails: user.deletionReasonDetails,
      deactivatedAt: user.deactivatedAt,
      bannedAt: user.bannedAt,
      banReason: user.banReason,
      suspendedAt: user.suspendedAt,
      suspensionReason: user.suspensionReason,
      phoneVerifiedAt: user.phoneVerifiedAt,
    };
    const users = StorageService.getUsers();
    const idx = users.findIndex(u => u.id === sanitized.id);
    if (idx >= 0) {
      users[idx] = sanitized;
    } else {
      users.push(sanitized);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  countActiveAdsForUser: (userId: string): number =>
    StorageService.getAds().filter(
      a => a.userId === userId && ACTIVE_AD_STATUSES.includes(a.status)
    ).length,

  canCreateAd: (userId: string): { ok: boolean; reason?: string } => {
    const user = StorageService.getUserById(userId);
    if (!user) return { ok: false, reason: 'کاربر یافت نشد.' };
    if (getAccountStatus(user) !== 'ACTIVE') {
      return { ok: false, reason: 'حساب شما برای ثبت آگهی فعال نیست.' };
    }
    if (StorageService.countActiveAdsForUser(userId) >= MAX_ACTIVE_ADS_PER_USER) {
      return {
        ok: false,
        reason: `حداکثر ${MAX_ACTIVE_ADS_PER_USER} آگهی فعال/در انتظار مجاز است.`,
      };
    }
    return { ok: true };
  },

  getPhoneRestrictions: (): PhoneRestriction[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PHONE_RESTRICTIONS) || '[]');
    } catch {
      return [];
    }
  },

  isPhoneRestricted: (phone: string): PhoneRestriction | null => {
    const p = phone.trim();
    return StorageService.getPhoneRestrictions().find(r => r.phone === p) || null;
  },

  addPhoneRestriction: (restriction: PhoneRestriction) => {
    const list = StorageService.getPhoneRestrictions().filter(r => r.phone !== restriction.phone);
    list.push(restriction);
    localStorage.setItem(STORAGE_KEYS.PHONE_RESTRICTIONS, JSON.stringify(list));
  },

  getDeletionRequests: (): AccountDeletionRequest[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNT_DELETION_REQUESTS) || '[]');
    } catch {
      return [];
    }
  },

  saveDeletionRequests: (list: AccountDeletionRequest[]) => {
    localStorage.setItem(
      STORAGE_KEYS.ACCOUNT_DELETION_REQUESTS,
      JSON.stringify(list.slice(-500))
    );
  },

  /** Hide public/pending ads when account is paused or pending deletion */
  archiveUserPublicAds: (
    userId: string,
    mode: 'ACCOUNT_DELETION' | 'DEACTIVATION'
  ): number => {
    const ads = StorageService.getAds();
    let n = 0;
    const targetStatus =
      mode === 'ACCOUNT_DELETION'
        ? AdStatus.ARCHIVED_ACCOUNT_DELETION
        : AdStatus.PAUSED;
    const hideable = [AdStatus.APPROVED, AdStatus.PENDING];
    ads.forEach(ad => {
      if (ad.userId !== userId) return;
      if (!hideable.includes(ad.status)) return;
      ad.previousStatus = ad.status;
      ad.status = targetStatus;
      ad.archivedAt = Date.now();
      ad.deletionReason =
        mode === 'ACCOUNT_DELETION' ? 'account_pending_deletion' : 'account_deactivated';
      n += 1;
    });
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    return n;
  },

  /**
   * After restore: archived-for-deletion ads become PAUSED (not auto-public).
   * After reactivation from deactivate: keep PAUSED.
   */
  pauseArchivedDeletionAds: (userId: string): number => {
    const ads = StorageService.getAds();
    let n = 0;
    ads.forEach(ad => {
      if (ad.userId !== userId) return;
      if (ad.status !== AdStatus.ARCHIVED_ACCOUNT_DELETION) return;
      ad.status = AdStatus.PAUSED;
      ad.deletionReason = 'awaiting_manual_republish';
      n += 1;
    });
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    return n;
  },

  requestAccountDeletion: (params: {
    userId: string;
    otpCode: string;
    reason?: AccountDeletionReasonCode;
    reasonDetails?: string;
  }): { ok: boolean; error?: string; scheduledAt?: number } => {
    const user = StorageService.getUserById(params.userId);
    if (!user) return { ok: false, error: 'کاربر یافت نشد.' };

    const status = getAccountStatus(user);
    if (status === 'BANNED' || status === 'SUSPENDED') {
      return {
        ok: false,
        error: 'حساب محدود یا مسدود است و نمی‌تواند از طریق حذف، محدودیت را دور بزند. با پشتیبانی تماس بگیرید.',
      };
    }
    if (status === 'PENDING_DELETION') {
      return { ok: false, error: 'درخواست حذف قبلاً ثبت شده است.' };
    }
    if (status === 'ANONYMIZED' || status === 'DELETED') {
      return { ok: false, error: 'این حساب دیگر قابل حذف نیست.' };
    }
    if (!user.phone) return { ok: false, error: 'شماره موبایل ثبت نشده است.' };

    const otp = OtpService.verifyOtp({
      phone: user.phone,
      purpose: 'account_deletion',
      code: params.otpCode,
    });
    if (!otp.ok) return { ok: false, error: otp.error };

    const now = Date.now();
    const scheduledAt = now + ACCOUNT_DELETION_GRACE_MS;

    const req: AccountDeletionRequest = {
      id: `del-req-${now}`,
      userId: user.id,
      requestedAt: now,
      scheduledFor: scheduledAt,
      reason: params.reason || 'SKIPPED',
      reasonDetails: params.reasonDetails?.trim() || undefined,
      status: 'PENDING',
      createdAt: now,
    };
    const reqs = StorageService.getDeletionRequests();
    // Cancel any older pending for this user
    reqs.forEach(r => {
      if (r.userId === user.id && r.status === 'PENDING') {
        r.status = 'CANCELLED';
        r.cancelledAt = now;
      }
    });
    reqs.push(req);
    StorageService.saveDeletionRequests(reqs);

    StorageService.archiveUserPublicAds(user.id, 'ACCOUNT_DELETION');

    StorageService.saveUser({
      ...user,
      accountStatus: 'PENDING_DELETION',
      deletionRequestedAt: now,
      deletionScheduledAt: scheduledAt,
      deletionCancelledAt: undefined,
      deletionReason: params.reason || 'SKIPPED',
      deletionReasonDetails: params.reasonDetails?.trim() || undefined,
      avatar: undefined,
    });

    StorageService.addNotification({
      userId: user.id,
      title: 'درخواست حذف حساب ثبت شد',
      message: `حساب شما در وضعیت حذف موقت است و در تاریخ برنامه‌ریزی‌شده به‌طور نهایی پردازش می‌شود. تا آن زمان می‌توانید حساب را بازیابی کنید.`,
      type: 'WARNING',
      category: 'system',
      link: '/profile?tab=settings',
    });

    StorageService.addActivityLog({
      actorId: user.id,
      actorName: user.name,
      actorRole: 'USER',
      action: 'account_deletion_requested',
      targetType: 'USER',
      targetId: user.id,
      details: `scheduled=${scheduledAt}; reason=${params.reason || 'SKIPPED'}`,
    });

    return { ok: true, scheduledAt };
  },

  cancelAccountDeletion: (userId: string): { ok: boolean; error?: string } => {
    const user = StorageService.getUserById(userId);
    if (!user) return { ok: false, error: 'کاربر یافت نشد.' };
    if (getAccountStatus(user) !== 'PENDING_DELETION') {
      return { ok: false, error: 'حساب در وضعیت حذف موقت نیست.' };
    }

    const now = Date.now();
    const reqs = StorageService.getDeletionRequests();
    reqs.forEach(r => {
      if (r.userId === userId && r.status === 'PENDING') {
        r.status = 'CANCELLED';
        r.cancelledAt = now;
      }
    });
    StorageService.saveDeletionRequests(reqs);

    StorageService.pauseArchivedDeletionAds(userId);

    StorageService.saveUser({
      ...user,
      accountStatus: 'ACTIVE',
      deletionRequestedAt: undefined,
      deletionScheduledAt: undefined,
      deletionCancelledAt: now,
      deletionReason: undefined,
      deletionReasonDetails: undefined,
    });

    StorageService.addNotification({
      userId,
      title: 'حساب بازیابی شد',
      message:
        'حساب شما فعال شد. آگهی‌های قبلی به‌صورت خودکار منتشر نمی‌شوند؛ از «آگهی‌های من» آن‌ها را مدیریت و در صورت تمایل دوباره منتشر کنید.',
      type: 'SUCCESS',
      category: 'system',
      link: '/profile?tab=my_ads',
    });

    StorageService.addActivityLog({
      actorId: userId,
      actorName: user.name,
      actorRole: 'USER',
      action: 'account_deletion_cancelled',
      targetType: 'USER',
      targetId: userId,
      details: 'account_restored',
    });

    return { ok: true };
  },

  deactivateAccount: (userId: string): { ok: boolean; error?: string } => {
    const user = StorageService.getUserById(userId);
    if (!user) return { ok: false, error: 'کاربر یافت نشد.' };
    const status = getAccountStatus(user);
    if (status === 'BANNED' || status === 'SUSPENDED') {
      return { ok: false, error: 'حساب محدود است و قابل توقف موقت نیست.' };
    }
    if (status !== 'ACTIVE') {
      return { ok: false, error: 'فقط حساب فعال قابل توقف موقت است.' };
    }

    StorageService.archiveUserPublicAds(userId, 'DEACTIVATION');
    StorageService.saveUser({
      ...user,
      accountStatus: 'DEACTIVATED',
      deactivatedAt: Date.now(),
      avatar: undefined,
    });
    StorageService.addActivityLog({
      actorId: userId,
      actorName: user.name,
      actorRole: 'USER',
      action: 'account_deactivated',
      targetType: 'USER',
      targetId: userId,
    });
    StorageService.addNotification({
      userId,
      title: 'حساب موقتاً غیرفعال شد',
      message: 'پروفایل و آگهی‌های شما از دید عموم مخفی شدند. هر زمان می‌توانید حساب را دوباره فعال کنید.',
      type: 'INFO',
      category: 'system',
      link: '/profile?tab=settings',
    });
    return { ok: true };
  },

  reactivateAccount: (userId: string): { ok: boolean; error?: string } => {
    const user = StorageService.getUserById(userId);
    if (!user) return { ok: false, error: 'کاربر یافت نشد.' };
    if (getAccountStatus(user) !== 'DEACTIVATED') {
      return { ok: false, error: 'حساب در وضعیت توقف موقت نیست.' };
    }
    // Ads stay PAUSED — user republishes manually
    StorageService.saveUser({
      ...user,
      accountStatus: 'ACTIVE',
      deactivatedAt: undefined,
    });
    StorageService.addActivityLog({
      actorId: userId,
      actorName: user.name,
      actorRole: 'USER',
      action: 'account_reactivated',
      targetType: 'USER',
      targetId: userId,
    });
    StorageService.addNotification({
      userId,
      title: 'حساب دوباره فعال شد',
      message: 'آگهی‌های شما همچنان غیرفعال‌اند؛ در صورت تمایل آن‌ها را از پروفایل دوباره منتشر کنید.',
      type: 'SUCCESS',
      category: 'system',
      link: '/profile?tab=my_ads',
    });
    return { ok: true };
  },

  changeUserPhone: (params: {
    userId: string;
    newPhone: string;
    otpCode: string;
  }): { ok: boolean; error?: string } => {
    const user = StorageService.getUserById(params.userId);
    if (!user) return { ok: false, error: 'کاربر یافت نشد.' };
    if (getAccountStatus(user) !== 'ACTIVE') {
      return { ok: false, error: 'فقط حساب فعال می‌تواند شماره را تغییر دهد.' };
    }
    const newPhone = params.newPhone.trim();
    if (!newPhone) return { ok: false, error: 'شماره جدید نامعتبر است.' };
    if (StorageService.isPhoneRestricted(newPhone)) {
      return { ok: false, error: 'این شماره مجاز به ثبت نیست.' };
    }
    const holder = StorageService.findUserByPhone(newPhone);
    if (holder && holder.id !== user.id && phoneBlocksNewRegistration(getAccountStatus(holder))) {
      return { ok: false, error: 'این شماره متعلق به حساب فعال دیگری است.' };
    }

    const otp = OtpService.verifyOtp({
      phone: newPhone,
      purpose: 'change_phone',
      code: params.otpCode,
    });
    if (!otp.ok) return { ok: false, error: otp.error };

    StorageService.saveUser({
      ...user,
      phone: newPhone,
      phoneVerifiedAt: Date.now(),
    });
    StorageService.addActivityLog({
      actorId: user.id,
      actorRole: 'USER',
      action: 'phone_changed',
      targetType: 'USER',
      targetId: user.id,
    });
    return { ok: true };
  },

  republishPausedAd: (adId: string, userId: string): { ok: boolean; error?: string } => {
    const ad = StorageService.getAdById(adId);
    if (!ad || ad.userId !== userId) return { ok: false, error: 'آگهی یافت نشد.' };
    if (ad.status !== AdStatus.PAUSED) {
      return { ok: false, error: 'فقط آگهی‌های متوقف‌شده قابل انتشار مجدد هستند.' };
    }
    const user = StorageService.getUserById(userId);
    if (!user || getAccountStatus(user) !== 'ACTIVE') {
      return { ok: false, error: 'حساب برای انتشار فعال نیست.' };
    }
    const limit = StorageService.canCreateAd(userId);
    // republish counts like creating — check after excluding this paused ad conceptually
    const activeCount = StorageService.countActiveAdsForUser(userId);
    if (activeCount >= MAX_ACTIVE_ADS_PER_USER) {
      return { ok: false, error: limit.reason };
    }

    const ads = StorageService.getAds();
    const idx = ads.findIndex(a => a.id === adId);
    if (idx < 0) return { ok: false, error: 'آگهی یافت نشد.' };
    ads[idx] = {
      ...ads[idx],
      status: AdStatus.PENDING,
      previousStatus: undefined,
      archivedAt: undefined,
      deletionReason: undefined,
    };
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    return { ok: true };
  },

  /**
   * Idempotent final processor — call on app boot (like expiry).
   * Anonymizes PII, clears images, frees phone (unless restricted).
   */
  processPendingAccountDeletions: (): number => {
    const now = Date.now();
    let processed = 0;
    const users = StorageService.getUsers();

    users.forEach(user => {
      if (getAccountStatus(user) !== 'PENDING_DELETION') return;
      if (!user.deletionScheduledAt || user.deletionScheduledAt > now) return;

      // Security: banned never frees phone via this path
      if (user.bannedAt || getAccountStatus(user) === 'BANNED') {
        if (user.phone) {
          StorageService.addPhoneRestriction({
            phone: user.phone,
            reason: 'BANNED',
            createdAt: now,
            note: 'Preserved after deletion attempt of banned account',
          });
        }
      }

      const ads = StorageService.getAds();
      ads.forEach(ad => {
        if (ad.userId !== user.id) return;
        // Wipe personal content; keep id/category/price/city for stats shape
        ad.title = '[آگهی حذف‌شده]';
        ad.description = '';
        ad.images = [];
        ad.contactPhone = '';
        ad.showPhone = false;
        ad.allowWhatsapp = false;
        ad.telegramId = undefined;
        ad.showTelegram = false;
        ad.status = AdStatus.REMOVED;
        ad.removalReason = 'account_anonymized';
        ad.removedAt = now;
        ad.removedBy = 'SYSTEM';
        ad.archivedAt = now;
      });
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));

      const phone = user.phone;
      StorageService.saveUser({
        ...user,
        name: 'کاربر حذف‌شده',
        phone: '',
        city: undefined,
        avatar: undefined,
        accountStatus: 'ANONYMIZED',
        anonymizedAt: now,
        deletedAt: now,
        deletionRequestedAt: user.deletionRequestedAt,
        deletionScheduledAt: user.deletionScheduledAt,
        savedAdIds: [],
      });

      const reqs = StorageService.getDeletionRequests();
      reqs.forEach(r => {
        if (r.userId === user.id && r.status === 'PENDING') {
          r.status = 'COMPLETED';
          r.completedAt = now;
        }
      });
      StorageService.saveDeletionRequests(reqs);

      // Clear user notifications
      try {
        const notifs = JSON.parse(
          localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'
        ) as AppNotification[];
        localStorage.setItem(
          STORAGE_KEYS.NOTIFICATIONS,
          JSON.stringify(notifs.filter(n => n.userId !== user.id))
        );
      } catch {
        /* ignore */
      }

      StorageService.addActivityLog({
        actorRole: 'SYSTEM',
        action: 'account_deletion_completed',
        targetType: 'USER',
        targetId: user.id,
        details: phone ? `phone_released` : 'anonymized',
      });
      processed += 1;
    });

    return processed;
  },

  /** @deprecated Prefer requestAccountDeletion — kept for emergency hard wipe */
  deleteUserAccount: (userId: string) => {
    // Soft-path: if active, start deletion without OTP only for legacy callers — redirect to anonymize immediately is wrong.
    // Keep hard-delete for backwards compat but prefer lifecycle.
    const user = StorageService.getUserById(userId);
    if (user && getAccountStatus(user) === 'ACTIVE') {
      StorageService.archiveUserPublicAds(userId, 'ACCOUNT_DELETION');
      const now = Date.now();
      StorageService.saveUser({
        ...user,
        accountStatus: 'PENDING_DELETION',
        deletionRequestedAt: now,
        deletionScheduledAt: now + ACCOUNT_DELETION_GRACE_MS,
        avatar: undefined,
      });
      return;
    }
    const users = StorageService.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    const ads = StorageService.getAds().filter(a => a.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
    const notifs = (JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[])
      .filter(n => n.userId !== userId);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    StorageService.addActivityLog({
      actorId: userId,
      actorRole: 'USER',
      action: 'ACCOUNT_DELETED',
      targetType: 'USER',
      targetId: userId,
      details: 'legacy hard delete',
    });
  },

  getCurrentUser: (): User | null => {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // Bookmarks (Saved Ads)
  getBookmarkedAdIds: (userId?: string): string[] => {
    try {
      const key = `${STORAGE_KEYS.BOOKMARKS}_${userId || 'guest'}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  },

  isAdBookmarked: (adId: string, userId?: string): boolean => {
    const bookmarks = StorageService.getBookmarkedAdIds(userId);
    return bookmarks.includes(adId);
  },

  toggleBookmarkAd: (adId: string, userId?: string): boolean => {
    const key = `${STORAGE_KEYS.BOOKMARKS}_${userId || 'guest'}`;
    const bookmarks = StorageService.getBookmarkedAdIds(userId);
    const exists = bookmarks.includes(adId);
    let updated: string[];
    if (exists) {
      updated = bookmarks.filter(id => id !== adId);
    } else {
      updated = [...bookmarks, adId];
    }
    localStorage.setItem(key, JSON.stringify(updated));
    return !exists;
  },

  toggleBookmark: (adId: string, userId?: string): boolean => {
    return StorageService.toggleBookmarkAd(adId, userId);
  },

  // Recent Views
  getRecentViewedAds: (): Ad[] => {
    try {
      const ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_VIEWS) || '[]') as string[];
      const allAds = StorageService.getAds();
      return ids.map(id => allAds.find(a => a.id === id)).filter((a): a is Ad => Boolean(a));
    } catch {
      return [];
    }
  },

  addRecentViewedAd: (adId: string) => {
    try {
      let ids = JSON.parse(localStorage.getItem(STORAGE_KEYS.RECENT_VIEWS) || '[]') as string[];
      ids = [adId, ...ids.filter(id => id !== adId)].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.RECENT_VIEWS, JSON.stringify(ids));
    } catch {
      // ignore
    }
  },

  // Notifications
  getNotifications: (userId?: string, role?: UserRole): AppNotification[] => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[];
      if (!userId) return all;
      const isStaff = role === UserRole.ADMIN || role === UserRole.EDITOR;
      return all.filter(n => {
        if (n.userId === userId || n.userId === 'ALL') return true;
        if (isStaff && n.userId === 'ADMIN') return true;
        return false;
      });
    } catch {
      return [];
    }
  },

  addNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[];
    const newNotif: AppNotification = {
      ...notif,
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      isRead: false
    };
    all.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all.slice(0, 500)));
  },

  markNotificationRead: (id: string) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[];
    const idx = all.findIndex(n => n.id === id);
    if (idx >= 0) {
      all[idx].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    }
  },

  markAllNotificationsRead: (userId: string, role: UserRole) => {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[];
    all.forEach(n => {
      if (n.userId === userId || n.userId === 'ALL' || ((role === UserRole.ADMIN || role === UserRole.EDITOR) && n.userId === 'ADMIN')) {
        n.isRead = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  deleteNotification: (id: string) => {
    const all = (JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[])
      .filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  // Violation Reports (گزارش‌های تخلف / DSA)
  getViolationReports: (): ViolationReport[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VIOLATION_REPORTS) || '[]');
    } catch {
      return [];
    }
  },

  saveViolationReport: (report: Omit<ViolationReport, 'id' | 'createdAt' | 'status'>) => {
    const reports = StorageService.getViolationReports();
    const newReport: ViolationReport = {
      ...report,
      id: `rep-${Date.now()}`,
      createdAt: Date.now(),
      status: 'PENDING'
    };
    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(reports));

    StorageService.addNotification({
      userId: 'ADMIN',
      title: 'گزارش تخلف جدید (DSA)',
      message: `گزارش جدید برای آگهی «${report.adTitle}» ثبت شد. علت: ${report.reason}`,
      type: 'WARNING',
      category: 'report',
      link: `/admin?tab=reports&reportId=${newReport.id}`
    });

    if (report.reporterUserId) {
      StorageService.addNotification({
        userId: report.reporterUserId,
        title: 'گزارش شما دریافت شد',
        message: `گزارش تخلف برای «${report.adTitle}» ثبت شد و توسط ناظران بررسی می‌شود.`,
        type: 'SUCCESS',
        category: 'report',
        link: '/profile?tab=notifications',
      });
    }

    StorageService.addActivityLog({
      actorId: report.reporterUserId,
      actorRole: 'USER',
      action: 'REPORT_CREATED',
      targetType: 'REPORT',
      targetId: newReport.id,
      details: report.reason,
    });

    return newReport;
  },

  updateViolationReportStatus: (reportId: string, status: 'PENDING' | 'RESOLVED' | 'DISMISSED') => {
    const reports = StorageService.getViolationReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx >= 0) {
      reports[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(reports));
      const rep = reports[idx];
      if (rep.reporterUserId) {
        StorageService.addNotification({
          userId: rep.reporterUserId,
          title: status === 'RESOLVED' ? 'گزارش شما رسیدگی شد' : 'نتیجه بررسی گزارش',
          message:
            status === 'RESOLVED'
              ? `گزارش مربوط به «${rep.adTitle}» رسیدگی شد.`
              : `گزارش مربوط به «${rep.adTitle}» رد شد (بدون تخلف احرازشده).`,
          type: status === 'RESOLVED' ? 'SUCCESS' : 'INFO',
          category: 'report',
          link: '/profile?tab=notifications',
        });
      }
    }
  },

  deleteViolationReport: (reportId: string) => {
    const reports = StorageService.getViolationReports().filter(r => r.id !== reportId);
    localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(reports));
  },

  // Appeals
  getAppeals: (): Appeal[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPEALS) || '[]');
    } catch {
      return [];
    }
  },

  getAppealsByUser: (userId: string): Appeal[] => {
    return StorageService.getAppeals().filter(a => a.userId === userId);
  },

  saveAppeal: (appeal: Omit<Appeal, 'id' | 'createdAt' | 'status'>) => {
    const appeals = StorageService.getAppeals();
    const newAppeal: Appeal = {
      ...appeal,
      id: `apl-${Date.now()}`,
      createdAt: Date.now(),
      status: 'PENDING',
    };
    appeals.unshift(newAppeal);
    localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(appeals));

    StorageService.addNotification({
      userId: 'ADMIN',
      title: 'اعتراض جدید به تصمیم moderation',
      message: `اعتراض روی آگهی «${appeal.adTitle}» ثبت شد.`,
      type: 'WARNING',
      category: 'appeal',
      link: '/admin?tab=appeals',
    });
    StorageService.addNotification({
      userId: appeal.userId,
      title: 'اعتراض شما ثبت شد',
      message: `اعتراض شما برای «${appeal.adTitle}» در صف بررسی قرار گرفت.`,
      type: 'INFO',
      category: 'appeal',
      link: '/profile?tab=appeals',
    });
    StorageService.addActivityLog({
      actorId: appeal.userId,
      actorRole: 'USER',
      action: 'APPEAL_CREATED',
      targetType: 'APPEAL',
      targetId: newAppeal.id,
      details: appeal.message,
    });
    return newAppeal;
  },

  resolveAppeal: (
    appealId: string,
    status: Exclude<AppealStatus, 'PENDING'>,
    adminReply: string,
    actor: { id?: string; name?: string; role: ActivityActor }
  ) => {
    const appeals = StorageService.getAppeals();
    const idx = appeals.findIndex(a => a.id === appealId);
    if (idx < 0) return;
    const appeal = appeals[idx];
    appeal.status = status;
    appeal.adminReply = adminReply.trim();
    appeal.resolvedAt = Date.now();
    localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(appeals));

    if (status === 'ACCEPTED') {
      const ad = StorageService.getAdById(appeal.adId);
      if (ad) {
        ad.status = AdStatus.PENDING;
        ad.rejectionReason = undefined;
        ad.removalReason = undefined;
        ad.removedAt = undefined;
        ad.removedBy = undefined;
        StorageService.saveAd(ad);
      }
    }

    StorageService.addNotification({
      userId: appeal.userId,
      title: status === 'ACCEPTED' ? 'اعتراض پذیرفته شد' : 'اعتراض رد شد',
      message:
        status === 'ACCEPTED'
          ? `اعتراض شما برای «${appeal.adTitle}» پذیرفته شد و آگهی دوباره در صف بررسی است.${adminReply.trim() ? ` توضیح: ${adminReply.trim()}` : ''}`
          : `اعتراض شما برای «${appeal.adTitle}» رد شد.${adminReply.trim() ? ` دلیل: ${adminReply.trim()}` : ''}`,
      type: status === 'ACCEPTED' ? 'SUCCESS' : 'ERROR',
      category: 'appeal',
      link: '/profile?tab=appeals',
    });
    StorageService.addActivityLog({
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      action: status === 'ACCEPTED' ? 'APPEAL_ACCEPTED' : 'APPEAL_REJECTED',
      targetType: 'APPEAL',
      targetId: appealId,
      details: adminReply.trim(),
    });
  },

  // Platform settings
  getSettings: (): PlatformSettings => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!raw) return { ...DEFAULT_PLATFORM_SETTINGS };
      return { ...DEFAULT_PLATFORM_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PLATFORM_SETTINGS };
    }
  },

  saveSettings: (
    settings: PlatformSettings,
    actor?: { id?: string; name?: string; role: ActivityActor }
  ) => {
    const merged = { ...DEFAULT_PLATFORM_SETTINGS, ...settings };
    if (!merged.adExpiryDays || merged.adExpiryDays < 1) merged.adExpiryDays = 60;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    StorageService.addActivityLog({
      actorId: actor?.id,
      actorName: actor?.name,
      actorRole: actor?.role || 'ADMIN',
      action: 'SETTINGS_UPDATED',
      targetType: 'SETTINGS',
      details: `انقضا: ${merged.adExpiryDays} روز`,
    });
  },

  // Activity logs
  getActivityLogs: (): ActivityLog[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS) || '[]');
    } catch {
      return [];
    }
  },

  addActivityLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    const all = StorageService.getActivityLogs();
    all.unshift({
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: Date.now(),
    });
    localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(all.slice(0, 1000)));
  },

  // Support Messages
  getSupportMessages: (): SupportMessage[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPORT_MESSAGES) || '[]');
    } catch {
      return [];
    }
  },

  saveSupportMessage: (msg: Omit<SupportMessage, 'id' | 'createdAt' | 'isReplied'>) => {
    const msgs = StorageService.getSupportMessages();
    const newMsg: SupportMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      createdAt: Date.now(),
      isReplied: false
    };
    msgs.unshift(newMsg);
    localStorage.setItem(STORAGE_KEYS.SUPPORT_MESSAGES, JSON.stringify(msgs));
    StorageService.addNotification({
      userId: 'ADMIN',
      title: 'پیام پشتیبانی جدید',
      message: `موضوع: ${msg.subject}`,
      type: 'INFO',
      category: 'support',
      link: '/admin?tab=support',
    });
  },

  replyToMessage: (id: string, reply: string) => {
    const msgs = StorageService.getSupportMessages();
    const idx = msgs.findIndex(m => m.id === id);
    if (idx >= 0) {
      msgs[idx].reply = reply;
      msgs[idx].isReplied = true;
      localStorage.setItem(STORAGE_KEYS.SUPPORT_MESSAGES, JSON.stringify(msgs));
      const contact = msgs[idx].contact.trim();
      const matched = StorageService.getUsers().find(u => u.phone.trim() === contact);
      if (matched) {
        StorageService.addNotification({
          userId: matched.id,
          title: 'پاسخ پشتیبانی',
          message: `به پیام «${msgs[idx].subject}» پاسخ داده شد.`,
          type: 'SUCCESS',
          category: 'support',
          link: '/contact',
        });
      }
    }
  },

  // Banners
  getBanners: (options?: { includeInactive?: boolean }): Banner[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BANNERS);
      const all: Banner[] = data ? JSON.parse(data) : INITIAL_BANNERS;
      if (options?.includeInactive) return all;
      return all.filter(b => b.isActive !== false);
    } catch {
      return INITIAL_BANNERS;
    }
  },

  saveBanner: (banner: Banner) => {
    const banners = StorageService.getBanners({ includeInactive: true });
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      banners[idx] = banner;
    } else {
      banners.push(banner);
    }
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  },

  deleteBanner: (id: string) => {
    const banners = StorageService.getBanners({ includeInactive: true }).filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  },

  // In-App Chat
  getAdChatMessages: (adId: string): ChatMessage[] => {
    try {
      const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]') as ChatMessage[];
      return allChats.filter(m => m.adId === adId).sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return [];
    }
  },

  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const allChats = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || '[]') as ChatMessage[];
    const newMsg: ChatMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now()
    };
    allChats.push(newMsg);
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(allChats));
    return newMsg;
  },

  // Reset to default seed
  resetToDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.ADS);
    localStorage.removeItem(STORAGE_KEYS.CITIES);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.VIOLATION_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.APPEALS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOGS);
    seedData();
  },

  /** Snapshot for PostgreSQL POST /api/import */
  exportLocalDump: () => ({
    users: StorageService.getUsers(),
    ads: StorageService.getAds(),
    categories: StorageService.getCategories({ includeInactive: true }),
    cities: StorageService.getCityRecords(),
    banners: StorageService.getBanners({ includeInactive: true }),
    settings: StorageService.getSettings(),
    notifications: JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]'),
    violationReports: StorageService.getViolationReports(),
    appeals: StorageService.getAppeals(),
    supportMessages: StorageService.getSupportMessages(),
    accountDeletionRequests: StorageService.getDeletionRequests(),
    phoneRestrictions: StorageService.getPhoneRestrictions(),
  }),

  /** Load bootstrap payload from API into localStorage (keeps sync StorageService API) */
  applyRemoteBootstrap: (data: {
    users?: User[];
    ads?: Ad[];
    categories?: Category[];
    cities?: ManagedCity[];
    banners?: Banner[];
    settings?: PlatformSettings;
    notifications?: AppNotification[];
    violationReports?: ViolationReport[];
    appeals?: Appeal[];
    supportMessages?: SupportMessage[];
    accountDeletionRequests?: AccountDeletionRequest[];
    phoneRestrictions?: PhoneRestriction[];
    activityLogs?: ActivityLog[];
  }) => {
    if (data.users) localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
    if (data.ads) localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(data.ads));
    if (data.categories) localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(data.categories));
    if (data.cities) localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(data.cities));
    if (data.banners) localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(data.banners));
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.notifications) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
    if (data.violationReports) localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(data.violationReports));
    if (data.appeals) localStorage.setItem(STORAGE_KEYS.APPEALS, JSON.stringify(data.appeals));
    if (data.supportMessages) localStorage.setItem(STORAGE_KEYS.SUPPORT_MESSAGES, JSON.stringify(data.supportMessages));
    if (data.activityLogs) localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(data.activityLogs));
    if (data.accountDeletionRequests) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNT_DELETION_REQUESTS, JSON.stringify(data.accountDeletionRequests));
    }
    if (data.phoneRestrictions) {
      localStorage.setItem(STORAGE_KEYS.PHONE_RESTRICTIONS, JSON.stringify(data.phoneRestrictions));
    }
  },
};
