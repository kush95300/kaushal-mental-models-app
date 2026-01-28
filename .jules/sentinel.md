# Sentinel Journal

## 2026-01-28 - Missing Input Validation in Server Actions
**Vulnerability:** Server actions `createTask`, `updateTask`, and `createDelegate` accepted raw user input without length limits or format validation, allowing potential DoS or invalid data insertion.
**Learning:** Next.js Server Actions are public endpoints and require the same level of validation as traditional API routes. Relying solely on client-side validation or database constraints is insufficient.
**Prevention:** Implement a shared validation library (`src/lib/validation.ts`) and enforce validation at the start of every Server Action.
