# Palette's Journal 🎨

## 2025-02-18 - Action Visibility on Focus
**Learning:** Hiding action buttons with `opacity-0` until hover is a common pattern for cleaner UI, but it completely blocks keyboard users if they can't see what they are focusing on.
**Action:** Always pair `group-hover:opacity-100` with `focus-within:opacity-100` (or `group-focus-within:opacity-100`) on the container, so tabbing into the hidden area reveals the actions.
