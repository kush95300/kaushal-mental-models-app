# Tech Context

## Development Setup

- **Package Manager**: npm
- **Database**: SQLite (`dev.db`)
  - Push schema: `npx prisma db push`
  - Studio: `npx prisma studio`
- **Run Dev Server**: `npm run dev` (Port 3000)

## Critical Dependencies

- `next`: ^16.1.3
- `react`: ^19.2.3
- `prisma`: ^6.2.1
- `@prisma/client`: ^6.2.1
- `tailwindcss`: ^4.1.18
- `lucide-react`: ^0.562.0

## Linting & Quality

- **ESLint**: Configured for Next.js (`eslint-config-next`).
- **Pre-commit**: Checks typically run before commits (verify via `.pre-commit-config.yaml`).
