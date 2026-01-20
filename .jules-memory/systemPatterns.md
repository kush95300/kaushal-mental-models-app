# System Patterns

## Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (Glassmorphism, Dark Mode)
- **Database**: SQLite (via Prisma)

## Design Patterns

- **Server Actions**: Used for data mutations (creating/moving tasks) to ensure type safety and reduced client-side Javascript.
- **Client Components**: Used for high-interactivity features like Drag-and-Drop (DnD) and Modals.
- **Lucide Iconography**: Consistent visual language using `lucide-react`.

## Key Directories

- `src/components`: UI components (likely organized by feature, e.g., `eisenhower-matrix/`).
- `src/lib`: Utility functions and implementation logic.
- `prisma/`: Database schema and migrations.
