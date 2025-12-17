import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// GET /api/brands - List all brands with optimized query
router.get('/', async (req, res) => {
  try {
    const { featured, search } = req.query;

    const where = {};
    if (featured !== undefined) where.isFeatured = featured === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const brands = await prisma.brand.findMany({
      where,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    res.json(brands);
  } catch (error) {
    console.error('Failed to fetch brands:', error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch brands',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/brands/:id - Get single brand
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Brand not found' 
      });
    }

    res.json(brand);
  } catch (error) {
    console.error(`Failed to fetch brand ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch brand',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/brands - Create brand
router.post('/', async (req, res) => {
  try {
    const { name, logoUrl, description, isFeatured = false, displayOrder = 0 } = req.body ?? {};

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name is required and must be a non-empty string',
        field: 'name',
      });
    }

    if (logoUrl && typeof logoUrl !== 'string') {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'logoUrl must be a string',
        field: 'logoUrl',
      });
    }

    if (description && typeof description !== 'string') {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'description must be a string',
        field: 'description',
      });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        logoUrl: logoUrl?.trim() || null,
        description: description?.trim() || null,
        isFeatured: Boolean(isFeatured),
        displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
      },
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error('Failed to create brand:', error);
    
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to create brand',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/brands/:id - Update brand
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, description, isFeatured, displayOrder } = req.body ?? {};

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name must be a non-empty string',
        field: 'name',
      });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (logoUrl !== undefined) data.logoUrl = logoUrl?.trim() || null;
    if (description !== undefined) data.description = description?.trim() || null;
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (displayOrder !== undefined) {
      data.displayOrder = Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    res.json(brand);
  } catch (error) {
    console.error(`Failed to update brand ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Brand not found' 
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update brand',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PATCH /api/brands/:id - Partial update
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logoUrl, description, isFeatured, displayOrder } = req.body ?? {};

    // Validation
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name must be a non-empty string',
        field: 'name',
      });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (logoUrl !== undefined) data.logoUrl = logoUrl?.trim() || null;
    if (description !== undefined) data.description = description?.trim() || null;
    if (isFeatured !== undefined) data.isFeatured = Boolean(isFeatured);
    if (displayOrder !== undefined) {
      data.displayOrder = Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    res.json(brand);
  } catch (error) {
    console.error(`Failed to update brand ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Brand not found' 
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update brand',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/brands/:id - Delete brand
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if brand has products
    const productCount = await prisma.product.count({
      where: { brandId: id },
    });

    if (productCount > 0) {
      return res.status(409).json({ 
        error: 'CONSTRAINT_VIOLATION',
        message: `Cannot delete brand with ${productCount} associated product(s)`,
        count: productCount,
      });
    }

    await prisma.brand.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete brand ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Brand not found' 
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to delete brand',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

