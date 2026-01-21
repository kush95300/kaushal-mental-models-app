/*
  Warnings:

  - You are about to drop the column `tags` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `maxDailyMinutes` on the `UserConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "workspaceId" INTEGER DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Task_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "Delegate" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Task" ("actualMinutes", "completedAt", "content", "createdAt", "delegateId", "dueDate", "estimatedMinutes", "id", "isDeleted", "isImportant", "isUrgent", "quadrant", "status", "updatedAt", "workspaceId") SELECT "actualMinutes", "completedAt", "content", "createdAt", "delegateId", "dueDate", "estimatedMinutes", "id", "isDeleted", "isImportant", "isUrgent", "quadrant", "status", "updatedAt", "workspaceId" FROM "Task";
DROP TABLE "Task";
ALTER TABLE "new_Task" RENAME TO "Task";
CREATE INDEX "Task_quadrant_idx" ON "Task"("quadrant");
CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_dueDate_idx" ON "Task"("dueDate");
CREATE TABLE "new_UserConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "activeWorkspaceId" INTEGER NOT NULL DEFAULT 1,
    "analyticsStartDate" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserConfig" ("activeWorkspaceId", "analyticsStartDate", "id", "updatedAt") SELECT "activeWorkspaceId", "analyticsStartDate", "id", "updatedAt" FROM "UserConfig";
DROP TABLE "UserConfig";
ALTER TABLE "new_UserConfig" RENAME TO "UserConfig";
CREATE TABLE "new_Workspace" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT 'indigo',
    "userId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Workspace" ("color", "createdAt", "description", "id", "name", "updatedAt") SELECT "color", "createdAt", "description", "id", "name", "updatedAt" FROM "Workspace";
DROP TABLE "Workspace";
ALTER TABLE "new_Workspace" RENAME TO "Workspace";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
