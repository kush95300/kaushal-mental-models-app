# Changelog

All notable changes to this project will be documented in this file.

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
