const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== USERS ===');
  const users = await prisma.user.findMany();
  console.log(users);

  console.log('=== WORKSPACES ===');
  const workspaces = await prisma.workspace.findMany();
  console.log(workspaces);

  console.log('=== DELEGATES ===');
  const delegates = await prisma.delegate.findMany();
  console.log(delegates);

  console.log('=== TASKS ===');
  const tasks = await prisma.task.findMany();
  console.log(`Total tasks: ${tasks.length}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
