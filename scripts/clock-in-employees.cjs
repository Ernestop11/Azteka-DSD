const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function clockIn() {
  // Find Nico and Vero
  const employees = await p.user.findMany({
    where: {
      OR: [
        { name: { contains: "Nico", mode: "insensitive" } },
        { name: { contains: "Vero", mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true }
  });

  console.log("Found employees:", employees);

  // Clock in time: today at 10:15 AM
  const today = new Date();
  const clockInTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 15, 0);

  console.log("Clock in time:", clockInTime.toISOString());

  for (const emp of employees) {
    // Check if already clocked in today
    const existing = await p.timeEntry.findFirst({
      where: {
        userId: emp.id,
        clockIn: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0)
        }
      }
    });

    if (existing) {
      console.log(`${emp.name} already has entry today, skipping`);
      continue;
    }

    const entry = await p.timeEntry.create({
      data: {
        userId: emp.id,
        clockIn: clockInTime,
        notes: "Clocked in by admin"
      }
    });
    console.log(`Clocked in ${emp.name} at 10:15 AM - entry ID: ${entry.id}`);
  }
}

clockIn().catch(console.error).finally(() => p.$disconnect());
