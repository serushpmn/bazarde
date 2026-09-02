export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}

export enum AdStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'USED' | 'FOR_PARTS';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  subcategories: SubCategory[];
}

export interface AdAttribute {
  label: string;
  value: string;
}

export interface Ad {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number; // Numeric amount
  currency?: 'EUR' | 'TOMAN'; // EUR (€) or TOMAN (تومان)
  isNegotiable?: boolean;
  isFree?: boolean;
  isUrgent?: boolean;
  isPromoted?: boolean;
  condition?: ItemCondition;
  city: string; // German City or State (e.g. برلین, مونیخ, فرانکفورت)
  state?: string; // German Federal State (Bundesland)
  district?: string; // German district or PLZ (e.g. Mitte, Charlottenburg, Schwabing, 10115)
  categoryId: string;
  subCategoryId?: string;
  images: string[];
  status: AdStatus;
  createdAt: number;
  contactPhone: string;
  whatsappPhone?: string;
  allowWhatsapp?: boolean;
  rejectionReason?: string;
  viewsCount?: number;
  isVerifiedSeller?: boolean;
  attributes?: Record<string, string>;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  role: UserRole;
  avatar?: string;
  createdAt?: number;
  savedAdIds?: string[];
  password?: string;
}

export interface AppNotification {
  id: string;
  userId: string; // User ID or 'ADMIN'
  title?: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  isRead: boolean;
  createdAt: number;
  link?: string;
}

export interface ViolationReport {
  id: string;
  adId: string;
  adTitle: string;
  adCity: string;
  adPrice: number;
  adImage?: string;
  adUserId: string;
  reporterName?: string;
  reporterContact?: string;
  reason: string;
  details?: string;
  createdAt: number;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export interface SupportMessage {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  createdAt: number;
  reply?: string;
  isReplied: boolean;
}

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string;
  link?: string;
  position: 'HOME_TOP' | 'HOME_MIDDLE' | 'SIDEBAR';
  altText?: string;
}

