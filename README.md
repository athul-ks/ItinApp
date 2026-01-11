# 🌍 ItinApp

**Smart Travel. Perfect Itineraries. Zero Stress.**

> _An AI-powered travel companion that generates personalized, day-by-day itineraries in seconds._

![Status](https://img.shields.io/badge/Status-Alpha-blue)
![Tech](https://img.shields.io/badge/Stack-Next.js_16_%7C_tRPC_%7C_Prisma-black)
![Auth](https://img.shields.io/badge/Auth-NextAuth.js-green)
![AI](https://img.shields.io/badge/AI-OpenAI_GPT--4o-purple)

## 📖 About The Project

**ItinApp** solves the "analysis paralysis" of modern travel planning. Instead of juggling dozens of browser tabs, blogs, and maps, users simply input their destination, travel dates, and budget. The application uses AI to generate a fully optimized, hour-by-hour itinerary that respects their financial constraints.

It is engineered as a high-performance **Monorepo** to ensure strict type safety from the database schema (Prisma) all the way to the frontend client (Next.js), deployed on a **Serverless** architecture.

### ✨ Key Features (Implemented)

- **🔐 Secure Authentication:** Robust Google Sign-In via NextAuth.js with protected route middleware.
- **🧠 AI-Powered Engine:** Connects to OpenAI to generate context-aware travel plans based on "Vibe" (Relaxed, Balanced, Fast).
- **⚡ Serverless Infrastructure:** Deployed on Vercel with Supabase Connection Pooling (PgBouncer) for massive scalability.
- **🛡️ Enterprise-Grade Safety:** Real-time error tracking via Sentry and automated testing pipelines (Vitest for logic, Playwright for E2E).
- **📊 Observability:** Built-in Vercel Analytics and Real-time Discord Alerts for new user signups.
- **⏳ Progressive UX:** Smart loading states that keep users engaged while the AI curates the trip.
- **💰 Smart Budgeting:** Input your budget level (Economy, Standard, Luxury) to get tailored recommendations.
- **⚡ End-to-End Type Safety:** Fully typed API communication using tRPC and Zod.

---

## 🛠 Tech Stack

Built with the **T3 Stack** philosophy, optimized for deployment and scale.

- **Monorepo Tool:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (v4 Adapter)
- **AI Provider:** OpenAI API
- **API Layer:** [tRPC](https://trpc.io/)
- **Database:** PostgreSQL with [Prisma ORM](https://www.prisma.io/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) & [Playwright](https://playwright.dev/) (E2E)
- **Monitoring:** [Sentry](https://sentry.io/) & Vercel Analytics

---

## 📂 Project Structure

The codebase is organized as a Turborepo monorepo:

```text
.
├── web/                # Main Next.js frontend application
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
    Create a .env file with your credentials (see .env.example). You will need API keys for OpenAI, Google OAuth, and a Supabase database URL.

    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/itinapp"

    # Authentication (NextAuth)
    NEXTAUTH_URL="http://localhost:3000"
    NEXTAUTH_SECRET="your-super-secret-key"
    AUTH_GOOGLE_ID="your-google-client-id"
    AUTH_GOOGLE_SECRET="your-google-client-secret"

    # AI
    OPENAI_API_KEY="sk-..."
    ```

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
- [ ] **Day-by-Day UI:** Tabbed interface for easier itinerary navigation.

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
