## 2025-01-30 - Reveal-on-Focus for Action Buttons
**Learning:** Hidden action buttons (using `opacity-0 group-hover:opacity-100`) are inaccessible to keyboard users as they receive focus but remain invisible.
**Action:** Always add `group-focus-within:opacity-100` alongside hover classes to ensure buttons become visible when a keyboard user tabs into the container.
