# lib/

## Purpose

Pure helpers, design tokens, and default platform content. No React pages.

## Important files

| File | Role |
|------|------|
| `formatters.ts` | Price, Persian digits, time-ago, WhatsApp/Telegram URL helpers |
| `designTokens.ts` | Shared Tailwind class strings |
| `adImagePlaceholders.ts` | Empty/invalid image handling |
| `platformDefaults.ts` | Default expiry, banned list, legal texts, report/reject reasons |
| `supabaseClient.ts` | **Unused** placeholder client |

## Dependencies

`types.ts` (platformDefaults). Formatters are dependency-light.

## Consumers

Pages/components for display; StorageService imports platformDefaults.

## Data flow

Stateless functions; platformDefaults copied into localStorage settings when missing.

## Business rules

Default copy/lists define initial compliance content; runtime edits live in settings storage.

## Tests

None.

## Common failure points

- Breaking Telegram/WhatsApp URL normalization used by contact modal
- Editing defaults without realizing existing browsers keep old `SETTINGS` until reset
