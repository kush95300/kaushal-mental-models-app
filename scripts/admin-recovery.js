const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const newPassword = args[0];

  console.log("\n==================================================");
  console.log("🛡️  WISDOM LAB - ADMIN PASSWORD RECOVERY TOOL");
  console.log("==================================================\n");

  if (!newPassword) {
    console.log("📌 USAGE:");
    console.log("  node scripts/admin-recovery.js <new_password>\n");
    console.log("💡 EXAMPLE:");
    console.log("  node scripts/admin-recovery.js SuperSecurePass123!\n");
    console.log("ℹ️  EXPLANATION:");
    console.log("  For security, user passwords are irreversibly hashed using bcrypt.");
    console.log("  Therefore, a forgotten password cannot be 'grabbed' or decrypted in plaintext.");
    console.log("  Instead, this CLI tool allows server administrators with direct code/server access");
    console.log("  to securely reset/overwrite the root admin password directly in the SQLite database.\n");
    process.exit(0);
  }

  try {
    console.log("🔄 Searching for root 'admin' account in database...");
    let adminUser = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    if (!adminUser) {
      console.log("⚠️ Root 'admin' account not found. Creating new root admin account...");
      adminUser = await prisma.user.create({
        data: {
          username: "admin",
          password: hashedPassword,
          isAdmin: true,
          status: "APPROVED",
        },
      });
      console.log(`\n✅ [SUCCESS] Root admin account created with password: "${newPassword}"`);
    } else {
      console.log("🔐 Root 'admin' account found. Updating password hash...");
      adminUser = await prisma.user.update({
        where: { username: "admin" },
        data: { password: hashedPassword },
      });
      console.log(`\n✅ [SUCCESS] Root admin password successfully reset to: "${newPassword}"`);
    }

    console.log("\n🚀 You can now log into the web application at http://localhost:3000/login");
    console.log("==================================================\n");
  } catch (error) {
    console.error("\n❌ [ERROR] Failed to recover/reset admin password:", error.message);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
