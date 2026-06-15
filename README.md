# 🧪 The Wisdom Lab (Mental Models Repository)

A high-precision, interactive workspace designed to sharpen decision-making and boost productivity using world-class mental models.

## 🚀 Key Features

### 🤖 AI Chatbot Tasker — "Betu" (v2.4.8)

Natural language AI assistant for task creation, mental model education, and smart task management.

- **TTS Header Speaker Button (Auto Speech)**: Toggle automatic read-aloud of chatbot replies via a speaker icon in the header. Features dynamic voice prioritization favoring natural, premium-sounding voices and sanitizes text strings (e.g. keeping hyphens in date structures) to avoid robotic text pronunciation.
- **Proposed Task Moves (Task Shifting)**: Automatically detects when you ask to move, shift, reschedule, or re-organize existing tasks (e.g., "move broad report to Schedule quadrant", "transfer it to Work workspace"). Displays a `ProposedMoveCard` with Approve/Cancel options that directly updates database task entries instead of creating duplicate tasks.
- **Strict Operating Mode Routing**: Enforces mode routing rules so that any explicit task movement request strictly invokes Mode C (`mode: "move"`), parsing context (like "this task" or "it") from conversation history and asking for clarification rather than defaulting back to creating duplicate tasks.
- **Customizable Persona & Avatars**: Defaults to "Betu". Users can rename the chatbot and customize its avatar (selecting from preset icons like `Smile`, `Bot`, `Sparkles`, `Heart`, `Zap` or entering a custom image URL) via a settings panel, persisting in `localStorage`.
- **Quota Tracking & Transparency**: Displays the current used message count and active limits (e.g., "Used 2/20 msgs today") directly in the chatbot header, with a strict hard cap of 100 daily messages.
- **Spoken Daily & Weekly Briefings**: Generates spoken briefings for both daily agendas and weekly reviews. The new "Brief My Week (Audio)" action summarizes weekly completions, upcoming tasks, and quadrant balance advice.
- **Local Grilling & Router Intercepts**: Prefilters prompts locally before hitting the LLM:
  - Intercepts tutorial help queries and renders quick links to restart matrix or analytics guided tours.
  - Intercepts off-topic queries (recipes, weather, sports) with a friendly notification and a "Go to FAQ Page" button.
  - Intercepts home page task additions, prompting the user to select the destination workspace.
- **JSON Output Sanitizer**: Automatically cleans up and parses response streams to prevent raw JSON syntax or Markdown wrapping from escaping to the user.
- **Task Decomposition**: Large tasks are split into sub-tasks with a strict duration limit of 1 to 3 hours (60 to 180 minutes) maximum.
- **Multi-Mode Intelligence**: Automatically detects whether you're asking to create a task, question mental models, or move an existing task.
- **Multi-LLM Providers**: Supports Gemini 1.5 Flash, GPT-4o-mini, and Claude Haiku. Auto-falls back on failures.
- **Voice Input**: Click the mic, speak naturally. Jitter-free sequential compilation compiled in real-time.
- **Interactive FAQ & Admin Forum**: Public `/faq` page with accordion-style Q&As and a question submission form. Administrators can type answers, approve pending questions, and delete entries via the Admin Portal dashboard.

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
- **Onboarding & Interactive Tutorials (v2.0.0)**:
  - **Interactive 4-Track Video Tour**: Built-in React-animated simulated video player with play/pause, scrubbing, speeds, toggleable subtitles (CC), and a mobile-optimized chapter selector dropdown. Explains: (1) what mental models are, (2) what the Eisenhower Matrix is (20-minute masterclass simulation), (3) adding, moving, and completing tasks, and (4) key platform features (Workspaces, Analytics, Delegates, Database Cleanup). Launches automatically upon first-time user login, allows users to choose any chapter to watch at any time, and features a calmer, slowed-down pre-recorded neural conversational voiceover narration.
  - **Contextual In-App Tutorials**: Floating step-by-step onboarding walkthrough pointers with focus highlights, tethered dynamically using viewport-relative `fixed` overlay coordinates to target UI elements on both the Eisenhower Matrix page and the Analytics Dashboard. Recalculates on page scroll/resize to follow UI elements smoothly without hijacking user scrolls.
  - **Interactive Walkthrough Sub-Guides**: Complete interactive guides selectable from a post-walkthrough dialog modal:
    - **How to Add a Task**: 3-step guide covering (1) entering a sample task ("Learn Eisenhower Matrix") and estimate ("45 min") in the form, (2) tracking its appearance in the Draft Queue (Inbox), and (3) dragging it to the appropriate matrix quadrant.
    - **How to Add a Delegate**: 4-step guide covering (1) clicking Manage Delegates in the header, (2) auto-opening the dialog and highlighting the teammate name input, (3) typing a teammate name and clicking Add Team Member, and (4) returning to the grid for task delegation assignment.
    - **How to Use Analytics**: Dynamic guide highlighting active productivity indicators.
  - **Auto-popup Controls**: Includes skip options, language selectors (English, Hindi, Hinglish), and a persistent "Don't show again" local storage toggle.
  - **Zero-Asset Synthesized Audio**: Utilizes the native browser Web Audio API `AudioContext` to synthesize premium click ticks, chime success sweeps, and swoosh transitions dynamically, removing the need for external audio assets.
  - **Smart Onboarding**: Prompt for analytics start date on first visit.
  - **Test Mode**: Explore the full matrix feature set without persisting any data to the database.
