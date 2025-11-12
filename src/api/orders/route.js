import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { addPointsForOrder } from '../loyalty/route.js';

const prisma = new PrismaClient();
const router = Router();

const orderInclude = {
  items: {
    include: {
      product: true,
    },
  },
  user: true,
};

const toDecimal = (value) => {
  if (value === undefined || value === null) {
    return new Prisma.Decimal(0);
  }
  return new Prisma.Decimal(value);
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return 'At least one order item is required';
  }

  for (const item of items) {
    if (!item?.productId) {
      return 'Each order item must include a productId';
    }
    if (!item?.quantity || item.quantity <= 0) {
      return 'Each order item must include a quantity greater than zero';
    }
    if (item.price === undefined || item.price === null) {
      return 'Each order item must include a price';
    }
  }

  return null;
};

router.get('/', async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: orderInclude,
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json(order);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { customerName, status = 'pending', userId, items = [] } = req.body;

    if (!customerName) {
      return res.status(400).json({ message: 'customerName is required' });
    }

    const itemError = validateItems(items);
    if (itemError) {
      return res.status(400).json({ message: itemError });
    }

    const total = items.reduce((sum, item) => {
      const line = toDecimal(item.price ?? 0).times(item.quantity ?? 0);
      return sum.plus(line);
    }, new Prisma.Decimal(0));

    const createdOrder = await prisma.order.create({
      data: {
        customerName,
        status,
        total,
        user: userId ? { connect: { id: userId } } : undefined,
        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            price: toDecimal(item.price),
            product: { connect: { id: item.productId } },
          })),
        },
      },
      include: orderInclude,
    });

    if (userId) {
      await addPointsForOrder(userId, total);
    }

    return res.status(201).json(createdOrder);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(400).json({ message: error.message });
    }
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status, items } = req.body;

    const data = {};
    if (status) {
      data.status = status;
    }

    if (Array.isArray(items) && items.length > 0) {
      const itemError = validateItems(items);
      if (itemError) {
        return res.status(400).json({ message: itemError });
      }

      const total = items.reduce((sum, item) => {
        const line = toDecimal(item.price ?? 0).times(item.quantity ?? 0);
        return sum.plus(line);
      }, new Prisma.Decimal(0));

      data.total = total;
      data.items = {
        deleteMany: {},
        create: items.map((item) => ({
          quantity: item.quantity,
          price: toDecimal(item.price),
          product: { connect: { id: item.productId } },
        })),
      };
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: orderInclude,
    });

    return res.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.order.delete({
      where: { id: req.params.id },
    });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    return next(error);
  }
});

export default router;
