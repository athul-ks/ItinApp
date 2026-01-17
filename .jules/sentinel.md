# 🛡️ Sentinel Journal - ItinApp

## UK Compliance & Privacy Standards

- **Act:** UK Data Use and Access Act 2025.
- **Mandate:** Absolute zero-leak policy for PII (Personally Identifiable Information).
- **PII Definition:** User emails, full names, and exact location coordinates must never be logged.
- **Telemetry:** Scrub all PII before sending to Sentry or any third-party logging providers.
- **Error Handling:** Ensure TRPC error messages are generic to users but descriptive (and PII-free) in server logs.

## Critical Learning Journal
