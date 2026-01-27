## 2025-02-23 - Missing Validation Layer
**Vulnerability:** Server Actions (`src/actions/`) directly accepted input without server-side validation, relying solely on frontend constraints.
**Learning:** Frontend validation is user experience, not security. Server actions must validate all inputs to prevent bad data state or DoS attacks via large payloads.
**Prevention:** Always implement a shared validation layer (`src/lib/validation.ts`) and enforce it in every Server Action entry point before DB operations.
