import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

console.log('Connecting to:', process.env.DATABASE_URL);

try {
  const res = await pool.query('SELECT COUNT(*) FROM products');
  console.log('✅ Connected. Products:', res.rows[0]);
} catch (err) {
  console.error('❌ Error:', err.message);
} finally {
  await pool.end();
}

