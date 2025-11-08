import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      { name: "Chips SurtiRico", description: "Crunchy snack", price: 1.99 },
      { name: "Jarritos Tamarindo", description: "Mexican soda", price: 2.49 },
    ],
  });
  console.log("✅ Seed data inserted");
}

main().finally(() => prisma.$disconnect());
