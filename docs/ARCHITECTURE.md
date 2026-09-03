# Architecture

## High-level

```
Browser SPA (React)
  → HashRouter routes (App.tsx)
  → Pages + Components
  → StorageService (services/storage.ts)
  → localStorage keys (bazaar_de_*_v3)
```

No server process, no SQL database, no authenticated HTTP API in this repo.

Optional scaffolding (not on critical path): Supabase JS client + ImageService for future image hosting.

---

## Frontend architecture

**Purpose:** Render marketplace UI, enforce client-side route guards, hold session/theme/city context.

**Location:** `App.tsx`, `index.tsx`, `pages/`, `components/`, `index.html` (Tailwind + fonts).

**Inputs:** User events, URL hash routes, `localStorage`.

**Outputs:** DOM UI; writes via StorageService / theme & city keys.

**Dependencies:** react, react-router-dom, lucide-react, StorageService, types.

**Consumers:** End users (browser).

### Providers (`App.tsx`)

| Provider | State | Persistence |
|----------|-------|-------------|
| ThemeProvider | dark/light | `bazaar_theme` |
| AuthProvider | `user` | `bazaar_de_current_user_v3` via StorageService |
| CityProvider | selected city list | `bazaar_viewing_city` + cities from StorageService |
| ToastProvider | ephemeral toasts | memory |

### Routing

`HashRouter` — paths like `/#/ad/:id`. Guards: `PrivateRoute` (any logged-in user), `AdminRoute` (ADMIN|EDITOR).

Startup: `PageLoader` ~400ms + `StorageService.processExpiredAds()`.

---

## Backend architecture

**None in-repo.** All “backend” behavior is synchronous StorageService methods in the browser.

**UNKNOWN / NEEDS VERIFICATION:** Any production hosting/proxy outside this repo.

---

## Database architecture

See [DATABASE.md](./DATABASE.md). Logical entities are JSON documents in `localStorage`, not relational tables.

---

## API architecture

See [API.md](./API.md). Application API = `StorageService` public methods.

---

## Authentication architecture

**Purpose:** Demo session without passwords.

**Location:** `pages/Login.tsx`, `App.tsx` AuthProvider, `StorageService.saveUser` / `setCurrentUser`.

**Flow:**

1. User enters phone (+ optional name/city on register).
2. Lookup/create `User` in `bazaar_de_users_v3`.
3. `login(user)` → memory + `CURRENT_USER` key.
4. Route guards read `useAuth().user.role`.

**Roles:** `USER` (default), `EDITOR`, `ADMIN` (seeded admin). Quick-login buttons create ephemeral role users if missing.

**Security note:** Anyone who knows/sets a phone in localStorage can impersonate. Acceptable only for local demo.

---

## Major services

| Service | Purpose | Status |
|---------|---------|--------|
| `StorageService` | CRUD for all domain entities + notifications + logs | **Active** |
| `ImageService` | Supabase Storage upload/delete | **Unused** |

---

## Major modules

| Module | Location | Role |
|--------|----------|------|
| Listings / Home | `pages/Home.tsx` | Public catalog |
| Ad detail | `pages/AdDetails.tsx` | Detail, contact, report |
| Create/edit ad | `pages/NewAd.tsx` | Form + re-moderation rules |
| Profile | `pages/Profile.tsx` | Ads, notifs, appeals, settings |
| Admin | `pages/AdminDashboard.tsx` + `components/AdminCompliancePanels.tsx` | Moderation & config |
| Legal | `pages/LegalPages.tsx`, SafetyGuide, ContactUs | Rules / privacy / banned / support |
| Layout / chrome | `components/Layout.tsx` | Nav, search, notif bell, footer |
| Domain types | `types.ts` | Shared models |
| Platform defaults | `lib/platformDefaults.ts` | Expiry, banned list, legal text defaults |

---

## External integrations

| Integration | Usage |
|-------------|-------|
| Unsplash URLs | Seed/demo ad & banner images |
| Tailwind CDN | Runtime CSS |
| Google Fonts (Vazirmatn) | Typography |
| WhatsApp / Telegram deep links | Contact actions via `lib/formatters.ts` |
| Supabase | Scaffold only |
| Gemini (`@google/genai`) | Dependency + Vite env inject; **no app imports** |

---

## Data flow (typical)

### Publish ad

```
NewAd form → validate → StorageService.saveAd
  → addNotification (user ± ADMIN)
  → addActivityLog
  → navigate profile or ad
```

### Public listing

```
Home mount → StorageService.getPublicAds()
  → processExpiredAds()
  → filter APPROVED → ListingFilters → AdCard
```

### Moderation

```
AdminDashboard → approve/reject/remove
  → saveAd / removeAdWithReason
  → notify seller
  → activity log
```

### Report (DSA)

```
AdDetails report modal → saveViolationReport
  → notify ADMIN + reporter
  → Admin reports tab
```

---

## Important dependencies (code)

```
App.tsx
  ├── Layout → StorageService (notifs, categories)
  ├── pages/* → StorageService + types + components
  └── ToastProvider

StorageService
  ├── types.ts
  └── lib/platformDefaults.ts

NewAd / AdDetails / Profile / Admin
  └── lib/formatters.ts
```

---

## Entry points

| Entry | Starts at | Continues to |
|-------|-----------|--------------|
| App bootstrap | `index.html` → `index.tsx` | `App` providers + routes |
| Vite config | `vite.config.ts` | Dev server port 3000 |
| Seed data | `storage.ts` `seedData()` on import | Demo ads/users/settings |
| Auth entry | `/login` | AuthProvider |
| Admin entry | `/admin` | AdminRoute → AdminDashboard |
| Expiry job | App mount + `getPublicAds` | `processExpiredAds` |

No cron, webhooks, CLI, or migrations in-repo.
