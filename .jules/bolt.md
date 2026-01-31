## 2026-01-31 - Missing Database Index on Sort Field
**Learning:** The `Task` model was missing an index on `createdAt`, despite being the default sort field (`orderBy: { createdAt: "desc" }`) in `getTasks`. This forces a full table scan on every fetch.
**Action:** Added `@@index([createdAt])` to the `Task` model to optimize the default query. Always verify indexes against `orderBy` clauses in `getTasks` or equivalent fetch functions.
