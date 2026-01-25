## BOLT'S JOURNAL - CRITICAL LEARNINGS ONLY

## 2025-02-23 - [Missing Index on Sorted Field]
**Learning:** The `Task` model is frequently sorted by `createdAt` in `getTasks`, but it lacked an index on this field. This is a common oversight that can lead to slow queries as the table grows.
**Action:** Always check `orderBy` clauses in queries against the schema indexes.
