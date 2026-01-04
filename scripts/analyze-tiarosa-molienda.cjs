const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  // Get order items for Tia Rosa and La Molienda from La Superior stores
  const stores = await p.customer.findMany({
    where: { businessName: { contains: "La Superior #", mode: "insensitive" } },
    select: { id: true, businessName: true }
  });

  console.log("Analyzing Tia Rosa and La Molienda from seeded invoices...");
  console.log("============================================================");

  const allItems = [];

  for (const store of stores) {
    const order = await p.order.findFirst({
      where: { customerId: store.id },
      include: { OrderItem: true }
    });

    if (!order) continue;

    for (const item of order.OrderItem) {
      const product = await p.product.findUnique({
        where: { id: item.productId },
        include: { Brand: true, Category: true }
      });

      if (!product) continue;

      const brandName = product.Brand?.name || "";
      if (brandName.toLowerCase().includes("tia rosa") ||
          brandName.toLowerCase().includes("molienda") ||
          product.name.toLowerCase().includes("tia rosa") ||
          product.name.toLowerCase().includes("molienda")) {
        allItems.push({
          productId: product.id,
          name: product.name,
          brand: brandName,
          invoicePrice: Number(item.price),
          invoiceQty: item.quantity,
          currentUnitsPerCase: product.unitsPerCase,
          currentPrice: Number(product.price),
          sellByHalfCase: product.sellByHalfCase
        });
      }
    }
  }

  // Dedupe by product
  const uniqueProducts = {};
  allItems.forEach(item => {
    if (!uniqueProducts[item.productId]) {
      uniqueProducts[item.productId] = item;
    }
  });

  console.log("\nTia Rosa / La Molienda products from invoices:");
  Object.values(uniqueProducts).forEach(p => {
    console.log({
      name: p.name,
      brand: p.brand,
      invoicePrice: p.invoicePrice,
      invoiceQty: p.invoiceQty,
      currentUnitsPerCase: p.currentUnitsPerCase,
      currentPrice: p.currentPrice,
      sellByHalfCase: p.sellByHalfCase
    });
  });

  // Also get all Tia Rosa and La Molienda products from database
  console.log("\n\nAll Tia Rosa products in database:");
  const tiaRosa = await p.product.findMany({
    where: {
      OR: [
        { Brand: { name: { contains: "Tia Rosa", mode: "insensitive" } } },
        { name: { contains: "Tia Rosa", mode: "insensitive" } }
      ]
    },
    include: { Brand: true, Category: true }
  });

  tiaRosa.forEach(prod => {
    console.log({
      id: prod.id,
      name: prod.name,
      brand: prod.Brand?.name,
      price: Number(prod.price),
      unitsPerCase: prod.unitsPerCase,
      sellByHalfCase: prod.sellByHalfCase
    });
  });

  console.log("\n\nAll La Molienda products in database:");
  const molienda = await p.product.findMany({
    where: {
      OR: [
        { Brand: { name: { contains: "Molienda", mode: "insensitive" } } },
        { name: { contains: "Molienda", mode: "insensitive" } }
      ]
    },
    include: { Brand: true, Category: true }
  });

  molienda.forEach(prod => {
    console.log({
      id: prod.id,
      name: prod.name,
      brand: prod.Brand?.name,
      price: Number(prod.price),
      unitsPerCase: prod.unitsPerCase,
      sellByHalfCase: prod.sellByHalfCase
    });
  });
}

main().catch(console.error).finally(() => p.$disconnect());
