# Persistence model (“Database”)

## Active runtimes

1. **Browser localStorage** via `StorageService` (default SPA path).
2. **PostgreSQL** via Express API in `server/` — see [POSTGRES.md](./POSTGRES.md).

Supabase client remains unused scaffolding.

---

## Storage keys

| Key | Entity | Notes |
|-----|--------|-------|
| `bazaar_de_users_v3` | `User[]` | Accounts |
| `bazaar_de_current_user_v3` | `User` \| null | Session |
| `bazaar_de_ads_v3` | `Ad[]` | Listings |
| `bazaar_de_categories_v3` | `Category[]` | Taxonomy |
| `bazaar_de_cities_v3` | `string[]` | City names |
| `bazaar_de_notifications_v3` | `AppNotification[]` | Cap ~500 |
| `bazaar_de_support_messages_v3` | `SupportMessage[]` | Contact form |
| `bazaar_de_banners_v3` | `Banner[]` | Home banners |
| `bazaar_de_saved_ads_v3_${userId\|guest}` | `string[]` | Bookmark ids |
| `bazaar_de_recent_views_v3` | `string[]` | Recent ad ids (max 10) |
| `bazaar_de_chats_v3` | `ChatMessage[]` | Unused by UI |
| `bazaar_de_violation_reports_v3` | `ViolationReport[]` | DSA reports |
| `bazaar_de_settings_v3` | `PlatformSettings` | Expiry, legal texts, banned list |
| `bazaar_de_appeals_v3` | `Appeal[]` | Appeals |
| `bazaar_de_activity_logs_v3` | `ActivityLog[]` | Cap ~1000 |
| `bazaar_de_account_deletion_requests_v1` | `AccountDeletionRequest[]` | Deletion audit |
| `bazaar_de_phone_restrictions_v1` | `PhoneRestriction[]` | Ban/abuse blocklist |
| `bazaar_de_otps_v1` | `OtpChallenge[]` | Client OTP demo store |
| `bazaar_theme` | `'dark'\|'light'` | App.tsx |
| `bazaar_viewing_city` | city string | CityProvider |

---

## Logical entities (from `types.ts`)

### users

Important fields: `id`, `name`, `phone`, `accountStatus`, deletion/deactivation timestamps, `bannedAt?`, `avatar?`, `role`, …

**AccountStatus:** `ACTIVE` | `PENDING_DELETION` | `DEACTIVATED` | `SUSPENDED` | `BANNED` | `DELETED` | `ANONYMIZED`

### ads

Statuses include `PAUSED` and `ARCHIVED_ACCOUNT_DELETION` for lifecycle hides (not public).

Ownership: user owns own profile; admin list is read-mostly.

### ads

Important fields: content (`title`, `description`, `images`, price flags, geo, category), contact toggles (`showPhone`, `allowWhatsapp`, `telegramId`, `showTelegram`), moderation (`status`, `rejectionReason`, `removalReason`, `removedAt`, `removedBy`), lifecycle (`createdAt`, `expiresAt`), `soldFeedback?`, `viewsCount?`, `attributes?`

Statuses: `PENDING` | `APPROVED` | `REJECTED` | `EXPIRED` | `REMOVED`

### categories / cities

Admin-editable taxonomy. Defaults from `DEFAULT_CATEGORIES` / `CITIES_DATA` in `types.ts`.

### violation_reports

Links to ad snapshot fields + `reporterUserId?`, `reason`, `details?`, `status`.

### appeals

Links `adId` + `userId`; type `REJECTION` | `REMOVAL`; status `PENDING` | `ACCEPTED` | `REJECTED`.

### notifications / activity_logs / support_messages / banners / settings

See interfaces in `types.ts`. Settings defaults: `lib/platformDefaults.ts`.

---

## Relationship map (logical)

```
users
  ├── ads (userId)
  ├── notifications (userId | ADMIN | ALL)
  ├── appeals (userId)
  └── bookmarks key per userId

ads
  ├── violation_reports (adId)
  ├── appeals (adId)
  ├── categories (categoryId / subCategoryId)
  └── cities (city string match)

platform_settings
  └── consumed by LegalPages, NewAd hints, report reasons, expiry
```

There are **no foreign-key constraints**; integrity is application-level only.

---

## Indexes / constraints

- **No DB indexes.** Lookups are in-memory array `find` / `filter`.
- Soft uniqueness: login matches `User.phone` (first match).
- Ad ids: `ad-${Date.now()}` or preserved on edit.
- Reject/remove require non-empty reason in admin UI/service paths.

---

## Important “queries” (code equivalents)

| Need | Method |
|------|--------|
| Public listings | `getPublicAds()` → expire + filter APPROVED |
| One ad | `getAdById` |
| User notifs | `getNotifications(userId, role)` |
| Pending moderation | filter ads `status === PENDING` in Admin UI |
| Settings | `getSettings()` merge with defaults |

---

## Data ownership & retention (product)

- User can delete own ads (hard delete) with sold feedback.
- Admin remove → status `REMOVED` (kept for appeal), not always hard-deleted.
- Account delete: removes user + their ads + their notifications (`deleteUserAccount`).
- Expiry: APPROVED → EXPIRED after `adExpiryDays` (default 60).

---

## Business rules affecting data

Documented in [BUSINESS_RULES.md](./BUSINESS_RULES.md) (status transitions, re-moderation fields, GDPR minimization).
