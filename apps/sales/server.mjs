import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import axios from 'axios';
import { removeBackground } from 'rembg-node';
import { createCanvas, loadImage } from 'canvas';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function authorize(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Missing token' });
    try {
      const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };
}

async function aiDescribeProduct(imagePath, cost) {
  try {
    const img = await fs.promises.readFile(imagePath, { encoding: 'base64' });
    const prompt = `
      You are a wholesale pricing AI. Look at this product photo and suggest:
      1. Product Name
      2. Category
      3. Short Description
      4. Recommended wholesale price (25–35% above cost: ${cost})
      Reply in JSON.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: `data:image/png;base64,${img}` },
          ],
        },
      ],
    });
    return JSON.parse(response.choices[0]?.message?.content || '{}');
  } catch (err) {
    console.error('AI error', err);
    const fallbackPrice = Number(cost) * 1.3 || 1.3;
    return { name: 'New Product', category: 'Misc', price: fallbackPrice };
  }
}

async function ensureBrandTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS brand_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      tagline TEXT,
      logo_url TEXT,
      primary_color TEXT,
      secondary_color TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

const defaultBrand = {
  name: 'Azteka Foods',
  tagline: 'Premium B2B Products',
  logo_url: '',
  primary_color: '#0f172a',
  secondary_color: '#f97316',
};

app.get('/api/products', async (_req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.*, c.name AS category
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.name;`
    );
    res.json(r.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const uploadDir =
  process.env.UPLOAD_DIR ||
  (process.cwd().startsWith('/srv') ? '/srv/azteka-dsd/uploads' : path.join(process.cwd(), 'uploads'));
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const url = `https://aztekafoods.com/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});


app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4)',
      [name, email, hash, role || 'SALES_REP']
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/test', authorize('ADMIN'), (req, res) => {
  res.json({ msg: `Welcome Admin ${req.user.name}` });
});

app.get('/api/admin/overview', authorize('ADMIN'), async (_req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT,
        region TEXT,
        rep_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const [sales, reps, zones] = await Promise.all([
      pool.query(
        `SELECT rep_id, SUM(total) AS total_sales
           FROM orders
           GROUP BY rep_id
           ORDER BY total_sales DESC
           LIMIT 10`
      ),
      pool.query('SELECT * FROM sales_reps ORDER BY name'),
      pool.query('SELECT * FROM zones ORDER BY name'),
    ]);
    res.json({ ok: true, sales: sales.rows, reps: reps.rows, zones: zones.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/brand', async (_req, res) => {
  try {
    await ensureBrandTable();
    const { rows } = await pool.query('SELECT * FROM brand_settings ORDER BY updated_at DESC LIMIT 1');
    res.json({ ok: true, brand: rows[0] || defaultBrand });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/brand', authorize('ADMIN'), async (req, res) => {
  const { name, tagline, logoUrl, primaryColor, secondaryColor } = req.body;
  try {
    await ensureBrandTable();
    const { rows } = await pool.query('SELECT id FROM brand_settings ORDER BY updated_at DESC LIMIT 1');
    if (rows[0]) {
      await pool.query(
        `UPDATE brand_settings
           SET name=$1, tagline=$2, logo_url=$3, primary_color=$4, secondary_color=$5, updated_at=NOW()
         WHERE id=$6`,
        [name, tagline, logoUrl, primaryColor, secondaryColor, rows[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO brand_settings (name, tagline, logo_url, primary_color, secondary_color)
         VALUES ($1,$2,$3,$4,$5)`,
        [name, tagline, logoUrl, primaryColor, secondaryColor]
      );
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/incentives', authorize('ADMIN'), async (req, res) => {
  const { title, description, target, reward, start, end } = req.body;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incentives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT,
        description TEXT,
        target NUMERIC,
        reward TEXT,
        start_date TIMESTAMPTZ,
        end_date TIMESTAMPTZ
      );
    `);

    await pool.query(
      `INSERT INTO incentives (id, title, description, target, reward, start_date, end_date)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6)`,
      [title, description, target, reward, start, end]
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/ai-insights', authorize('ADMIN'), async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT category, SUM(total) AS total
      FROM orders
      GROUP BY category
      ORDER BY total DESC;
    `);

    const prompt = `
      You are an expert sales analyst.
      Analyze this sales data: ${JSON.stringify(rows)}
      and output 3 insights and 2 growth recommendations.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    res.json({ ok: true, insights: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/me', authorize(), (req, res) => {
  const { id, name, role } = req.user;
  res.json({ id, name, role });
});

app.get('/api/products/all', authorize('ADMIN'), async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name AS category
         FROM products p
         LEFT JOIN categories c ON c.id = p.category_id
         ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', authorize('ADMIN'), async (req, res) => {
  const { name, price, sku, description, category_id, image_url } = req.body;
  if (!name || !price || !sku) return res.status(400).json({ error: 'Missing fields' });
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, price, sku, description, category_id, image_url, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
       RETURNING *`,
      [name, slug, price, sku, description || '', category_id || null, image_url || '']
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/intake', authorize('ADMIN'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image is required' });
    const cost = Number(req.body.cost) || 1;
    const buffer = await fs.promises.readFile(req.file.path);

    const cleaned = await removeBackground(buffer);
    const sku = `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const pngPath = path.join(uploadDir, `${sku}.png`);
    await fs.promises.writeFile(pngPath, cleaned);

    const aiData = await aiDescribeProduct(pngPath, cost);
    const suggestedName = aiData?.name || 'New Product';
    const suggestedCategory = aiData?.category || null;
    const suggestedDescription = aiData?.description || '';
    const suggestedPrice = Number(aiData?.price) || cost * 1.3;
    const slug = suggestedName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let categoryId = null;
    if (suggestedCategory) {
      const { rows: catRows } = await pool.query(
        'SELECT id FROM categories WHERE LOWER(name)=LOWER($1) LIMIT 1',
        [suggestedCategory]
      );
      categoryId = catRows[0]?.id || null;
    }

    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, sku, price, description, image_url, category_id, in_stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,TRUE)
       RETURNING *`,
      [suggestedName, slug, sku, suggestedPrice, suggestedDescription, `/uploads/${sku}.png`, categoryId]
    );

    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, 600, 400);
    const img = await loadImage(pngPath);
    ctx.drawImage(img, 100, 50, 400, 300);
    ctx.font = 'bold 28px Sans';
    ctx.fillStyle = '#222';
    ctx.fillText(suggestedName, 20, 40);
    ctx.fillStyle = '#009933';
    ctx.fillText(`$${suggestedPrice.toFixed(2)}`, 20, 80);
    const bannerPath = path.join(uploadDir, `${sku}_banner.png`);
    await fs.promises.writeFile(bannerPath, canvas.toBuffer('image/png'));

    res.json({
      ok: true,
      product: rows[0],
      banner: `/uploads/${sku}_banner.png`,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/routes/plan', authorize('DRIVER'), async (req, res) => {
  try {
    const { stops } = req.body;
    if (!Array.isArray(stops) || !stops.length) {
      return res.status(400).json({ error: 'No stops provided' });
    }

    const origin = '110 Railroad Ave, Vallejo, CA';
    const optimizerPrompt = `Given this list of delivery stops with addresses:
${JSON.stringify(stops)}
Return them in the most efficient driving order for a round trip starting and ending at '${origin}'. Reply only with JSON array preserving customer/address fields.`;

    let orderedStops = stops;
    try {
      const ai = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: optimizerPrompt }],
      });
      orderedStops = JSON.parse(ai.choices[0]?.message?.content || JSON.stringify(stops));
    } catch (err) {
      console.error('Route AI parse error', err);
    }

    const mapsKey = process.env.GOOGLE_MAPS_KEY;
    if (!mapsKey) {
      return res.json({ ok: true, route: orderedStops });
    }

    const destinations = orderedStops.map((s) => encodeURIComponent(s.address)).join('|');
    const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
      origin
    )}&destinations=${destinations}&key=${mapsKey}`;
    const { data } = await axios.get(matrixUrl);

    const results = orderedStops.map((stop, idx) => {
      const element = data?.rows?.[0]?.elements?.[idx] || {};
      return {
        ...stop,
        eta: element.duration?.text || 'N/A',
        distance: element.distance?.text || 'N/A',
      };
    });

    res.json({ ok: true, route: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/routes/log', authorize('DRIVER'), async (req, res) => {
  const { routeId, fuelCost, distance, stops, notes } = req.body;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS route_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        route_id TEXT,
        fuel_cost NUMERIC,
        distance TEXT,
        stops JSONB,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(
      `INSERT INTO route_logs (id, route_id, fuel_cost, distance, stops, notes, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
      [uuidv4(), routeId, fuelCost, distance, JSON.stringify(stops || []), notes || '']
    );
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/showcase/auto', authorize('ADMIN'), async (_req, res) => {
  try {
    const { rows: products } = await pool.query(`
      SELECT id, name, price, image_url, category, created_at
      FROM products
      WHERE featured = TRUE OR created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 6;
    `);

    if (!products.length) {
      return res.status(404).json({ error: 'No products found' });
    }

    const prompt = `Create a short headline (3-6 words) and tagline for a wholesale banner.
The theme should match: ${products.map((p) => p.category || 'General').join(', ')}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    const bannerText = completion.choices[0]?.message?.content || 'Fresh Picks\nTop Wholesale Deals';
    const [headline, tagline] = bannerText.split('\n');

    const W = 1200;
    const H = 600;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 46px Sans';
    ctx.fillText((headline || 'Fresh Picks').slice(0, 30), 50, 80);
    ctx.font = '24px Sans';
    ctx.fillStyle = '#555';
    if (tagline) ctx.fillText(tagline.slice(0, 60), 50, 120);

    let x = 100;
    let y = 160;
    for (const product of products) {
      try {
        if (!product.image_url) continue;
        const relativePath = product.image_url.startsWith('/uploads')
          ? product.image_url.replace('/uploads/', '')
          : path.basename(product.image_url);
        const imgPath = path.join(uploadDir, relativePath);
        const img = await loadImage(imgPath);
        ctx.drawImage(img, x, y, 200, 200);
        ctx.font = 'bold 18px Sans';
        ctx.fillStyle = '#222';
        ctx.fillText(product.name.slice(0, 20), x, y + 230);
        ctx.fillStyle = '#009933';
        ctx.fillText(`$${Number(product.price).toFixed(2)}`, x, y + 255);
        x += 220;
        if (x > 1000) {
          x = 100;
          y += 280;
        }
      } catch (err) {
        console.error('Img fail', err);
      }
    }

    const bannerId = `showcase_${Date.now()}.png`;
    const outPath = path.join(uploadDir, bannerId);
    await fs.promises.writeFile(outPath, canvas.toBuffer('image/png'));

    await pool.query(
      `CREATE TABLE IF NOT EXISTS showcases (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT NOT NULL,
        headline TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );`
    );

    await pool.query(
      `INSERT INTO showcases (image_url, headline) VALUES ($1,$2)`,
      [`/uploads/${bannerId}`, bannerText]
    );

    res.json({ ok: true, banner: `/uploads/${bannerId}`, text: bannerText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', authorize('ADMIN'), async (req, res) => {
  const { name, price, sku, image_url } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE products SET name=$1, price=$2, sku=$3, image_url=$4 WHERE id=$5 RETURNING *`,
      [name, price, sku, image_url, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authorize('ADMIN'), async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/deals/:id', authorize('ADMIN'), async (req, res) => {
  try {
    const { featured, discount } = req.body;
    const { rows } = await pool.query(
      `UPDATE products
         SET featured = COALESCE($1, featured),
             price = CASE WHEN $2 IS NOT NULL THEN price * (1 - ($2/100)) ELSE price END
       WHERE id=$3
       RETURNING *`,
      [featured, discount, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/forecast', async (_req, res) => {
  try {
    const q = `
      SELECT p.id, p.name, p.sku, p.price, p.in_stock, c.name AS category
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ORDER BY p.name;
    `;
    const { rows } = await pool.query(q);
    const forecast = rows.map((r) => {
      const avgSales = randomInt(5, 50);
      const recommended = avgSales * 7;
      const shortage = Math.max(0, recommended - (r.in_stock ? 100 : 0));
      return { ...r, avgSales, recommended, shortage };
    });
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/po/auto', async (req, res) => {
  try {
    const { sku, quantity } = req.body;
    if (!sku || !quantity) return res.status(400).json({ error: 'Missing sku or quantity' });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sku TEXT NOT NULL,
        quantity INT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    const { rows } = await pool.query(
      'INSERT INTO purchase_orders (sku, quantity) VALUES ($1,$2) RETURNING *;',
      [sku, quantity]
    );
    res.json({ ok: true, po: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 5177;
app.listen(port, () => console.log('API listening on :' + port));
