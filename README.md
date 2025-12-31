# 🌍 ItinApp

**Smart Travel. Perfect Itineraries. Zero Stress.**

> _An AI-powered travel companion that turns your budget and dates into the perfect itinerary._

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![Tech](https://img.shields.io/badge/Stack-Next.js%20%7C%20tRPC%20%7C%20Prisma-black)

## 📖 About The Project

**ItinApp** solves the "analysis paralysis" of modern travel planning. Instead of juggling dozens of browser tabs, blogs, and maps, users simply input their destination, travel dates, and budget. The application uses AI to generate a fully optimized, hour-by-hour itinerary that respects their financial constraints.

Currently built as a high-performance Monorepo to ensure type safety from the database all the way to the frontend.

### ✨ Key Features

- **🧠 AI-Generated Itineraries:** Personalized day-by-day plans based on user preferences.
- **💰 Smart Budget Allocation:** Automatically estimates costs for food, transport, and activities to keep you on budget.
- **⚡ End-to-End Type Safety:** Fully typed API communication using tRPC and Zod.
- **🏗 Scalable Architecture:** Built with Turborepo to handle future microservices (flights/hotels).

---

## 🛠 Tech Stack

This project uses a modern, cutting-edge stack optimized for performance and developer experience.

- **Monorepo Tool:** [Turborepo](https://turbo.build/)
- **Package Manager:** [pnpm](https://pnpm.io/) (utilizing Workspaces & Catalogs)
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **API Layer:** [tRPC](https://trpc.io/) (with React Query)
- **Database:** PostgreSQL
- **ORM:** [Prisma](https://www.prisma.io/)
- **Validation:** Zod

---

## 📂 Project Structure

The codebase is organized as a monorepo:

```text
.
├── packages/
│   ├── api/        # tRPC router and API definition
│   ├── db/         # Prisma schema and database client
│   └── config/     # Shared TSConfig and ESLint settings
├── web/            # Next.js frontend application
└── turbo.json      # Build pipeline configuration
```

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js**: `v20+`
- **pnpm**: `v9+`
- **PostgreSQL**: A local or cloud-hosted database instance.

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
    Create a `.env` file in the root of the project and add your database connection string:

    ```
    DATABASE_URL="postgresql://user:password@localhost:5432/itinapp"
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

- [ ] **User Authentication** (NextAuth.js / Clerk)
- [ ] **Integration with LLM Provider** (OpenAI / Anthropic)
- [ ] **Interactive Map View** (Mapbox / Google Maps)
- [ ] **"Save & Share" Itineraries**
- [ ] **Flight & Hotel Price Estimation APIs**

---

## ⚖️ License & Copyright

© 2025 Athul. All Rights Reserved.

This source code is the intellectual property of the author. It is provided publicly for educational and portfolio demonstration purposes only.

- **You may:** View, fork, and download the code for personal learning.
- **You may NOT:** Use this code for commercial purposes, distribute it, modify it for a competing product, or sublicense it without explicit written permission from the author.
