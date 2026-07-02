# CNPM Fe

E-commerce frontend for the CNPM coursework project. A full-stack React app built on TanStack Start, integrating with a REST backend for product catalog, shopping cart, checkout, user accounts, notifications, and role-based management consoles.

## Project Summary

This application serves two audiences:

| Area | Routes | Purpose |
|---|---|---|
| **Consumer** | `/`, `/product/$slug`, `/shop/$slug`, `/cart`, `/checkout`, `/me/*` | Browse products and shops, manage cart, place orders, view discounts, manage profile/addresses/orders/notifications |
| **Management** | `/manage/*`, `/manage/shop/*` | Platform and shop administration — products, inventory, orders, discounts, warehouses, deliveries, staff, roles, and more |

Key capabilities:

- **Authentication** — sign-in, sign-up, token refresh, session bootstrap
- **RBAC** — permissions hydrated from the backend; route guards and component-level gating via `<RequirePermission>`
- **Server state** — TanStack Query caches API responses; route loaders prefetch critical data
- **Real-time** — WebSocket notifications for authenticated users
- **Image uploads** — presigned S3 URLs for user avatars and shop logos

The backend API contract lives in [`docs/postman/cnpm-be.postman_collection.json`](docs/postman/cnpm-be.postman_collection.json).

---

## Tech Stack

### Build & Runtime

| Tool | Version | How we use it |
|---|---|---|
| **Vite** | 8 | Dev server, production bundling. Plugins: `@tanstack/react-start`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `@tanstack/devtools-vite` |
| **React** | 19 | Function components only. Named exports preferred |
| **TypeScript** | 6 | Strict mode, `verbatimModuleSyntax`, ESM (`"type": "module"`) |
| **Yarn** | 4 Berry | Package manager — `yarn.lock` is the source of truth |

### Routing & SSR

| Tool | How we use it |
|---|---|
| **TanStack Router** | File-based routes in `src/routes/`. Route tree auto-generated into `src/routeTree.gen.ts` (do not edit). Typed navigation via `<Link to="…">` and `useNavigate()` |
| **TanStack Start** | SSR framework on top of Vite. Server functions available via `createServerFn` when server-only logic is needed |
| **TanStack Router SSR Query** | `setupRouterSsrQueryIntegration` in `src/router.tsx` wires Query + Router for SSR-aware data fetching |

Route files own loaders, guards, and search-param validation; UI lives in `src/pages/`.

### State Management

Three layers — each with a clear role:

| Layer | Tool | Scope |
|---|---|---|
| Global client state | `@tanstack/store` + `@tanstack/react-store` | Auth tokens, role/permissions, theme (`src/stores/`) |
| Server cache | `@tanstack/react-query` | All API-backed data (`src/lib/query/`) |
| URL state | TanStack Router search params (Zod-validated) | Pagination, filters, search |
| Component-local | `useState` / `useReducer` | Modals, form drafts, transient UI |

Do not duplicate query/loader data into the client store.

### Data Fetching & API

| Tool | How we use it |
|---|---|
| **Native `fetch`** | All HTTP goes through `apiRequest()` in `src/lib/api/client.ts` — Bearer auth, single-flight 401 refresh |
| **Zod** | v4 schemas in `src/lib/schemas/` validate every external boundary (API responses, forms, search params). Types derived via `z.infer<typeof schema>` |
| **TanStack Query** | Query keys in `src/lib/query/keys.ts`; `*QueryOptions()` factories in `src/lib/query/<resource>.ts`; mutations via `createMutationOptions()` |

Consumption patterns:

1. **Route loader + `queryClient.fetchQuery`** — preferred for page-critical data
2. **`useQuery` with `queryOptions` factory** — reactive UI (e.g. cart badge count)
3. **Direct API in loader** — acceptable for one-off fetches without caching

### Forms

| Tool | How we use it |
|---|---|
| **TanStack Form** | `@tanstack/react-form` + Zod per-field validators (`validators: { onChange: schema.shape.<field> }`) |
| **Schemas** | Single source of truth in `src/lib/schemas/` — no `react-hook-form` |

### UI & Styling

| Tool | How we use it |
|---|---|
| **shadcn/ui** | Primary component library (`new-york` style, `zinc` base). Install via `yarn dlx shadcn@latest add <name>` → `src/components/ui/` |
| **Tailwind CSS** | v4 — entry at `src/styles.css`. Brand tokens + shadcn semantic palette. Dark mode via `class="dark"` on `<html>` |
| **Lucide React** | Icon library |
| **class-variance-authority** | Variant props on shadcn primitives |
| **`cn()`** | Class merger in `src/lib/utils.ts` (`clsx` + `tailwind-merge`) — always merge Tailwind classes through this |
| **Sonner** | Toast notifications — `<Toaster />` mounted in `src/routes/__root.tsx` |
| **isomorphic-dompurify** | Sanitise untrusted HTML via `sanitizeHtml()` / `<RichText />` |

### Testing & Quality

| Tool | How we use it |
|---|---|
| **Vitest** | 4 — unit tests (`yarn test`). Reads `vite.config.ts`; no separate config yet |
| **Testing Library** | React component tests with role-based selectors |
| **ESLint** | 9 flat config via `@tanstack/eslint-config` |
| **Prettier** | 3 — `semi: false`, `singleQuote: true`, `trailingComma: 'all'` |

---

## Code Conventions

### Architecture

