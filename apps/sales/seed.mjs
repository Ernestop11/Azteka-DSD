import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const products = [
  { name: 'Jarritos Tamarindo', description: 'Mexican soda', price: 2.49, category: 'Beverages' },
  { name: 'Chips SurtiRico', description: 'Crunchy snack', price: 1.99, category: 'Snacks' },
  { name: 'Gansito Marinela', description: 'Chocolate snack cake', price: 1.49, category: 'Pastries' },
  { name: 'Topo Chico Mineral Water', description: 'Glass bottle mineral water', price: 3.25, category: 'Beverages' },
  { name: 'Canelitas Cookies', description: 'Cinnamon cookies', price: 1.75, category: 'Snacks' }
];

(async () => {
  try {
    await Promise.all(
      products.map(p =>
        pool.query(
          'INSERT INTO products (name, description, price, created_at) VALUES ($1,$2,$3,NOW())',
          [p.name, p.description, p.price]
        )
      )
    );
    console.log(`✅ Seeded ${products.length} products.`);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    pool.end();
  }
})();
