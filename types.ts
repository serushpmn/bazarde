export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR'
}

export enum AdStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  REMOVED = 'REMOVED',
  /** Hidden while account paused or after restore — not public until user republishes */
  PAUSED = 'PAUSED',
  /** Hidden because account entered pending deletion */
  ARCHIVED_ACCOUNT_DELETION = 'ARCHIVED_ACCOUNT_DELETION',
}

/** Account lifecycle (separate from ban/suspension) */
export type AccountStatus =
  | 'ACTIVE'
  | 'PENDING_DELETION'
  | 'DEACTIVATED'
  | 'SUSPENDED'
  | 'BANNED'
  | 'DELETED'
  | 'ANONYMIZED';

export type OtpPurpose =
  | 'account_deletion'
  | 'change_phone'
  | 'account_reactivation';

export type AccountDeletionReasonCode =
  | 'NO_LONGER_NEED'
  | 'NOT_FOUND_WHAT_LOOKING'
  | 'BAD_EXPERIENCE'
  | 'TOO_MANY_NOTIFICATIONS'
  | 'CREATED_ANOTHER_ACCOUNT'
  | 'TECHNICAL_PROBLEMS'
  | 'OTHER'
  | 'SKIPPED';

export type AccountDeletionRequestStatus = 'PENDING' | 'CANCELLED' | 'COMPLETED' | 'FAILED';

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  requestedAt: number;
  scheduledFor: number;
  cancelledAt?: number;
  completedAt?: number;
  reason?: AccountDeletionReasonCode;
  reasonDetails?: string;
  status: AccountDeletionRequestStatus;
  createdAt: number;
}

export interface OtpChallenge {
  id: string;
  phone: string;
  purpose: OtpPurpose;
  /** Demo SPA: plaintext code; production would store hash only */
  code: string;
  expiresAt: number;
  consumedAt?: number;
  attempts: number;
  createdAt: number;
  userId?: string;
}

/** Phone numbers that must not register new accounts (e.g. permanent ban) */
export interface PhoneRestriction {
  phone: string;
  reason: 'BANNED' | 'ABUSE' | 'OTHER';
  createdAt: number;
  note?: string;
}

export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'USED' | 'FOR_PARTS';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // Lucide icon name
  subcategories: SubCategory[];
  /** When false, hidden from public listing/new-ad. Default true. */
  isActive?: boolean;
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
  expiresAt?: number;
  contactPhone: string;
  showPhone?: boolean;
  allowWhatsapp?: boolean;
  telegramId?: string;
  showTelegram?: boolean;
  rejectionReason?: string;
  removalReason?: string;
  removedAt?: number;
  removedBy?: 'USER' | 'ADMIN' | 'SYSTEM';
  soldFeedback?: 'SOLD' | 'NOT_SOLD' | 'PREFER_NOT_SAY';
  viewsCount?: number;
  isVerifiedSeller?: boolean;
  attributes?: Record<string, string>;
  /** Status before pause / account-deletion archive (for restore → PAUSED) */
  previousStatus?: AdStatus;
  archivedAt?: number;
  deletionReason?: string;
}

export interface User {
  id: string;
  name: string;
  /** Primary contact — only essential personal data stored (GDPR minimization). Empty after anonymization. */
  phone: string;
  city?: string;
  role: UserRole;
  avatar?: string;
  createdAt?: number;
  updatedAt?: number;
  savedAdIds?: string[];
  /** Lifecycle status; missing ⇒ ACTIVE (legacy records) */
  accountStatus?: AccountStatus;
  deletionRequestedAt?: number;
  deletionScheduledAt?: number;
  deletionCancelledAt?: number;
  deletedAt?: number;
  anonymizedAt?: number;
  deletionReason?: AccountDeletionReasonCode;
  deletionReasonDetails?: string;
  deactivatedAt?: number;
  bannedAt?: number;
  banReason?: string;
  suspendedAt?: number;
  suspensionReason?: string;
  phoneVerifiedAt?: number;
}

export interface AppNotification {
  id: string;
  userId: string; // User ID, 'ADMIN', or 'ALL'
  title?: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARNING';
  isRead: boolean;
  createdAt: number;
  link?: string;
  category?: 'moderation' | 'report' | 'appeal' | 'expiry' | 'support' | 'system';
}

export interface ViolationReport {
  id: string;
  adId: string;
  adTitle: string;
  adCity: string;
  adPrice: number;
  adImage?: string;
  adUserId: string;
  reporterUserId?: string;
  reason: string;
  details?: string;
  createdAt: number;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
}

