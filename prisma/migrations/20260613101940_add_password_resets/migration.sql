-- CreateTable
CREATE TABLE "PasswordResetRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tempPassword" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "PasswordResetRequest_status_idx" ON "PasswordResetRequest"("status");