- **Mobile & Cross-Device Responsiveness (v2.2.0)**:
  - **Horizontal scrollable tab bar** on mobile viewports to toggle selectively between Inbox and each matrix quadrant, preventing long layout stacking.
  - **Stacked forms** and touch-friendly controls with comfortable pad tap areas on screens `< 768px`.
  - **Collapsible settings drawer**: Slide-up settings sheet in the matrix view to clean up header space.
  - **Touch-Friendly "Move/Prioritize" Quick Selector**: Target icon on task cards with prominent background and helper tip banner for easy mobile relocation.
  - **Fluid text & compact stats grid**: Dynamically scaling header fonts, smaller paddings, and a compact 3-column stats view to prevent vertical screen takeover on mobile.
  - **Responsive video controls & Fullscreen**: Custom Video Tour Player control panel wrapping dynamically with abbreviated labels, toggleable closed captions (CC), and native HTML5 Fullscreen API toggle.
  - **Robust layering**: Standardized topmost modal z-indices (`z-[50000]+`) to avoid clashes with hover-highlighted elements.
  - **Centered popover notifications**: Centered fixed layouts for alerts to guarantee readability on narrow screens.
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
- **User Authentication, Admin Portal & Password Resets (v2.4.0)**:
  - **Secure Login System**: Password hashing via `bcryptjs` and secure JWT cookie sessions via `jose`.
  - **Password Reset Requests**: Active users can submit password reset requests from the login panel if credentials are forgotten. Admins approve requests in `/admin` by generating random alphanumeric temporary credentials, invalidating active sessions.
  - **Admin Management Portal**: Dedicated portal (`/admin`) for administrators to manage user accounts, review pending account requests, approve password resets, create new credentials, and revoke access.
  - **Multi-Tenant Isolation**: Workspaces are securely scoped to individual users or globally accessible for team collaboration.
  - **Universal Password Management**: Global "Change Password" modal accessible from the start page for all authenticated users.
  - **Admin Portal Hardening**: Relocated User Management strictly to the start page for administrators. Protected root `admin` account from deletion.
  - **Custom Confirmation Modal**: Replaced native `window.confirm` dialogs with a premium custom React confirmation modal in the Admin Portal to resolve webview popup dismissal bugs during user deletion and rejection.
  - **CLI Admin Recovery Tool**: Dedicated Node.js command-line script (`npm run admin:recovery -- <new_password>`) for server administrators to securely recover or reset the root admin password directly in the SQLite database without web UI intervention.
  - **Security Vulnerability Remediation**: Added in-memory rate limiting to auth actions against brute-force attacks, implemented `tokenVersion` session invalidation upon password changes to prevent replay attacks, enforced strict SameSite cookie attributes, and added session authorization checks across all custom API routes (`/api/tasks`, `api/delegates`, `api/config`).
  - **IDOR & Security Header Hardening**: Configured comprehensive Next.js security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) and implemented strict multi-tenant Insecure Direct Object Reference (IDOR) workspace ownership verification across all Server Actions (`task.ts`, `delegate.ts`, `analytics.ts`) and REST API routes (`/api/tasks`, `/api/delegates`).
  - **Database Migration Isolation**: Moved database storage to `/app/data/dev.db` mounted separate from the migrations directory `/app/prisma`, allowing database schema changes and migrations without losing active data.
- **Completed Tasks Heatmap**: GitHub-style activity grid visualizer on the Analytics dashboard showing completed tasks per day over the last 375 days. Colors cells from grey (0 tasks) to deep indigo (5+ tasks) with tooltips showing specific counts on hover.

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

## 🐳 Containerization & Orchestration (4 Deployment Options)

We provide four complete, production-ready methods to deploy the application using the configurations located in the `deployment/` directory.

### 🌟 Interactive Deployment Menu (Recommended)

You can launch our interactive deployment helper script to automatically guide you through building, configuring, and deploying to any of the 4 targets (or starting local dev):

```bash
make deploy
# or
npm run deploy
```

### Manual Deployment Targets

1. **Standalone Docker Container**: Multi-stage, highly optimized Next.js standalone container (`deployment/docker/Dockerfile`). Database migrations are applied automatically at container startup, and a custom `JWT_SECRET` environment variable must be provided in production.
2. **Docker Compose**: Automated orchestration pulling the pre-built `kaushal95300/kaushal-mental-models:latest` image. Persistent data is stored in the volume `sqlite_data` (preserving data across container restarts). You can pull updates and hot-reload containers safely with `make app-update`, which creates a database backup file (`dev_db_backup_before_update.db`) on the host prior to the update. Make sure to configure the `JWT_SECRET` in the Compose file.
3. **Vanilla Kubernetes Manifests**: Declarative K8s resources including PVC, Deployment, Service, ConfigMap, and Ingress (`deployment/k8s/`).
4. **Helm Chart**: Fully templated, dynamic Kubernetes package management (`deployment/helm/kaushal-mental-models`).

For detailed step-by-step instructions on each deployment method, please refer to the **[Deployment Guide](deployment.md)**.

## 🧹 Code Quality & Styling

To maintain high code quality and styling consistency across the workspace:
- **Linting**: Run `npm run lint` to perform static code analysis via ESLint.
- **Formatting**: Run `npx prettier --write "src/**/*.{ts,tsx,css}"` to automatically format all source files.

## 🤝 Contributing

Contributions are welcome! Please ensure that your pull requests pass all linting, formatting, and test checks.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

_Created with ❤️ by Kaushal Soni | Turning mental models into action._
