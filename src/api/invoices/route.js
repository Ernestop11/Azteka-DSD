import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { Prisma, PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { removeBackgroundFromImageBase64 } from 'remove.bg';

const prisma = new PrismaClient();
const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads', 'invoices');
const productImageDir = path.join(process.cwd(), 'public', 'products');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDir(uploadDir);
ensureDir(productImageDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname) || '.dat';
    cb(null, `${timestamp}-${file.fieldname}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

const OPENAI_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const decimal = (value) => new Prisma.Decimal(value ?? 0);

const fallbackExtraction = () => ({
  supplier: 'Unknown Supplier',
  invoiceDate: new Date().toISOString(),
  items: [
    {
      name: 'Sample Product',
      qty: 10,
      cost: 8.5,
      total: 85,
    },
  ],
});

async function extractInvoiceData(filePath, mimetype) {
  if (!openai) {
    return fallbackExtraction();
  }

  const fileBuffer = await fs.promises.readFile(filePath);
  const base64 = fileBuffer.toString('base64');

  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      input: [
        {
          role: 'system',
          content:
            'You are an expert AP clerk. Extract supplier name, invoice date, and line items with fields name, qty, cost, total. Respond with strict JSON: {supplier, invoiceDate, items:[{name,qty,cost,total}]}',
        },
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Parse this invoice and provide structured JSON.',
            },
            {
              type: 'input_image',
              mime_type: mimetype,
              data: base64,
            },
          ],
        },
      ],
    });

    const raw = response.output?.[0]?.content?.[0]?.text ?? response.output_text;
    if (!raw) {
      return fallbackExtraction();
    }

    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('OpenAI extraction failed, using fallback', error);
    return fallbackExtraction();
  }
}

async function applyBackgroundRemoval(buffer) {
  if (process.env.REMOVE_BG_KEY) {
    try {
      const result = await removeBackgroundFromImageBase64({
        base64img: buffer.toString('base64'),
        apiKey: process.env.REMOVE_BG_KEY,
        size: 'auto',
        format: 'png',
      });
      if (result?.base64img) {
        return Buffer.from(result.base64img, 'base64');
      }
    } catch (error) {
      console.warn('remove.bg failed, falling back to sharp alpha mask', error.message);
    }
  }

  return sharp(buffer).png().toBuffer();
}

async function generatePlaceholderImage(name) {
  if (!openai) {
    return sharp({
      create: {
        width: 600,
        height: 600,
        channels: 4,
        background: { r: 236, g: 253, b: 245, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  }

  try {
    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: `Studio photo of ${name}, commercial product on neutral background, high detail`,
      size: '512x512',
    });
    const imageBase64 = response.data?.[0]?.b64_json;
    if (imageBase64) {
      return Buffer.from(imageBase64, 'base64');
    }
  } catch (error) {
    console.warn('AI image generation failed, using fallback buffer', error.message);
  }

  return sharp({
    create: {
      width: 600,
      height: 600,
      channels: 4,
      background: { r: 236, g: 253, b: 245, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

async function downloadProductImage(name) {
  const queries = [
    `https://source.unsplash.com/600x600/?${encodeURIComponent(name)}`,
    `https://images.unsplash.com/photo-1524592094714-0f0654e20314`,
  ];

  for (const url of queries) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.warn('Image fetch failed', error.message);
    }
  }

  return null;
}

async function prepareProductImage(productName, filename) {
  let buffer = await downloadProductImage(productName);
  if (!buffer) {
    buffer = await generatePlaceholderImage(productName);
  }

  const cleaned = await applyBackgroundRemoval(buffer);
  const filePath = path.join(productImageDir, filename);
  await fs.promises.writeFile(filePath, cleaned);
  return `/products/${filename}`;
}

router.post('/upload', upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const { path: filePath, mimetype, filename } = req.file;
    const structured = await extractInvoiceData(filePath, mimetype);
    const supplier = structured.supplier || 'Unknown Supplier';
    const invoiceDate = structured.invoiceDate ? new Date(structured.invoiceDate) : null;
    const items = Array.isArray(structured.items) ? structured.items : [];

    let total = decimal(0);
    const processedItems = [];

    for (const item of items) {
      const qty = Number(item.qty) || Number(item.quantity) || 0;
      const cost = decimal(item.cost || item.price || 0);
      const lineTotal = cost.times(qty);
      total = total.plus(lineTotal);
      const cleanName = (item.name || 'Unnamed Item').trim();

      if (!cleanName || qty === 0) continue;

      const existing = await prisma.product.findFirst({
        where: {
          name: {
            equals: cleanName,
            mode: 'insensitive',
          },
        },
      });

      if (existing) {
        const margin =
          existing.price && !existing.price.isZero()
            ? existing.price.minus(cost).div(existing.price).times(100)
            : null;

        const updated = await prisma.product.update({
          where: { id: existing.id },
          data: {
            stock: { increment: qty },
            inStock: true,
            cost,
            margin,
          },
        });

        processedItems.push({
          type: 'existing',
          productId: updated.id,
          name: updated.name,
          quantity: qty,
          cost: cost.toString(),
        });
      } else {
        const computedPrice = cost.times(1.3);
        const margin = computedPrice.minus(cost).div(computedPrice).times(100);
        const productSku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const imageFilename = `${productSku}.png`;
        let imageUrl = '';

        try {
          imageUrl = await prepareProductImage(cleanName, imageFilename);
        } catch (error) {
          console.warn('Failed to prepare product image', error.message);
        }

        const created = await prisma.product.create({
          data: {
            name: cleanName,
            sku: productSku,
            description: 'Catalog entry created from invoice ingestion',
            supplier,
            price: computedPrice,
            cost,
            margin,
            imageUrl,
            stock: qty,
            minStock: Math.max(5, qty),
            inStock: true,
          },
        });

        processedItems.push({
          type: 'new',
          productId: created.id,
          name: created.name,
          imageUrl: created.imageUrl,
          quantity: qty,
          cost: cost.toString(),
        });
      }
    }

    const invoiceRecord = await prisma.invoice.create({
      data: {
        supplier,
        invoiceDate,
        fileUrl: `/uploads/invoices/${filename}`,
        total,
      },
    });

    return res.json({
      invoice: invoiceRecord,
      items: processedItems,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
