-- CreateTable
CREATE TABLE "ChatQuotaSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "period" TEXT NOT NULL DEFAULT 'DAY',
    "defaultLimit" INTEGER NOT NULL DEFAULT 20,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UserChatUsage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "usedToday" INTEGER NOT NULL DEFAULT 0,
    "usedThisWeek" INTEGER NOT NULL DEFAULT 0,
    "extraQuota" INTEGER NOT NULL DEFAULT 0,
    "lastResetDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserChatUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatQuotaRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "requestedExtra" INTEGER NOT NULL,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "approvedAmount" INTEGER,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "ChatQuotaRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChatUsage_userId_key" ON "UserChatUsage"("userId");

-- CreateIndex
CREATE INDEX "UserChatUsage_userId_idx" ON "UserChatUsage"("userId");

-- CreateIndex
CREATE INDEX "ChatQuotaRequest_userId_idx" ON "ChatQuotaRequest"("userId");

-- CreateIndex
CREATE INDEX "ChatQuotaRequest_status_idx" ON "ChatQuotaRequest"("status");
