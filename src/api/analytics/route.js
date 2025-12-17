import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { format } from 'date-fns';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const router = Router();

const REPORTS_DIR = process.env.REPORTS_DIR || path.join(process.cwd(), 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const ANALYTICS_MODEL = process.env.OPENAI_ANALYTICS_MODEL || 'gpt-4o-mini';

const ensureAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'ADMIN' && req.user.role !== 'super_admin' && req.user.role !== 'SUPERADMIN')) {
    return res.status(403).json({ message: 'Executive access only' });
  }
  return next();
};

const buildSummary = async () => {
  const [orders, purchaseOrders, invoices, loyaltyAccounts, rewards, products] = await Promise.all([
    prisma.order.findMany({ include: { items: true } }),
    prisma.purchaseOrder.findMany(),
    prisma.invoice.findMany(),
    prisma.loyaltyAccount.findMany(),
    prisma.reward.findMany({ where: { active: true } }),
    prisma.product.findMany(),
  ]);

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const totalMargin = products.reduce((sum, product) => {
    if (product.cost && product.price) {
      return sum + Number(product.price) - Number(product.cost);
    }
    return sum;
  }, 0);
  const avgMargin = products.length ? totalMargin / products.length : 0;
  const inventoryValue = products.reduce((sum, product) => sum + (Number(product.cost || 0) * product.stock), 0);
  const loyaltyPoints = loyaltyAccounts.reduce((sum, account) => sum + account.points, 0);
  const kpi = {
    totalSales,
    avgMargin,
    inventoryValue,
    purchaseOrders: purchaseOrders.length,
    invoices: invoices.length,
    loyaltyPoints,
    activeCustomers: new Set(orders.map((order) => order.customerName)).size,
    totalRewards: rewards.length,
  };

  const topRoutes = orders.reduce((acc, order) => {
    const key = order.driverId || 'unassigned';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    kpi,
    topRoutes,
  };
};

router.get('/summary', ensureAdmin, async (_req, res, next) => {
  try {
    const summary = await buildSummary();
    return res.json(summary);
  } catch (error) {
    return next(error);
  }
});

router.get('/export', ensureAdmin, async (_req, res, next) => {
  try {
    const summary = await buildSummary();
    const rows = [
      ['Metric', 'Value'],
      ['Total Sales', summary.kpi.totalSales.toFixed(2)],
      ['Average Margin', summary.kpi.avgMargin.toFixed(2)],
      ['Inventory Value', summary.kpi.inventoryValue.toFixed(2)],
      ['Purchase Orders', summary.kpi.purchaseOrders],
      ['Invoices', summary.kpi.invoices],
      ['Loyalty Points', summary.kpi.loyaltyPoints],
      ['Active Customers', summary.kpi.activeCustomers],
      ['Rewards', summary.kpi.totalRewards],
    ];
    const csv = rows.map((row) => row.join(',')).join('\n');
    res.header('Content-Type', 'text/csv');
    res.attachment('analytics-export.csv');
    return res.send(csv);
  } catch (error) {
    return next(error);
  }
});

router.get('/report', ensureAdmin, async (_req, res, next) => {
  try {
    const summary = await buildSummary();
    let aiNarrative = 'Executive summary not available (OpenAI disabled).';
    if (openai) {
      try {
        const response = await openai.responses.create({
          model: ANALYTICS_MODEL,
          input: [
            {
              role: 'system',
              content:
                'You are an executive analyst. Given JSON metrics, write a concise summary with Sales, Operations, Loyalty, and Inventory sections.',
            },
            {
              role: 'user',
              content: JSON.stringify(summary),
            },
          ],
        });
        aiNarrative =
          response.output?.[0]?.content?.[0]?.text ||
          response.output_text ||
          aiNarrative;
      } catch (error) {
        console.warn('OpenAI analytics summary failed', error.message);
      }
    }

    const filename = `Executive-Report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.pdf`;
    const filepath = path.join(REPORTS_DIR, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(20).text('Executive Analytics Report', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown();

    doc.fontSize(14).text('Key Metrics');
    doc.fontSize(12).list([
      `Total Sales: $${summary.kpi.totalSales.toFixed(2)}`,
      `Average Margin: $${summary.kpi.avgMargin.toFixed(2)}`,
      `Inventory Value: $${summary.kpi.inventoryValue.toFixed(2)}`,
      `Purchase Orders: ${summary.kpi.purchaseOrders}`,
      `Invoices Processed: ${summary.kpi.invoices}`,
      `Loyalty Points Outstanding: ${summary.kpi.loyaltyPoints}`,
      `Active Customers: ${summary.kpi.activeCustomers}`,
    ]);

    doc.moveDown();
    doc.fontSize(14).text('AI Summary');
    doc.fontSize(12).text(aiNarrative, {
      align: 'justify',
    });

    doc.moveDown();
    doc.fontSize(14).text('Top Routes (Deliveries)');
    Object.entries(summary.topRoutes).forEach(([driverId, count]) => {
      doc.fontSize(12).text(`${driverId}: ${count} orders`);
    });

    doc.end();

    stream.on('finish', () => {
      return res.json({
        message: 'Report generated',
        path: filepath.replace(process.cwd(), ''),
      });
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
