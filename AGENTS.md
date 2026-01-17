# 🤖 ItinApp - AI Agent Context

> **Start Here:** This file provides the architectural context, coding standards, and business logic required to modify the ItinApp codebase. Read this before attempting to refactor or generate code.

## 1. Project Identity & Stack

**Name:** ItinApp
**Description:** A SaaS application that generates personalized, day-by-day travel itineraries using AI (GPT-4o).
**Monorepo Tool:** Turborepo
**Package Manager:** pnpm

### Core Tech Stack (The "T3 Stack")

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS v4 + Shadcn UI (Radix Primitives)
- **API Layer:** tRPC (Server Actions / React Query wrapper)
- **Database:** PostgreSQL (via Prisma ORM)
- **Auth:** NextAuth.js (v4 Adapter) with Google OAuth

---

## 2. Monorepo Structure

| Path               | Purpose                  | Key Patterns                                                          |
| :----------------- | :----------------------- | :-------------------------------------------------------------------- |
| `apps/web`         | Main Next.js application | Client components in `src/app`, Server Components default.            |
| `apps/e2e`         | Playwright E2E tests     | Uses `ENABLE_E2E_MOCKS` to bypass external APIs.                      |
| `packages/api`     | Backend Logic (tRPC)     | Contains all `routers`. **Business logic lives here**, not in the UI. |
| `packages/db`      | Database                 | `schema.prisma` defines the data model.                               |
| `packages/auth`    | Authentication           | Shared NextAuth options.                                              |
| `packages/schemas` | Shared Types             | Zod schemas shared between Frontend, Backend, and AI prompts.         |
| `packages/ui`      | UI Library               | Reusable, dumb components (Buttons, Dialogs).                         |
| `packages/env`     | Env Validation           | `t3-env` validates environment variables at runtime/build time.       |

---

## 3. Critical Business Rules

### A. The Credit System 💰

- **Monetization:** Freemium.
- **Signup Bonus:** New users receive **5 free credits** automatically (defined in Prisma `@default(5)`).
- **Cost:** 1 generated trip = 1 credit.
- **Restriction:** Users with 0 credits cannot generate trips.
- **Refunds:** If the OpenAI API call fails, the credit MUST be refunded to the user immediately.

### B. Privacy & Compliance 🇬🇧

- **GDPR:** We must adhere to UK/EU data laws.
- **Right to Erasure:** A "Delete Account" feature is mandatory (currently pending implementation).
- **PII:** Do not log PII (emails, names) to Sentry or Console in production.

---

## 4. Architectural Patterns

### 🔄 Data Fetching (tRPC)

- **Mutation:** `api.trip.generate` handles the heavy lifting (OpenAI calls).
- **Query:** `api.trip.getById` fetches trip details.
- **Client Usage:** Use `api.trip.generate.useMutation()` in Client Components.
- **Server Usage:** Use the `api` caller in `apps/web/src/trpc/server.ts` for Server Components.

### 🧠 AI Generation Flow

1.  **Input:** User selects Destination, Dates, Budget.
2.  **Guard:** Check User Credits > 0.
3.  **Process:** Call OpenAI (GPT-4o) with `zodTextFormat` to enforce `TripOptionsSchema`.
4.  **Constraint:** The AI **MUST** return exactly 3 options (Fast, Balanced, Relaxed).
5.  **Storage:** The complex JSON result is stored in `Trip.tripData` (JSONB column) rather than normalized tables.

### 📐 Testing Strategy (The "Mock Triangle")

- **Philosophy:** We test against the **Production Build** in CI.
- **Determinism:** We mock OpenAI and Unsplash in E2E tests to prevent flakiness and costs.
- **Implementation:**
  - If `env.ENABLE_E2E_MOCKS === 'true'`, the API returns fixed JSON from `packages/schemas/src/testing.ts`.
  - **Do not break this mock path.** It is critical for CI stability.

---

## 5. Development Commands

| Command        | Description                                           |
| :------------- | :---------------------------------------------------- |
| `pnpm dev`     | Starts the full stack (Web + DB generation).          |
| `pnpm db:push` | Pushes schema changes to the local Postgres instance. |
| `pnpm db:seed` | Seeds the database with a test user and dummy trip.   |
| `pnpm test`    | Runs Unit Tests (Vitest).                             |
| `pnpm build`   | Builds all apps/packages (Turborepo).                 |

---

## 6. Coding Standards for Agents

1.  **Strict Types:** Never use `any`. Use `zod` schemas from `@itinapp/schemas` for data validation.
2.  **Server Actions:** Do not create raw API routes in `app/api`. Use tRPC procedures in `packages/api`.
3.  **UI Components:** Do not import from external libraries directly in pages. Use the wrapper components in `@itinapp/ui` (e.g., `import { Button } from '@itinapp/ui/components/button'`).
4.  **Env Vars:** Never access `process.env` directly. Import `env` from `@itinapp/env`.

## 7. Known Issues / Gotchas

- **Race Conditions:** The current credit deduction logic (Read -> Write) is not atomic. When refactoring `trip.generate`, prefer atomic SQL updates (e.g., `updateMany` with a `where` clause).
- **Timeouts:** The Vercel Serverless Function limit is 60s. Generating 3 itineraries often takes longer. Future work involves moving this to an async job queue.
