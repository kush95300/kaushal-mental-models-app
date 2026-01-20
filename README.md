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
- **Premium User Experience**:
  - **Hover Tooltips**: Instantly view full task descriptions on hover for longer entries.
  - **Educational Overlay**: Integrated **Help (?)** portal explaining the Eisenhower philosophy.
  - **Adaptive Workspace**: Live **Today's Date** display, **Focus Depth** slider, and real-time **Task Metrics**.

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
