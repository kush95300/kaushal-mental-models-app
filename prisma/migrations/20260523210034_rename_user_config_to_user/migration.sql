/*
  Warnings:

  - You are about to drop the `UserConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "UserConfig";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "activeWorkspaceId" INTEGER,
    "maxDailyMinutes" INTEGER NOT NULL DEFAULT 480,
    "analyticsStartDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Delegate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "workspaceId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Delegate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Delegate" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "Delegate";
DROP TABLE "Delegate";
ALTER TABLE "new_Delegate" RENAME TO "Delegate";
CREATE INDEX "Delegate_workspaceId_idx" ON "Delegate"("workspaceId");
CREATE UNIQUE INDEX "Delegate_name_workspaceId_key" ON "Delegate"("name", "workspaceId");
CREATE TABLE "new_Task" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "isImportant" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "quadrant" TEXT NOT NULL DEFAULT 'INBOX',
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "estimatedMinutes" INTEGER,
    "actualMinutes" INTEGER,
    "dueDate" DATETIME,
    "delegateId" INTEGER,
    "workspaceId" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "reminderMinutesBefore" INTEGER,
    "isNotified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Task_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Delegate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("actualMinutes", "completedAt", "content", "createdAt", "delegateId", "dueDate", "estimatedMinutes", "id", "isDeleted", "isImportant", "isUrgent", "quadrant", "status", "tags", "updatedAt", "workspaceId") SELECT "actualMinutes", "completedAt", "content", "createdAt", "delegateId", "dueDate", "estimatedMinutes", "id", "isDeleted", "isImportant", "isUrgent", "quadrant", "status", "tags", "updatedAt", "workspaceId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_quadrant_idx" ON "Task"("quadrant");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
CREATE INDEX "Task_workspaceId_idx" ON "Task"("workspaceId");
CREATE TABLE "new_Workspace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT 'indigo',
    "icon" TEXT DEFAULT 'Briefcase',
    "dailyNotificationTime" TEXT DEFAULT '09:00',
    "userId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Workspace" ("color", "createdAt", "description", "id", "name", "updatedAt") SELECT "color", "createdAt", "description", "id", "name", "updatedAt" FROM "Workspace";
DROP TABLE "Workspace";
ALTER TABLE "new_Workspace" RENAME TO "Workspace";
CREATE UNIQUE INDEX "Workspace_name_userId_key" ON "Workspace"("name", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
