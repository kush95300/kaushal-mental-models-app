## 2026-01-29 - Invisible Controls
**Learning:** Hiding interactive elements with `opacity: 0` until hover creates a significant accessibility barrier for keyboard users, as the controls are focusable but invisible.
**Action:** Always include `focus-within` or `focus-visible` styles (e.g., `group-focus-within:opacity-100`) whenever using hover-reveal patterns for action buttons.
