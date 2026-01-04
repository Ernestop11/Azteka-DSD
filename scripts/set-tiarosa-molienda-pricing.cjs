const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const admin = await p.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

  // Get all La Superior stores
  const stores = await p.customer.findMany({
    where: { businessName: { contains: "La Superior #", mode: "insensitive" } },
    select: { id: true, businessName: true }
  });

  console.log("Setting up Tia Rosa and La Molienda products...");
  console.log("================================================");

  // Get all Tia Rosa products
  const tiaRosaProducts = await p.product.findMany({
    where: {
      OR: [
        { Brand: { name: { contains: "Tia Rosa", mode: "insensitive" } } },
        { name: { contains: "Tia Rosa", mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true, price: true, unitsPerCase: true }
  });

  // Get all La Molienda products
  const moliendaProducts = await p.product.findMany({
    where: {
      OR: [
        { Brand: { name: { contains: "Molienda", mode: "insensitive" } } },
        { name: { contains: "Molienda", mode: "insensitive" } }
      ]
    },
    select: { id: true, name: true, price: true, unitsPerCase: true }
  });

  const allProducts = [...tiaRosaProducts, ...moliendaProducts];
  console.log(`Found ${tiaRosaProducts.length} Tia Rosa products`);
  console.log(`Found ${moliendaProducts.length} La Molienda products`);

  // Step 1: Enable sellByHalfCase for all these products (allow less-than-case ordering)
  console.log("\n1. Enabling sellByHalfCase for all products...");
  for (const product of allProducts) {
    await p.product.update({
      where: { id: product.id },
      data: { sellByHalfCase: true }
    });
  }
  console.log(`   Updated ${allProducts.length} products to allow less-than-case ordering`);

  // Step 2: Create price overrides for La Superior stores based on invoice data
  // Invoice pricing from the seeded data:
  const invoicePricing = {
    // Tia Rosa products - invoice unit price
    "Panque Tia Rosa 235g": 3.5,
    "Doraditas Nuez Tia Rosa 127g": 2.0,
    "Mantecadas Vainilla Tia Rosa 157g": 2.5,
    "Cuernitos Tia Rosa 2pzs 100g": 3.0,
    "Tartina Fresa Tia Rosa 133g": 2.25,
    "Tartina Zarzamora Tia Rosa 133g": 2.25,
    "Pachonsitos Tia Rosa": 2.6,
    "Doraditas Tia Rosa 110g": 2.0,
    // La Molienda products - invoice unit price
    "La Molienda Rollo Guayaba/Cajeta Grande 7.70z": 3.0,
    "La Molienda Mazapan Caja 1/36 120g 4.2oz": 4.0,
  };

  console.log("\n2. Creating price overrides for La Superior stores...");
  let overridesCreated = 0;

  for (const store of stores) {
    for (const product of allProducts) {
      // Check if we have invoice pricing for this product
      const unitPrice = invoicePricing[product.name];

      if (unitPrice) {
        const unitsPerCase = product.unitsPerCase || 1;
        const casePrice = unitPrice * unitsPerCase;

        // Check if override already exists
        const existing = await p.customerPriceOverride.findFirst({
          where: { customerId: store.id, productId: product.id }
        });

        if (existing) {
          await p.customerPriceOverride.update({
            where: { id: existing.id },
            data: {
              overrideType: "FIXED_PRICE",
              fixedPrice: Math.round(casePrice * 100) / 100,
              active: true,
              notes: "Tia Rosa/La Molienda negotiated pricing"
            }
          });
        } else {
          await p.customerPriceOverride.create({
            data: {
              customerId: store.id,
              productId: product.id,
              createdById: admin.id,
              overrideType: "FIXED_PRICE",
              fixedPrice: Math.round(casePrice * 100) / 100,
              active: true,
              notes: "Tia Rosa/La Molienda negotiated pricing"
            }
          });
        }
        overridesCreated++;
      }
    }
  }

  console.log(`   Created/updated ${overridesCreated} price overrides`);

  // Step 3: Show summary
  console.log("\n3. Summary of Tia Rosa/La Molienda products:");
  console.log("   Products with sellByHalfCase enabled (can order less than case):");

  const updatedProducts = await p.product.findMany({
    where: {
      OR: [
        { Brand: { name: { contains: "Tia Rosa", mode: "insensitive" } } },
        { name: { contains: "Tia Rosa", mode: "insensitive" } },
        { Brand: { name: { contains: "Molienda", mode: "insensitive" } } },
        { name: { contains: "Molienda", mode: "insensitive" } }
      ]
    },
    select: { name: true, price: true, unitsPerCase: true, sellByHalfCase: true }
  });

  updatedProducts.forEach(p => {
    const unitPrice = (Number(p.price) / (p.unitsPerCase || 1)).toFixed(2);
    console.log(`   - ${p.name.substring(0, 40).padEnd(40)} | Case: $${Number(p.price).toFixed(2)} (${p.unitsPerCase} units @ $${unitPrice}/ea) | Half-case: ${p.sellByHalfCase ? 'YES' : 'NO'}`);
  });

  // Show Carlos's pricing
  console.log("\n4. Carlos's (La Superior #1) pricing for products with overrides:");
  const carlosOverrides = await p.customerPriceOverride.findMany({
    where: {
      customerId: stores[0].id,
      active: true,
      product: {
        OR: [
          { Brand: { name: { contains: "Tia Rosa", mode: "insensitive" } } },
          { name: { contains: "Tia Rosa", mode: "insensitive" } },
          { Brand: { name: { contains: "Molienda", mode: "insensitive" } } },
          { name: { contains: "Molienda", mode: "insensitive" } }
        ]
      }
    },
    include: { product: { select: { name: true, price: true, unitsPerCase: true } } }
  });

  carlosOverrides.forEach(o => {
    const basePrice = Number(o.product.price);
    const carlosPrice = Number(o.fixedPrice);
    const unitPrice = (carlosPrice / (o.product.unitsPerCase || 1)).toFixed(2);
    console.log(`   - ${o.product.name.substring(0, 40).padEnd(40)} | Base: $${basePrice.toFixed(2)} | Carlos: $${carlosPrice.toFixed(2)} ($${unitPrice}/ea)`);
  });
}

main().catch(console.error).finally(() => p.$disconnect());
