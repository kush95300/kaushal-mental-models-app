## 2026-01-24 - Accessibility and Opacity
**Learning:** Opacity-based hover effects (like `opacity-0 group-hover:opacity-100`) effectively hide elements from keyboard users even when they receive focus.
**Action:** Always pair `group-hover:opacity-100` with `focus-within:opacity-100` (or `focus-visible` on children) to ensure interactive elements become visible when they receive keyboard focus.
