## 2024-05-23 - Input Validation Pattern
**Vulnerability:** Missing input validation on server actions allowed potential DoS and data integrity issues.
**Learning:** Server Actions in Next.js need explicit input validation as they are public endpoints. Existing error handling patterns (returning `{ success: false, error: ... }`) should be respected when adding validation failures to avoid breaking frontend clients.
**Prevention:** Always validate input at the start of Server Actions using a shared validation library. Ensure return types for validation errors match the existing API contract.
