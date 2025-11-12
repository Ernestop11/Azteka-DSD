import { Router } from 'express';
import { subDays } from 'date-fns';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const ensureAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  return next();
};

let ioRef = null;
export const registerGamificationSocket = (io) => {
  ioRef = io;
};

const emitBadgeEvent = (payload) => {
  if (ioRef) {
    ioRef.emit('gamification:badge', payload);
  }
};

const buildLeaderboard = async () => {
  const since = subDays(new Date(), 90);

  const [orders, userBadges, users] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: since } },
      include: { user: true },
    }),
    prisma.userBadge.findMany({
      include: { badge: true },
    }),
    prisma.user.findMany({
      select: { id, name, role },
    }),
  ]);

  const userBadgesMap = userBadges.reduce((acc, entry) => {
    if (!acc[entry.userId]) {
      acc[entry.userId] = [];
    }
    acc[entry.userId].push(entry.badge);
    return acc;
  }, {});

  const baseEntry = () => ({
    totalSales: 0,
    totalOrders: 0,
    points: 0,
  });

  const salesMap = new Map();
  const driverMap = new Map();

  orders.forEach((order) => {
    if (order.userId) {
      if (!salesMap.has(order.userId)) {
        salesMap.set(order.userId, baseEntry());
      }
      const entry = salesMap.get(order.userId);
      entry.totalSales += Number(order.total);
      entry.totalOrders += 1;
    }
    if (order.driverId) {
      if (!driverMap.has(order.driverId)) {
        driverMap.set(order.driverId, baseEntry());
      }
      const entry = driverMap.get(order.driverId);
      entry.totalOrders += 1;
    }
  });

  users.forEach((user) => {
    const badges = userBadgesMap[user.id] || [];
    const points = badges.reduce((sum, badge) => sum + (badge.points || 0), 0);
    if (salesMap.has(user.id)) {
      salesMap.get(user.id).points = points;
      salesMap.get(user.id).badges = badges;
      salesMap.get(user.id).user = user;
    }
    if (driverMap.has(user.id)) {
      driverMap.get(user.id).points = points;
      driverMap.get(user.id).badges = badges;
      driverMap.get(user.id).user = user;
    }
  });

  const formatEntries = (map) =>
    Array.from(map.entries())
      .map(([userId, stats]) => ({
        userId,
        name: stats.user?.name || 'Unknown User',
        points: stats.points,
        totalSales: stats.totalSales,
        totalOrders: stats.totalOrders,
        badges: stats.badges || [],
      }))
      .sort((a, b) => b.points - a.points || b.totalSales - a.totalSales);

  return {
    sales: formatEntries(salesMap),
    drivers: formatEntries(driverMap),
  };
};

router.get('/leaderboard', async (_req, res, next) => {
  try {
    const leaderboard = await buildLeaderboard();
    return res.json(leaderboard);
  } catch (error) {
    return next(error);
  }
});

router.get('/badges', async (_req, res, next) => {
  try {
    const [badges, incentives] = await Promise.all([
      prisma.badge.findMany({
        orderBy: { points: 'desc' },
      }),
      prisma.incentive.findMany({
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return res.json({ badges, incentives });
  } catch (error) {
    return next(error);
  }
});

router.post('/award', ensureAdmin, async (req, res, next) => {
  try {
    const { userId, badgeId, incentiveId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    let badgeAward = null;
    if (badgeId) {
      const existing = await prisma.userBadge.findFirst({
        where: { userId, badgeId },
      });
      if (!existing) {
        badgeAward = await prisma.userBadge.create({
          data: { userId, badgeId },
          include: { badge: true },
        });
        emitBadgeEvent({
          userId,
          badge: badgeAward.badge,
        });
      } else {
        badgeAward = existing;
      }
    }

    let incentiveAward = null;
    if (incentiveId) {
      const incentive = await prisma.incentive.findUnique({ where: { id: incentiveId } });
      if (!incentive) {
        return res.status(404).json({ message: 'Incentive not found' });
      }
      const orderCount = await prisma.order.count({
        where: { userId },
      });
      if (orderCount >= incentive.threshold) {
        incentiveAward = {
          incentive,
          met: true,
          orders: orderCount,
        };
      } else {
        incentiveAward = {
          incentive,
          met: false,
          orders: orderCount,
        };
      }
    }

    return res.json({ badgeAward, incentiveAward });
  } catch (error) {
    return next(error);
  }
});

export default router;
