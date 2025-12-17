import { Router } from 'express';
import OpenAI from 'openai';
import { PrismaClient, Prisma } from '@prisma/client';
import { subDays, differenceInCalendarDays } from 'date-fns';
import { getApiKey, useOpenAI, useClaude, useGemini } from '../integrations/helpers.js';

const router = Router();
const prisma = new PrismaClient();

// Get OpenAI client from user's API key
async function getOpenAIClient(userId) {
  const apiKey = await getApiKey(userId, 'openai');
  if (!apiKey) {
    // Fallback to environment variable
    return process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
  }
  return new OpenAI({ apiKey });
}

const GENERATION_MODEL = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';

const decimal = (value) => new Prisma.Decimal(value ?? 0);

// Analyze vendor advantages for products
async function analyzeVendorAdvantages(products) {
  // Group products by supplier
  const supplierMap = new Map();
  
  products.forEach((product) => {
    const supplier = product.supplier || 'Default Supplier';
    if (!supplierMap.has(supplier)) {
      supplierMap.set(supplier, {
        supplier,
        products: [],
        totalValue: 0,
        avgDeliveryTime: 7, // Default 7 days
        avgQuality: 4, // Default 4/5
        paymentTerms: 'Net 30', // Default
      });
    }
    
    const supplierData = supplierMap.get(supplier);
    supplierData.products.push(product);
    supplierData.totalValue += Number(product.price || 0) * (product.minStock - product.stock || 0);
  });

  return Array.from(supplierMap.values());
}

// Calculate reorder quantity based on sales velocity and lead time
function calculateReorderQuantity(product, salesVelocity, leadTimeDays = 7) {
  const currentStock = product.stock || 0;
  const minStock = product.minStock || 10;
  const safetyStock = Math.ceil(salesVelocity * leadTimeDays * 1.5); // 1.5x safety buffer
  const reorderPoint = minStock + safetyStock;
  const reorderQuantity = Math.max(reorderPoint - currentStock, minStock);
  
  return Math.ceil(reorderQuantity);
}

// Generate AI PO suggestions
async function generateAIPOSuggestions(forecasts, products, userId) {
  if (forecasts.length === 0) {
    return generateFallbackSuggestions(forecasts, products);
  }

  const lowStockProducts = forecasts.filter(
    (item) => item.projectedRunwayDays !== null && item.projectedRunwayDays <= 14
  );

  if (lowStockProducts.length === 0) {
    return [];
  }

  const vendorAnalysis = await analyzeVendorAdvantages(products);

  const prompt = `You are a supply chain analyst. Given the following low-stock products and vendor information, generate AI-powered purchase order suggestions.

Low Stock Products:
${JSON.stringify(lowStockProducts, null, 2)}

Vendor Analysis:
${JSON.stringify(vendorAnalysis, null, 2)}

For each low-stock product, provide:
1. Recommended vendor (consider pricing, delivery time, quality, relationship)
2. Recommended quantity (consider sales velocity, lead time, safety stock)
3. Estimated cost
4. Reasoning for the recommendation
5. Priority level (High/Medium/Low)

Respond with JSON array of suggestions:
[
  {
    "productId": "uuid",
    "productName": "Product Name",
    "currentStock": 5,
    "minStock": 10,
    "recommendedVendor": "Vendor Name",
    "recommendedQuantity": 50,
    "estimatedCost": 500.00,
    "reasoning": "Detailed reasoning...",
    "priority": "High",
    "estimatedDeliveryDays": 7
  }
]`;

  // Try OpenAI first, then Claude, then Gemini
  let suggestions = null;

  try {
    // Try OpenAI
    const openaiClient = await getOpenAIClient(userId);
    if (openaiClient) {
      try {
        const response = await openaiClient.chat.completions.create({
          model: GENERATION_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a supply chain analyst. Generate purchase order suggestions in JSON format.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });

        const content = response.choices[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          suggestions = parsed.suggestions || parsed || [];
        }
      } catch (error) {
        console.warn('OpenAI failed, trying Claude:', error.message);
      }
    }

    // Try Claude if OpenAI failed
    if (!suggestions) {
      try {
        const claudeResponse = await useClaude(userId, prompt, {
          response_format: { type: 'json_object' },
          temperature: 0.3,
        });
        const content = claudeResponse.content[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          suggestions = parsed.suggestions || parsed || [];
        }
      } catch (error) {
        console.warn('Claude failed, trying Gemini:', error.message);
      }
    }

    // Try Gemini if Claude failed
    if (!suggestions) {
      try {
        const geminiResponse = await useGemini(userId, prompt, {
          temperature: 0.3,
        });
        const content = geminiResponse.candidates[0]?.content?.parts[0]?.text;
        if (content) {
          const parsed = JSON.parse(content);
          suggestions = parsed.suggestions || parsed || [];
        }
      } catch (error) {
        console.warn('Gemini failed, using fallback:', error.message);
      }
    }
  } catch (error) {
    console.error('AI PO suggestions failed, using fallback:', error);
  }

  return suggestions || generateFallbackSuggestions(forecasts, products);
}

