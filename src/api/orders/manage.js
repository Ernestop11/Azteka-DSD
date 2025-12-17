import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.patch('/:id', async (req, res, next) => {
  try {
    const { status, driverId, notes } = req.body;
    const data = {};

    if (status) data.status = status;
    if (driverId !== undefined) data.driverId = driverId;
    if (notes !== undefined) data.notes = notes;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No updates provided' });
    }

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: {
        items: {
          include: { product: true },
        },
        user: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    return next(error);
  }
});

router.get('/summary', async (_req, res, next) => {
  try {
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });

    const totals = statusCounts.reduce(
      (acc, curr) => {
        acc.statuses[curr.status] = curr._count._all;
        acc.totalOrders += curr._count._all;
        return acc;
      },
      { statuses: {}, totalOrders: 0 }
    );

    const revenue = await prisma.order.aggregate({
      _sum: { total: true },
    });

    const totalRevenue = revenue._sum.total ?? new Prisma.Decimal(0);

    return res.json({
      ...totals,
      totalRevenue: totalRevenue.toString(),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
