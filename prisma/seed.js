import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aztekafoods.com' },
    update: {},
    create: {
      email: 'admin@aztekafoods.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create sales rep user
  const salesPassword = await bcrypt.hash('sales123', 10);
  const salesRep = await prisma.user.upsert({
    where: { email: 'sales@aztekafoods.com' },
    update: {},
    create: {
      email: 'sales@aztekafoods.com',
      name: 'Sales Representative',
      password: salesPassword,
      role: 'SALES_REP',
    },
  });
  console.log('✅ Created sales rep user:', salesRep.email);

  // Create driver user
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driver = await prisma.user.upsert({
    where: { email: 'driver@aztekafoods.com' },
    update: {},
    create: {
      email: 'driver@aztekafoods.com',
      name: 'Delivery Driver',
      password: driverPassword,
      role: 'DRIVER',
    },
  });
  console.log('✅ Created driver user:', driver.email);

  // Create customer user
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      name: 'Demo Customer',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Created customer user:', customer.email);

  // Create sample products
  const products = [
    {
      name: 'Takis Fuego',
      sku: 'TAK-001',
      description: 'Hot chili pepper & lime flavored rolled tortilla chips',
      price: 24.99,
      cost: 15.50,
      margin: 38.00,
      stock: 120,
      minStock: 20,
      supplier: 'Barcel USA',
      inStock: true,
    },
    {
      name: 'Jumex Mango Nectar',
      sku: 'JUM-001',
      description: 'Mango nectar juice 11.3 fl oz (24 pack)',
      price: 18.99,
      cost: 12.00,
      margin: 36.80,
      stock: 80,
      minStock: 15,
      supplier: 'Jumex',
      inStock: true,
    },
    {
      name: 'Goya Black Beans',
      sku: 'GOY-001',
      description: 'Black beans 15.5 oz (12 pack)',
      price: 14.99,
      cost: 9.50,
      margin: 36.60,
      stock: 150,
      minStock: 25,
      supplier: 'Goya Foods',
      inStock: true,
    },
    {
      name: 'La Costeña Jalapeños',
      sku: 'LAC-001',
      description: 'Pickled jalapeño peppers 26 oz',
      price: 3.99,
      cost: 2.50,
      margin: 37.30,
      stock: 200,
      minStock: 30,
      supplier: 'La Costeña',
      inStock: true,
    },
    {
      name: 'Maseca Corn Flour',
      sku: 'MAS-001',
      description: 'Instant corn masa flour 4.4 lbs',
      price: 5.99,
      cost: 3.80,
      margin: 36.60,
      stock: 100,
      minStock: 20,
      supplier: 'Gruma Corporation',
      inStock: true,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
    console.log('✅ Created product:', product.name);
  }

  // Create badges
  const badges = [
    {
      name: 'Top Seller',
      description: 'Achieved highest sales this month',
      points: 100,
    },
    {
      name: 'Quick Delivery',
      description: 'Completed 50 deliveries on time',
      points: 75,
    },
    {
      name: 'Customer Favorite',
      description: 'Received 5-star ratings from customers',
      points: 50,
    },
  ];

  for (const badgeData of badges) {
    const badge = await prisma.badge.upsert({
      where: { name: badgeData.name },
      update: {},
      create: badgeData,
    });
    console.log('✅ Created badge:', badge.name);
  }

  // Create incentives
  const incentives = [
    {
      title: 'Monthly Sales Target',
      description: 'Reach $10,000 in sales this month',
      threshold: 10000,
      reward: 500.00,
    },
    {
      title: 'New Customer Bonus',
      description: 'Sign up 10 new customers',
      threshold: 10,
      reward: 250.00,
    },
  ];

  for (const incentiveData of incentives) {
    const incentive = await prisma.incentive.create({
      data: incentiveData,
    });
    console.log('✅ Created incentive:', incentive.title);
  }

  // Create loyalty account for customer
  const loyaltyAccount = await prisma.loyaltyAccount.upsert({
    where: { userId: customer.id },
    update: {},
    create: {
      userId: customer.id,
      points: 150,
      tier: 'Bronze',
    },
  });
  console.log('✅ Created loyalty account for:', customer.name);

  // Create rewards
  const rewards = [
    {
      title: '10% Off Next Order',
      description: 'Get 10% discount on your next purchase',
      cost: 100,
      active: true,
    },
    {
      title: 'Free Delivery',
      description: 'Free delivery on your next order',
      cost: 150,
      active: true,
    },
    {
      title: '$25 Store Credit',
      description: '$25 credit towards any purchase',
      cost: 500,
      active: true,
    },
  ];

  for (const rewardData of rewards) {
    const reward = await prisma.reward.create({
      data: rewardData,
    });
    console.log('✅ Created reward:', reward.title);
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Default Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:');
  console.log('  Email: admin@aztekafoods.com');
  console.log('  Password: admin123');
  console.log('\nSales Rep:');
  console.log('  Email: sales@aztekafoods.com');
  console.log('  Password: sales123');
  console.log('\nDriver:');
  console.log('  Email: driver@aztekafoods.com');
  console.log('  Password: driver123');
  console.log('\nCustomer:');
  console.log('  Email: customer@example.com');
  console.log('  Password: customer123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
