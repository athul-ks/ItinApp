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

## 2026-01-31 - Rate Limit Bypass via Race Condition

**Vulnerability:** The rate limit check (read last trip -> check time) was not atomic, allowing parallel requests to bypass the cooldown and potentially exhaust credits/resources.
**Learning:** In high-concurrency environments, "Check-then-Act" logic is vulnerable to TOCTOU (Time-of-Check to Time-of-Use) attacks unless serialized.
**Prevention:** Use database transactions with explicit row locking (`SELECT ... FOR UPDATE`) to serialize requests for the same user, or implement atomic "token bucket" logic.

## 2026-06-15 - CSP Configuration for T3 Stack

**Vulnerability:** Missing Content Security Policy (CSP) allowed potential XSS and injection attacks.
**Learning:** Implementing CSP in Next.js with Vercel and Sentry requires specific allowlists (`va.vercel-scripts.com`, `ingest.de.sentry.io`) and currently relies on `'unsafe-inline'`/`'unsafe-eval'` for compatibility.
**Prevention:** Use a centralized, strict CSP configuration in `next.config.ts` that explicitly whitelists required infrastructure domains while blocking everything else (`default-src 'self'`).

## 2026-06-20 - Defense in Depth via Permissions-Policy

**Vulnerability:** The application lacked a `Permissions-Policy` header, implicitly allowing usage of powerful browser features (camera, microphone, geolocation) by the document or third-party scripts if compromised (XSS).
**Learning:** CSP is not enough; `Permissions-Policy` provides an additional layer of defense by explicitly disabling unused features at the browser level.
**Prevention:** Configure a strict `Permissions-Policy` (e.g., `camera=(), microphone=(), geolocation=()`) in `next.config.ts` to reduce the potential impact of a successful XSS attack.

## 2026-06-25 - Rate Limit Bypass via Failure

**Vulnerability:** Users could bypass the "1 trip per minute" rate limit by intentionally causing the generation to fail (e.g., via prompt injection or cancellation), as the failed trip record was deleted, removing the `createdAt` timestamp used for the cooldown check.
**Learning:** "Check-then-Act" rate limiting relying on database records fails if the "Act" (record creation) is rolled back on failure. The record of the *attempt* must persist.
**Prevention:** Never delete the audit/tracking record on failure. Update its status to `failed` instead, so the timestamp remains available for rate limiting logic. Filter these failed records from the UI if necessary.

## 2026-06-30 - Availability Risk from Strict Schema Validation
**Vulnerability:** A single corrupted record in the database (violating the Zod schema) caused the `getAll` endpoint to crash with a 500 error for the user, effectively locking them out of their dashboard.
**Learning:** Strict schema validation on read (`.parse()`) is a double-edged sword. While it guarantees data integrity for the application, it creates a "Fragile Read" vulnerability where one bad apple spoils the bunch.
**Prevention:** On list endpoints (`findMany`), use `.safeParse()` inside a `reduce` or `filter` operation to gracefully skip corrupted records while logging the anomaly for administrative repair, rather than crashing the entire request.

## 2026-07-25 - Input Validation Bypass via Unicode Control Characters
**Vulnerability:** The input validation for `destination` used an ASCII-only regex `[\x00-\x1F\x7F]` to block control characters, failing to detect Unicode control characters (like Zero Width Space `\u200B` or Right-to-Left Override `\u202E`) which could be used for obfuscation or prompt injection.
**Learning:** ASCII-range regexes are insufficient for modern applications handling Unicode input. Attackers can use invisible characters to bypass filters or manipulate text display.
**Prevention:** Use Unicode Property Escapes in regex (e.g., `[\p{C}]` with the `u` flag) to strictly match all Unicode control characters, ensuring comprehensive input sanitization.
