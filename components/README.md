# components/

## Purpose

Reusable UI and chrome shared across pages.

## Responsibilities

- Presentational widgets and layout shell
- Shared notification list/banner
- Admin settings/appeals/logs panels
- Design-system primitives under `ui/`

## Important files

| File | Role |
|------|------|
| `Layout.tsx` | Header, nav, notif bell, footer links |
| `AdCard.tsx` | Grid/list ad card |
| `AdImage.tsx` | Image / placeholder |
| `ListingFilters.tsx` | Home filters |
| `NotificationList.tsx` | Notif list + home banner |
| `AdminCompliancePanels.tsx` | Settings / appeals / logs UI |
| `TrustSignals.tsx` | Contact/trust hints on detail |
| `CityModal.tsx` | City picker |
| `CategoryIcon.tsx` | Category lucide map |
| `SellerCard.tsx` | **Unused** on AdDetails currently |
| `ui/Button.tsx`, `Modal.tsx`, `Toast.tsx`, `SearchBar.tsx`, `EmptyState.tsx`, `Breadcrumbs.tsx`, `PageLoader.tsx` | Primitives |

## Dependencies

StorageService (Layout, Admin panels), Auth/City contexts, formatters, designTokens, types.

## Consumers

`pages/*`, `App.tsx` (Layout, Toast, PageLoader).

## Data flow

Mostly props-down; Layout/Admin panels call StorageService directly.

## Business rules

None owned here — display/admin editing of rules lives in AdminCompliancePanels + StorageService settings.

## Tests

None.

## Common failure points

- Layout notif filter regressing (users seeing ADMIN-only items)
- Footer legal links pointing at wrong routes
- Duplicating modal patterns instead of `ui/Modal`
