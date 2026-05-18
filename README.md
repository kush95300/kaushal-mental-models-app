# 🧪 The Wisdom Lab (Mental Models Repository)

A high-precision, interactive workspace designed to sharpen decision-making and boost productivity using world-class mental models.

## 🚀 Key Features

### 📅 The Focus Matrix (Eisenhower Matrix v2.0)

Transform your to-do list into a strategic map by separating the urgent from the essential.

- **Dynamic Drag & Drop**: Categorize tasks effortlessly from the **Draft Queue** into one of four distinct quadrants.
- **Intelligent Scheduling & Automation**:
  - **Smart Auto-Promotion**: Tasks due Today/Tomorrow automatically promote to **Urgent & Important (Do First)** if assigned to you, or **Delegate** if assigned to others.
  - **Context-Aware Moves**: Dragging a task to **Eliminate** automatically clears its due date.
  - **Graceful Validation**: Moving an incomplete task to the matrix instantly opens the **Edit Mode** with guidance instead of blocking you.
- **Team Delegation System**:
  - Dedicated **Delegate Manager** for team personas.
  - **Smart Assignments**: Tasks are automatically assigned to **"Self"** upon creation and whenever moved out of the **Delegate** quadrant.
- **Advanced Archive & Resets**:
  - **Done Archive**: Specialized view for all completed tasks with _Restore to TODO_ capability.
  - **Eliminated (Soft-Delete)**: Moving tasks to the **Eliminate** quadrant automatically archives them. View all removed items in the **Eliminated** list at the top.
  - **Data Resets**: Quickly wipe _Today's Data_ or _All Data_ for a clean slate.
- **Onboarding & Analytics**:
  - **Smart Onboarding**: Prompt for analytics start date on first visit.
  - **Test Mode**: Explore the full matrix feature set without persisting any data to the database.
- **Server Actions Architecture (v1.2)**:
  - **Unified Operations**: All task and delegate management moved to high-performance **Server Actions**.
  - **Optimistic UI**: Instant visual feedback for task creation, movement, and deletion before server confirmation.
  - **Modular Component Design**: Page structure refactored into focused components (`MatrixHeader`, `StatsView`, `MainTaskForm`, `MatrixGrid`) for easier maintenance.
- **Unified Theme Engine (v1.7.0)**:
  - **Global State Management**: Transitioned from localized state to a centralized `ThemeProvider` context, ensuring perfectly synchronized dark mode across the entire app.
  - **Tailwind v4 Integration**: Optimized for the latest CSS-first engine with custom `@variant dark` support.
  - **Cross-Component Persistence**: Theme state is shared instantly between the Matrix, Home page, and Analytics without redundant triggers.
  - **Adaptive Workspace**: Live **Today's Date** display, **Workload Balance** metrics, real-time **Task Analytics**, fully responsive header controls, rich custom hover tooltip dialog boxes with advanced CSS stacking context resolution, premium custom glassmorphic confirmation modal dialogs for data reset and workspace deletion operations, direct 1-click workspace switching with inline workspace creation, 16 custom workspace icon options, dedicated workspace management, workspace-scoped delegate management ensuring team members are isolated per context, and seamless contextual analytics navigation preserving active workspace state.
- **Notifications & Reminders (v1.8.0)**:
  - **Browser Notifications**: Integrated browser push notifications.
  - **Workspace Alerts**: Option to set daily notification times for specific workspaces.
  - **Task Reminders**: Ability to set reminder alerts minutes before task due dates.
- **User Authentication & Admin Portal (v1.9.0 / v1.9.1)**:
  - **Secure Login System**: Password hashing via `bcryptjs` and secure JWT cookie sessions via `jose`.
  - **Admin Management Portal**: Dedicated portal (`/admin`) for administrators to manage user accounts, review pending account requests, create new credentials, and revoke access.
  - **Multi-Tenant Isolation**: Workspaces are securely scoped to individual users or globally accessible for team collaboration.
  - **Universal Password Management**: Global "Change Password" modal accessible from the start page for all authenticated users.
  - **Admin Portal Hardening**: Relocated User Management strictly to the start page for administrators. Protected root `admin` account from deletion.
  - **Dynamic Credential Banner**: Programmatic check to automatically hide default credentials banner once the default password is changed.
  - **Custom Confirmation Modal**: Replaced native `window.confirm` dialogs with a premium custom React confirmation modal in the Admin Portal to resolve webview popup dismissal bugs during user deletion and rejection.
  - **CLI Admin Recovery Tool**: Dedicated Node.js command-line script (`npm run admin:recovery -- <new_password>`) for server administrators to securely recover or reset the root admin password directly in the SQLite database without web UI intervention.
  - **Security Vulnerability Remediation**: Added in-memory rate limiting to auth actions against brute-force attacks, implemented `tokenVersion` session invalidation upon password changes to prevent replay attacks, enforced strict SameSite cookie attributes, and added session authorization checks across all custom API routes (`/api/tasks`, `api/delegates`, `api/config`).

### 🍱 The Models Library

A curated gallery of frameworks for better thinking.

- **Eisenhower Matrix**: The core productivity engine (Full Feature).
- **Pareto Principle (80/20)**: Focus on the high-impact effort (Upcoming).
- **First Principles**: Problem deconstruction system (Upcoming).
- **Occam’s Razor**: Simplification logic (Upcoming).

## 🛠 Tech Stack

- **Next.js 16**: Modern, high-performance web framework utilizing **Server Actions**.
- **Tailwind CSS v4**: Bleeding-edge styling for glassmorphic and vibrant design.
- **Prisma + SQLite**: Robust local persistence with optimized database indexes.
- **Lucide React**: Professional metadata-aware iconography.

## 🏁 Getting Started

1. **Clone the Lab**:

```bash
git clone [repository-url]
```

1. **Install Ingredients**:

```bash
npm install
```

1. **Deploy Database**:

```bash
npx prisma db push
```

1. **Ignite the Server**:

```bash
npm run dev
```

## 🤝 Contributing

Contributions are welcome! Please ensure that your pull requests pass the **pre-commit** checks to maintain code quality.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

_Created with ❤️ by Kaushal Soni | Turning mental models into action._
