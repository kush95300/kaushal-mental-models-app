const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Starting database cleanup...");

  // 1. Get the admin user
  const admin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  if (!admin) {
    console.error("❌ Error: admin user not found in the database!");
    process.exit(1);
  }

  console.log(`👤 Found admin user (ID: ${admin.id})`);

  // 2. Delete all tasks
  const deletedTasks = await prisma.task.deleteMany({});
  console.log(`🗑️ Deleted ${deletedTasks.count} tasks.`);

  // 3. Delete all delegates except "Self" in workspace 1 (Personal) and 2 (Work)
  const deletedDelegates = await prisma.delegate.deleteMany({
    where: {
      NOT: {
        name: "Self",
        workspaceId: { in: [1, 2] },
      },
    },
  });
  console.log(`🗑️ Deleted ${deletedDelegates.count} delegates.`);

  // 4. Delete all workspaces except Personal (id 1) and Work (id 2) belonging to admin
  const deletedWorkspaces = await prisma.workspace.deleteMany({
    where: {
      userId: admin.id,
      NOT: {
        id: { in: [1, 2] },
      },
    },
  });
  console.log(`🗑️ Deleted ${deletedWorkspaces.count} non-default admin workspaces.`);

  // 5. Delete all other users (this will cascade and delete their workspaces/delegates/tasks)
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      NOT: {
        id: admin.id,
      },
    },
  });
  console.log(`🗑️ Deleted ${deletedUsers.count} non-admin users.`);

  // 6. Reset admin user activeWorkspaceId to 1 if it wasn't 1 or 2
  await prisma.user.update({
    where: { id: admin.id },
    data: {
      activeWorkspaceId: 1,
    },
  });
  console.log(`🔄 Reset admin activeWorkspaceId to 1.`);

  console.log("✅ Database cleanup successfully completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
