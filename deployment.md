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
- **Theme Test**: Click the **Sun/Moon icon** in the top right. Verify the whole app transitions between light and dark modes instantly.

### Step 2: Integrated Navigation

- Click **"Launch App"**.
- Ensure the **"← Back to Models"** link is present at the top left of the matrix page.
- Click it to verify you can return to the home screen smoothly.

### Step 3: Persistence Check (Onboarding & Redirection Stability)

- Return to the Eisenhower Matrix.
- If it's your first time (or after reset), you should see the **Onboarding Modal**.
- Choose "Start Today" or "Try in Test Mode".
- **URL Parameter Verification**: Confirm that selecting a workspace appends `?workspaceId=<id>` to the URL, and entering Test Mode appends `?testMode=true`.
- **Redirection Stability**: Perform task mutations (e.g., adding, dragging, or deleting tasks) and verify that the page does not get stuck in a redirect loop that re-opens the onboarding modal.

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

## 🐳 Containerization & Orchestration (4 Deployment Options)

We provide four complete, production-ready methods to deploy the application using the configurations located in the `deployment/` directory.

### 🌟 Interactive Deployment Menu (Recommended)

You can launch our interactive deployment helper script to automatically guide you through building, configuring, and deploying to any of the 4 targets (or starting local dev):

```bash
# Using Make shortcut
make deploy

# Or using npm script
npm run deploy

# Or executing directly
bash scripts/deploy.sh
```

### Option 1: Standalone Docker Container

Build and run the multi-stage, optimized Next.js standalone container. Database migrations are applied automatically at container startup.

```bash
# Build the Docker image
docker build -t kaushal-mental-models:latest -f deployment/docker/Dockerfile .

# Run the container on port 3000 (Note: JWT_SECRET is required in production)
docker run -d -p 3000:3000 -e JWT_SECRET=your-strong-production-key-here --name mental-models-app kaushal-mental-models:latest
```

### Option 2: Docker Compose (Recommended for Single-Host Production)

Deploy the application with automated persistent SQLite volume management and schema updates.

```bash
# Start the multi-container environment
# Be sure to customize JWT_SECRET in deployment/docker-compose/docker-compose.yml
docker compose -f deployment/docker-compose/docker-compose.yml up -d --build

# View real-time logs
# docker compose -f deployment/docker-compose/docker-compose.yml logs -f
```

### Option 3: Vanilla Kubernetes (K8s) Manifests

Deploy to any standard Kubernetes cluster using native declarative manifests:

```bash
# Apply ConfigMap, PVC, Deployment, Service, and Ingress
kubectl apply -f deployment/k8s/configmap.yaml
kubectl apply -f deployment/k8s/deployment.yaml
kubectl apply -f deployment/k8s/service.yaml
kubectl apply -f deployment/k8s/ingress.yaml

# Verify pod status
kubectl get pods -l app=kaushal-mental-models
```

### Option 4: Helm Chart (Recommended for Enterprise K8s)

Deploy using our fully templated, dynamic Helm package manager:

```bash
# Install or upgrade the Helm chart
helm upgrade --install mental-models-app ./deployment/helm/kaushal-mental-models --namespace production --create-namespace

# Check Helm release status
helm status mental-models-app -n production
```

---

## 🛠 Maintenance Commands

📋 **Sync database schema if errors occur:**

```bash
npx prisma db push
```

📋 **Code Linting:**

```bash
npm run lint
```

📋 **Code Formatting:**

```bash
npx prettier --write "src/**/*.{ts,tsx,css}"
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
- [ ] Premium Dark/Light mode functional on all pages
- [ ] Home button navigation functional
- [ ] Real-time category updates working
- [ ] Cross-page theme synchronization (Home-Matrix-Analytics)
- [ ] URL parameters (`workspaceId` and `testMode`) are updated correctly and do not cause redirection loops during task operations
