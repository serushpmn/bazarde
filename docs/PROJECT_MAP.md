# Project map

Compact map for AI navigation. Prefer this over full-repo search.

---

## Module: Application shell

**Location:** `App.tsx`, `index.tsx`, `index.html`

**Purpose:** Mount React, providers (theme/auth/city/toast), HashRouter, route table, initial expiry pass.

**Important files:** `App.tsx`, `index.tsx`, `index.html`

**Dependencies:** pages/*, Layout, StorageService, PageLoader, Toast

**Used by:** Entire app

**Relationships:** `index.tsx` → `App` → `Layout` → `Routes` → page components

---

## Module: Domain types & seed taxonomy

**Location:** `types.ts`, `lib/platformDefaults.ts`

**Purpose:** Enums/interfaces (`Ad`, `User`, `Appeal`, …); default cities/categories; default settings (expiry 60d, banned items, legal texts, report reasons).

**Important files:** `types.ts`, `lib/platformDefaults.ts`

**Dependencies:** none (leaf)

**Used by:** StorageService, all pages/components that touch domain data

---

## Module: Persistence (StorageService)

**Location:** `services/storage.ts`

**Purpose:** Sole active data layer — ads, users, reports, appeals, settings, logs, notifications, banners, support, bookmarks, chats (API only).

**Important files:** `services/storage.ts`, `services/README.md`

**Dependencies:** `types.ts`, `lib/platformDefaults.ts`

**Used by:** Nearly every page + Layout + AdminCompliancePanels

**Relationships:** Pages → StorageService → localStorage

---

## Module: Listings (Home)

**Location:** `pages/Home.tsx`, `components/ListingFilters.tsx`, `components/AdCard.tsx`

**Purpose:** Public catalog, filters, banners, home notification banner.

**Dependencies:** StorageService.getPublicAds, City context, NotificationList banner

**Used by:** Route `/`

---

## Module: Ad detail & contact

**Location:** `pages/AdDetails.tsx`, `components/TrustSignals.tsx`, `components/AdImage.tsx`

**Purpose:** Gallery, sticky CTA, contact modal (phone/WA/Telegram icons), DSA report modal, owner status banners, similar ads.

**Dependencies:** StorageService, formatters (WhatsApp/Telegram URLs), Auth

**Used by:** Route `/ad/:id`

**Note:** `SellerCard` exists but is not used on this page.

---

## Module: Create / edit ad

**Location:** `pages/NewAd.tsx`

**Purpose:** Ad form; contact checkboxes; image as data-URL; re-moderation when title/description/images change.

**Dependencies:** StorageService, Auth (phone required), categories/cities

**Used by:** `/new`, `/new-ad`, `/edit/:id`

---

## Module: Auth / login

**Location:** `pages/Login.tsx`, AuthProvider in `App.tsx`

**Purpose:** Phone login/register; quick role login; no passwords.

**Dependencies:** StorageService users API

**Used by:** `/login`, PrivateRoute, AdminRoute

---

## Module: Profile

**Location:** `pages/Profile.tsx`, `components/NotificationList.tsx`

**Purpose:** My ads, notifications, appeals, saved/recent, settings, GDPR delete account, sold-feedback on delete.

**Dependencies:** StorageService (ads, appeals, notifs, deleteUserAccount)

**Used by:** `/profile?tab=*`

---

## Module: Admin / compliance

**Location:** `pages/AdminDashboard.tsx`, `components/AdminCompliancePanels.tsx`

**Purpose:** Moderate ads; DSA reports; appeals; editable platform settings; activity logs; categories/cities/banners/support/users.

**Dependencies:** StorageService extensively

**Used by:** `/admin?tab=*`

**Tabs:** ads, reports, appeals, settings, logs, categories, cities, support, banners, users

---

## Module: Legal & safety

**Location:** `pages/LegalPages.tsx`, `pages/SafetyGuide.tsx`, `pages/ContactUs.tsx`

**Purpose:** Rules, privacy, banned list (from settings); scam guide; support form.

**Dependencies:** StorageService.getSettings / saveSupportMessage

**Used by:** `/rules`, `/privacy`, `/banned`, `/safety`, `/scam-guide`, `/contact`

---

## Module: Layout / chrome

**Location:** `components/Layout.tsx`, `components/CityModal.tsx`, `components/ui/*`

**Purpose:** Header search, category mega-menu, notification dropdown, footer legal links, mobile nav.

**Dependencies:** Auth, City, StorageService notifications/categories

**Used by:** All routes (wraps children)

---

## Module: Formatters & UI tokens

**Location:** `lib/formatters.ts`, `lib/designTokens.ts`, `lib/adImagePlaceholders.ts`

**Purpose:** Price/time/Persian digits; WhatsApp/Telegram helpers; Tailwind class tokens; image placeholders.

**Used by:** Cards, details, admin, profile

---

## Module: Unused / future

| Location | Purpose | Status |
|----------|---------|--------|
| `lib/supabaseClient.ts` | Supabase client stub | Unused |
| `services/imageService.ts` | Upload to Supabase Storage | Unused |
| Chat methods in StorageService | In-app chat | No UI |

---

## Route → page quick index

| Path | Page |
|------|------|
| `/` | Home |
| `/ad/:id` | AdDetails |
| `/login` | Login |
| `/new`, `/new-ad`, `/edit/:id` | NewAd |
| `/profile` | Profile |
| `/admin` | AdminDashboard |
| `/contact` | ContactUs |
| `/safety`, `/scam-guide` | SafetyGuide |
| `/rules`, `/privacy`, `/banned` | LegalPages |
