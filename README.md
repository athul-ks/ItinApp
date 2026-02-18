# 🌍 ItinApp

**Smart Travel. Perfect Itineraries. Zero Stress.**

> _An AI-powered travel companion that generates personalized, day-by-day itineraries in seconds._

![Status](https://img.shields.io/badge/Status-Alpha-blue)
![Tech](https://img.shields.io/badge/Stack-Next.js_16_%7C_tRPC_%7C_Prisma-black)
![Auth](https://img.shields.io/badge/Auth-NextAuth.js-green)
![AI](https://img.shields.io/badge/AI-OpenAI_GPT--4o-purple)

[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=athul-ks_ItinApp&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=athul-ks_ItinApp)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=athul-ks_ItinApp&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=athul-ks_ItinApp)

## 📖 About The Project

**ItinApp** solves the "analysis paralysis" of modern travel planning. Instead of juggling dozens of browser tabs, blogs, and maps, users simply input their destination, travel dates, and budget. The application uses AI to generate a fully optimized, hour-by-hour itinerary that respects their financial constraints.

It is engineered as a high-performance **Monorepo** to ensure strict type safety from the database schema (Prisma) all the way to the frontend client (Next.js), deployed on a **Serverless** architecture.

### 🏗️ Evolution to Distributed Architecture

Initially a simple serverless application, ItinApp has evolved into a robust **Asynchronous Distributed System**. To handle the latency of AI generation without blocking the user interface, we decoupled the "Generation Logic" from the "Web Server."

- **Web App (Vercel):** Handles UI, Authentication, and fast read operations.
- **Worker Node (Docker/VM):** A dedicated background worker that processes long-running AI jobs via a **Redis Queue**.

This ensures the UI remains snappy even when hundreds of users are generating complex trips simultaneously.

### ✨ Key Features

- **🔐 Enterprise-Grade Security:**
  - **Snyk:** Automated vulnerability scanning for dependencies.
  - **NextAuth.js:** Secure Google OAuth with protected middleware.
- **⚡ Asynchronous AI Engine:**
  - **BullMQ & Redis:** Decoupled job processing prevents timeouts on Serverless functions.
  - **Worker Isolation:** AI generation runs on a dedicated worker service, scalable independently from the web app.
- **🛡️ Quality & Reliability:**
  - **SonarQube:** Continuous code quality analysis and "Clean Code" enforcement.
  - **End-to-End Testing:** **Playwright** suite running in CI to verify critical user flows.
  - **Unit Testing:** **Vitest** for robust logic verification.
- **📊 Deep Observability:**
  - **Better Stack:** Centralized structured logging (Web + Worker) and uptime monitoring.
  - **Sentry:** Full-stack error tracking with source map integration.
  - **Analytics:** Built-in Vercel Analytics and Real-time Discord Alerts for new user signups.

---

## 🛠 Tech Stack

Built with the **T3 Stack** philosophy, optimized for deployment and scale.

- **Monorepo Tool:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Async Processing:** Redis + BullMQ (Job Queue)
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v4 Adapter)
- **AI Provider:** OpenAI API
- **API Layer:** [tRPC](https://trpc.io/)
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Monitoring:** [Sentry](https://sentry.io/), Vercel Analytics & Better Stack (Logs/Uptime)

---

## 📂 Project Structure

The codebase is organized as a Turborepo monorepo:

```text
.
├── apps/
│   ├── web/                # Next.js Frontend (Vercel)
│   ├── worker/             # Node.js Background Worker (Docker/VM)
│   └── e2e/                # Playwright End-to-End Tests
├── packages/
│   ├── api/            # tRPC routers (Trip generation logic)
│   ├── auth/           # NextAuth configuration & session logic
│   ├── db/             # Prisma schema and database client
│   ├── ui/             # Shared UI components (Shadcn/Radix)
│   └── configs/        # Shared TSConfig and ESLint settings
└── turbo.json          # Build pipeline configuration
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: `v20+`
- **pnpm**: `v9+`
- **PostgreSQL**: Local or cloud instance (e.g., Supabase/Neon).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https:/`/github.com/athul-ks/ItinApp.git`
    cd ItinApp
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up Environment Variables:**
    Copy the example file to create your local configuration.

    ```bash
    cp .env.example .env
    ```

    Open `.env` and fill in the missing values:

4.  **Initialize the Database:**
    Push the Prisma schema to your database:

    ```bash
    pnpm db:push
    ```

5.  **Run the Development Server:**
    Start the entire stack (Web + API + DB generation):
    ```bash
    pnpm dev
    ```
    The app should now be running at [http://localhost:3000](http://localhost:3000).

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Foundation (Completed)

- [x] Monorepo Architecture Setup
- [x] Database Schema Design (Users, Trips, Itineraries)
- [x] Authentication (Google Login + Middleware Protection)
- [x] Basic AI Trip Generation (OpenAI Integration)
- [x] "Plan Trip" Form UI

### 🚧 Phase 2: Visuals & Immersion (Current Focus)

- [x] **Dynamic Imagery:** Fetch destination photos via Unsplash/Google Places API.
- [x] **Interactive Maps:** Split-screen view with pins for daily activities.
- [x] **Day-by-Day UI:** Tabbed interface for easier itinerary navigation.

### 🔮 Phase 3: The "Editor" Experience

- [ ] **Drag-and-Drop:** Reorder activities within the timeline.
- [ ] **Regenerate Item:** "Don't like this museum? Swap it."
- [ ] **Custom Activities:** Manually add your own events (e.g., "Dinner with friends").

### 📦 Phase 4: Persistence & Dashboard

- [x] **User Dashboard:** View past and upcoming trips.
- [ ] **PDF Export:** Download itinerary for offline use.
- [ ] **Trip Management:** Rename or delete generated trips.

### 🚀 Phase 5: Social & Growth

- [ ] **Shareable Links:** Public read-only pages for trips.
- [ ] **Booking Integration:** "Find Hotels" links (Affiliate/API hooks).

---

## ⚖️ License & Copyright

© 2025 Athul. All Rights Reserved.

This source code is the intellectual property of the author. It is provided publicly for educational and portfolio demonstration purposes only.

- **You may:** View, fork, and download the code for personal learning.
- **You may NOT:** Use this code for commercial purposes, distribute it, modify it for a competing product, or sublicense it without explicit written permission from the author.
