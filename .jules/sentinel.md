## 2024-05-23 - Server Action Input Validation
**Vulnerability:** Server Actions lacked input validation, trusting client-side checks or no checks at all.
**Learning:** Next.js Server Actions are public endpoints and must validate all inputs independently of the UI.
**Prevention:** Use a dedicated `src/lib/validation.ts` to centralize validation logic and apply it at the start of every Server Action.