export type AppealType = 'REJECTION' | 'REMOVAL';
export type AppealStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Appeal {
  id: string;
  adId: string;
  adTitle: string;
  userId: string;
  type: AppealType;
  originalReason: string;
  message: string;
  status: AppealStatus;
  adminReply?: string;
  createdAt: number;
  resolvedAt?: number;
}

export type ActivityActor = 'USER' | 'ADMIN' | 'EDITOR' | 'SYSTEM';

export interface ActivityLog {
  id: string;
  actorId?: string;
  actorName?: string;
  actorRole?: ActivityActor;
  action: string;
  targetType: 'AD' | 'USER' | 'REPORT' | 'APPEAL' | 'SETTINGS' | 'SYSTEM';
  targetId?: string;
  details?: string;
  createdAt: number;
}

export interface PlatformSettings {
  adExpiryDays: number;
  bannedItems: string[];
  publishingRules: string;
  privacyPolicy: string;
  reportReasons: string[];
  rejectReasonTemplates: string[];
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
  /** When false, hidden from home slider. Default true. */
  isActive?: boolean;
}

/** City/state entry managed in admin (supports rename + disable) */
export interface ManagedCity {
  name: string;
  isActive?: boolean;
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

const PROVINCES = {
  BW: 'بادن-وورتمبرگ (Baden-Württemberg)',
  BY: 'بایرن (Bayern / Bavaria)',
  BE: 'برلین (Berlin)',
  BB: 'براندنبورگ (Brandenburg)',
  HB: 'برمن (Bremen)',
  HH: 'هامبورگ (Hamburg)',
  HE: 'هسن (Hessen)',
  MV: 'مکلنبورگ-فورپومرن (Mecklenburg-Vorpommern)',
  NI: 'نیدرزاکسن (Niedersachsen / Lower Saxony)',
  NW: 'نوردراین-وستفالن (Nordrhein-Westfalen / NRW)',
  RP: 'راینلاند-فالتس (Rheinland-Pfalz)',
  SL: 'زارلاند (Saarland)',
  SN: 'زاکسن (Sachsen / Saxony)',
  ST: 'زاکسن-آنهالت (Sachsen-Anhalt)',
  SH: 'شلسویگ-هولشتاین (Schleswig-Holstein)',
  TH: 'تورینگن (Thüringen)',
} as const;

const city = (
  persian: string,
  german: string,
  province: string,
  popularDistricts: string[] = []
): CityData => ({
  name: `${persian} (${german})`,
  germanName: german,
  province,
  popularDistricts,
});

/** ۱۶ ایالت آلمان + شهرهای اصلی (و مناطق مهم برلین/هامبورگ) */
export const CITIES_DATA: CityData[] = [
  // 1. Baden-Württemberg
  city('اشتوتگارت', 'Stuttgart', PROVINCES.BW),
  city('مانهایم', 'Mannheim', PROVINCES.BW),
  city('کارلسروهه', 'Karlsruhe', PROVINCES.BW),
  city('فرایبورگ', 'Freiburg im Breisgau', PROVINCES.BW),
  city('هایدلبرگ', 'Heidelberg', PROVINCES.BW),
  city('هایلبرون', 'Heilbronn', PROVINCES.BW),
  city('فورتسهایم', 'Pforzheim', PROVINCES.BW),
  city('اولم', 'Ulm', PROVINCES.BW),
  city('رویتلینگن', 'Reutlingen', PROVINCES.BW),
  city('توبینگن', 'Tübingen', PROVINCES.BW),

  // 2. Bayern
  city('مونیخ', 'München', PROVINCES.BY),
  city('نورنبرگ', 'Nürnberg', PROVINCES.BY),
  city('آگسبورگ', 'Augsburg', PROVINCES.BY),
  city('رگنسبورگ', 'Regensburg', PROVINCES.BY),
  city('اینگولشتات', 'Ingolstadt', PROVINCES.BY),
  city('وورتسبورگ', 'Würzburg', PROVINCES.BY),
  city('فورت', 'Fürth', PROVINCES.BY),
  city('ارلانگن', 'Erlangen', PROVINCES.BY),
  city('بامبرگ', 'Bamberg', PROVINCES.BY),
  city('بایرویت', 'Bayreuth', PROVINCES.BY),

  // 3. Berlin (city-state)
  city('برلین', 'Berlin', PROVINCES.BE, [
    'Mitte',
    'Charlottenburg',
    'Kreuzberg',
    'Neukölln',
    'Friedrichshain',
    'Prenzlauer Berg',
    'Spandau',
    'Steglitz',
    'Tempelhof',
    'Köpenick',
  ]),

  // 4. Brandenburg
  city('پوتسدام', 'Potsdam', PROVINCES.BB),
  city('کوتبوس', 'Cottbus', PROVINCES.BB),
  city('براندنبورگ آن در هافل', 'Brandenburg an der Havel', PROVINCES.BB),
  city('فرانکفورت اودر', 'Frankfurt (Oder)', PROVINCES.BB),
  city('اورانینبورگ', 'Oranienburg', PROVINCES.BB),
  city('ابرسوالده', 'Eberswalde', PROVINCES.BB),
  city('فالکنزه', 'Falkensee', PROVINCES.BB),
  city('برناو', 'Bernau bei Berlin', PROVINCES.BB),
  city('کونیگز ووسترهاوزن', 'Königs Wusterhausen', PROVINCES.BB),
  city('زنفتنبرگ', 'Senftenberg', PROVINCES.BB),

  // 5. Bremen (city-state)
  city('برمن', 'Bremen', PROVINCES.HB),
  city('برمرهافن', 'Bremerhaven', PROVINCES.HB),

  // 6. Hamburg (city-state)
  city('هامبورگ', 'Hamburg', PROVINCES.HH, [
    'Hamburg-Mitte',
    'Altona',
    'Eimsbüttel',
    'Hamburg-Nord',
    'Wandsbek',
    'Harburg',
    'Bergedorf',
  ]),

  // 7. Hessen
  city('فرانکفورت', 'Frankfurt am Main', PROVINCES.HE),
  city('ویسبادن', 'Wiesbaden', PROVINCES.HE),
  city('کاسل', 'Kassel', PROVINCES.HE),
  city('دارمشتات', 'Darmstadt', PROVINCES.HE),
  city('اوفنباخ', 'Offenbach am Main', PROVINCES.HE),
  city('هاناو', 'Hanau', PROVINCES.HE),
  city('گیسن', 'Gießen', PROVINCES.HE),
  city('ماربورگ', 'Marburg', PROVINCES.HE),
  city('فولدا', 'Fulda', PROVINCES.HE),
  city('روسلسهایم', 'Rüsselsheim am Main', PROVINCES.HE),

  // 8. Mecklenburg-Vorpommern
  city('روستوک', 'Rostock', PROVINCES.MV),
  city('شورین', 'Schwerin', PROVINCES.MV),
  city('نوی‌براندنبورگ', 'Neubrandenburg', PROVINCES.MV),
  city('اشترالزوند', 'Stralsund', PROVINCES.MV),
  city('گرایفسوالد', 'Greifswald', PROVINCES.MV),
  city('ویسمار', 'Wismar', PROVINCES.MV),
  city('گوسترو', 'Güstrow', PROVINCES.MV),
  city('وارن', 'Waren (Müritz)', PROVINCES.MV),
  city('نوی‌اشترلیتس', 'Neustrelitz', PROVINCES.MV),
  city('پاسه‌والک', 'Pasewalk', PROVINCES.MV),

  // 9. Niedersachsen
  city('هانوفر', 'Hannover', PROVINCES.NI),
  city('براونشوایگ', 'Braunschweig', PROVINCES.NI),
  city('اولدنبورگ', 'Oldenburg', PROVINCES.NI),
  city('اوسنابروک', 'Osnabrück', PROVINCES.NI),
  city('ولفسبورگ', 'Wolfsburg', PROVINCES.NI),
  city('گوتینگن', 'Göttingen', PROVINCES.NI),
  city('هیلدسهایم', 'Hildesheim', PROVINCES.NI),
  city('زالتس‌گیتر', 'Salzgitter', PROVINCES.NI),
  city('ویلهلمسهافن', 'Wilhelmshaven', PROVINCES.NI),
  city('لونبورگ', 'Lüneburg', PROVINCES.NI),

  // 10. Nordrhein-Westfalen
  city('کلن', 'Köln', PROVINCES.NW),
  city('دوسلدورف', 'Düsseldorf', PROVINCES.NW),
  city('دورتموند', 'Dortmund', PROVINCES.NW),
  city('اسن', 'Essen', PROVINCES.NW),
  city('دویسبورگ', 'Duisburg', PROVINCES.NW),
  city('بوخوم', 'Bochum', PROVINCES.NW),
  city('ووپرتال', 'Wuppertal', PROVINCES.NW),
  city('بیله‌فلد', 'Bielefeld', PROVINCES.NW),
  city('بن', 'Bonn', PROVINCES.NW),
  city('مونستر', 'Münster', PROVINCES.NW),

  // 11. Rheinland-Pfalz
  city('ماینتس', 'Mainz', PROVINCES.RP),
  city('لودویگسهافن', 'Ludwigshafen am Rhein', PROVINCES.RP),
  city('کوبلنتس', 'Koblenz', PROVINCES.RP),
  city('تریر', 'Trier', PROVINCES.RP),
  city('کایزرسلاوترن', 'Kaiserslautern', PROVINCES.RP),
  city('وورمس', 'Worms', PROVINCES.RP),
  city('نوی‌اشتات', 'Neustadt an der Weinstraße', PROVINCES.RP),
  city('اشپایر', 'Speyer', PROVINCES.RP),
  city('لانداو', 'Landau in der Pfalz', PROVINCES.RP),
  city('باد کرویتسناخ', 'Bad Kreuznach', PROVINCES.RP),

  // 12. Saarland
  city('زاربروکن', 'Saarbrücken', PROVINCES.SL),
  city('نوی‌کیرشن', 'Neunkirchen', PROVINCES.SL),
  city('هومبورگ', 'Homburg', PROVINCES.SL),
  city('فولکلینگن', 'Völklingen', PROVINCES.SL),
  city('زارلوئیس', 'Saarlouis', PROVINCES.SL),
  city('سنت اینگبرت', 'St. Ingbert', PROVINCES.SL),
  city('مرتسیگ', 'Merzig', PROVINCES.SL),
  city('سنت وندل', 'St. Wendel', PROVINCES.SL),
  city('دیلینگن', 'Dillingen/Saar', PROVINCES.SL),
  city('بلیس‌کاستل', 'Blieskastel', PROVINCES.SL),

  // 13. Sachsen
  city('لایپزیگ', 'Leipzig', PROVINCES.SN),
  city('درسدن', 'Dresden', PROVINCES.SN),
  city('کمنیتس', 'Chemnitz', PROVINCES.SN),
  city('تسویکاو', 'Zwickau', PROVINCES.SN),
  city('پلاون', 'Plauen', PROVINCES.SN),
  city('گورلیتس', 'Görlitz', PROVINCES.SN),
  city('فرایبرگ', 'Freiberg', PROVINCES.SN),
  city('بوتسن', 'Bautzen', PROVINCES.SN),
  city('رادبویل', 'Radebeul', PROVINCES.SN),
  city('پیرنا', 'Pirna', PROVINCES.SN),

  // 14. Sachsen-Anhalt
  city('ماگدبورگ', 'Magdeburg', PROVINCES.ST),
  city('هاله', 'Halle (Saale)', PROVINCES.ST),
  city('دسائو-روسلاو', 'Dessau-Roßlau', PROVINCES.ST),
  city('ویتنبرگ', 'Lutherstadt Wittenberg', PROVINCES.ST),
  city('هالبرشتات', 'Halberstadt', PROVINCES.ST),
  city('اشتندال', 'Stendal', PROVINCES.ST),
  city('مرزه‌بورگ', 'Merseburg', PROVINCES.ST),
  city('بیترفِلد', 'Bitterfeld-Wolfen', PROVINCES.ST),
  city('ناومبورگ', 'Naumburg', PROVINCES.ST),
  city('کویدلینبورگ', 'Quedlinburg', PROVINCES.ST),

  // 15. Schleswig-Holstein
  city('کیل', 'Kiel', PROVINCES.SH),
  city('لوبک', 'Lübeck', PROVINCES.SH),
  city('فلنسبورگ', 'Flensburg', PROVINCES.SH),
  city('نوی‌مونستر', 'Neumünster', PROVINCES.SH),
  city('نوردراشتت', 'Norderstedt', PROVINCES.SH),
  city('المسهورن', 'Elmshorn', PROVINCES.SH),
  city('پینبرگ', 'Pinneberg', PROVINCES.SH),
  city('ایتسهو', 'Itzehoe', PROVINCES.SH),
  city('هوزوم', 'Husum', PROVINCES.SH),
  city('رندسبورگ', 'Rendsburg', PROVINCES.SH),

  // 16. Thüringen
  city('ارفورت', 'Erfurt', PROVINCES.TH),
  city('ینا', 'Jena', PROVINCES.TH),
  city('گرا', 'Gera', PROVINCES.TH),
  city('وایمار', 'Weimar', PROVINCES.TH),
  city('گوتا', 'Gotha', PROVINCES.TH),
  city('آیزناخ', 'Eisenach', PROVINCES.TH),
  city('نوردهاوزن', 'Nordhausen', PROVINCES.TH),
  city('زول', 'Suhl', PROVINCES.TH),
  city('ایلمناو', 'Ilmenau', PROVINCES.TH),
  city('مولهاوزن', 'Mühlhausen', PROVINCES.TH),
];

export const DEFAULT_CITIES = CITIES_DATA.map(c => c.name);

export const GERMAN_PROVINCES = Object.values(PROVINCES);

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
