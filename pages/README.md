# pages/

## Purpose

Route-level screens for the marketplace SPA.

## Responsibilities

- Compose UI for a URL
- Call `StorageService` for reads/writes
- Enforce page-local validation and modals
- Respect auth via parent routes (`PrivateRoute` / `AdminRoute`)

## Important files

| File | Route(s) | Notes |
|------|----------|-------|
| `Home.tsx` | `/` | Public ads + filters + home notifs |
| `AdDetails.tsx` | `/ad/:id` | Contact modal, report, owner banners |
| `NewAd.tsx` | `/new`, `/new-ad`, `/edit/:id` | Create/edit + re-moderation |
| `Login.tsx` | `/login` | Phone auth / quick login |
| `Profile.tsx` | `/profile` | Ads, notifs, appeals, GDPR |
| `AdminDashboard.tsx` | `/admin` | Moderation hub |
| `LegalPages.tsx` | `/rules`, `/privacy`, `/banned` | Settings-driven texts |
| `SafetyGuide.tsx` | `/safety`, `/scam-guide` | Static safety content |
| `ContactUs.tsx` | `/contact` | Support messages |

## Public interfaces

Default-exported React pages; registered in `App.tsx`.

## Dependencies

`../services/storage`, `../types`, `../components/*`, `../lib/*`, `../App` contexts.

## Consumers

React Router only.

## Data flow

User event → local state → StorageService → navigate / reload lists.

## Business rules

See `docs/BUSINESS_RULES.md` (especially NewAd, AdDetails, Profile, AdminDashboard).

## Tests

None dedicated.

## Common failure points

- Forgetting new `AdStatus` in filters/badges
- Writing localStorage outside StorageService
- Contact/report/appeal flows diverging from admin settings lists
- Large AdminDashboard regressions when adding tabs
