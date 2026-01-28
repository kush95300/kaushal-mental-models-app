## 2026-01-28 - Heavy Re-renders from Centralized State
**Learning:** The `EisenhowerMatrixPage` holds all application state (tasks, form inputs, modal visibility). Typing in the "Add Task" input triggers a re-render of the entire page, including `MatrixGrid` and all `Quadrant`s.
**Action:** Use `React.memo` on expensive children (`StatsView`) and `useMemo` for derived data (`stats`, filtered tasks) to mitigate the cost of these re-renders without extensive refactoring of the state management.
