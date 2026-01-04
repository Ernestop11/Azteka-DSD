const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const admin = await p.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

  const stores = await p.customer.findMany({
    where: { businessName: { contains: "La Superior #", mode: "insensitive" } },
    select: { id: true, businessName: true }
  });

  console.log("Processing", stores.length, "La Superior stores...");

  // Delete existing price overrides for these stores
  for (const store of stores) {
    const deleted = await p.customerPriceOverride.deleteMany({
      where: { customerId: store.id }
    });
    console.log(store.businessName, "- Deleted", deleted.count, "existing overrides");
  }

  // Define pricing rules by category (Carlos's negotiated unit price)
  const categoryPricing = {
    "Sabritas XXL": 4.70,      // Familiar/XXL size
    "Sabritas Regular": 2.75,  // Regular size
    "Sabritas Chicas": 1.29,   // Small size
    "Barcel XXL": 4.70,
    "Barcel Regular": 2.75,
    "Barcel Chicas": 1.29,
  };

  // Products to exclude from automatic pricing
  const excludePatterns = [
    "peanuts",
    "sabri-negocio",
    "sabrinegocio",
    "sabrimayoreo",
    "colmillo",
    "sabriton",
    "hot nuts",
    "kiyakis"
  ];

  const products = await p.product.findMany({
    where: {
      Category: { name: { in: Object.keys(categoryPricing) } }
    },
    select: {
      id: true,
      name: true,
      price: true,
      unitsPerCase: true,
      Category: { select: { name: true } }
    }
  });

  console.log("\nFound", products.length, "products in target categories");

  let created = 0;
  let skipped = 0;
  const skippedProducts = [];

  for (const store of stores) {
    for (const product of products) {
      const nameLower = product.name.toLowerCase();
      const shouldExclude = excludePatterns.some(ex => nameLower.includes(ex));

      if (shouldExclude) {
        if (store.businessName === "La Superior #1") {
          skippedProducts.push(product.name);
        }
        skipped++;
        continue;
      }

      const categoryName = product.Category && product.Category.name;
      if (!categoryName) continue;

      const unitPrice = categoryPricing[categoryName];
      if (!unitPrice) continue;

      const unitsPerCase = product.unitsPerCase || 1;
      const casePrice = unitPrice * unitsPerCase;

      await p.customerPriceOverride.create({
        data: {
          customerId: store.id,
          productId: product.id,
          createdById: admin.id,
          overrideType: "FIXED_PRICE",
          fixedPrice: Math.round(casePrice * 100) / 100,
          active: true,
          notes: "Negotiated Sabritas/Barcel pricing"
        }
      });
      created++;
    }
  }

  console.log("\nCreated:", created, "price overrides");
  console.log("Skipped:", skipped, "excluded products (across all stores)");
  console.log("\nExcluded products:", skippedProducts);

  // Show sample of pricing
  console.log("\nSample pricing for La Superior #1:");
  const samples = await p.customerPriceOverride.findMany({
    where: {
      customerId: stores[0].id,
      active: true
    },
    take: 10,
    include: {
      product: { select: { name: true, price: true, unitsPerCase: true, Category: { select: { name: true } } } }
    }
  });

  samples.forEach(s => {
    const basePrice = Number(s.product.price);
    const carlosPrice = Number(s.fixedPrice);
    const unitPrice = carlosPrice / (s.product.unitsPerCase || 1);
    console.log({
      product: s.product.name.substring(0, 30),
      category: s.product.Category?.name,
      unitsPerCase: s.product.unitsPerCase,
      basePrice: basePrice.toFixed(2),
      carlosPrice: carlosPrice.toFixed(2),
      unitPrice: unitPrice.toFixed(2)
    });
  });
}

main().catch(console.error).finally(() => p.$disconnect());
