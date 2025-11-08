import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const decimal = (value) => new Prisma.Decimal(value ?? 0);

router.get('/', async (_req, res, next) => {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(purchaseOrders);
  } catch (error) {
    next(error);
  }
});

router.post('/create', async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
      },
    });

    const lowStock = products.filter((product) => product.stock < product.minStock);

    if (lowStock.length === 0) {
      return res.status(400).json({ message: 'No products are below their minimum stock threshold.' });
    }

    const supplierBuckets = lowStock.reduce((acc, product) => {
      const supplier = product.supplier || 'Default Supplier';
      if (!acc[supplier]) acc[supplier] = [];
      acc[supplier].push(product);
      return acc;
    }, {});

    const createdOrders = [];

    for (const [supplier, supplierProducts] of Object.entries(supplierBuckets)) {
      const itemsData = supplierProducts.map((product) => {
        const quantity = Math.max(product.minStock - product.stock, 0) || 0;
        return {
          productId: product.id,
          quantity,
          cost: product.price,
        };
      }).filter((item) => item.quantity > 0);

      if (itemsData.length === 0) continue;

      const total = itemsData.reduce((sum, item) => sum.plus(decimal(item.cost).times(item.quantity)), decimal(0));

      const purchaseOrder = await prisma.purchaseOrder.create({
        data: {
          supplier,
          status: 'pending',
          total,
          items: {
            create: itemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              cost: item.cost,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      createdOrders.push(purchaseOrder);
    }

    return res.status(201).json(createdOrders);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status = 'received' } = req.body;

    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id: req.params.id },
      include: { items: true },
    });

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.purchaseOrder.update({
        where: { id: purchaseOrder.id },
        data: { status },
      });

      for (const item of purchaseOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            inStock: true,
          },
        });
      }
    });

    const updated = await prisma.purchaseOrder.findUnique({
      where: { id: purchaseOrder.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
});

export default router;
