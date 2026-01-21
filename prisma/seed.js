const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Create default workspaces
  const work = await prisma.workspace.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Work",
      color: "indigo",
    },
  });

  const personal = await prisma.workspace.upsert({
    where: { name: "Personal" },
    update: {},
    create: {
      name: "Personal",
      color: "rose",
    },
  });

  // Ensure Self delegate exists
  await prisma.delegate.upsert({
    where: { name: "Self" },
    update: {},
    create: {
      name: "Self",
    },
  });

  // Ensure UserConfig exists
  await prisma.userConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      activeWorkspaceId: 1,
    },
  });

  console.log("Seed completed: Work and Personal workspaces created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
