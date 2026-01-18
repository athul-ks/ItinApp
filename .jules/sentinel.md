## 2024-05-23 - IDOR Vulnerability in Trip Access
**Vulnerability:** Insecure Direct Object Reference (IDOR) in `tripRouter.getById`.
**Learning:** `protectedProcedure` only ensures the user is logged in. It does not automatically check if the user owns the resource they are requesting.
**Prevention:** Always manually verify ownership (e.g., `resource.userId === session.user.id`) inside the procedure before returning data.
