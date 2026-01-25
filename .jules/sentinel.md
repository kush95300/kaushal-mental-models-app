## 2024-05-23 - Missing Input Validation in Server Actions
**Vulnerability:** Server Actions (`src/actions/`) accepted raw input without validation, relying only on Prisma types. This could allow empty strings, extremely long content, or invalid enum values to be processed.
**Learning:** Even with TypeScript, runtime validation is crucial for server boundaries. "Type safety" at compile time does not prevent runtime abuse of API endpoints.
**Prevention:** Always use a validation layer (like `src/lib/validation.ts` or Zod) at the start of every Server Action to enforce constraints before business logic.
