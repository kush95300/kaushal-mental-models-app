## 2026-01-31 - Missing Server-Side Validation Pattern
**Vulnerability:** Server Actions (`createTask`, `updateTask`) accepted raw user input without length checks or enum validation, allowing potential database pollution or DoS via massive payloads.
**Learning:** In Next.js App Router, Server Actions are public endpoints. The absence of a centralized validation layer (like Zod or custom logic) suggests a pattern of relying on client-side validation, which is bypassable.
**Prevention:** Established a reusable validation pattern in `src/lib/validation.ts`. Future actions must import and use this layer before any DB interaction.
