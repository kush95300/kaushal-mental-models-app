## 2026-01-21 - Client-Side Business Logic Anti-Pattern
**Learning:** The application was performing bulk data updates by fetching all records to the client, iterating, and sending individual update requests. This causes N+1 network chatter and performance degradation.
**Action:** Move such logic to server-side actions using bulk operations (e.g., `updateMany`) whenever possible.
