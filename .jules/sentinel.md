# Sentinel's Journal

## 2025-02-12 - Dangerous API Functionality
**Vulnerability:** Unprotected `reset=all` and `reset=today` parameters in `DELETE /api/tasks` endpoint.
**Learning:** Development/debug features (like database reset) were left in the production API code without any authentication or flags, allowing anyone to wipe the database.
**Prevention:** Ensure debug/reset functionality is strictly separated from production code, or behind strong authentication and feature flags. Code reviews should flag any "bulk delete" or "reset" logic exposed in APIs.
