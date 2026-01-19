# 🛡️ Sentinel Journal - ItinApp

## UK Compliance & Privacy Standards

- **Act:** UK Data Use and Access Act 2025.
- **Mandate:** Absolute zero-leak policy for PII (Personally Identifiable Information).
- **PII Definition:** User emails, full names, and exact location coordinates must never be logged.
- **Telemetry:** Scrub all PII before sending to Sentry or any third-party logging providers.
- **Error Handling:** Ensure TRPC error messages are generic to users but descriptive (and PII-free) in server logs.

## Critical Learning Journal

## 2024-05-23 - IDOR Vulnerability in Trip Access
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `tripRouter.getById`.
**Learning:** `protectedProcedure` only ensures the user is logged in. It does not automatically check if the user owns the resource they are requesting.
**Prevention:** Always manually verify ownership (e.g., `resource.userId === session.user.id`) inside the procedure before returning data.
