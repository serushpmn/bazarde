# API

## HTTP API

**None.** This project does not expose REST/GraphQL endpoints and does not call a backend for domain data.

Declared but unused:

- Supabase client (`lib/supabaseClient.ts`) — placeholder URL/key
- `ImageService.uploadImage` / `deleteImage` — unused by pages
- Vite `GEMINI_API_KEY` inject — unused by app source

If you need an “API” for agents, use **StorageService** below.

---

## Application API: `StorageService`

**Location:** `services/storage.ts`  
**Consumers:** pages, Layout, AdminCompliancePanels  
**Auth:** caller responsibility (UI route guards); StorageService does not enforce roles.

### Ads

| Method | Purpose | Notes |
|--------|---------|-------|
| `getAds` | All ads | Raw list |
| `getPublicAds` | Public catalog | Runs expiry, APPROVED only |
| `getAdById` | Single ad | |
| `saveAd` | Create/update | Ensures `expiresAt` |
| `deleteAd` | Hard delete | Admin/internal |
| `deleteAdByUser` | User delete + sold feedback | Logs activity |
| `removeAdWithReason` | Soft remove | Notifies user; DSA |
| `computeExpiresAt` | Expiry timestamp | From settings days |
| `processExpiredAds` | Approve→Expired | Notifies owners |
| `incrementAdViews` | View counter | |

### Users / session / account lifecycle

| Method | Purpose |
|--------|---------|
| `getUsers` / `saveUser` / `getUserById` / `findUserByPhone` | Accounts; default `accountStatus=ACTIVE` |
| `requestAccountDeletion` | OTP-gated → `PENDING_DELETION`, archive ads, 30d schedule |
| `cancelAccountDeletion` | Restore → `ACTIVE`; ads → `PAUSED` |
| `deactivateAccount` / `reactivateAccount` | Pause without permanent delete |
| `changeUserPhone` | OTP on new phone + uniqueness |
| `processPendingAccountDeletions` | Idempotent final anonymize (boot) |
| `canCreateAd` / `countActiveAdsForUser` / `republishPausedAd` | 5-ad limit + republish |
| `deleteUserAccount` | Legacy; prefers soft pending deletion |
| `getCurrentUser` / `setCurrentUser` | Session |

OTP: `lib/otpService.ts` (purpose-scoped, TTL, rate limit, single-use; demo code shown in UI).

### Notifications

| Method | Purpose |
|--------|---------|
| `getNotifications(userId?, role?)` | Scoped list (staff see ADMIN) |
| `addNotification` | Cap 500 |
| `markNotificationRead` / `markAllNotificationsRead` | |
| `deleteNotification` | |

### Reports / appeals / logs / settings

| Method | Purpose |
|--------|---------|
| `saveViolationReport` | DSA report + notifs + log |
| `updateViolationReportStatus` | Notify reporter |
| `getAppeals` / `getAppealsByUser` / `saveAppeal` / `resolveAppeal` | Appeal lifecycle |
| `getSettings` / `saveSettings` | Platform config |
| `getActivityLogs` / `addActivityLog` | Audit trail |

### Taxonomy / support / banners / bookmarks / chat

Categories, cities, support messages, banners, bookmarks, recent views, chat get/send — see source. **Chat has no UI consumer.**

### Admin utility

`resetToDefaults()` — reseeds demo content (destructive for local keys listed in method).

---

## Typical call chains

```
Home
  → StorageService.getPublicAds
  → localStorage ADS + SETTINGS

NewAd submit
  → StorageService.saveAd
  → addNotification / addActivityLog

AdDetails report
  → saveViolationReport
  → ADMIN + reporter notifications

Admin reject
  → saveAd(status REJECTED, rejectionReason)
  → addNotification(seller)
  → addActivityLog

Admin remove
  → removeAdWithReason
  → seller notification + log

Profile appeal
  → saveAppeal
  → ADMIN + user notifications
```

---

## Errors

Storage methods mostly **swallow parse errors** and return empty arrays / defaults. UI must validate before write (e.g. reject reason required in AdminDashboard).

No HTTP status codes.
