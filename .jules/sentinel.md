# Sentinel Journal

## 2024-05-22 - Server Action Input Validation
**Vulnerability:** Server Actions in `src/actions/task.ts` lacked input validation, accepting raw user input directly into Prisma queries.
**Learning:** Next.js Server Actions are public endpoints and must validate all inputs. The project lacked a standard validation layer.
**Prevention:** Implemented `src/lib/validation.ts` to enforce strict types, length limits, and allowlists for enums. Future actions should use this or similar validation before processing data.
