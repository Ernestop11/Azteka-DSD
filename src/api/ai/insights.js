import { Router } from 'express';
import { subDays, differenceInCalendarDays } from 'date-fns';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { getApiKey, useOpenAI, useClaude, useGemini } from '../integrations/helpers.js';

const prisma = new PrismaClient();
const router = Router();

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

const buildFallbackSummary = (forecasts) => {
  if (!forecasts.length) {
    return 'No recent sales were recorded in the last 90 days, so there are no forecasts to display.';
  }
  const sorted = [...forecasts].sort((a, b) => b.totals.d30 - a.totals.d30);
  const top = sorted.slice(0, 3).map((item) => item.name).join(', ');
  const lowStock = forecasts
    .filter((item) => item.projectedRunwayDays > 0 && item.projectedRunwayDays < 14)
    .map((item) => item.name);
  return [
    `Top movers this month: ${top || 'n/a'}.`,
    lowStock.length
      ? `Low stock risk within 2 weeks: ${lowStock.join(', ')}.`
      : 'Inventory runway is healthy (>2 weeks) for all tracked products.',
  ].join(' ');
};

router.get('/forecast', async (_req, res, next) => {
  try {
    const now = new Date();
    const windowStart = subDays(now, 90);
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: windowStart,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const productMap = new Map();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = item.product;
        if (!product) return;

        if (!productMap.has(product.id)) {
          productMap.set(product.id, {
            product,
            totals: { d30: 0, d60: 0, d90: 0 },
            series: [],
          });
        }

        const entry = productMap.get(product.id);
        const diff = differenceInCalendarDays(now, order.createdAt);

        if (diff <= 30) entry.totals.d30 += item.quantity;
        if (diff <= 60) entry.totals.d60 += item.quantity;
        if (diff <= 90) entry.totals.d90 += item.quantity;

        entry.series.push({
          date: order.createdAt,
          quantity: item.quantity,
        });
      });
    });

    const forecasts = Array.from(productMap.values()).map((entry) => {
      const { product, totals } = entry;
      const avgDaily = totals.d90 / 90 || 0;
      const currentStock = product.stock || 0;
      const projectedRunwayDays = avgDaily > 0 ? Math.round(currentStock / avgDaily) : null;
      const recommendedAction =
        projectedRunwayDays !== null && projectedRunwayDays < 14
          ? 'Reorder within 1-2 weeks'
          : avgDaily === 0
          ? 'Monitor - no recent movement'
          : 'Stock level OK';

      return {
        productId: product.id,
        name: product.name,
        stock: currentStock,
        minStock: product.minStock,
        totals,
        avgDaily: Number(avgDaily.toFixed(2)),
        projectedRunwayDays,
        recommendedAction,
      };
    });

    const payload = {
      forecasts,
      aiSummary: '',
    };

    const prompt = [
      'You are a supply chain analyst. Given JSON sales summaries (30/60/90 day units per SKU, stock, runway days), respond with 3 concise paragraphs:',
      '1) Top 5 products by projected growth or demand.',
      '2) Slow movers or items with < 5 units sold in 90 days.',
      '3) Margin or pricing adjustments plus reorder guidance (mention SKUs under 14 day runway).',
      'End with a single actionable recommendation.',
    ].join(' ');

    const userId = req.user?.id || req.user?.sub;
    
    // Try OpenAI first, then Claude, then Gemini
    let aiSummary = null;
    
    if (forecasts.length > 0) {
      try {
        // Try OpenAI
        const openaiClient = await getOpenAIClient(userId);
        if (openaiClient) {
          try {
            const response = await openaiClient.chat.completions.create({
              model: GENERATION_MODEL,
              messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: JSON.stringify(forecasts) },
              ],
            });
            aiSummary = response.choices[0]?.message?.content || null;
          } catch (error) {
            console.warn('OpenAI failed, trying Claude:', error.message);
          }
        }

        // Try Claude if OpenAI failed
        if (!aiSummary) {
          try {
            const claudeResponse = await useClaude(userId, prompt + '\n\n' + JSON.stringify(forecasts));
            aiSummary = claudeResponse.content[0]?.text || null;
          } catch (error) {
            console.warn('Claude failed, trying Gemini:', error.message);
          }
        }

        // Try Gemini if Claude failed
        if (!aiSummary) {
          try {
            const geminiResponse = await useGemini(userId, prompt + '\n\n' + JSON.stringify(forecasts));
            aiSummary = geminiResponse.candidates[0]?.content?.parts[0]?.text || null;
          } catch (error) {
            console.warn('Gemini failed, using fallback:', error.message);
          }
        }
      } catch (error) {
        console.warn('AI forecast summary failed, using fallback', error.message);
      }
    }

    payload.aiSummary = aiSummary || buildFallbackSummary(forecasts);

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

export default router;
