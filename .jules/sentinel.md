## 2025-02-18 - Unprotected Database Reset
**Vulnerability:** A public API route (`DELETE /api/tasks?reset=all`) allowed unauthenticated deletion of all tasks in the database.
**Learning:** Development/testing conveniences (like "reset all data") can easily be left in production code if placed in public API routes.
**Prevention:** strictly separate test/debug logic from production routes. Use environment variables to disable such features in production, or better yet, keep them in separate admin-only tools or scripts, not in the public API.
