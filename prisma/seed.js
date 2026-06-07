const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Ensure admin user exists
  const existingAdmin = await prisma.user.findUnique({
    where: { username: "admin" },
  });

  let adminId;
  if (!existingAdmin) {
    const hashedPassword = "$2b$10$axgq2bvijvKQeb3Zw0Oi.OQcw31bwd1.0vuQYnMD0l.vBRF9tNzM6";
    const admin = await prisma.user.create({
      data: {
        username: "admin",
        password: hashedPassword,
        isAdmin: true,
        status: "APPROVED",
        tokenVersion: 0,
      },
    });
    adminId = admin.id;
    console.log("👤 Created default admin user.");
  } else {
    adminId = existingAdmin.id;
    console.log("👤 Default admin user already exists.");
  }

  // 2. Ensure Personal workspace (id: 1) exists for admin
  const personalWorkspace = await prisma.workspace.upsert({
    where: {
      name_userId: {
        name: "Personal",
        userId: adminId,
      },
    },
    update: {},
    create: {
      id: 1,
      name: "Personal",
      description: "Personal tasks and goals",
      color: "bg-indigo-500",
      icon: "User",
      userId: adminId,
    },
  });
  console.log(`💼 Ensured 'Personal' workspace exists (ID: ${personalWorkspace.id}).`);

  // 3. Ensure Work workspace (id: 2) exists for admin
  const workWorkspace = await prisma.workspace.upsert({
    where: {
      name_userId: {
        name: "Work",
        userId: adminId,
      },
    },
    update: {},
    create: {
      id: 2,
      name: "Work",
      description: "Professional projects and deadlines",
      color: "bg-amber-500",
      icon: "Briefcase",
      userId: adminId,
    },
  });
  console.log(`💼 Ensured 'Work' workspace exists (ID: ${workWorkspace.id}).`);

  // 4. Update admin activeWorkspaceId to 1 if not set
  const admin = await prisma.user.findUnique({ where: { id: adminId } });
  if (admin && !admin.activeWorkspaceId) {
    await prisma.user.update({
      where: { id: adminId },
      data: { activeWorkspaceId: 1 },
    });
    console.log("🔄 Set admin active workspace to 1.");
  }

  // 5. Ensure "Self" delegate exists for Personal workspace
  await prisma.delegate.upsert({
    where: {
      name_workspaceId: {
        name: "Self",
        workspaceId: 1,
      },
    },
    update: {},
    create: {
      name: "Self",
      email: "me@example.com",
      workspaceId: 1,
    },
  });

  // 6. Ensure "Self" delegate exists for Work workspace
  await prisma.delegate.upsert({
    where: {
      name_workspaceId: {
        name: "Self",
        workspaceId: 2,
      },
    },
    update: {},
    create: {
      name: "Self",
      email: "me@example.com",
      workspaceId: 2,
    },
  });
  console.log("👥 Ensured default delegates exist.");

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
