import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// Helper to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedBrands() {
  try {
    console.log("📦 Seeding brands...");
    const brandsPath = join(process.cwd(), 'data', 'brands.csv');
    const brandsContent = readFileSync(brandsPath, 'utf-8');
    const lines = brandsContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    
    if (nameIndex === -1) {
      console.warn("⚠️  Could not find 'name' column in brands.csv");
      return;
    }

    let created = 0;
    let updated = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      
      if (!name) continue;

      const slug = generateSlug(name);
      
      try {
        const existing = await prisma.brand.findUnique({
          where: { slug },
        });

        if (existing) {
          await prisma.brand.update({
            where: { slug },
            data: { name },
          });
          updated++;
        } else {
          await prisma.brand.create({
            data: { name, slug },
          });
          created++;
        }
      } catch (error) {
        console.warn(`⚠️  Error seeding brand "${name}":`, error.message);
      }
    }

    console.log(`✅ Brands seeded: ${created} created, ${updated} updated`);
  } catch (error) {
    console.warn("⚠️  Could not seed brands (file may not exist):", error.message);
  }
}

async function seedCategories() {
  try {
    console.log("📁 Seeding categories...");
    const categoriesPath = join(process.cwd(), 'data', 'categories.csv');
    const categoriesContent = readFileSync(categoriesPath, 'utf-8');
    const lines = categoriesContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
    
    if (nameIndex === -1) {
      console.warn("⚠️  Could not find 'name' column in categories.csv");
      return;
    }

    let created = 0;
    let updated = 0;

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const name = values[nameIndex];
      
      if (!name) continue;

      const slug = generateSlug(name);
      
      try {
        const existing = await prisma.category.findUnique({
          where: { slug },
        });

        if (existing) {
          await prisma.category.update({
            where: { slug },
            data: { name },
          });
          updated++;
        } else {
          await prisma.category.create({
            data: { name, slug },
          });
          created++;
        }
      } catch (error) {
        console.warn(`⚠️  Error seeding category "${name}":`, error.message);
      }
    }

    console.log(`✅ Categories seeded: ${created} created, ${updated} updated`);
  } catch (error) {
    console.warn("⚠️  Could not seed categories (file may not exist):", error.message);
  }
}

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("password123", 10);
  console.log("🔐 Password hashed successfully");

  // Use raw SQL to bypass Prisma schema mismatch with customerId column
  const existingUser = await prisma.$queryRaw`
    SELECT id, email FROM "User" WHERE email = ${"admin@azteka.com"}
  `;

  if (existingUser && existingUser.length > 0) {
    console.log("👤 Admin user exists, updating password...");
    // Update existing user
    await prisma.$executeRaw`
      UPDATE "User" 
      SET name = ${"Admin"}, password = ${password}, role = ${"ADMIN"}::"Role"
      WHERE email = ${"admin@azteka.com"}
    `;
    console.log("✅ Admin user updated");
  } else {
    console.log("👤 Creating new admin user...");
    // Create new user
    await prisma.$executeRaw`
      INSERT INTO "User" (id, email, name, password, role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${"admin@azteka.com"}, ${"Admin"}, ${password}, ${"ADMIN"}::"Role", NOW(), NOW())
    `;
    console.log("✅ Admin user created");
  }

  // Verify user exists
  const verifyUser = await prisma.$queryRaw`
    SELECT id, email, name, role FROM "User" WHERE email = ${"admin@azteka.com"}
  `;
  console.log("✅ Verified admin user exists:", verifyUser[0]?.email);

  // Seed brands and categories from CSV files
  await seedBrands();
  await seedCategories();

  // Seed products from CSV
  try {
    console.log("\n📦 Seeding products...");
    const { seedProducts } = await import('./seed-products.mjs');
    await seedProducts();
  } catch (error) {
    console.warn("⚠️  Could not seed products:", error.message);
    console.log("   You can seed products manually by running:");
    console.log("   node prisma/seed-products.mjs");
  }

  console.log("✅ Seed complete — admin@azteka.com / password123");
  console.log("\n💡 To generate product images, run:");
  console.log("   node scripts/seed-images-improved.mjs");
}



main()

  .catch((e) => {

    console.error(e);

    process.exit(1);

  })

  .finally(async () => {

    await prisma.$disconnect();

  });
