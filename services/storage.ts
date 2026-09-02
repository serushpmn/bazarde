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
  ViolationReport
} from '../types';

const STORAGE_KEYS = {
  USERS: 'bazaar_de_users_v3',
  ADS: 'bazaar_de_ads_v3',
  CURRENT_USER: 'bazaar_de_current_user_v3',
  CITIES: 'bazaar_de_cities_v3',
  CATEGORIES: 'bazaar_de_categories_v3',
  NOTIFICATIONS: 'bazaar_de_notifications_v3',
  SUPPORT_MESSAGES: 'bazaar_de_support_messages_v3',
  BANNERS: 'bazaar_de_banners_v3',
  BOOKMARKS: 'bazaar_de_saved_ads_v3',
  RECENT_VIEWS: 'bazaar_de_recent_views_v3',
  CHATS: 'bazaar_de_chats_v3',
  VIOLATION_REPORTS: 'bazaar_de_violation_reports_v3'
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
    city: 'فرانکفورت (Frankfurt)',
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
    city: 'فرانکفورت (Frankfurt)',
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
    reporterName: 'علی رضایی',
    reporterContact: '+49 176 88776655',
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
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(DEFAULT_CITIES));
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
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
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

  getAdById: (id: string): Ad | undefined => {
    const ads = StorageService.getAds();
    return ads.find(a => a.id === id);
  },

  saveAd: (ad: Ad) => {
    const ads = StorageService.getAds();
    const index = ads.findIndex(a => a.id === ad.id);
    if (index >= 0) {
      ads[index] = ad;
    } else {
      ads.unshift(ad);
    }
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
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
  getCategories: (): Category[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategory: (category: Category) => {
    const categories = StorageService.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  deleteCategory: (id: string) => {
    const categories = StorageService.getCategories().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  // Cities
  getCities: (): string[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CITIES);
      return data ? JSON.parse(data) : DEFAULT_CITIES;
    } catch {
      return DEFAULT_CITIES;
    }
  },

  addCity: (city: string) => {
    const cities = StorageService.getCities();
    if (!cities.includes(city)) {
      cities.push(city);
      localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
    }
  },

  removeCity: (city: string) => {
    const cities = StorageService.getCities().filter(c => c !== city);
    localStorage.setItem(STORAGE_KEYS.CITIES, JSON.stringify(cities));
  },

  // Users & Auth
  getUsers: (): User[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {
      return [];
    }
  },

  saveUser: (user: User) => {
    const users = StorageService.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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
  getNotifications: (userId?: string): AppNotification[] => {
    try {
      const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]') as AppNotification[];
      return all.filter(n => !userId || n.userId === userId || n.userId === 'ALL' || n.userId === 'ADMIN');
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
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
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
      if (n.userId === userId || ((role === UserRole.ADMIN || role === UserRole.EDITOR) && n.userId === 'ADMIN')) {
        n.isRead = true;
      }
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
  },

  // Violation Reports (گزارش‌های تخلف)
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

    // Also send an admin notification with link directly to report in admin panel
    StorageService.addNotification({
      userId: 'ADMIN',
      title: 'گزارش تخلف جدید',
      message: `گزارش جدید برای آگهی «${report.adTitle}» ثبت شد. علت: ${report.reason}`,
      type: 'WARNING',
      link: `/admin?tab=reports&reportId=${newReport.id}`
    });

    return newReport;
  },

  updateViolationReportStatus: (reportId: string, status: 'PENDING' | 'RESOLVED' | 'DISMISSED') => {
    const reports = StorageService.getViolationReports();
    const idx = reports.findIndex(r => r.id === reportId);
    if (idx >= 0) {
      reports[idx].status = status;
      localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(reports));
    }
  },

  deleteViolationReport: (reportId: string) => {
    const reports = StorageService.getViolationReports().filter(r => r.id !== reportId);
    localStorage.setItem(STORAGE_KEYS.VIOLATION_REPORTS, JSON.stringify(reports));
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
  },

  replyToMessage: (id: string, reply: string) => {
    const msgs = StorageService.getSupportMessages();
    const idx = msgs.findIndex(m => m.id === id);
    if (idx >= 0) {
      msgs[idx].reply = reply;
      msgs[idx].isReplied = true;
      localStorage.setItem(STORAGE_KEYS.SUPPORT_MESSAGES, JSON.stringify(msgs));
    }
  },

  // Banners
  getBanners: (): Banner[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BANNERS) || '[]');
    } catch {
      return INITIAL_BANNERS;
    }
  },

  saveBanner: (banner: Banner) => {
    const banners = StorageService.getBanners();
    const idx = banners.findIndex(b => b.id === banner.id);
    if (idx >= 0) {
      banners[idx] = banner;
    } else {
      banners.push(banner);
    }
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  },

  deleteBanner: (id: string) => {
    const banners = StorageService.getBanners().filter(b => b.id !== id);
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
    seedData();
  }
};
