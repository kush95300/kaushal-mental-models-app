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
- You should see the **Mental Model Repository** title with a clean black-and-white header.
- Verify the **Eisenhower Matrix** card has a professional description and an "Open Tool" button.

### Step 2: Integrated Navigation
- Click **"Open Tool"**.
- Ensure the **"← Back to Home"** link is present at the top left of the matrix page.
- Click it to verify you can return to the home screen smoothly.

### Step 3: Database Verification (Task Addition)
- Return to the Eisenhower Matrix.
- Enter a task (e.g., "Analyze System Architecture") and press **Enter**.
- **Crucial**: Verify the task is added successfully without any "Prisma" or "Table not found" errors in the terminal.

### Step 4: Real-time Categorization
- Toggle the **"Important"** or **"Urgent"** badges on the task.
- Verify the **"Matrix Overview"** panel on the right updates its numbers instantly.

### Step 5: Full Matrix View
- Click **"Show Full Matrix"**.
- Confirm that your categorized tasks appear in the distinct quadrants.

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
