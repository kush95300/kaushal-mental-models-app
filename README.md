# 🎓 Mental Model Repository

A professional, interactive, and locally-hostable repository for mental models. Designed with a clean, high-contrast "Educative" aesthetic, this monolithic application helps you manage your cognitive tools with clarity and focus.

## ✨ Current Models
- **Eisenhower Matrix**: Prioritize tasks by urgency and importance in a minimalist, professional interface.

---

## 🚀 Setting Up on a New Machine

If you are cloning this repository for the first time on a new computer, follow these steps to get the environment running.

### 1. Prerequisites
Ensure you have the following software installed:
- **Node.js**: Version 18.x or higher is recommended.
- **npm**: Comes bundled with Node.js.
- **Git**: For cloning the repository.

### 2. Clone and Install
📋 **Copy and run these commands:**

```bash
git clone <your-repo-url>
```
```bash
cd kaushal-mental-models
```
```bash
npm install
```

### 3. Database Initialization
This project uses **SQLite** with **Prisma**. To initialize the local database file:

📋 **Command to generate client:**
```bash
npx prisma generate
```

📋 **Command to sync database schema:**
```bash
npx prisma db push
```

### 4. Run the Repository
📋 **Start the server:**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to enter the portal.

---

## 💾 Database Management & Migrations

The application saves all your data locally in the `dev.db` file. To ensure you don't lose data:

### Keeping Data Safe
- **Backup**: Always create a copy of `dev.db` before running destructive actions.
- **Schema Updates**: If you modify `schema.prisma`, run `npx prisma db push`.

### Moving to Another Computer
1. Follow the **Setup** steps above on the new machine.
2. Copy your existing `dev.db` file to the root folder on the new machine.
3. Run `npm run dev`. Your data will be preserved.

---

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: SQLite
- **ORM**: Prisma
- **Styling**: Minimalist Vanilla CSS
- **Fonts**: Inter (via Google Fonts)
