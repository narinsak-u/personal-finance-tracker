# Personal Finance Tracker

A full-stack web application for recording and tracking personal income and expense transactions. Features include transaction CRUD, filtering by type/category/date range, real-time summary statistics, and per-category breakdown visualizations.

Built with a clean layered architecture (Route Handler → Service → Repository → Database) to maintain separation of concerns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM v0.45 |
| **Validation** | Zod v4 |
| **Styling** | Tailwind CSS v4 + shadcn/ui (`@base-ui/react`) |
| **Charts** | Recharts |
| **Testing** | Vitest v4 |
| **Container** | Docker + Docker Compose |

## Project Structure

```
personal-finance-tracker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transactions/
│   │   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts       # GET, PUT, DELETE by id
│   │   │   └── summary/
│   │   │       └── route.ts           # GET (summary by date range)
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Dashboard page (server component)
│   │   └── globals.css
│   ├── components/
│   │   ├── Dashboard.tsx              # Main dashboard (client)
│   │   ├── SummaryCards.tsx            # Income/expense/net cards
│   │   ├── TransactionForm.tsx         # Add/edit transaction form
│   │   ├── TransactionList.tsx         # Transaction table with filters
│   │   ├── CategoryBreakdown.tsx       # Bar chart by category
│   │   └── ui/                         # shadcn/ui primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── badge.tsx
│   │       ├── calendar.tsx
│   │       ├── chart.tsx
│   │       ├── label.tsx
│   │       ├── popover.tsx
│   │       └── radio-group.tsx
│   ├── db/
│   │   ├── client.ts                  # PostgreSQL connection pool
│   │   └── schema.ts                  # Drizzle schema + enums
│   ├── lib/
│   │   ├── api-client.ts              # Client-side fetch wrappers
│   │   ├── errors.ts                  # ValidationError, NotFoundError
│   │   ├── format.ts                  # Currency/date formatters
│   │   ├── http.ts                    # handleError() for route handlers
│   │   └── utils.ts                   # cn() (clsx + tailwind-merge)
│   ├── repositories/
│   │   └── transactionRepository.ts   # Drizzle queries + row mapper
│   ├── schemas/
│   │   └── transactionSchema.ts       # Zod v4 schemas
│   ├── services/
│   │   ├── transactionService.ts      # Transaction business logic
│   │   └── summaryService.ts          # Summary aggregation logic
│   └── types/
│       └── transaction.ts             # Domain types + constants
├── tests/
│   ├── lib/format.test.ts
│   ├── schemas/transactionSchema.test.ts
│   ├── repositories/transactionRepository.test.ts
│   ├── services/transactionService.test.ts
│   └── services/summaryService.test.ts
├── drizzle/                           # Generated migrations
├── scripts/
│   └── migrate.mjs                    # Runtime migration script
├── public/
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## Architecture

```
Route Handler (HTTP) → Service (Business Logic) → Repository (Data Access) → Drizzle ORM → PostgreSQL
```

- **Route Handlers** (`src/app/api/`): Parse HTTP requests, delegate to services, map errors via `handleError()`. Contains zero business logic.
- **Services** (`src/services/`): Zod validation, cents conversion (stored as integers), domain rules, cross-field validation.
- **Repositories** (`src/repositories/`): Raw Drizzle queries, row-to-domain mapping with `rowToTransaction()`.
- **DB** (`src/db/`): Schema definitions (`schema.ts`) and connection pool (`client.ts`).

All files are under 200 lines.

## Database Schema

The `transactions` table stores amounts in **cents** (integer) to avoid floating-point issues:

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Auto-generated primary key |
| `type` | enum | `income` or `expense` |
| `amount` | integer | Stored in cents |
| `category` | text | Validated against per-type categories |
| `date` | date | Transaction date |
| `note` | text | Optional, nullable |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-set |

Constraint: `amount > 0`

### Categories

| Type | Categories |
|------|-----------|
| Expense | food, utilities, entertainment, shopping, other |
| Income | salary, investment, gift, other |

## API Endpoints

| Method | Path | Query Params | Description |
|--------|------|-------------|-------------|
| GET | `/api/transactions` | `type`, `category`, `from`, `to` | List transactions (optional filters) |
| POST | `/api/transactions` | — | Create a transaction |
| GET | `/api/transactions/:id` | — | Get a single transaction |
| PUT | `/api/transactions/:id` | — | Update a transaction |
| DELETE | `/api/transactions/:id` | — | Delete a transaction |
| GET | `/api/summary` | `from`, `to` (required) | Summary: totals + breakdown by category |

### Request/Response Examples

**POST /api/transactions**
```json
{
  "type": "expense",
  "amount": 25.50,
  "category": "food",
  "date": "2026-07-01",
  "note": "Lunch"
}
```
*Amounts are sent/received in dollars; stored as cents internally.*

**GET /api/summary?from=2026-01-01&to=2026-12-31**
```json
{
  "from": "2026-01-01",
  "to": "2026-12-31",
  "totalIncome": 5000.00,
  "totalExpense": 1250.00,
  "netBalance": 3750.00,
  "byCategory": [
    { "type": "expense", "category": "food", "total": 500.00 },
    { "type": "income", "category": "salary", "total": 5000.00 }
  ]
}
```

## Prerequisites

- Node.js 18+
- Docker + Docker Compose (for containerized setup)
- Or a local PostgreSQL 16 instance

## Setup & Run

### Using Docker (recommended)

```bash
# 1. Clone and enter the project
cd personal-finance-tracker

# 2. Create environment file
cp .env.example .env

# 3. Start services (PostgreSQL + app)
docker compose up --build

# 4. In another terminal, run migrations
docker compose exec app npm run db:migrate

# 5. Open http://localhost:3000
```

### Local Development (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start PostgreSQL (or use Docker for just the DB)
docker compose up postgres -d

# 3. Create environment file
cp .env.example .env

# 4. Push schema to database
npm run db:push

# 5. Start dev server
npm run dev

# 6. Open http://localhost:3000
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/finance` | PostgreSQL connection string |

Copy `.env.example` to `.env` and adjust as needed.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint (flat config) |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once |
| `npm run test:coverage` | Run Vitest with coverage |
| `npm run db:generate` | Generate Drizzle migration files |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema directly (dev only) |

### Running a Single Test

```bash
npx vitest run tests/services/transactionService.test.ts
npx vitest run -t "test name pattern"
```

## Testing

Tests are written with Vitest (globals enabled — no imports needed) and run in a Node environment (no jsdom). The test suite covers:

| Test File | What It Tests |
|-----------|--------------|
| `tests/lib/format.test.ts` | Currency and date formatting |
| `tests/schemas/transactionSchema.test.ts` | Zod validation (create, update, filters, summary) |
| `tests/repositories/transactionRepository.test.ts` | CRUD queries, row-to-domain mapping |
| `tests/services/transactionService.test.ts` | Business logic, cents conversion, error handling |
| `tests/services/summaryService.test.ts` | Summary aggregation, edge cases |
