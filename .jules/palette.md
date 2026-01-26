# Palette's Journal

## 2025-02-23 - Keyboard Access for Hover Actions
**Learning:** Interactive elements hidden with `opacity-0` and revealed on `hover` are inaccessible to keyboard users unless they are also revealed on `focus`.
**Action:** Always add `focus-within:opacity-100` (or similar focus styles) to containers that hide interactive elements until hovered.
