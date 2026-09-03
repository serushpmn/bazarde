# services/

## Purpose

I/O and persistence boundary.

## Responsibilities

- **StorageService:** all live domain persistence + related side effects (notifications, activity logs, expiry)
- **ImageService:** Supabase Storage helpers (**unused** by UI)

## Important files

| File | Status |
|------|--------|
| `storage.ts` | **Critical — active** |
| `imageService.ts` | Scaffold only |

## Public interfaces

`export const StorageService = { ... }` — see `docs/API.md`.

`export const ImageService = { uploadImage, deleteImage }`.

## Dependencies

`types.ts`, `lib/platformDefaults.ts`; ImageService → `lib/supabaseClient.ts`.

## Consumers

Pages, Layout, AdminCompliancePanels. ImageService: **none**.

## Data flow

```
Caller → StorageService method → localStorage JSON
       ↘ optional addNotification / addActivityLog
```

Seed runs on module import (`seedData()`).

## Business rules

Expiry processing, remove-with-reason, appeal accept → PENDING, settings merge defaults — implemented here; product description in `docs/BUSINESS_RULES.md`.

## Tests

None. Highest-risk file for regressions.

## Common failure points

- Changing `STORAGE_KEYS` without migration
- Forgetting notifications/logs on new moderation actions
- Dual-write bugs if pages bypass StorageService
- Growing file size — prefer careful extension over parallel stores
