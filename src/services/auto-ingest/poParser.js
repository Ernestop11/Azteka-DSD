/**
 * PO Parser
 * Uses OCR + GPT-4o Vision to extract product data from purchase orders
 */

import { OpenAI } from 'openai';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as pdfParseModule from 'pdf-parse';
const pdfParse = pdfParseModule.default || pdfParseModule;
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class POParser {
  constructor() {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
    
    if (!this.openai) {
      console.warn('⚠️  OPENAI_API_KEY not configured. PO parsing will be limited.');
    }
  }

  /**
   * Parse PDF purchase order
   */
  async parsePDF(filePath) {
    try {
      const dataBuffer = readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      
      // If OpenAI is available, use vision model for better extraction
      if (this.openai && pdfData.text) {
        return await this.extractWithAI(pdfData.text, filePath, 'pdf');
      }
      
      // Fallback to text extraction
      return this.extractFromText(pdfData.text);
    } catch (error) {
      throw new Error(`PDF_PARSING_ERROR: ${error.message}`);
    }
  }

  /**
   * Parse CSV purchase order
   */
  async parseCSV(filePath) {
    try {
      const fileContent = readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
      });

      const products = records.map((record) => ({
        product_name: record.product_name || record.name || record.product || record.item,
        sku: record.sku || record.SKU || record.product_code || record.code,
        vendor_code: record.vendor_code || record.vendor || record.supplier_code,
        size: record.size || record.unit_size || record.pack_size,
        quantity: parseInt(record.quantity || record.qty || record.amount || '0', 10),
        brand: record.brand || record.brand_name,
        category: record.category || record.category_name,
        price: parseFloat(record.price || record.unit_price || '0'),
      }));

      return { products, raw: records };
    } catch (error) {
      throw new Error(`CSV_PARSING_ERROR: ${error.message}`);
    }
  }

  /**
   * Parse Excel purchase order
   */
  async parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const records = XLSX.utils.sheet_to_json(worksheet);

      const products = records.map((record) => ({
        product_name: record.product_name || record.name || record.product || record.item,
        sku: record.sku || record.SKU || record.product_code || record.code,
        vendor_code: record.vendor_code || record.vendor || record.supplier_code,
        size: record.size || record.unit_size || record.pack_size,
        quantity: parseInt(record.quantity || record.qty || record.amount || '0', 10),
        brand: record.brand || record.brand_name,
        category: record.category || record.category_name,
        price: parseFloat(record.price || record.unit_price || '0'),
      }));

      return { products, raw: records };
    } catch (error) {
      throw new Error(`EXCEL_PARSING_ERROR: ${error.message}`);
    }
  }

  /**
   * Parse image purchase order using GPT-4o Vision
   */
  async parseImage(filePath) {
    if (!this.openai) {
      throw new Error('OPENAI_API_KEY not configured. Image parsing requires GPT-4o Vision.');
    }

    try {
      const imageBuffer = readFileSync(filePath);
      const base64Image = imageBuffer.toString('base64');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting product information from purchase orders.
Extract the following fields for each product:
- product_name: Full product name
- sku: Product SKU or code
- vendor_code: Vendor or supplier code
- size: Package size (e.g., "50g", "500ml", "12 pack")
- quantity: Order quantity
- brand: Brand name if visible
- category: Product category if visible
- price: Unit price if visible

Return a JSON array of products.`,
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
              {
                type: 'text',
                text: 'Extract all products from this purchase order image.',
              },
            ],
          },
        ],
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content returned from GPT-4o');
      }

      // Parse JSON from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in GPT response');
      }

      const products = JSON.parse(jsonMatch[0]);
      return { products, raw: content };
    } catch (error) {
      throw new Error(`IMAGE_PARSING_ERROR: ${error.message}`);
    }
  }

  /**
   * Extract product data using GPT-4o from text
   */
  async extractWithAI(text, filePath = null, fileType = 'text') {
    if (!this.openai) {
      return this.extractFromText(text);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting product information from purchase orders.
Extract the following fields for each product:
- product_name: Full product name
- sku: Product SKU or code
- vendor_code: Vendor or supplier code
- size: Package size (e.g., "50g", "500ml", "12 pack")
- quantity: Order quantity
- brand: Brand name if visible
- category: Product category if visible
- price: Unit price if visible

Return a JSON array of products.`,
          },
          {
            role: 'user',
            content: `Extract all products from this ${fileType} purchase order:\n\n${text.substring(0, 8000)}`,
          },
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      const parsed = JSON.parse(content);
      
      // Handle both { products: [...] } and [...] formats
      const products = Array.isArray(parsed) ? parsed : (parsed.products || []);
      
      return { products, raw: content };
    } catch (error) {
      console.warn('AI extraction failed, falling back to text extraction:', error.message);
      return this.extractFromText(text);
    }
  }

  /**
   * Fallback text extraction (simple regex-based)
   */
  extractFromText(text) {
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const products = [];

    // Simple pattern matching
    for (const line of lines) {
      // Look for lines that might contain product info
      if (line.match(/\d+/) && (line.match(/[a-zA-Z]/) || line.match(/SKU|sku|code/i))) {
        const parts = line.split(/\s+/);
        const quantity = parts.find((p) => /^\d+$/.test(p));
        const sku = parts.find((p) => /^[A-Z0-9-]+$/i.test(p) && p.length > 3);

        if (quantity || sku) {
          products.push({
            product_name: line.substring(0, 100),
            sku: sku || null,
            vendor_code: null,
            size: null,
            quantity: quantity ? parseInt(quantity, 10) : 1,
            brand: null,
            category: null,
            price: null,
          });
        }
      }
    }

    return { products, raw: text };
  }
}

export default new POParser();

