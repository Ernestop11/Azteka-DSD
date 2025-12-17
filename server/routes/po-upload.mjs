import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'node:crypto';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = pdfParseModule.default || pdfParseModule;
import Tesseract from 'tesseract.js';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { applyFallbackStrategies } from '../lib/fallback-strategies.mjs';
import { normalizeRows } from '../lib/normalization-orchestrator.mjs';

const router = express.Router();
const uploadRoot = path.join(process.cwd(), 'uploads', 'po');
const prisma = new PrismaClient();
const openai =
  process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== ''
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    try {
      await fs.mkdir(uploadRoot, { recursive: true });
      cb(null, uploadRoot);
    } catch (error) {
      cb(error);
    }
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
});

async function extractTextFromPdf(filePath) {
  const buffer = await fs.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text ?? '';
}

async function extractTextFromImage(filePath) {
  const { data } = await Tesseract.recognize(filePath, 'eng', {
    logger: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });
  return data?.text ?? '';
}

async function extractText(file) {
  const mimetype = file.mimetype ?? '';
  if (mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPdf(file.path);
  }
  return extractTextFromImage(file.path);
}

async function callOpenAIExtraction({ text, supplier }) {
  if (!openai) {
    return null;
  }

  const prompt = `
You are a wholesale catalog ingestion assistant.
Extract product rows from the following purchase order text.
Return a JSON array. Each item must include:
- name
- sku (if present)
- description
- category
- brand
- quantity
- unit_type
- units_per_case
- priceCase
- vendorPrice
- costCase

If a field is missing in the text, set it to null.
Text:
"""
${text.slice(0, 12000)}
"""
JSON:
`;

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_SEEDING_MODEL || 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: 'Return only valid JSON.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const raw = completion.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((row) => ({
        ...row,
        supplier,
      }));
    }
  } catch (error) {
    console.warn('Failed to parse OpenAI extraction output:', error);
  }

  return null;
}

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const supplier = req.body?.supplier?.trim() || null;

    const text = await extractText(req.file);
    let rawRows = null;

    if (text && text.trim().length > 0) {
      rawRows = await callOpenAIExtraction({ text, supplier });
    }

    if (!rawRows || rawRows.length === 0) {
      rawRows = await applyFallbackStrategies({
        filePath: req.file.path,
        originalName: req.file.originalname,
        supplier,
      });
    }

    const normalizedOutput = await normalizeRows(rawRows, {
      supplier,
      importId: req.body?.importId ?? null,
    });

    const importId = crypto.randomUUID();

    await prisma.pOImport.upsert({
      where: { id: importId },
      update: {
        vendor_name: supplier,
        file_name: req.file.originalname,
        raw_text: text,
        status: 'PROCESSED',
      },
      create: {
        id: importId,
        vendor_name: supplier,
        file_name: req.file.originalname,
        raw_text: text,
        status: 'PROCESSED',
      },
    });

    return res.json({
      success: true,
      importId,
      products: normalizedOutput.products,
      warnings: normalizedOutput.warnings,
      metadata: {
        filename: req.file.originalname,
        supplier,
        recordCount: normalizedOutput.products.length,
        storedPath: req.file.path,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

