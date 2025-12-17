import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const decimal = (value) => new Prisma.Decimal(value ?? 0);

// GET /api/contract-workers/jobs - Get available jobs and my jobs
router.get('/jobs', async (req, res, next) => {
  try {
    const { type } = req.query;
    const userId = req.user?.id; // From auth middleware

    if (!type) {
      return res.status(400).json({ error: 'Worker type is required' });
    }

    // Get worker
    const worker = userId
      ? await prisma.contractWorker.findUnique({
          where: { userId },
        })
      : null;

    // Get available jobs
    const availableJobs = await prisma.job.findMany({
      where: {
        type,
        status: 'available',
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get my jobs
    const myJobs = worker
      ? await prisma.job.findMany({
          where: {
            workerId: worker.id,
            status: {
              in: ['accepted', 'in_progress', 'completed'],
            },
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    res.json({
      success: true,
      available: availableJobs,
      myJobs,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/contract-workers/jobs/:id/accept - Accept a job
router.post('/jobs/:id/accept', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get or create worker
    let worker = await prisma.contractWorker.findUnique({
      where: { userId },
    });

    if (!worker) {
      // Get user to determine type
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Determine worker type from user role
      let workerType = 'sales_rep';
      if (user.role === 'DRIVER') workerType = 'driver';
      if (user.role === 'WAREHOUSE') workerType = 'warehouse';

      worker = await prisma.contractWorker.create({
        data: {
          userId,
          type: workerType,
        },
      });
    }

    // Check if job exists and is available
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'available') {
      return res.status(400).json({ error: 'Job is not available' });
    }

    if (job.type !== worker.type) {
      return res.status(400).json({ error: 'Job type does not match worker type' });
    }

    // Accept job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'accepted',
        workerId: worker.id,
      },
    });

    res.json({
      success: true,
      job: updatedJob,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/contract-workers/jobs/:id/complete - Complete a job
router.post('/jobs/:id/complete', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get worker
    const worker = await prisma.contractWorker.findUnique({
      where: { userId },
    });

    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Check if job exists and belongs to worker
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.workerId !== worker.id) {
      return res.status(403).json({ error: 'Job does not belong to worker' });
    }

    if (job.status === 'completed') {
      return res.status(400).json({ error: 'Job already completed' });
    }

    // Complete job
    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // Update worker earnings
    await prisma.contractWorker.update({
      where: { id: worker.id },
      data: {
        earnings: decimal(worker.earnings).plus(job.commission),
      },
    });

    res.json({
      success: true,
      job: updatedJob,
      commission: job.commission,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/contract-workers/earnings - Get worker earnings
router.get('/earnings', async (req, res, next) => {
  try {
    const userId = req.user?.id; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get worker
    const worker = await prisma.contractWorker.findUnique({
      where: { userId },
    });

    if (!worker) {
      return res.json({
        success: true,
        total: 0,
        worker: null,
      });
    }

    res.json({
      success: true,
      total: Number(worker.earnings),
      worker: {
        id: worker.id,
        type: worker.type,
        active: worker.active,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/contract-workers/jobs - Create a job (Admin only)
router.post('/jobs', async (req, res, next) => {
  try {
    const { type, title, description, location, commission, deadline } = req.body;

    if (!type || !title || !description || !commission) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const job = await prisma.job.create({
      data: {
        type,
        title,
        description,
        location: location || null,
        commission: decimal(commission),
        deadline: deadline ? new Date(deadline) : null,
        status: 'available',
      },
    });

    res.json({
      success: true,
      job,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

