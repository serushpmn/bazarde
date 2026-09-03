# AI workflow

How agents should investigate and change this repo without reading everything.

---

## Default path

```
USER REQUEST
    ↓
Identify feature/module
    ↓
Read docs/PROJECT_MAP.md
    ↓
Read module README (pages|components|services|lib)
    ↓
Read docs/BUSINESS_RULES.md if product logic
    ↓
Open relevant files only
    ↓
Grep symbols / callers / StorageService methods
    ↓
Impact / blast-radius notes
    ↓
Minimal plan
    ↓
Edit minimum files
    ↓
npm run build (+ browser check for UI)
    ↓
Review diff
    ↓
Update docs if architecture/API/rules changed
```

---

## Context hierarchy (token efficiency)

1. **Root:** `README.md`, `AGENTS.md`
2. **System:** `docs/ARCHITECTURE.md`, `PROJECT_MAP.md`
3. **Domain:** `BUSINESS_RULES.md`, `DATABASE.md`, `API.md`
4. **Module:** `pages/README.md`, etc.
5. **Code:** specific files/symbols

Expand downward only as needed.

---

## Task → first files

| Task type | Start here |
|-----------|------------|
| Listing/filter UI | `pages/Home.tsx`, `components/ListingFilters.tsx`, `AdCard.tsx` |
| Contact / report | `pages/AdDetails.tsx`, `lib/formatters.ts` |
| Create/edit / re-moderation | `pages/NewAd.tsx`, `docs/BUSINESS_RULES.md` |
| Auth / roles | `pages/Login.tsx`, `App.tsx` |
| Notifications | `Layout.tsx`, `NotificationList.tsx`, StorageService notif methods |
| Moderation / settings | `AdminDashboard.tsx`, `AdminCompliancePanels.tsx`, `platformDefaults.ts` |
| Persistence / keys | `services/storage.ts`, `docs/DATABASE.md` |
| Types / statuses | `types.ts` |
| Legal copy | `LegalPages.tsx`, settings in StorageService |

---

## Blast radius checklist

Before large changes, answer:

- [ ] Which StorageService methods/keys change?
- [ ] Which AdStatus transitions break?
- [ ] Do Home public filters still hide non-APPROVED?
- [ ] Do notifications still target correct userId/ADMIN?
- [ ] Do Admin and Profile tabs stay in sync with new entities?
- [ ] Did routes/guards change?
- [ ] Are Persian RTL strings still coherent?

---

## Verification commands

```bash
npm run build
```

No `npm test`. For UI: exercise the affected hash route(s) in the browser.

---

## Anti-patterns

- Grepping the whole monorepo when PROJECT_MAP already names the module
- Pasting large code into new docs
- “Cleaning up” unused Supabase/SellerCard/chat without a request
- Adding REST “for completeness” without product direction
