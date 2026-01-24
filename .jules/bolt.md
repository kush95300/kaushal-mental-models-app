# Bolt's Journal

This journal tracks critical performance learnings for the Eisenhower Matrix Task Manager.

## 2025-02-18 - Missing Index on createdAt
**Learning:** The application heavily relies on sorting tasks by `createdAt` in descending order, but the database schema lacked an index on this field, causing inefficient sorting (likely O(N log N) with temp B-tree) instead of O(N) or O(1) retrieval.
**Action:** Added `@@index([createdAt])` to the `Task` model. Future schema designs should prioritize indexing sort fields for main feed queries.
