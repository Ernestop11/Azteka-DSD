const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const admin = await p.user.findFirst({ where: { role: "ADMIN" }, select: { id: true } });

  // Get all La Superior stores
  const stores = await p.customer.findMany({
    where: { businessName: { contains: "La Superior #", mode: "insensitive" } },
    select: { id: true, businessName: true }
  });

  console.log("Fixing Tia Rosa and La Molienda product data based on invoices...");
  console.log("==================================================================");

  // Get invoice data to understand the actual case sizes
  // The invoice qty represents how many UNITS were ordered
  // The invoice price is the UNIT price

  // From the invoice analysis:
  // - La Molienda Rollo Guayaba: qty=110, price=$3.00/ea -> likely sold individually
  // - La Molienda Mazapan Caja 1/36: qty=72, price=$4.00/ea -> 36 per case (qty=72 is 2 cases)
  // - Panque Tia Rosa: qty=12, price=$3.50/ea, unitsPerCase=8 -> already correct
  // - Doraditas Nuez: qty=43, price=$2.00/ea, unitsPerCase=10 -> correct

  // Products that need units per case corrections:
  const unitsPerCaseCorrections = {
    "La Molienda Mazapan Caja 1/36 120g 4.2oz": 36, // It's 1/36 = 36 units per case
  };

  // Carlos's negotiated prices (unit price from invoice × units per case)
  const invoicePricing = {
    // Tia Rosa products
    "Panque Tia Rosa 235g": { unitPrice: 3.5, unitsPerCase: 8 },
    "Doraditas Nuez Tia Rosa 127g": { unitPrice: 2.0, unitsPerCase: 10 },
    "Mantecadas Vainilla Tia Rosa 157g": { unitPrice: 2.5, unitsPerCase: 10 },
    "Cuernitos Tia Rosa 2pzs 100g": { unitPrice: 3.0, unitsPerCase: 10 },
    "Tartina Fresa Tia Rosa 133g": { unitPrice: 2.25, unitsPerCase: 4 },
    "Tartina Zarzamora Tia Rosa 133g": { unitPrice: 2.25, unitsPerCase: 4 },
    "Pachonsitos Tia Rosa": { unitPrice: 2.6, unitsPerCase: 10 },
    "Doraditas Tia Rosa 110g": { unitPrice: 2.0, unitsPerCase: 10 },
    // La Molienda products
    "La Molienda Rollo Guayaba/Cajeta Grande 7.70z": { unitPrice: 3.0, unitsPerCase: 1 }, // Sold individually
    "La Molienda Mazapan Caja 1/36 120g 4.2oz": { unitPrice: 4.0, unitsPerCase: 36 },
  };

  // Step 1: Fix unitsPerCase where needed
  console.log("\n1. Fixing unitsPerCase for products...");
  for (const [productName, correctUnits] of Object.entries(unitsPerCaseCorrections)) {
    const product = await p.product.findFirst({
      where: { name: productName }
    });

    if (product) {
      await p.product.update({
        where: { id: product.id },
        data: { unitsPerCase: correctUnits }
      });
      console.log(`   Fixed: ${productName} -> ${correctUnits} units/case`);
    }
  }

  // Step 2: Delete existing overrides for these products (to recreate with correct data)
  console.log("\n2. Clearing existing overrides for Tia Rosa/La Molienda...");
  for (const store of stores) {
    for (const productName of Object.keys(invoicePricing)) {
      const product = await p.product.findFirst({ where: { name: productName } });
      if (product) {
        await p.customerPriceOverride.deleteMany({
          where: { customerId: store.id, productId: product.id }
        });
      }
    }
  }

  // Step 3: Create correct price overrides
  console.log("\n3. Creating correct price overrides...");
  let created = 0;

  for (const store of stores) {
    for (const [productName, pricing] of Object.entries(invoicePricing)) {
      const product = await p.product.findFirst({ where: { name: productName } });

      if (product) {
        const casePrice = pricing.unitPrice * pricing.unitsPerCase;

        await p.customerPriceOverride.create({
          data: {
            customerId: store.id,
            productId: product.id,
            createdById: admin.id,
            overrideType: "FIXED_PRICE",
            fixedPrice: Math.round(casePrice * 100) / 100,
            active: true,
            notes: `Tia Rosa/La Molienda: $${pricing.unitPrice}/ea × ${pricing.unitsPerCase} = $${casePrice}`
          }
        });
        created++;
      }
    }
  }

  console.log(`   Created ${created} price overrides`);

  // Step 4: Verify the results
  console.log("\n4. Verification - Carlos's (La Superior #1) pricing:");
  const carlosOverrides = await p.customerPriceOverride.findMany({
    where: {
      customerId: stores[0].id,
      active: true,
      product: {
        OR: [
          { name: { in: Object.keys(invoicePricing) } }
        ]
      }
    },
    include: { product: { select: { name: true, price: true, unitsPerCase: true } } }
  });

  carlosOverrides.forEach(o => {
    const basePrice = Number(o.product.price);
    const carlosPrice = Number(o.fixedPrice);
    const units = o.product.unitsPerCase || 1;
    const unitPrice = (carlosPrice / units).toFixed(2);
    console.log(`   ${o.product.name.padEnd(45)} | Units: ${String(units).padStart(2)} | Base: $${basePrice.toFixed(2).padStart(6)} | Carlos: $${carlosPrice.toFixed(2).padStart(6)} ($${unitPrice}/ea)`);
  });
}

main().catch(console.error).finally(() => p.$disconnect());
