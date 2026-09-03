# Bazaar Germany (بازار آلمان)

Persian RTL classifieds marketplace for Iranians living in Germany. Client-only SPA; all persistence is browser `localStorage`.

## Purpose

Enable listing and discovery of goods, housing, vehicles, jobs, and services across German cities — with moderation, DSA-style reporting, appeals, and GDPR-oriented contact minimization.

## Main features

- Browse / filter / search ads (city, category, price, photos)
- Create & edit ads (phone / WhatsApp / Telegram contact toggles)
- Moderation queue (approve / reject-with-reason / remove-with-reason)
- DSA reports, appeals, activity logs
- Notifications (header, home banner, profile)
- Legal pages: rules, privacy (GDPR), banned items (admin-editable)
- Ad expiry (default 60 days, configurable)
- Admin panel for categories, cities, banners, support, settings

## Stack

| Layer | Choice |
|-------|--------|
| UI | React 19 + TypeScript |
| Build | Vite 6 |
| Routing | React Router 7 (`HashRouter`) |
| Styles | Tailwind via CDN (`index.html`) + `lib/designTokens.ts` |
| Icons | lucide-react |
| Data | `localStorage` via `services/storage.ts` |
| Auth | Client-only session in `localStorage` (phone-based demo login) |

**Not used in runtime (scaffolding only):** Supabase client / `ImageService`, `@google/genai` (declared; no app imports).

## Run

```bash
npm install
npm run dev      # Vite — see vite.config.ts (port 3000, host 0.0.0.0)
npm run build
npm run preview
```

**Tests:** none configured (`package.json` has no `test` script).

**Env:** optional `GEMINI_API_KEY` wired in `vite.config.ts` but unused by app code. Supabase placeholders in `lib/supabaseClient.ts` are unused.

## Directory map

```
bazaar/
├── App.tsx              # Providers + routes
├── index.tsx            # React mount
├── types.ts             # Domain types + seed categories/cities
├── pages/               # Route screens
├── components/          # UI + layout + compliance panels
├── services/            # StorageService (source of truth), ImageService (unused)
├── lib/                 # Formatters, design tokens, platform defaults
├── docs/                # AI / architecture documentation
├── AGENTS.md            # Rules for AI coding agents
└── README.md            # This file
```

## Deeper documentation

| Doc | Use when |
|-----|----------|
| [AGENTS.md](./AGENTS.md) | Starting any AI-assisted change |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System shape & data flow |
| [docs/PROJECT_MAP.md](./docs/PROJECT_MAP.md) | Find the right module/files |
| [docs/DATABASE.md](./docs/DATABASE.md) | Persistence model (`localStorage`) |
| [docs/API.md](./docs/API.md) | HTTP APIs (none — client storage API) |
| [docs/BUSINESS_RULES.md](./docs/BUSINESS_RULES.md) | Product / compliance rules |
| [docs/DECISIONS.md](./docs/DECISIONS.md) | Architectural decisions |
| [docs/AI_WORKFLOW.md](./docs/AI_WORKFLOW.md) | How agents should investigate |

Module notes: [pages/README.md](./pages/README.md) · [components/README.md](./components/README.md) · [services/README.md](./services/README.md) · [lib/README.md](./lib/README.md)

## Demo accounts

Seeded admin phone: `+49 170 0000000` (see Login quick-login). No passwords.

## License

UNSPECIFIED / NEEDS VERIFICATION — coordinate with maintainer before redistribution.
