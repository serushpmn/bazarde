# Architectural decisions

Only decisions confidently inferred from the codebase. Speculative history is marked UNKNOWN.

---

## Decision: Client-only SPA with localStorage

**Evidence:** `StorageService` + README; no server routes; package scripts are Vite-only.

**Reason:** UNKNOWN / NEEDS VERIFICATION (likely prototype / demo speed).

**Consequences:**

- No multi-device sync, weak security, data loss if storage cleared.
- Easy local demo; production needs a real backend.

---

## Decision: PostgreSQL via Express API (2026-09)

**Evidence:** `server/` (Express + `pg`), `docs/POSTGRES.md`, `services/postgresSync.ts`.

**Reason:** User installed PostgreSQL on Windows; browsers cannot talk to PG directly.

**Consequences:**

- Phase 1: SPA still uses `StorageService`/localStorage for runtime; pull/push sync with PG.
- Phase 2 (future): dual-write or fully async API client.
- Requires `DATABASE_URL` and running API on port 4000.

---

## Decision: HashRouter

**Evidence:** `App.tsx` uses `HashRouter`.

**Reason:** UNKNOWN / NEEDS VERIFICATION (often used for static hosting without server rewrite rules).

**Consequences:** URLs look like `/#/ad/id`; deep links depend on hash.

---

## Decision: Tailwind via CDN in `index.html`

**Evidence:** `index.html` loads `cdn.tailwindcss.com` + inline config; no PostCSS Tailwind pipeline in package.json.

**Reason:** UNKNOWN / NEEDS VERIFICATION (simplicity for prototype).

**Consequences:** Runtime CDN dependency; design tokens duplicated partly in `lib/designTokens.ts`.

---

## Decision: Phone-based auth without passwords

**Evidence:** `Login.tsx`, User type without password.

**Reason:** UNKNOWN / NEEDS VERIFICATION (demo UX).

**Consequences:** Not production-secure; impersonation trivial via localStorage.

---

## Decision: Single StorageService facade

**Evidence:** Almost all mutations go through `services/storage.ts`.

**Reason:** Centralize persistence and side effects (notifications, logs).

**Consequences:** Large file; high blast radius; must stay the single write path.

---

## Decision: Soft remove + mandatory reasons + appeals

**Evidence:** `AdStatus.REMOVED`, `removeAdWithReason`, Appeal types, admin modals.

**Reason:** Align demo product with DSA-style transparency (stated in UI/settings copy).

**Consequences:** Extra statuses and admin/profile flows; public listing must filter statuses carefully.

---

## Decision: Re-moderate only on content change

**Evidence:** `adContentRequiresReview` in `NewAd.tsx` (title, description, images).

**Reason:** Reduce moderator load for metadata-only edits (product request reflected in code).

**Consequences:** Price/contact fraud could bypass re-queue — accept consciously or tighten later.

---

## Decision: Keep Supabase / Gemini scaffolding unused

**Evidence:** Dependencies + stubs; no page imports.

**Reason:** UNKNOWN / NEEDS VERIFICATION (future backend/AI).

**Consequences:** Agents must not assume cloud storage/AI is live.

---

## Decision: Persian RTL UI

**Evidence:** `index.html` `lang="fa" dir="rtl"`; Vazirmatn; Persian copy throughout.

**Reason:** Target audience = Farsi speakers in Germany.

**Consequences:** LTR for phones/`dir="ltr"` monospace; keep Persian user-facing strings.
