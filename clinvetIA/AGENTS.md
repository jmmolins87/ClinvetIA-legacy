# Agent Instructions for Clinvetia App

Next.js 16 App Router + React 19 + TypeScript (strict) + Tailwind CSS v4 + Vitest + Testing Library + Storybook.

**Core Features:** ROI Calculator for veterinary clinics, booking system with time slot management (mock API), i18n (ES/EN), dark/light theme (`next-themes`), accessibility-first UI (Radix UI).

## Commands

```bash
pnpm install                    # install deps
pnpm dev                        # dev server (localhost:3000)
pnpm build                      # production build
pnpm start                      # start production server

# Lint (ESLint 9, flat config in eslint.config.mjs)
pnpm lint
pnpm lint -- --fix
pnpm lint -- app/page.tsx       # lint single file

# Typecheck
pnpm exec tsc --noEmit

# Tests (Vitest)
pnpm test                       # vitest run
pnpm test:watch                 # watch mode
pnpm test:coverage              # strict coverage (100% thresholds)

# Single test file
pnpm test -- components/ui/button.test.tsx

# Single test by name
pnpm test -- -t "renders"
pnpm test -- components/ui/button.test.tsx -t "renders"

# Storybook
pnpm storybook                  # port 6006
pnpm build-storybook

# Full CI check
pnpm lint && pnpm exec tsc --noEmit && pnpm test && pnpm build
```

## Project Structure

```
app/                 # App Router (Server Components by default)
  layout.tsx         # Root layout + fonts + providers
  page.tsx           # Home (client component)
  globals.css        # Tailwind v4 + theme tokens
components/
  blocks/            # Page sections (header/footer/hero)
  providers/         # Client providers (theme, i18n, loaders)
  ui/                # UI primitives (Radix/shadcn-style)
features/            # Feature-specific logic (booking, ROI)
lib/
  api/               # Client-side API wrappers with typed results
  utils.ts           # cn() helper (clsx + tailwind-merge)
services/mockApi/    # Mock API (availability, holds, bookings)
stories/             # Storybook stories + MSW handlers
locales/             # i18n JSON files (es.json, en.json)
```

## Repo-Specific Notes

- Package manager: **pnpm** (lockfile: `pnpm-lock.yaml`).
- Module alias: `@/*` maps to repo root (`tsconfig.json` + `vitest.config.mjs`).
- Tailwind v4: configured via `app/globals.css` (`@import "tailwindcss"`); PostCSS in `postcss.config.mjs`; no `tailwind.config.*`.
- TypeScript excludes `stories/` and `.storybook/`.
- ESLint flat config ignores build outputs and `.storybook/**`.
- Storybook runs via Vite; `next/*` aliased to `.storybook/mocks/*`.
- Mock API enabled by default (`NEXT_PUBLIC_USE_MOCK_API=true` in `.env.local`); debug via `window.__mockState`.

## Code Style

### Formatting
- 2-space indentation, semicolons, double quotes. No Prettier.
- Keep diffs tight; avoid drive-by reformatting.
- Prefer readable multiline JSX/objects over dense one-liners.

### Imports
- Prefer `@/` absolute imports over deep relative paths.
- Group: (1) type-only, (2) React/Next, (3) third-party, (4) `@/` locals — separated by blank lines.
- Use `import type { ... }` or inline `type` modifiers: `import { clsx, type ClassValue } from "clsx"`.

### TypeScript
- `strict: true` — avoid `any`; prefer `unknown` + narrowing at boundaries.
- Use `type` for unions/utility types; `interface` when extension/merging is useful.
- Prefer typed result unions over throwing for expected failures:
  ```typescript
  type Result<T> = { ok: true; data: T } | { ok: false; code: string; message: string };
  ```
- Add `"use client"` when using hooks or browser APIs. Don't import browser-only modules into Server Components.

### Naming
- Components/files: `PascalCase`. Hooks: `camelCase` with `use*` prefix.
- Types: `PascalCase`. Constants: `UPPER_SNAKE_CASE`.
- Tests: `*.test.ts(x)` colocated next to the code they cover.

### React / Next.js Patterns
- Default to Server Components; add `"use client"` only when needed.
- `app/` pages/layouts: default-export the component; type metadata as `Metadata`.
- Providers live in `components/providers/` and compose in `app/layout.tsx`.
- i18n: direct JSON imports from `locales/{es,en}.json` (no i18n library).

### Styling (Tailwind v4)
- Use Tailwind utilities and design tokens from `app/globals.css`.
- Use `cn()` from `lib/utils.ts` for conditional class merging.
- Avoid inline styles unless no Tailwind/CSS-variable alternative exists.

### Icons
- Use `Icon` from `components/ui/icon.tsx` — never import lucide icons directly.
- Icon-only controls must have `aria-label`.

### Error Handling
- API wrappers (`lib/api/*`): return typed result unions; normalize parse/network errors.
- Wrap throwy code in `try/catch`; keep error shapes stable.
- Don't silently swallow UI errors; use `error.tsx` boundaries when introduced.

### Testing
- Vitest + jsdom + Testing Library. Setup/mocks in `vitest.setup.ts`.
- `vitest.setup.ts` mocks `next/link`, `next/image`, `next/navigation`.
- Prefer queries by role/label/text; use `user-event` for interactions.
- Coverage targets `components/**/*.{ts,tsx}` with 100% thresholds.
- Colocate tests: `component.tsx` → `component.test.tsx`.

### Storybook
- See `STORYBOOK.md` for conventions. Stories in `stories/`; MSW handlers in `stories/mocks/handlers.ts`.
- Use CSF3 (`satisfies Meta<typeof Component>`).

### Mock APIs
- Enabled by default for booking system (`services/mockApi/`).
- Toggle via `NEXT_PUBLIC_USE_MOCK_API` in `.env.local`.

### Environment & Secrets
- Never commit `.env*` files. Only expose client-safe values via `NEXT_PUBLIC_*`.
- `.env.example` has the required variable template.

### Git Hygiene
- Don't commit secrets, credentials, or build outputs (`.next/`, `out/`, `coverage/`).
- Keep changes focused; avoid touching unrelated files.

## Cursor / Copilot Rules

No Cursor rules (`.cursor/rules/`, `.cursorrules`) or Copilot instructions (`.github/copilot-instructions.md`) found.
