# PR Description: Workspace Support & v1.3.0 Features

## Summary

This PR implements the Workspace feature set (v1.3.0), allowing users to organize tasks into distinct contexts (e.g., "Work", "Personal") and introducing a robust "Test Mode" for sandbox usage.

## Key Changes

### 1. Database Schema

- Added `Workspace` model to Prisma schema.
- Added `workspaceId` and `tags` to `Task` model.
- Added `description` to `Workspace` model.
- Migrated database and added seed script for default workspaces.

### 2. Backend Actions

- Updated `tasks` actions to filter by `workspaceId`.
- Created `workspace` actions (`create`, `update`, `delete`, `select`).
- Fixed type safety issues and added proper error handling.

### 3. Frontend / UI

- **Startup Modal**: Users can now choose between "Test Mode" (no persistence) or "Start with Workspace" on load.
- **Workspace Switcher**: Integrated into the header to easily switch contexts or create new workspaces.
- **Workspace Management**: Added modals for creating, updating, and deleting workspaces.
- **Test Mode**: Explicit visual indication and isolated in-memory state for testing without DB writes.

### 4. Code Quality

- Refactored `page.tsx` to handle workspace logic cleanly via `useTaskOperations` hook.
- Fixed numerous linting errors and type mismatches.
- Standardized component props for better maintainability.

## User Flow

1. **User Opens App**: Presented with `WorkspaceSelectionModal`.
2. **Selection**:
   - **Test Mode**: Enters sandbox environment.
   - **Workspace**: Selects an existing workspace or creates a new one.
3. **Usage**:
   - Tasks created are assigned to the active workspace.
   - Switching workspace updates the view immediately.
   - "Test Mode" tasks are lost on refresh (as designed).

## Verification

- Verified persistence of tasks per workspace.
- Verified isolation of Test Mode.
- Verified creation/deletion of workspaces works as expected.
