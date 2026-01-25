## 2026-01-25 - Hidden Actions Accessibility
**Learning:** Elements hidden with `opacity-0` for visual cleanliness (hover-reveal) are inaccessible to keyboard users if they remain hidden when focused.
**Action:** Always add `group-focus-within:opacity-100` (or similar) alongside `group-hover:opacity-100` to ensure keyboard focus reveals the controls.
