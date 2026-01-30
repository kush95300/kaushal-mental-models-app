## 2026-01-30 - Missing Index on Sort Field
**Learning:** The `Task` model was frequently queried with `orderBy: { createdAt: "desc" }` but lacked an index on `createdAt`. This forces the database to perform a full table scan and sort in memory, which scales poorly (O(N log N) or worse).
**Action:** Always verify that fields used in `orderBy`, `where`, and `join` conditions are indexed, especially for potentially large tables like `Task`. Added `@@index([createdAt])`.
