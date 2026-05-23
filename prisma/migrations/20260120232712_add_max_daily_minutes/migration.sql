-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserConfig" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "activeWorkspaceId" INTEGER NOT NULL DEFAULT 1,
    "maxDailyMinutes" INTEGER NOT NULL DEFAULT 480,
    "analyticsStartDate" DATETIME,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserConfig" ("activeWorkspaceId", "analyticsStartDate", "id", "updatedAt") SELECT "activeWorkspaceId", "analyticsStartDate", "id", "updatedAt" FROM "UserConfig";
DROP TABLE "UserConfig";
ALTER TABLE "new_UserConfig" RENAME TO "UserConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
