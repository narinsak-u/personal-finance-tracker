# AGENTS.md

## Project Overview

Personal finance tracker built with **Next.js 16 App Router**, **TypeScript** (strict), **Drizzle ORM** on PostgreSQL, **Tailwind CSS v4** with shadcn/ui components powered by `@base-ui/react`, and **Vitest** for testing.

- **Package manager:** npm
- **Node:** 18+
- **Database:** PostgreSQL 16 (via `postgres.js` driver)

## Architecture

```
Route Handler (src/app/api) → Service (src/services) → Repository (src/repositories) → Drizzle ORM → PostgreSQL
```

- Route handlers parse requests, call services, map errors via `handleError()`. **Never** put business logic in route handlers.
- Services handle Zod validation and cross-field rules, delegate to repositories.
- Repositories contain raw Drizzle queries and a `rowToTransaction()` mapper.
- `src/db/schema.ts` defines the Drizzle schema; `src/db/client.ts` creates the connection pool.

## Commands

```bash
npm run dev             # Next.js dev server
npm run build           # Production build
npm run start           # Production server
npm run lint            # ESLint (flat config)
npm run test            # Vitest in watch mode
npm run test:run        # Vitest single run
npm run test:coverage   # Vitest with coverage
npm run db:generate     # Generate Drizzle migrations
npm run db:migrate      # Run pending migrations
npm run db:push         # Push schema directly (dev only)
```

### Running a single test

```bash
npx vitest run tests/services/transactionService.test.ts
npx vitest run -t "test name pattern"
```

Vitest globals (`describe`, `it`, `expect`, `vi`, `beforeEach`) are enabled — no imports needed in test files.

## Code Style

### TypeScript

- **Strict mode** enabled (`tsconfig.json`)
- **No semicolons** — consistently omitted
- Path alias `@/` maps to `./src/` (configured in both `tsconfig.json` and `vitest.config.ts`)
- Use `import type` for type-only imports: `import type { Transaction } from '@/types/transaction'`

### Functions & Exports

- Prefer **named `function` declarations** over arrow functions, including exports:
  ```typescript
  export function rowToTransaction(row: TransactionRow): Transaction { ... }
  export default function RootLayout({ children }: Props) { ... }
  ```
- Arrow functions are acceptable for callbacks and inline handlers only.

### Components

- Server components (no `"use client"`): layout, page, SummaryCards
- Client components (with `"use client"` directive): Dashboard, CategoryBreakdown, TransactionForm, TransactionList, and all `ui/` components
- Component props typed via `interface Props { ... }` (not inline or `type`)

### Imports

- Use `@/` path alias for all internal imports
- Repository modules are imported with namespace pattern:
  ```typescript
  import * as transactionRepository from '@/repositories/transactionRepository'
  ```
- Default imports only for React components:
  ```typescript
  import SummaryCards from '@/components/SummaryCards'
  ```

### Styling

- Tailwind CSS v4 — CSS-based configuration via `@theme` in `globals.css`, powered by `@tailwindcss/postcss`
- `cn()` from `@/lib/utils` (clsx + tailwind-merge) for conditional class merging
- Components in `src/components/ui/` follow shadcn conventions with CVA variants

### Error Handling

- Server-side: custom `ValidationError` (wraps `ZodIssue[]`) and `NotFoundError` in `src/lib/errors.ts`
- `handleError()` in `src/lib/http.ts` maps errors to `NextResponse` with correct status codes
- Client-side: `try/catch` with `setError(err.message)` for form/UI state

### Schemas & Validation

- Zod v4 schemas in `src/schemas/transactionSchema.ts`
- Use `safeParse()` in tests to avoid throwing; check `.success` and `.error.issues`

### Client / Server Separation

- API client wrappers in `src/lib/api-client.ts` (`apiGet`, `apiPost`, `apiPut`, `apiDelete`) for client-side fetch calls
- Server-side data fetching uses direct function calls (services/repositories), never fetch to self
- `export const dynamic = "force-dynamic"` on pages that should always render fresh data

## Testing

All tests live under `tests/` with extension `.test.ts`. Test environment is **Node** (not jsdom).

### Mocking conventions

```typescript
// Top-level vi.mock, before any imports of the mocked module
vi.mock('@/db/client', () => ({
  db: { select: vi.fn(), insert: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))
vi.mock('@/repositories/transactionRepository')
```

- Use `vi.mocked(fn).mockReturnValue(value)` for type-safe mock setup
- Drizzle chainable queries are mocked with a `createChainableMock` helper that returns self for all builder methods and exposes a `.then()` for the final promise

### Zod tests

```typescript
const result = schema.safeParse(input)
expect(result.success).toBe(false)
```

## Environment

Copy `.env.example` to `.env` for local development:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance
```

## Docker

```bash
docker compose up    # Starts postgres:16-alpine + app container
```

The Dockerfile uses a multi-stage build (`node:22-alpine`), outputs a standalone Next.js build.
