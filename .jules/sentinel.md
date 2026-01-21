# 🛡️ Sentinel Journal - ItinApp

## UK Compliance & Privacy Standards

- **Act:** UK Data Use and Access Act 2025.
- **Mandate:** Absolute zero-leak policy for PII (Personally Identifiable Information).
- **PII Definition:** User emails, full names, and exact location coordinates must never be logged.
- **Telemetry:** Scrub all PII before sending to Sentry or any third-party logging providers.
- **Error Handling:** Ensure TRPC error messages are generic to users but descriptive (and PII-free) in server logs.

---

## 📓 HISTORICAL SECURITY ENTRIES (APPEND ONLY)

## 2024-05-23 - IDOR Vulnerability in Trip Access

**Vulnerability:** Insecure Direct Object Reference (IDOR) in `tripRouter.getById`.
**Learning:** `protectedProcedure` only ensures the user is logged in. It does not automatically check if the user owns the resource they are requesting.
**Prevention:** Always manually verify ownership (e.g., `resource.userId === session.user.id`) inside the procedure before returning data.

## 2026-01-20 - LLM Injection & DoS in Trip Generation

**Vulnerability:** The `destination` input was unbounded and unsanitized, allowing for Prompt Injection (via newlines/control chars) and Denial of Service (token exhaustion).
**Learning:** Inputs passed to LLM prompts via template literals are high-risk. Zod's `string()` defaults are insufficient for security.
**Prevention:** Enforce strict length limits (`max(100)`) and content validation (`refine` to ban newlines/control characters) on all inputs used in AI prompts.
