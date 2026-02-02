## 2024-05-23 - Missing Server-Side Validation & Prisma Versioning
**Vulnerability:** Input validation was missing in Server Actions, allowing potential DoS (large payloads) or invalid data.
**Learning:** `npx prisma` defaults to the latest version, causing schema validation errors in v6 projects. Server Actions with `revalidatePath` are difficult to test in standalone scripts.
**Prevention:** Always specify prisma version (e.g., `npx prisma@6.2.1`). Enforce validation in Server Actions using a shared library.
