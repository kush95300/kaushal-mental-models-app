# User Flow: Mental Models App

## Core Logic (Eisenhower Matrix)

```mermaid
graph TD
    User[User] -->|Opens App| Home[Homepage]
    Home -->|Selects Model| MainModal[Test Mode or Start with Workspace]
    MainModal -->|Test Mode| TestView[Test Interface]
    MainModal -->|Start with Workspace| WorkspaceList[Workspace Management Dialog]

    WorkspaceList -->|Manage| ManageWS[Create/Update/Delete Workspaces]
    WorkspaceList -->|Select Workspace| Matrix[Eisenhower Matrix]

    subgraph "Test Mode Constraints"
        TestView -->|Features| AllFeatures[All UI Features Available]
        TestView -.->|Save| NoSave[Data NOT Persisted]
        TestView -.->|Analytics| NoAnalytics[Analytics Disabled]
    end

    subgraph "Capture & Organize"
        Matrix -->|Add Task| Inbox[Inbox / Drafts]
        Inbox -->|Define Metadata| Sorting{Sorting Logic}
        Sorting -->|Urgent + Important| Do[DO Quadrant]
        Sorting -->|Not Urgent + Impt| Schedule[SCHEDULE Quadrant]
        Sorting -->|Urgent + Not Impt| Delegate[DELEGATE Quadrant]
        Sorting -->|Neither| Eliminate[ELIMINATE Quadrant]
    end

    subgraph "Advanced Features (New)"
        Do -->|Check Workload| WorkloadCheck{Daily Limit Exceeded?}
        WorkloadCheck -->|Yes| Warning[Overburden Alert]
        WorkloadCheck -->|No| Safe[Add to Day]

        Matrix -->|Switch Workspace| Workspace{Select Workspace}
        Workspace -->|Personal| PersonalView[Personal Tasks]
        Workspace -->|Work| WorkView[Work Tasks]
    end

    subgraph "Execution"
        Do -->|Complete| Done[Done List]
        Done -->|Log Time| ContextCheck{In Workspace?}
        ContextCheck -->|Yes| Analytics[Analytics Engine]
        ContextCheck -->|No| NoAnalytics[Analytics Disabled]
    end
```

## Detailed Flows

### 1. Task Capture

- User enters task in "Inbox".
- System prompts for "Importance" and "Urgency" (or Time Estimate).
- Task is auto-assigned to detailed quadrant.

### 2. Smart Scheduling

- **Due Date Logic**:
  - `Today` or `Tomorrow` -> **DO** or **DELEGATE** (if assigned).
  - `Future Date` -> **SCHEDULE**.
- **Delegation Logic**:
  - Assigned to `Self` -> **DO** or **SCHEDULE**.
  - Assigned to `Others` -> **DELEGATE**.

### 3. Workload Management (New)

- User sets "Max Daily Hours" (e.g., 6 hours).
- System sums `estimatedMinutes` of all active "DO" tasks.
- If Sum > Limit -> Show Warning.
