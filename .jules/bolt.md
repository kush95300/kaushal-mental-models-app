## 2024-05-22 - [React Memoization & Handler References]
**Learning:** `React.memo` on list items (like `TaskCard`) is ineffective if parent components pass inline arrow functions (e.g., `() => delete(id)`), as these create new references on every render.
**Action:** Refactor child components to accept the full item object in handlers (e.g., `onDelete(task)`), allowing the parent to pass a stable `useCallback` reference that doesn't depend on individual item closure.
