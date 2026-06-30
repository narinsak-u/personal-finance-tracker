# Personal Finance Tracker

A personal finance tracker to record income and expense transactions, with filtering, summary, and per-category breakdown.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Drizzle ORM
- Zod validation
- Tailwind CSS
- Vitest (unit tests)
- Docker + Docker Compose

## Prerequisites

- Node.js 18+
- Docker + Docker Compose

## Setup & Run with Docker

1. **Clone and enter the project:**
   ```bash
   cd personal-finance-tracker
   ```

2. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

3. **Start services with Docker Compose:**
   ```bash
   docker-compose up --build
   ```
   This starts:
   - PostgreSQL on port 5432
   - Next.js app on port 3000

4. **Run database migration (in a new terminal):**
   ```bash
   docker-compose exec app npm run db:migrate
   ```
   Or, if running locally:
   ```bash
   npm run db:migrate
   ```

5. **Open the app:**
   Navigate to http://localhost:3000

## Local Development (without Docker)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start PostgreSQL:**
   You can use Docker for just the database:
   ```bash
   docker-compose up postgres -d
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Run database migration:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
   Or push schema directly:
   ```bash
   npm run db:push
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```

6. **Open the app:**
   Navigate to http://localhost:3000

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage
```

## Test Files

| File | Tests |
|---|---|
| `tests/lib/format.test.ts` | Currency and date formatting |
| `tests/schemas/transactionSchema.test.ts` | Zod validation (create, update, filters, summary) |
| `tests/repositories/transactionRepository.test.ts` | CRUD queries, row-to-domain mapping |
| `tests/services/transactionService.test.ts` | Business logic, cents conversion, error handling |
| `tests/services/summaryService.test.ts` | Summary aggregation, edge cases |

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/transactions` | List (optional filters: type, category, from, to) |
| POST | `/api/transactions` | Create |
| GET | `/api/transactions/:id` | Get one |
| PUT | `/api/transactions/:id` | Update |
| DELETE | `/api/transactions/:id` | Delete |
| GET | `/api/summary` | Summary (required: from, to) |

## Architecture (Layered SOC)

```
Route Handlers → Service → Repository → Database
```

- **Route Handlers:** HTTP transport only (parse request, call service, map errors)
- **Service:** Business logic (Zod validation, cents conversion, domain rules)
- **Repository:** Data access (Drizzle queries, row-to-domain mapping)
- **DB:** Schema definitions and client

All files are under 200 lines.
