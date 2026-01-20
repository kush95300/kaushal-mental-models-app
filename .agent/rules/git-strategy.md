---
trigger: model_decision
description: This is the Git strategy and file strategy we are following in this repo.
---

# 🚀 Monolith Test Product

This is a local monolithic application featuring a Node.js backend and a JavaScript-based frontend. This repository follows a strict **Develop-Centric** Git strategy to ensure stability and clean code organization.

---

## 🌿 Git Strategy & Branching Model

We follow a modified Gitflow-lite approach. The `main` branch is the "Production" source of truth, while `develop` serves as the primary workspace.

### Branch Types

- **`main`**: High-stability branch. Updated only during "Larger Upgrades" or emergency `hotfix/` merges.
- **`develop`**: The main hub for all development. All features and fixes originate here.
- **`feat/*`**: New features. **Source:** `develop` | **Target:** `develop`.
- **`fix/*`**: Standard bug fixes. **Source:** `develop` | **Target:** `develop`.
- **`hotfix/*`**: Critical emergency patches. **Source:** `main` | **Target:** `main` AND `develop`.

---

## 🏷️ Naming Conventions

Consistency is enforced to ensure the monolith remains readable as it grows.

### 1. Branch Naming

**Pattern:** `prefix/short-description` (lowercase, kebab-case).

- ✅ `feat/api-user-login`
- ✅ `fix/navbar-mobile-issue`
- ✅ `hotfix/patch-security-vulnerability`

### 2. File & Directory Naming

| Asset Type        | Convention       | Example                                      |
| :---------------- | :--------------- | :------------------------------------------- |
| **Directories**   | `kebab-case`     | `src/api-controllers/`, `src/ui-components/` |
| **Backend/Logic** | `snake_case.js`  | `user_service.js`, `db_connection.js`        |
| **Frontend/UI**   | `PascalCase.js`  | `DashboardView.js`, `AuthForm.js`            |
| **Utilities**     | `kebab-case.js`  | `date-utility.js`, `error-handler.js`        |
| **Styles**        | `kebab-case.css` | `global-layout.css`                          |

## 3. Commit Messages

**Pattern:** `type(scope): description` or `type(scope): [Phase-X] description`

**Rules:**

1. **Type**: `feat`, `fix`, `refactor`, `docs`, `chore`.
2. **Scope**: Component affected (e.g., `matrix`, `api`, `db`).
3. **Phase Tag**: **Mandatory** when working on a specific Implementation Plan phase.
4. **Description**: Concise summary (imperative mood).

**Examples:**

- `feat(api): [Phase-1] add server actions for task mutations`
- `fix(ui): [Phase-2] resolve drag-and-drop flickering`
- `docs(readme): update installation guide`
- `refactor(db): [Phase-3] optimize query indexing`

## 🔄 Core Workflows

### Standard Development (Feature/Fix)

1. **Switch to Develop:** `git checkout develop`
2. **Create Branch:** `git checkout -b feat/your-feature`
3. **Merge Back:** Once tested, merge into `develop`.

### Release Strategy

When a milestone is reached on `develop` or significant UI changes are verified:

1. `git checkout main`
2. `git merge develop`
3. **Tagging Rule:** Do NOT tag every commit. Only create a tag (e.g., `v1.x.x` or `v1.x.x-patch`) when:
   - There is a visible UI change that is stable.
   - A major feature is completed.
   - A critical bug fix is verified.
4. `git tag -a v1.x.x -m "Release description"`

### Emergency Hotfix (The Exception)

1. **Branch from Main:** `git checkout main` -> `git checkout -b hotfix/urgent-fix`
2. **Fix & Merge to Main:** `git checkout main` -> `git merge hotfix/urgent-fix`
3. **Sync with Develop:** `git checkout develop` -> `git merge hotfix/urgent-fix`

---

## 📁 Project Structure

```text
├── /src
│   ├── /server          # Node.js backend (logic in snake_case.js)
│   ├── /client          # Frontend logic (components in PascalCase.js)
│   └── app.js           # Main entry point
├── /tests               # Local test suites
├── .env.example         # Template for environment variables
├── .gitignore           # Excludes node_modules, .env, and local DB files
└── package.json         # Project configuration & dependencies

## ⚠️ Repository Guardrails
- No Direct Commits to Main: Except via a hotfix/ branch.
- Strict Naming: Do not use spaces or uppercase in file names (except for UI components).
- Secret Management: Never commit .env files. Ensure they are listed in .gitignore.
```
