# AGENTS.md — AI coding agent manual

Primary rules for agents working in this repository.

## Project at a glance

- **SPA only:** React + Vite + TypeScript. No backend server in-repo.
- **Persistence:** `services/storage.ts` → browser `localStorage`.
- **UI language:** Persian (Farsi), `dir="rtl"`.
- **Routing:** `HashRouter` in `App.tsx`.

**Do not inspect the entire repository for every task.** Start from [docs/PROJECT_MAP.md](./docs/PROJECT_MAP.md), open the relevant module README, retrieve only necessary files, trace dependencies/callers, and expand context only when required.

---

## Project rules

### Technology constraints

- Prefer React function components + hooks.
- TypeScript types live mainly in `types.ts`; platform defaults in `lib/platformDefaults.ts`.
- Styling: Tailwind utility classes (CDN config in `index.html`) + shared tokens in `lib/designTokens.ts`.
- Do not introduce a real backend, ORM, or REST layer without an explicit product decision.
- Do not wire unused Supabase/`ImageService`/`@google/genai` into production paths unless asked.

### Architecture constraints

- **Single data gateway:** mutate domain data through `StorageService` methods, not ad-hoc `localStorage` writes (except theme/city keys already used in `App.tsx` / Layout).
- **Pages** own route screens; **components** are reusable UI; **lib** is pure helpers; **services** own I/O.
- Keep HashRouter routes registered in `App.tsx`.
- Auth roles: `USER` | `EDITOR` | `ADMIN` (`UserRole`). Admin UI: `AdminRoute`.

### Coding conventions

- Match existing file style (Persian copy, rounded-2xl/3xl cards, `primary` brand color).
- Prefer small, focused diffs; reuse existing components (`Modal`, `Toast`, `AdCard`, `NotificationList`, etc.).
- Naming: PascalCase components/pages; camelCase functions; `StorageService` method names stay verb-oriented (`saveAd`, `getPublicAds`).
- New domain fields must be added to `types.ts` and persisted via `StorageService` with migration/default handling if needed.

### File organization

| Put here | Examples |
|----------|----------|
| `pages/` | Route-level screens |
| `components/` | Shared UI |
| `components/ui/` | Primitives (Button, Modal, Toast) |
| `services/` | Persistence / external I/O |
| `lib/` | Pure utils + defaults |
| `docs/` | Architecture docs for agents |

### Testing requirements

- **No automated test suite today.** After changes: `npm run build` (typecheck + bundle).
- Manually verify affected routes in the browser when UI/state changes.
- If adding tests later, colocate or use a `tests/` convention — NEEDS VERIFICATION / not established.

### Security / privacy

- Minimize PII: contact phone is the primary stored contact field (GDPR stance in product copy).
- Reports store `reporterUserId`, not separate reporter phone/name.
- Never commit real Supabase keys or secrets.
- Soft-remove by admin requires a reason; reject requires a reason (DSA).

### “Database” rules (localStorage)

- Keys are versioned (`*_v3`). Changing key names breaks existing browser data.
- Prefer additive fields with safe defaults over breaking renames.
- Cap growth: notifications (500), activity logs (1000) — see StorageService.

### API rules

- There is **no HTTP API**. Treat `StorageService` as the application API surface.
- Document StorageService method changes in `docs/API.md` / module README when behavior changes.

### Dependency rules

- Do not add packages without justification (size, license, necessity).
- Prefer lucide-react icons already in use.
- Tailwind stays CDN-based unless a deliberate migration is requested.

---

## AI workflow

Before modifying code:

1. Understand the requested change.
2. Identify the affected module via [docs/PROJECT_MAP.md](./docs/PROJECT_MAP.md).
3. Read that module’s `README.md` and [docs/BUSINESS_RULES.md](./docs/BUSINESS_RULES.md) if product logic is involved.
4. Identify dependencies and callers (grep for symbols / imports).
5. Perform **impact / blast-radius** analysis (files, storage keys, roles, routes).
6. Inspect related UI flows (no unit tests to run yet).
7. Write a concise implementation plan.
8. Make the **smallest safe change**.
9. Run `npm run build`; verify UI if behavior/layout changed.
10. Review the final diff.
11. Update docs only if architecture, Storage API, routes, or business rules changed.

Detailed navigation: [docs/AI_WORKFLOW.md](./docs/AI_WORKFLOW.md).

---

## AI agents must NOT

- Rewrite large portions of the app “for cleanliness” without request.
- Duplicate StorageService logic in pages.
- Invent HTTP endpoints, SQL tables, or business rules.
- Change schema/`STORAGE_KEYS` without understanding all consumers.
- Modify unrelated files.
- Remove working moderation/compliance flows to “simplify”.
- Enable unused Supabase/Gemini paths casually.
- Commit secrets or `.env` with real keys.

---

## Impact analysis (blast radius)

For non-trivial changes, list:

- Files directly affected
- Modules indirectly affected
- Storage keys / entities affected
- Routes / roles affected
- Potential regressions (listings, contact modal, admin queues, notifications)

---

## Change documentation rules

Update docs when changing:

- Architecture or providers/routes
- StorageService public methods / keys / entities
- Business rules (moderation, expiry, GDPR, DSA)
- Module responsibilities

Skip doc updates for trivial UI polish.

---

## High-risk areas

| Area | Why |
|------|-----|
| `services/storage.ts` | Sole persistence; large; easy to break data |
| `pages/NewAd.tsx` | Status / re-moderation logic |
| `pages/AdminDashboard.tsx` | Large surface; moderation + settings |
| `App.tsx` auth/routes | Access control |
| Contact / report / appeal flows | Compliance-sensitive |

---

## Known dead / unused code

| Item | Status |
|------|--------|
| `lib/supabaseClient.ts` | Unused by pages/components |
| `services/imageService.ts` | Unused; uploads unused |
| `@google/genai` dependency | Unused in source |
| `SellerCard` | Exported; not mounted on AdDetails (removed seller section) |
| Chat APIs in StorageService | No UI consumer |

Do not delete without explicit request; document if you revive them.
