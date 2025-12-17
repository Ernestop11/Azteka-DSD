import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

let ioRef = null;
export const registerLoyaltySocket = (io) => {
  ioRef = io;
};

const emitRewardEvent = (payload) => {
  if (ioRef) {
    ioRef.emit('loyalty:reward', payload);
  }
};

const ensureAccount = async (userId) => {
  return prisma.loyaltyAccount.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      points: 0,
      tier: 'Bronze',
    },
  });
};

const calculateTier = (points) => {
  if (points >= 5000) return 'Platinum';
  if (points >= 2500) return 'Gold';
  if (points >= 1000) return 'Silver';
  return 'Bronze';
};

export const addPointsForOrder = async (userId, orderTotal) => {
  if (!userId || !orderTotal) return;
  const points = Math.floor(Number(orderTotal) / 10);
  if (points <= 0) return;

  const account = await ensureAccount(userId);
  const updatedPoints = account.points + points;
  await prisma.loyaltyAccount.update({
    where: { userId },
    data: {
      points: updatedPoints,
      tier: calculateTier(updatedPoints),
    },
  });
};

router.get('/points', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const account = await ensureAccount(userId);
    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: { cost: 'asc' },
    });

    const nextReward = rewards.find((reward) => reward.cost > account.points) || rewards[0] || null;

    return res.json({
      points: account.points,
      tier: account.tier,
      nextReward,
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/rewards', async (_req, res, next) => {
  try {
    const rewards = await prisma.reward.findMany({
      where: { active: true },
      orderBy: { cost: 'asc' },
    });
    return res.json({ rewards });
  } catch (error) {
    return next(error);
  }
});

router.post('/redeem', async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    const { rewardId } = req.body;

    if (!userId || !rewardId) {
      return res.status(400).json({ message: 'Missing user or reward.' });
    }

    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward || !reward.active) {
      return res.status(404).json({ message: 'Reward not found.' });
    }

    const account = await ensureAccount(userId);

    if (account.points < reward.cost) {
      return res.status(400).json({ message: 'Not enough points.' });
    }

    const newPoints = account.points - reward.cost;
    const updated = await prisma.loyaltyAccount.update({
      where: { userId },
      data: {
        points: newPoints,
        tier: calculateTier(newPoints),
      },
    });

    emitRewardEvent({
      userId,
      reward,
      points: updated.points,
      tier: updated.tier,
    });

    return res.json({
      reward,
      points: updated.points,
      tier: updated.tier,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