export interface ChatMessage {
  id: string;
  adId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

// German States (Bundesländer) and Major Cities
export interface CityData {
  name: string;
  germanName: string;
  province: string; // State / Bundesland
  popularDistricts: string[];
}

export const CITIES_DATA: CityData[] = [
  {
    name: 'برلین (Berlin)',
    germanName: 'Berlin',
    province: 'برلین (Berlin)',
    popularDistricts: ['Mitte', 'Charlottenburg', 'Kreuzberg', 'Neukölln', 'Prenzlauer Berg', 'Friedrichshain', 'Schöneberg', 'Steglitz', 'Spandau', 'Pankow']
  },
  {
    name: 'مونیخ (München)',
    germanName: 'München',
    province: 'بایرن (Bayern)',
    popularDistricts: ['Schwabing', 'Maxvorstadt', 'Sendling', 'Bogenhausen', 'Neuhausen', 'Haidhausen', 'Giesing', 'Pasing']
  },
  {
    name: 'فرانکفورت (Frankfurt)',
    germanName: 'Frankfurt am Main',
    province: 'هسن (Hessen)',
    popularDistricts: ['Innenstadt', 'Westend', 'Nordend', 'Sachsenhausen', 'Bornheim', 'Bockenheim', 'Gallus', 'Höchst']
  },
  {
    name: 'کلن (Köln)',
    germanName: 'Köln',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Altstadt', 'Ehrenfeld', 'Nippes', 'Lindenthal', 'Sülz', 'Deutz', 'Mülheim', 'Rodenkirchen']
  },
  {
    name: 'هامبورگ (Hamburg)',
    germanName: 'Hamburg',
    province: 'هامبورگ (Hamburg)',
    popularDistricts: ['Altona', 'Eimsbüttel', 'Wandsbek', 'Hamburg-Nord', 'St. Pauli', 'Winterhude', 'Harburg', 'Bergedorf']
  },
  {
    name: 'دوسلدورف (Düsseldorf)',
    germanName: 'Düsseldorf',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Altstadt', 'Stadtmitte', 'Pempelfort', 'Bilk', 'Oberkassel', 'Derendorf', 'Flingern', 'Benrath']
  },
  {
    name: 'اشتوتگارت (Stuttgart)',
    germanName: 'Stuttgart',
    province: 'بادن-وورتمبرگ (Baden-Württemberg)',
    popularDistricts: ['Stuttgart-Mitte', 'Stuttgart-West', 'Stuttgart-Süd', 'Bad Cannstatt', 'Degerloch', 'Vaihingen', 'Zuffenhausen']
  },
  {
    name: 'هانوفر (Hannover)',
    germanName: 'Hannover',
    province: 'نیدرزاکسن (Niedersachsen)',
    popularDistricts: ['Mitte', 'List', 'Linden', 'Nordstadt', 'Südstadt', 'Döhren', 'Herrenhausen']
  },
  {
    name: 'نورنبرگ (Nürnberg)',
    germanName: 'Nürnberg',
    province: 'بایرن (Bayern)',
    popularDistricts: ['Mitte', 'Gostenhof', 'St. Johannis', 'Erlenstegen', 'Mögeldorf', 'Langwasser']
  },
  {
    name: 'لایپزیگ (Leipzig)',
    germanName: 'Leipzig',
    province: 'زاکسن (Sachsen)',
    popularDistricts: ['Zentrum', 'Plagwitz', 'Connewitz', 'Südvorstadt', 'Gohlis', 'Reudnitz']
  },
  {
    name: 'دورتموند (Dortmund)',
    germanName: 'Dortmund',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Innenstadt-West', 'Innenstadt-Ost', 'Hörde', 'Hombruch', 'Aplerbeck']
  },
  {
    name: 'اسن (Essen)',
    germanName: 'Essen',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Stadtkern', 'Rüttenscheid', 'Holsterhausen', 'Bredeney', 'Werden']
  },
  {
    name: 'برمن (Bremen)',
    germanName: 'Bremen',
    province: 'برمن (Bremen)',
    popularDistricts: ['Mitte', 'Neustadt', 'Findorff', 'Schwachhausen', 'Östliche Vorstadt']
  },
  {
    name: 'درسدن (Dresden)',
    germanName: 'Dresden',
    province: 'زاکسن (Sachsen)',
    popularDistricts: ['Altstadt', 'Neustadt', 'Blasewitz', 'Plauen', 'Striesen']
  },
  {
    name: 'بن (Bonn)',
    germanName: 'Bonn',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Bonn-Zentrum', 'Bad Godesberg', 'Beuel', 'Poppelsdorf', 'Kessenich']
  },
  {
    name: 'مانهایم (Mannheim)',
    germanName: 'Mannheim',
    province: 'بادن-وورتمبرگ (Baden-Württemberg)',
    popularDistricts: ['Innenstadt/Jungbusch', 'Neckarstadt', 'Oststadt', 'Schwetzingerstadt', 'Lindenhof']
  },
  {
    name: 'کارلسروهه (Karlsruhe)',
    germanName: 'Karlsruhe',
    province: 'بادن-وورتمبرگ (Baden-Württemberg)',
    popularDistricts: ['Innenstadt-Ost', 'Innenstadt-West', 'Südweststadt', 'Durlach', 'Weststadt']
  },
  {
    name: 'ویسبادن (Wiesbaden)',
    germanName: 'Wiesbaden',
    province: 'هسن (Hessen)',
    popularDistricts: ['Mitte', 'Biebrich', 'Sonnenberg', 'Rheingauviertel', 'Schierstein']
  },
  {
    name: 'مونستر (Münster)',
    germanName: 'Münster',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Mitte', 'Mauritz', 'Kreuzviertel', 'Sentrup', 'Hiltrup']
  },
  {
    name: 'آخن (Aachen)',
    germanName: 'Aachen',
    province: 'نوردراین-وستفالن (NRW)',
    popularDistricts: ['Aachen-Mitte', 'Laurensberg', 'Richterich', 'Brand', 'Haaren']
  },
  {
    name: 'هایدلبرگ (Heidelberg)',
    germanName: 'Heidelberg',
    province: 'بادن-وورتمبرگ (Baden-Württemberg)',
    popularDistricts: ['Altstadt', 'Bergheim', 'Neuenheim', 'Handschuhsheim', 'Weststadt']
  },
  {
    name: 'ماینتس (Mainz)',
    germanName: 'Mainz',
    province: 'راینلاند-فالتس (Rheinland-Pfalz)',
    popularDistricts: ['Altstadt', 'Neustadt', 'Gonsenheim', 'Bretzenheim']
  },
  {
    name: 'زاربروکن (Saarbrücken)',
    germanName: 'Saarbrücken',
    province: 'زارلاند (Saarland)',
    popularDistricts: ['Alt-Saarbrücken', 'St. Johann', 'St. Arnual']
  },
  {
    name: 'کیل (Kiel)',
    germanName: 'Kiel',
    province: 'اشلسویگ-هولشتاین (Schleswig-Holstein)',
    popularDistricts: ['Mitte', 'Düsternbrook', 'Wik', 'Ravensberg']
  }
];

export const DEFAULT_CITIES = CITIES_DATA.map(c => c.name);

// Categories for Classifieds in Germany (Farsi-German community & second hand)
export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'real-estate',
    name: 'املاک و مسکن در آلمان',
    slug: 'real-estate',
    icon: 'Home',
    subcategories: [
      { id: 're-rent-long', name: 'اجاره مسکونی بلندمدت (Miete)', slug: 'long-term-rent' },
      { id: 're-rent-temp', name: 'اجاره موقت / سابلت (Zwischenmiete)', slug: 'zwischenmiete' },
      { id: 're-wg', name: 'هم‌خانه‌ای و اتاق (WG-Zimmer)', slug: 'wg-zimmer' },
      { id: 're-buy-res', name: 'خرید و فروش خانه و آپارتمان (Kauf)', slug: 'residential-buy' },
      { id: 're-commercial', name: 'دفتر، مغازه و تجاری (Gewerbe)', slug: 'commercial' },
      { id: 're-garage', name: 'پارکینگ و انبار (Stellplatz / Garage)', slug: 'garage-parking' }
    ]
  },
  {
    id: 'vehicles',
    name: 'وسایل نقلیه و خودرو',
    slug: 'vehicles',
    icon: 'Car',
    subcategories: [
      { id: 'v-cars', name: 'خودرو سواری (PKW / Autos)', slug: 'cars' },
      { id: 'v-motorcycles', name: 'موتورسیکلت و اسکوتر (Motorräder)', slug: 'motorcycles' },
      { id: 'v-bicycles', name: 'دوچرخه و دوچرخه برقی (Fahrräder & E-Bikes)', slug: 'bicycles' },
      { id: 'v-escooter', name: 'اسکوتر برقی (E-Scooter)', slug: 'e-scooter' },
      { id: 'v-parts', name: 'لوازم یدکی و لاستیک (Autoteile & Reifen)', slug: 'auto-parts' }
    ]
  },
  {
    id: 'digital',
    name: 'کالای دیجیتال و الکترونیک',
    slug: 'digital',
    icon: 'Smartphone',
    subcategories: [
      { id: 'd-mobile', name: 'موبایل و گوشی هوشمند (Smartphones)', slug: 'mobile-phones' },
      { id: 'd-laptop', name: 'لپ‌تاپ و کامپیوتر (Notebooks & PCs)', slug: 'laptops-computers' },
      { id: 'd-tablet', name: 'تبلت و آیپد (Tablets & iPads)', slug: 'tablets' },
      { id: 'd-gaming', name: 'کنسول بازی و گیمینگ (PlayStation, Xbox, PC)', slug: 'gaming' },
      { id: 'd-tv-audio', name: 'تلویزیون و سیستم صوتی (TV & Audio)', slug: 'tv-audio' },
      { id: 'd-cameras', name: 'دوربین عکاسی و فیلمبرداری (Foto & Video)', slug: 'cameras' },
      { id: 'd-accessories', name: 'لوازم جانبی و مانیتور (Zubehör)', slug: 'accessories' }
    ]
  },
  {
    id: 'home-appliances',
    name: 'خانه، لوازم برقی و مبلمان',
    slug: 'home-appliances',
    icon: 'Sofa',
    subcategories: [
      { id: 'h-furniture', name: 'مبلمان، میز و صندلی (Möbel & Tische)', slug: 'furniture' },
      { id: 'h-bed', name: 'سرویس خواب و کمد (Betten & Schränke)', slug: 'beds-wardrobes' },
      { id: 'h-kitchen', name: 'آشپزخانه و وسایل پخت‌وپز (Küche & Geschirr)', slug: 'kitchen' },
      { id: 'h-major', name: 'یخچال، ماشین لباسشویی و ظرفشویی', slug: 'major-appliances' },
      { id: 'h-small', name: 'لوازم برقی کوچک و جاروبرقی', slug: 'small-appliances' },
      { id: 'h-decor', name: 'فرش، دکوراسیون و روشنایی (Deko & Lampen)', slug: 'decor-lighting' },
      { id: 'h-garden', name: 'تجهیزات باغچه و بالکن (Garten & Balkon)', slug: 'garden' }
    ]
  },
  {
    id: 'services',
    name: 'خدمات، مشاوره و آموزش',
    slug: 'services',
    icon: 'Wrench',
    subcategories: [
      { id: 's-translation', name: 'ترجمه رسمی و امور دارالترجمه', slug: 'translation' },
      { id: 's-consulting', name: 'مشاوره مهاجرت، اقامت و بیمه', slug: 'consulting-insurance' },
      { id: 's-transport', name: 'اسباب‌کشی و حمل‌ونقل (Umzug & Transport)', slug: 'moving-transport' },
      { id: 's-tech', name: 'تعمیرات کامپیوتر، موبایل و فنی', slug: 'technical-repairs' },
      { id: 's-language', name: 'تدریس زبان آلمانی / انگلیسی و دروس', slug: 'language-tutoring' },
      { id: 's-beauty', name: 'خدمات زیبایی، آرایشگری و مراقبت', slug: 'beauty-services' },
      { id: 's-cleaning', name: 'خدمات نظافت و خانه‌داری (Reinigung)', slug: 'cleaning' }
    ]
  },
  {
    id: 'jobs',
    name: 'استخدام و فرصت‌های شغلی',
    slug: 'jobs',
    icon: 'Briefcase',
    subcategories: [
      { id: 'j-fulltime', name: 'تمام وقت (Vollzeit)', slug: 'full-time' },
      { id: 'j-parttime', name: 'پاره وقت (Teilzeit)', slug: 'part-time' },
      { id: 'j-minijob', name: 'مینی‌جاب و کارهای دانشجویی (Minijob)', slug: 'minijob' },
      { id: 'j-ausbildung', name: 'آوسبیلدونگ و کارآموزی (Ausbildung/Praktikum)', slug: 'ausbildung' },
      { id: 'j-gastronomy', name: 'رستوران، کافه و هتل (Gastronomie)', slug: 'gastronomy' },
      { id: 'j-it', name: 'برنامه‌نویسی و فناوری اطلاعات (IT & Tech)', slug: 'it-tech' }
    ]
  },
  {
    id: 'personal-goods',
    name: 'وسایل شخصی و مد',
    slug: 'personal-goods',
    icon: 'Shirt',
    subcategories: [
      { id: 'p-women', name: 'پوشاک و کفش زنانه (Damenbekleidung)', slug: 'women-clothing' },
      { id: 'p-men', name: 'پوشاک و کفش مردانه (Herrenbekleidung)', slug: 'men-clothing' },
      { id: 'p-kids', name: 'لوازم نوزاد و کودک (Baby & Kinder)', slug: 'baby-kids' },
      { id: 'p-watches', name: 'ساعت، طلا و زیورآلات (Schmuck & Uhren)', slug: 'watches-jewelry' },
      { id: 'p-bags', name: 'کیف و چمدان مسافرتی (Taschen & Koffer)', slug: 'bags-suitcases' },
      { id: 'p-beauty', name: 'عطر و لوازم آرایشی (Parfüm & Kosmetik)', slug: 'beauty-perfume' }
    ]
  },
  {
    id: 'leisure',
    name: 'سرگرمی، کتاب و هنر',
    slug: 'leisure',
    icon: 'Gamepad2',
    subcategories: [
      { id: 'l-books', name: 'کتاب و رمان فارسی / آلمانی (Bücher)', slug: 'books' },
      { id: 'l-music', name: 'ساز و آلات موسیقی (Musikinstrumente)', slug: 'music-instruments' },
      { id: 'l-sports', name: 'تجهیزات ورزشی و بدنسازی (Sportgeräte)', slug: 'sports-fitness' },
      { id: 'l-tickets', name: 'بلیط کنسرت، رویداد و سفر (Tickets)', slug: 'tickets' },
      { id: 'l-pets', name: 'حیوانات خانگی و ملزومات (Haustiere)', slug: 'pets' },
      { id: 'l-handcraft', name: 'صنایع دستی و سنتی ایرانی', slug: 'handcrafts' }
    ]
  }
];
