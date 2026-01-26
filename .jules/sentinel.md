## 2024-05-22 - Server Action Validation and UX
**Vulnerability:** Missing input validation in Next.js Server Actions allowed potential invalid data entry and DoS.
**Learning:** Adding validation to Server Actions returning `{ success: false }` handles security, but existing frontend hooks using optimistic updates may silently fail or revert without user feedback if they don't explicitly handle the `error` field.
**Prevention:** When adding server-side validation, audit frontend hooks (`useTaskOperations`) to ensure they handle error states and provide user feedback, rather than just ignoring the failure.