```
routes/  →  pages/<feature>/  →  components/<area>/  →  components/ui/
                ↓                        ↓
           lib/query/              lib/ (api, schemas, rbac)
```

- **`lib/*`** is framework-agnostic — must not import from `routes/`, `pages/`, `components/`, or `hooks/`
- **Route files** are thin: `createFileRoute`, loader, guards, delegate UI to `pages/`
- **Cross-route reuse** goes to `components/`, `hooks/`, or `lib/` — not across feature folders
- **Private helpers** co-locate as `pages/<feature>/_*.ts` (underscore prefix)

### File & Naming

| Kind | Convention | Example |
|---|---|---|
| TypeScript files | kebab-case | `use-cart-actions.ts`, `auth-card.tsx` |
| Route files | TanStack Router conventions | `product.$slug.tsx`, `__root.tsx` |
| React components | PascalCase export, kebab-case file | `auth-card.tsx` → `AuthCard` |
| Private helpers | `_camelCase` prefix | `_normalizeKey()` |
| Constants | `SCREAMING_SNAKE_CASE` | `QUERY_STALE_TIME_MS` |
| Hooks | `use*` in `use-*.ts` files | `use-cart-item-count.ts` |

### Imports

- Prefer `#/*` path alias (`#/lib/utils`) — matches shadcn and `package.json` imports
- `@/*` is also configured; do not mix both in the same file
- Type-only imports must use `import type { … }` (`verbatimModuleSyntax`)
- No deep relative paths (`../../..`)

### TypeScript

- No `any` — use `unknown` and narrow
- No `enum` — use `as const` object maps + union types
- No default exports (except where the framework requires them)
- Schema-first: define Zod schema, infer type with `z.infer`
- Every exported function/component declares explicit parameter and return types

### API & Query Layer

- One file per resource: `src/lib/api/<resource>.ts` + `src/lib/schemas/<resource>.schema.ts`
- Parse every API response through Zod
- Query keys only in `src/lib/query/keys.ts` — never inline in components
- Pass `AbortSignal` from loaders or `useQuery` to API calls
- Components never call `fetch` or `apiRequest` directly

### Routing

- User-visible URLs use **slugs**, not raw entity IDs (`/product/wireless-earbuds-pro`, not `/product/uuid`)
- Auth guards: `ensureAuthenticated()` / `ensureAnonymous()` from `src/lib/auth-guards.ts`
- Permission guards: `ensurePermission()` from `src/lib/rbac/guards.ts`
- Component gating: `<RequirePermission>` from `src/components/rbac/require-permission.tsx`
- Permission constants in `src/lib/rbac/constants/` — never hardcode permission strings

### UI

- Install shadcn primitives — do not hand-author files in `src/components/ui/`
- Merge classes with `cn()`; prefer design-token utilities (`bg-background`, `text-foreground`)
- Every clickable surface shows pointer cursor (handled globally in `src/styles.css`)
- Buttons without visible text need `aria-label`
- Untrusted HTML only through `<RichText />`

### Commits

Conventional Commits: `feat`, `fix`, `docs`, `refactor`, etc. — lower-case scope, no trailing period on subject.

---

## Project Structure

```
src/
├── router.tsx              # QueryClient + Router + SSR query integration
├── routeTree.gen.ts          # Generated route tree — DO NOT EDIT
├── routes/                   # File-based routes (thin: loader, guards, page import)
├── pages/                    # Route-owned UI + co-located helpers
├── components/
│   ├── ui/                   # shadcn primitives
│   ├── layout/               # App shell, headers, sidebars
│   ├── auth/                 # Auth composites
│   └── <area>/               # Shared feature widgets
├── hooks/                    # Cross-route hooks (use-*.ts)
├── stores/                   # @tanstack/store slices (auth, theme)
└── lib/
    ├── api/                  # apiRequest wrappers per resource
    ├── query/                # Query keys, options, invalidation helpers
    ├── schemas/              # Zod schemas (single source of truth)
    ├── rbac/                 # Permission constants, hooks, guards
    └── utils.ts              # cn(), stableJsonKey()
```

---

## Getting Started

### Prerequisites

- Node.js (LTS recommended)
- Yarn 4 (`corepack enable` if needed)

### Install & Run

```bash
yarn install
yarn dev        # http://localhost:5173
```

### Environment Variables

Create a `.env` file (git-ignored):

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_S3_PUBLIC_BASE_URL=https://your-bucket.s3.amazonaws.com
```

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | REST API base URL (read via `import.meta.env`) |
| `VITE_S3_PUBLIC_BASE_URL` | Public S3/CDN base for resolving image keys |

### Scripts

```bash
yarn dev        # Start dev server (port 5173)
yarn build      # Production build
yarn preview    # Preview production build
yarn test       # Run Vitest
yarn lint       # ESLint
yarn format     # Prettier write + ESLint fix
yarn check      # Prettier check only
yarn tsc --noEmit   # TypeScript verification (no script alias)
```

### Adding shadcn Components

```bash
yarn dlx shadcn@latest add button
```

Generated files land in `src/components/ui/`.

---

## Backend Integration

- **Contract**: [`docs/postman/cnpm-be.postman_collection.json`](docs/postman/cnpm-be.postman_collection.json)
- **Base path**: `/api/v1`
- **Auth**: Bearer access token; auto-refresh on 401
- **Scope**: Consumer routes use public/user APIs; `/manage` additionally calls `/shop/*` and `/admin/*` namespaces
