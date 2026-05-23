# Changelog

All notable changes to this project will be documented in this file.

## [v1.9.2] - 2026-05-23

### Added & Fixed

- **Persistent SQLite Volume & Runtime Migration**: Relocated `prisma db push` from build-time Dockerfile execution to runtime `npx prisma migrate deploy` at container startup. Removed the redundant Dockerfile `VOLUME /app/prisma` instruction to ensure persistent SQLite database volumes correctly apply migrations without data loss.
- **Production Secret Hardening**: Added dynamic validation checks for the `JWT_SECRET` environment variable in production. The application now fails fast at startup if it is missing, preventing silent fallbacks to insecure development secrets. Enforced setting `JWT_SECRET` in `docker-compose.yml`.
- **Shared Workspace Access Control**: Extracted duplicate workspace access checking logic across Server Actions into a single shared helper utility in `src/lib/workspace-access.ts`.
- **Admin Seeding & Concurrency Guard**: Re-engineered database seeding using composite keys for default workspaces and delegates, and added an in-memory initialization check to prevent concurrent race conditions during static builds.
- **Guest / Test Mode Isolation**: Enhanced the Eisenhower matrix client hook `useTaskOperations.ts` to fully isolate tasks by workspace ID when running in guest/non-authenticated mode.

## [v1.9.1] - 2026-05-18

### Added & Fixed

- **Universal Password Management**: Added a global "Change Password" modal accessible from the start page for all authenticated users.
- **Admin Portal Hardening**: Relocated User Management strictly to the start page for administrators. Protected root `admin` account from deletion.
- **Dynamic Credential Banner**: Added programmatic check to automatically hide default credentials banner once the default password is changed.
- **Custom Confirmation Modal**: Replaced native `window.confirm` dialogs with a premium custom React confirmation modal in the Admin Portal to resolve webview popup dismissal bugs during user deletion and rejection.
- **CLI Admin Recovery Tool**: Dedicated Node.js command-line script (`npm run admin:recovery -- <new_password>`) for server administrators to securely recover or reset the root admin password directly in the SQLite database without web UI intervention.
- **Security Vulnerability Remediation**: Added in-memory rate limiting to auth actions against brute-force attacks, implemented `tokenVersion` session invalidation upon password changes to prevent replay attacks, enforced strict SameSite cookie attributes, and added session authorization checks across all custom API routes (`/api/tasks`, `/api/delegates`, `/api/config`).
- **IDOR & Security Header Hardening**: Configured comprehensive Next.js security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) and implemented strict multi-tenant Insecure Direct Object Reference (IDOR) workspace ownership verification across all Server Actions (`task.ts`, `delegate.ts`, `analytics.ts`) and REST API routes (`/api/tasks`, `/api/delegates`).

## [v1.9.0] - 2026-05-18

### Added

- **User Authentication**: Secure login system with password hashing (bcryptjs) and JWT session management (jose).
- **Admin Portal**: Dedicated portal (`/admin`) for administrators to manage system access, create new users, and revoke access.
- **Multi-Tenant Scoping**: Workspaces are now scoped to individual users or globally accessible.

## [v1.8.0] - 2026-05-18

### Added

- **Notifications**: Integrated browser push notifications.
- **Daily Workspace Reminders**: Option to set daily notification times for specific workspaces.
- **Task Reminders**: Option to set reminder alerts before task due dates.

## [v1.5.0] - 2026-01-21

### Added

- **Analytics Dashboard**: New "Wisdom Lab" page providing deep insights into productivity.
- **Visual Charts**: Integrated Recharts to display Quadrant Distribution (Pie) and Completion Velocity (Bar).
- **KPI Metrics**: Cards for Completion Rate, Avg Velocity, and Active Tasks.
- **Delegation Reports**: Breakdown of tasks assigned to others.

## [v1.4.0] - 2026-01-21

### Added

- **Time Management Config**: Global "Max Daily Hours" setting to define workload capacity.
- **Overburden Alert**: Real-time visual indicator in the Header and Stats view when "Urgent & Important" tasks exceed daily capacity.
- **Calendar View**: Monthly grid view to visualize and manage scheduled tasks.
- **Settings Modal**: Dedicated UI for configuring global preferences.

## [v1.3.0] - 2026-01-21

### Added

- **Workspaces**: Database schema, UI modal, and header switcher to manage distinct task contexts (e.g., Work, Personal).
- **Test Mode**: Explicit non-persistent sandbox mode accessible from the startup modal.
- **Task Metadata**: Added `description`, `workspaceId`, and `tags` to support broader contexts.
- **Manage Workspaces**: Create, update description, and delete workspaces directly from the UI.

## [v1.2.3] - 2026-01-21

### Changed

- **UI Modularization**: Refactored `page.tsx` from 1200+ lines into modular components (`MatrixHeader`, `StatsView`, `MainTaskForm`, `MatrixGrid`).
- **Hydration Fix**: Added `suppressHydrationWarning` to fix browser extension conflicts.
- **Git Strategy**: Enforced PR-only merges to the `main` branch.

## [v1.2.2] - 2026-01-21

### Changed

- **Hook Migration**: Refactored `useTaskOperations.ts` to fully utilize Server Actions.
- **Optimistic UI**: Implemented instant feedback for task creation, movement, and deletion.

## [v1.2.1] - 2026-01-20

### Added

- **Server Actions Foundation**: Implemented `task.ts` and `delegate.ts` actions.
- **Performance**: Added SQLite indexes for optimized task querying.
- **Types**: Standardized Eisenhower Matrix types for server-side processing.

## [v1.1.1] - 2026-01-20

### Added

- Documentation structure (`Docs/` folder).
- User Flow diagrams.
- Design System checklist.

## [v1.1.0] - 2025-01-19

### Added (v1.1.0)

- Eisenhower Matrix Page features (Drag & Drop, Quadrants).
- "Smart Scheduling" logic.

## [v1.0.0] - 2025-01-15

### Added (v1.0.0)

- Initial Release.
- Homepage with Mental Models list.
- Basic SQLite Database setup.
