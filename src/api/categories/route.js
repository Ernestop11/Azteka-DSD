import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Validation helper
const validateSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

// GET /api/categories - List all categories with optimized query
router.get('/', async (req, res) => {
  try {
    const { includeSubcategories = 'true' } = req.query;

    const categories = await prisma.category.findMany({
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: {
          select: { products: true },
        },
        ...(includeSubcategories === 'true' && {
          subcategories: {
            orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
            include: {
              _count: {
                select: { products: true },
              },
            },
          },
        }),
      },
    });

    res.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch categories',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/categories/:id - Get single category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: {
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Category not found' 
      });
    }

    res.json(category);
  } catch (error) {
    console.error(`Failed to fetch category ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/categories - Create category
router.post('/', async (req, res) => {
  try {
    const { name, slug, description, imageUrl, displayOrder = 0 } = req.body ?? {};

    // Validation
    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name and slug are required',
        fields: { name: !name ? 'required' : undefined, slug: !slug ? 'required' : undefined },
      });
    }

    if (!validateSlug(slug)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Slug must be lowercase alphanumeric with hyphens only',
        field: 'slug',
      });
    }

    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name must be a non-empty string',
        field: 'name',
      });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        displayOrder: Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0,
      },
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Failed to create category:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY',
        message: 'Category with this slug already exists',
        field: 'slug',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to create category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/categories/:id - Update category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder } = req.body ?? {};

    // Validation
    if (slug && !validateSlug(slug)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Slug must be lowercase alphanumeric with hyphens only',
        field: 'slug',
      });
    }

    const data = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'VALIDATION_ERROR',
          message: 'Name must be a non-empty string',
          field: 'name',
        });
      }
      data.name = name.trim();
    }
    if (slug !== undefined) data.slug = slug.trim().toLowerCase();
    if (description !== undefined) data.description = description?.trim() || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;
    if (displayOrder !== undefined) {
      data.displayOrder = Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (error) {
    console.error(`Failed to update category ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Category not found' 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY',
        message: 'Category with this slug already exists',
        field: 'slug',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PATCH /api/categories/:id - Partial update
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder } = req.body ?? {};

    // Validation
    if (slug && !validateSlug(slug)) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Slug must be lowercase alphanumeric with hyphens only',
        field: 'slug',
      });
    }

    const data = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'VALIDATION_ERROR',
          message: 'Name must be a non-empty string',
          field: 'name',
        });
      }
      data.name = name.trim();
    }
    if (slug !== undefined) data.slug = slug.trim().toLowerCase();
    if (description !== undefined) data.description = description?.trim() || null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl?.trim() || null;
    if (displayOrder !== undefined) {
      data.displayOrder = Number.isFinite(Number(displayOrder)) ? Number(displayOrder) : 0;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json(category);
  } catch (error) {
    console.error(`Failed to update category ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Category not found' 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY',
        message: 'Category with this slug already exists',
        field: 'slug',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/categories/:id - Delete category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return res.status(409).json({ 
        error: 'CONSTRAINT_VIOLATION',
        message: `Cannot delete category with ${productCount} associated product(s)`,
        count: productCount,
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete category ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Category not found' 
      });
    }

    if (error.code === 'P2003') {
      return res.status(409).json({ 
        error: 'CONSTRAINT_VIOLATION',
        message: 'Cannot delete category with associated subcategories',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to delete category',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

