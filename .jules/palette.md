## 2024-05-22 - Accessibility in Task Cards
**Learning:** Icon-only buttons in task cards were inaccessible to screen readers and keyboard users (hidden by opacity).
**Action:** Always ensure action buttons have `aria-label` and become visible on focus (`focus-within`).
