# 🛡️ Sentinel Journal - ItinApp

## UK Compliance & Privacy Standards

- **Act:** UK Data Use and Access Act 2025.
- **Mandate:** Absolute zero-leak policy for PII (Personally Identifiable Information).
- **PII Definition:** User emails, full names, and exact location coordinates must never be logged.
- **Telemetry:** Scrub all PII before sending to Sentry or any third-party logging providers.
- **Error Handling:** Ensure TRPC error messages are generic to users but descriptive (and PII-free) in server logs.

---

## 📓 HISTORICAL SECURITY ENTRIES (APPEND ONLY)

## 2026-01-18 - IDOR Vulnerability in Trip Access

**Vulnerability:** Insecure Direct Object Reference (IDOR) in `tripRouter.getById`.
**Learning:** `protectedProcedure` only ensures the user is logged in. It does not automatically check if the user owns the resource they are requesting.
**Prevention:** Always manually verify ownership (e.g., `resource.userId === session.user.id`) inside the procedure before returning data.

## 2026-01-20 - LLM Injection & DoS in Trip Generation

**Vulnerability:** The `destination` input was unbounded and unsanitized, allowing for Prompt Injection (via newlines/control chars) and Denial of Service (token exhaustion).
**Learning:** Inputs passed to LLM prompts via template literals are high-risk. Zod's `string()` defaults are insufficient for security.
**Prevention:** Enforce strict length limits (`max(100)`) and content validation (`refine` to ban newlines/control characters) on all inputs used in AI prompts.

## 2026-01-22 - Indirect Prompt Injection in Trip Generation

**Vulnerability:** User input was directly interpolated into the system prompt without delimiters, allowing potential indirect prompt injection attacks where the AI could be instructed to ignore safety rules.
**Learning:** Even with length limits and newline restrictions, malicious instructions can still be injected if the LLM cannot distinguish user input from system instructions.
**Prevention:** Use clear delimiters (like `"""` or XML tags) around user input in prompts and explicitly instruct the LLM to ignore instructions found within those delimiters. Validate inputs to reject the delimiter itself.

## 2026-01-23 - Authorization Bypass in Server Components

**Vulnerability:** Direct database access (`prisma.trip.findUnique`) in Next.js Server Components bypassed the authorization logic centralized in tRPC routers.
**Learning:** Server Components have direct DB access, tempting developers to skip the API layer. This creates a parallel data access path lacking security guards.
**Prevention:** Always fetch data in Server Components via the tRPC server caller (`api.trip.getById`) to reuse `protectedProcedure` authorization logic.

## 2026-01-25 - Compliance Violation in Sentry Default Config

**Vulnerability:** The Sentry initialization wizard (or default copy-paste config) set `sendDefaultPii: true` in `sentry.server.config.ts`, `sentry.edge.config.ts`, and `instrumentation-client.ts`, violating the UK Data Use and Access Act 2025 zero-leak policy.
**Learning:** Third-party tools often default to "maximum data collection" which can silently violate strict privacy compliance requirements.
**Prevention:** Manually audit all third-party telemetry configuration files for PII collection settings immediately after installation or generation.

## 2026-05-21 - Logic Validation in Duration Calculation
**Vulnerability:** Business logic flaw allowing negative duration calculation if `endDate` < `startDate`, potentially confusing AI safety checks.
**Learning:** Simple type validation (e.g., `z.date()`) is insufficient for dependent fields.
**Prevention:** Use Zod's `.refine()` on the parent object to enforce relationships between fields (e.g., `start <= end`).

## 2026-05-22 - DoS Risk from Safety Logic Mismatch
**Vulnerability:** Code implementation capped trip duration at 10 days despite a safety comment explicitly stating a 5-day limit to prevent token exhaustion/timeouts.
**Learning:** Discrepancies between safety comments and actual code (often from "temporary" debugging changes left in) create hidden availability risks.
**Prevention:** When defining safety limits (like duration/size caps) in comments, explicitly verify the accompanying code enforces that exact limit during code reviews.

## 2026-06-03 - DoS Protection via Rate Limiting
**Vulnerability:** The expensive `trip.generate` endpoint (using OpenAI) lacked rate limiting, allowing credit exhaustion or DoS attacks.
**Learning:** In serverless environments (Next.js), simple in-memory rate limiting is ineffective. Without external stores (Redis), the database can be used as a rate limiter for critical, low-frequency actions.
**Prevention:** Implement "check-then-act" logic using `createdAt` timestamps from the database to enforce cooldowns on resource-intensive endpoints.
