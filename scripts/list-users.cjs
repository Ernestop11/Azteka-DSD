const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function listUsers() {
  const users = await p.user.findMany({
    select: { id: true, name: true, role: true, email: true }
  });

  console.log("All users in database:");
  users.forEach(u => {
    console.log(`  - ${u.name} (${u.role}) - ${u.email}`);
  });
  console.log(`Total: ${users.length} users`);
}

listUsers().catch(console.error).finally(() => p.$disconnect());
