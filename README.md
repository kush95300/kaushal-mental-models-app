# 🧪 The Wisdom Lab (Mental Models Repository)

A high-precision, interactive workspace designed to sharpen decision-making and boost productivity using world-class mental models.

## 🚀 Key Features

### 📅 The Focus Matrix (Eisenhower Matrix v2.0)

Transform your to-do list into a strategic map by separating the urgent from the essential.

- **Dynamic Drag & Drop**: Categorize tasks effortlessly from the **Draft Queue** into one of four distinct quadrants.
- **Intelligent Scheduling**:
  - **Do First (DO)**: Assign priority as _Today_ or _Tomorrow_.
  - **Schedule (Plan)**: Full date-picker integration for long-term planning.
- **Team Delegation System**:
  - Dedicated **Delegate Manager** for team personas.
  - **Smart Assignments**: Tasks default to **"Self"**, with a specific handover prompt when moving to the "Delegate" quadrant.
- **Advanced Archive & Resets**:
  - **Done Archive**: Specialized view for all completed tasks with _Restore to TODO_ capability.
  - **Trash (Soft-Delete)**: Deleted tasks are moved to a Trash can, allowing for _Revert_ or _Permanent Deletion_.
  - **Data Resets**: Quickly wipe _Today's Data_ or _All Data_ for a clean slate.
- **Onboarding & Analytics**:
  - **Smart Onboarding**: Prompt for analytics start date on first visit.
  - **Test Mode**: Explore the full matrix feature set without persisting any data to the database.
- **Educational Overlay**: Integrated **Help (?)** portal explaining the Eisenhower philosophy to ensure maximum productivity.
- **Adaptive Workspace**: Live **Today's Date** display, **Focus Depth** slider (3-50 items), and real-time **Task Metrics** (Total, Done, Pending).

### 🍱 The Models Library

A curated gallery of frameworks for better thinking.

- **Eisenhower Matrix**: The core productivity engine (Full Feature).
- **Pareto Principle (80/20)**: Focus on the high-impact effort (Upcoming).
- **First Principles**: Problem deconstruction system (Upcoming).
- **Occam’s Razor**: Simplification logic (Upcoming).

## 🛠 Tech Stack

- **Next.js 16**: Modern, high-performance web framework.
- **Tailwind CSS v4**: Bleeding-edge styling for glassmorphic and vibrant design.
- **Prisma + SQLite**: Robust local persistence for all tasks, delegates, and settings.
- **Lucide React**: Professional metadata-aware iconography.

## 🏁 Getting Started

1.  **Clone the Lab**:
    ```bash
    git clone [repository-url]
    ```
2.  **Install Ingredients**:
    ```bash
    npm install
    ```
3.  **Deploy Database**:
    ```bash
    npx prisma db push
    ```
4.  **Ignite the Server**:
    ```bash
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please ensure that your pull requests pass the **pre-commit** checks to maintain code quality.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

_Created with ❤️ by Kaushal Soni | Turning mental models into action._
