# 🚀 Quick Start & Testing Guide

Follow these steps to launch the Mental Model Repository and verify all systems are functioning correctly in the new **Educative Edition**.

---

## 1. Start the Application

Open your terminal in the project root and run:

📋 **Start command:**

```bash
npm run dev
```

The application will be live at: **[http://localhost:3000](http://localhost:3000)**

---

## 2. Testing Procedure

### Step 1: Professional Portal (Home Page)

- Navigate to the home page.
- You should see the **Mental Models** title with "The Wisdom Lab" header.
- Verify the **Eisenhower Matrix** card has an educational description and a **"Launch App"** button.

### Step 2: Integrated Navigation

- Click **"Launch App"**.
- Ensure the **"← Back to Models"** link is present at the top left of the matrix page.
- Click it to verify you can return to the home screen smoothly.

### Step 3: Persistence Check (Onboarding)

- Return to the Eisenhower Matrix.
- If it's your first time (or after reset), you should see the **Onboarding Modal**.
- Choose "Start Today" or "Try in Test Mode".

### Step 4: Real-time Categorization (Drag & Drop)

- Create a task in the **Inbox** (left panel).
- Drag it to any quadrant (Do First, Schedule, Delegate, Eliminate).
- Verify the **Assignment Modal** appears for Do, Schedule, and Delegate.
- Complete the specific prompt and verify the task stays in the target quadrant.
- **Verification**: Check that the update is persisted using **Server Actions** (refresh page to confirm).

### Step 5: Advanced Features

- Toggle **"Show Full Matrix"** (should be default view now).
- Test **Mark Done** by clicking the circle icon (confirm completion time).
- Test **Reset Mode** using the top header buttons.

---

## 🛠 Maintenance Commands

📋 **Sync database schema if errors occur:**

```bash
npx prisma db push
```

📋 **Generate production build:**

```bash
npm run build
```

```bash
npm start
```

---

## ✅ Final Checklist

- [ ] No database "Table not found" errors
- [ ] Minimalist Black & White theme applied
- [ ] Home button navigation functional
- [ ] Real-time category updates working
