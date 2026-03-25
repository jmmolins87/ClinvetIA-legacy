# ClinvetIA - Frontend Application

Sistema de atención inteligente para clínicas veterinarias.

## Desarrollo

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo (http://localhost:3000)
pnpm dev

# Build de producción
pnpm build

# Iniciar servidor de producción
pnpm start

# Linting
pnpm lint

# Type checking
pnpm exec tsc --noEmit

# Tests
pnpm test
```

## Estructura del Proyecto

```
├── app/                      # Next.js App Router
│   ├── (main)/              # Grupo de rutas principal
│   │   ├── page.tsx         # Home
│   │   ├── roi/             # Calculadora ROI
│   │   ├── reservar/        # Booking/Calendar
│   │   ├── contacto/        # Formulario contacto
│   │   └── ...
│   ├── layout.tsx           # Root layout
│   ├── globals.css          # Estilos globales
│   └── not-found.tsx        # Página 404
├── components/
│   ├── blocks/              # Secciones (header, footer, etc.)
│   ├── providers/           # Context providers
│   └── ui/                  # Componentes UI (shadcn)
├── features/                # Lógica de negocio por feature
│   ├── roi/                 # ROI calculator logic
│   ├── booking/             # Booking logic
│   └── contact/             # Contact form logic
├── lib/                     # Utilidades compartidas
│   ├── storage.ts           # SSR-safe localStorage
│   ├── validators.ts        # Validaciones
│   └── time.ts              # Timezone utils
├── constants/               # Constantes de aplicación
│   └── app.ts               # Storage keys, config, etc.
├── services/                # Servicios y adapters
│   ├── api/                 # API adapters
│   └── mockApi/             # Mocks deterministas
├── docs/                    # Documentación
│   ├── parity-matrix.md     # Matriz de paridad con legacy
│   └── smoke-flow.md        # Flujos de testing manual
└── locales/                 # Traducciones i18n
    ├── es.json
    └── en.json
```

## Paridad con Legacy

Este proyecto mantiene **paridad funcional 1:1** con el repositorio legacy.

Consulta la documentación:
- **Matriz de paridad:** [`docs/parity-matrix.md`](./docs/parity-matrix.md)
- **Smoke testing:** [`docs/smoke-flow.md`](./docs/smoke-flow.md)

## Imports con Alias `@`

Todos los imports usan el alias `@` configurado en `tsconfig.json`:

```typescript
// ✅ Correcto
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS } from "@/constants/app";
import { getItem } from "@/lib/storage";

// ❌ Evitar
import { Button } from "../../components/ui/button";
```

## Storage Keys

Las keys de `localStorage` y `sessionStorage` deben coincidir **exactamente** con legacy:

```typescript
// Ver constants/app.ts
STORAGE_KEYS = {
  ROI_DATA: "clinvetia-roi-data",
  CALENDLY_DATA: "clinvetia-calendly-data",
  CONTACT_DRAFT: "clinvetia-contact-draft",
  CONTACT_SUBMITTED: "clinvetia-contact-submitted",
  LANG: "clinvetia.lang",
  THEME: "theme",
  PENDING_BOOKING: "clinvetia-pending-booking",  // sessionStorage
  LAST_BOOKING: "lastBooking",                    // sessionStorage
}
```

## Timezone

Todas las operaciones de booking usan **Europe/Madrid** timezone.

```typescript
import { TIMEZONE, SAME_DAY_CUTOFF_HOUR } from "@/lib/time";

// Cutoff: 19:30
// Después de esta hora, no se permiten reservas same-day
```

## SSR Safety

Todos los accesos a `window`, `localStorage`, `sessionStorage` están protegidos:

```typescript
import { getItem, setItem } from "@/lib/storage";

// ✅ SSR-safe
const data = getItem<ROIData>(STORAGE_KEYS.ROI_DATA);

// ❌ Crash en SSR
const data = JSON.parse(localStorage.getItem("key"));
```

## Validación de Flujos

Antes de considerar una feature completa, ejecuta los smoke tests:

```bash
# 1. Iniciar dev server
pnpm dev

# 2. Abrir docs/smoke-flow.md
# 3. Ejecutar cada flujo manualmente
# 4. Verificar checkboxes en smoke-flow.md
```

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **React:** 19
- **TypeScript:** Strict mode
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Testing:** Vitest + Testing Library
- **Storybook:** Component documentation

## Reglas de Código

- **Strict TypeScript:** No `any`, preferir `unknown` con narrowing
- **SSR-safe:** Guards para browser APIs
- **No NaN/Infinity:** Validar inputs numéricos (ROI)
- **Imports:** Siempre con alias `@`
- **Storage:** Keys exactas de legacy
- **Formato:** 2 spaces, semicolons, double quotes

Consulta [`AGENTS.md`](./AGENTS.md) para guías detalladas.

## License

Proprietary - ClinvetIA
