# Mental Models App - Implementation Plan

## Goal Description

To evolve the existing Eisenhower Matrix prototype into a robust, feature-rich productivity tool for local use, while architecting for future scalability. The focus is strictly on the Eisenhower Matrix, enhancing it with advanced time management, workspaces, and deep analytics.

## Versioning Strategy

We follow a modified semantic versioning tailored to the "Mental Models" product structure.

| Version    | Scope            | Criteria                                                                   |
| :--------- | :--------------- | :------------------------------------------------------------------------- |
| **v1.x.x** | **Single Model** | Focused exclusively on maximizing the "Eisenhower Matrix" model.           |
| **v2.x.x** | **Multi-Model**  | Introduced when the 2nd model (e.g., Pareto Principle) is added.           |
| **vX.Y.x** | **Major Phase**  | Incremented when a "Phase" from this plan is completed (e.g., v1.2, v1.3). |
| **vX.Y.Z** | **Feature/Fix**  | Incremented for feature groups or polish within a phase.                   |

## Feature Roadmap (Eisenhower Matrix v1.x)

### v1.2.1 - Actions & Schema Types [x]

**Goal**: Establish the Server Actions layer.

- [x] Create `src/actions/task.ts` & `src/actions/delegate.ts`.
- [x] Standardize `src/types/eisenhower.ts`.
- [x] Optimize Schema Indexes.

### v1.2.2 - Hook Migration [x]

**Goal**: Move business logic out of the component.

- [x] Refactor `useTaskOperations.ts` to use Server Actions.
- [x] Implement optimistic updates in hook.

### v1.2.3 - UI Integration & Refactoring [x]

**Goal**: Connect the matrix to the new backend and modularize.

- [x] Resolve merge conflicts in `page.tsx`.
- [x] Standardize local state management.
- [x] Extract large UI blocks into modular components.

### v1.3.0 - Workspaces & Context

**Goal**: Support "Work" vs "Personal" separation.

- [x] **Models**: Create `Workspace` entity in Prisma.
- [x] **UI**: Workspace Switcher in Header & Startup Modal.
- [x] **Test Mode**: robust "Sandbox" implementation (no DB persistence).
- [x] **Metadata**: Add `tags` and `actualTime` to Task schema.

### v1.4.0 - Time Management

**Goal**: Prevent burnout.

- [x] **Config**: "Max Daily Hours" setting.
- [x] **Logic**: Overburden Alert (`Sum(DO) > Limit`).
- [x] **View**: Calendar View for Scheduled tasks.

### v1.5.0 - Analytics Engine

**Goal**: "The Wisdom Lab" Insights.

- [ ] **Dashboard**: Dedicated `/analytics` page.
- [ ] **Charts**: Quadrant Distribution (Pie), Completion Velocity (Bar).
- [ ] **Privacy**: Analytics disabled in Test Mode.

### v1.6.0 - Premium Polish

**Goal**: Aesthetics and User Joy.

- [ ] **Theme**: "Midnight" Dark Mode.
- [ ] **Interaction**: Keyboard Shortcuts (`n` for new, `del` for delete).
- [ ] **Sound**: Subtle completion sounds.

## User Flow Diagram (with Test Mode)

> [!IMPORTANT] > **Test Mode Logic**: Test Mode allows users to explore all UI features without saving data to the persistent DB. Analytics are disabled.

```mermaid
graph TD
    User[User] -->|Opens App| Home[Homepage]
    Home -->|Selects Model| ModeCheck{Test Mode?}

    ModeCheck -->|Yes| TestView[Test Interface]
    ModeCheck -->|No| Matrix[Eisenhower Matrix]

    subgraph "Test Mode Constraints"
        TestView -->|Features| AllFeatures[All UI Features Available]
        TestView -.->|Save| NoSave[Data NOT Persisted]
        TestView -.->|Analytics| NoAnalytics[Analytics Disabled]
    end

    subgraph "Standard Capture & Organize"
        Matrix -->|Add Task| Inbox[Inbox / Drafts]
        Inbox -->|Define Metadata| Sorting{Sorting Logic}
        Sorting -->|Urgent + Important| Do[DO Quadrant]
        Sorting -->|Not Urgent + Impt| Schedule[SCHEDULE Quadrant]
        Sorting -->|Urgent + Not Impt| Delegate[DELEGATE Quadrant]
        Sorting -->|Neither| Eliminate[ELIMINATE Quadrant]
    end

    subgraph "Standard Execution & Features"
        Do -->|Check Workload| WorkloadCheck{Daily Limit Check}
        WorkloadCheck -->|Over Limit| Warning[Overburden Alert]

        Matrix -->|Switch Workspace| Workspace{Select Workspace}
        Workspace -->|Personal| PersonalView[Personal DB Context]
        Workspace -->|Work| WorkView[Work DB Context]

        Do -->|Complete| Done[Done List]
        Done -->|Log Time| Analytics[Analytics Engine]
    end
```

## Proposed Phases (Technical Execution)

### Phase 1: Refactoring & Foundation

**target**: `v1.2.0`

- **Refactor `EisenhowerMatrixPage`**: Break into `useTaskOperations`, `TaskCard`, `Quadrant`, `Modals`.
- **Server Actions Migration**: Strict Types (`Task`, `Delegate`, `ApiResponse`).
- **Docs**: Create `Docs/` folder (including `CHANGELOG.md`).

### Phase 2: Workspaces

**target**: `v1.3.0`

- **Schema**: Add `Workspace` model.
- **UI**: Implementation of Workspace Switcher.

### Phase 3: Time & Calendar

**target**: `v1.4.0`

- **Logic**: Implement Daily Limit calculation.
- **UI**: Build Calendar Grid component.

### Phase 4: Analytics

**target**: `v1.5.0`

- **Page**: Build `/analytics`.
- **Vis**: Integration of Recharts/Chart.js.

### Phase 5: UI/UX

**target**: `v1.6.0`

- **CSS**: Dark Mode variables.
- **Events**: Keyboard event listeners.

## Verification Plan

### Automated Tests

- **Server Actions**: Test `createTask` and `moveTask` logic (Mocked DB).
- **Refactoring Safety**: Ensure `page.tsx` breakdown doesn't break existing drag-and-drop.

### Manual Verification

- **Test Mode**: Verify adding tasks in Test Mode DOES NOT result in DB entries.
- **Analytics**: Verify Analytics page shows "Disabled in Test Mode" message.
