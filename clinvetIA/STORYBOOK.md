# Storybook

## Run Storybook

```bash
pnpm install
pnpm storybook
```

## Build Storybook

```bash
pnpm build-storybook
```

## Where stories live

- `stories/ui/*.stories.tsx` for shadcn/ui components and primitives.
- `stories/mocks/handlers.ts` for MSW mocks used by UI components.

## Adding a new story

1. Create a `*.stories.tsx` file in `stories/ui/`.
2. Use CSF3 with `satisfies Meta<typeof Component>`.
3. Prefer real variants used in the app (sizes, states, disabled, etc.).
4. Keep Tailwind-only styling (no inline styles).