// Fallback suggestions without AI
function generateFallbackSuggestions(forecasts, products) {
  const lowStockProducts = forecasts.filter(
    (item) => item.projectedRunwayDays !== null && item.projectedRunwayDays <= 14
  );

  return lowStockProducts.map((forecast) => {
    const product = products.find((p) => p.id === forecast.productId);
    if (!product) return null;

    const salesVelocity = forecast.avgDaily || 1;
    const recommendedQuantity = calculateReorderQuantity(product, salesVelocity);
    const estimatedCost = Number(product.price || 0) * recommendedQuantity;

    return {
      productId: product.id,
      productName: product.name,
      currentStock: product.stock || 0,
      minStock: product.minStock || 10,
      recommendedVendor: product.supplier || 'Default Supplier',
      recommendedQuantity,
      estimatedCost,
      reasoning: `Low stock detected. Current stock: ${product.stock}, Min stock: ${product.minStock}. Sales velocity: ${salesVelocity.toFixed(2)} units/day. Recommended reorder quantity: ${recommendedQuantity} units.`,
      priority: forecast.projectedRunwayDays <= 7 ? 'High' : 'Medium',
      estimatedDeliveryDays: 7,
    };
  }).filter(Boolean);
}

// POST /api/automation/po-suggestions/generate - Generate PO suggestions
router.post('/generate', async (req, res, next) => {
  try {
    // Get forecast data
    const now = new Date();
    const windowStart = subDays(now, 90);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate forecasts
    const productMap = new Map();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product;
        if (!product) return;

        if (!productMap.has(product.id)) {
          productMap.set(product.id, {
            product,
            totals: { d30: 0, d60: 0, d90: 0 },
          });
        }

        const entry = productMap.get(product.id);
        const diff = differenceInCalendarDays(now, order.createdAt);

        if (diff <= 30) entry.totals.d30 += item.quantity;
        if (diff <= 60) entry.totals.d60 += item.quantity;
        if (diff <= 90) entry.totals.d90 += item.quantity;
      });
    });

    const forecasts = Array.from(productMap.values()).map((entry) => {
      const { product, totals } = entry;
      const avgDaily = totals.d90 / 90 || 0;
      const currentStock = product.stock || 0;
      const projectedRunwayDays = avgDaily > 0 ? Math.round(currentStock / avgDaily) : null;

      return {
        productId: product.id,
        name: product.name,
        stock: currentStock,
        minStock: product.minStock,
        totals,
        avgDaily: Number(avgDaily.toFixed(2)),
        projectedRunwayDays,
      };
    });

    // Get all products
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
      },
    });

    // Generate AI suggestions
    const userId = req.user?.id || req.user?.sub;
    const suggestions = await generateAIPOSuggestions(forecasts, products, userId);

    res.json({
      success: true,
      suggestions,
      generatedAt: new Date().toISOString(),
      totalSuggestions: suggestions.length,
    });
  } catch (error) {
    console.error('PO suggestions generation error:', error);
    return next(error);
  }
});

// GET /api/automation/po-suggestions - Get pending suggestions
router.get('/', async (req, res, next) => {
  try {
    // For now, we'll generate suggestions on-demand
    // In production, you'd store these in a database
    res.json({
      success: true,
      suggestions: [],
      message: 'Use POST /generate to create suggestions',
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/automation/po-suggestions/:id/approve - Approve suggestion and create PO
router.post('/:id/approve', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { vendor, quantity, cost } = req.body;

    // In production, you'd fetch the suggestion from database
    // For now, we'll create a PO directly

    // Find product
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplier: vendor || product.supplier || 'Default Supplier',
        status: 'pending',
        total: decimal(cost || product.price || 0),
        items: {
          create: {
            productId: product.id,
            quantity: quantity || product.minStock,
            cost: decimal(cost || product.price || 0),
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      success: true,
      purchaseOrder,
      message: 'Purchase order created successfully',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

