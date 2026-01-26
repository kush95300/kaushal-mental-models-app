## 2026-01-26 - Missing Database Index on CreatedAt
**Learning:** The `Task` model was missing an index on `createdAt`, despite `getTasks` sorting by it (`orderBy: { createdAt: "desc" }`). This causes full table scans.
**Action:** Added `@@index([createdAt])` to `Task` model. Ensure indexes align with `orderBy` and `where` clauses in Prisma queries.
