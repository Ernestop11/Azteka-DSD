import { Router } from 'express';
import pkg from '@prisma/client';
const { PrismaClient, BusinessMode } = pkg;

const prisma = new PrismaClient();
const router = Router();
const BUSINESS_MODE_VALUES = new Set(Object.values(BusinessMode));

// Validation schemas
const validateProductUpdate = (req, res, next) => {
  const { businessModes, isHidden } = req.body ?? {};
  
  if (businessModes !== undefined && !Array.isArray(businessModes)) {
    return res.status(400).json({ 
      error: 'INVALID_INPUT',
      message: 'businessModes must be an array' 
    });
  }
  
  if (isHidden !== undefined && typeof isHidden !== 'boolean') {
    return res.status(400).json({ 
      error: 'INVALID_INPUT',
      message: 'isHidden must be a boolean' 
    });
  }
  
  next();
};

// GET /api/products/manage - List all products with optimized query
router.get('/', async (req, res) => {
  try {
    const { page = '1', limit = '50', categoryId, brandId, featured, inStock, search } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where = {};
    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (featured !== undefined) where.featured = featured === 'true';
    if (inStock !== undefined) where.inStock = inStock === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Optimized query with includes
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          brand: {
            select: { id: true, name: true, logoUrl: true },
          },
          images: {
            orderBy: { sort_order: 'asc' },
            take: 1, // Only first image for list view
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Failed to fetch products for management:', error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch products',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// GET /api/products/manage/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        subcategory: true,
        images: {
          orderBy: { sort_order: 'asc' },
        },
        bundles: {
          select: { id: true, name: true, slug: true },
        },
        promotions: {
          where: { active: true },
          select: { id: true, title: true, discountPercent: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Product not found' 
      });
    }

    res.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to fetch product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// POST /api/products/manage - Create product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      sku,
      description,
      priceCase,
      vendor_price,
      cost_case,
      units_per_case,
      unit_type,
      categoryId,
      brandId,
      subcategoryId,
      inStock = true,
      stock = 0,
      minStock = 10,
      featured = false,
      minOrderQty = 1,
      businessModes = [],
      isHidden = false,
    } = req.body;

    // Validation
    if (!name || !slug) {
      return res.status(400).json({ 
        error: 'VALIDATION_ERROR',
        message: 'Name and slug are required',
        fields: { name: !name ? 'required' : undefined, slug: !slug ? 'required' : undefined },
      });
    }

    // Validate business modes
    const sanitizedModes = Array.isArray(businessModes)
      ? businessModes.filter((mode) => typeof mode === 'string' && BUSINESS_MODE_VALUES.has(mode))
      : [];

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        sku,
        description,
        priceCase,
        vendor_price,
        cost_case,
        units_per_case,
        unit_type,
        categoryId,
        brandId,
        subcategoryId,
        inStock: Boolean(inStock),
        stock: parseInt(stock, 10) || 0,
        minStock: parseInt(minStock, 10) || 10,
        supplier: 'Manual Entry',
        featured: Boolean(featured),
        minOrderQty: parseInt(minOrderQty, 10) || 1,
        businessModes: sanitizedModes,
        isHidden: Boolean(isHidden),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Failed to create product:', error);
    
    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY',
        message: 'Product with this slug or SKU already exists',
        field: error.meta?.target?.[0] || 'slug',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to create product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PUT /api/products/manage/:id - Update product
router.put('/:id', validateProductUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessModes, isHidden, ...updateData } = req.body;

    // Validate business modes if provided
    let sanitizedModes;
    if (businessModes !== undefined) {
      sanitizedModes = Array.isArray(businessModes)
        ? businessModes.filter((mode) => typeof mode === 'string' && BUSINESS_MODE_VALUES.has(mode))
        : [];
    }

    const data = { ...updateData };
    if (sanitizedModes !== undefined) data.businessModes = sanitizedModes;
    if (isHidden !== undefined) data.isHidden = Boolean(isHidden);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(`Failed to update product ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Product not found' 
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({ 
        error: 'DUPLICATE_ENTRY',
        message: 'Product with this slug or SKU already exists',
        field: error.meta?.target?.[0] || 'slug',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// PATCH /api/products/manage/:id - Partial update
router.patch('/:id', validateProductUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    const { businessModes, isHidden, ...updateData } = req.body;

    // Validate business modes if provided
    let sanitizedModes;
    if (businessModes !== undefined) {
      sanitizedModes = Array.isArray(businessModes)
        ? businessModes.filter((mode) => typeof mode === 'string' && BUSINESS_MODE_VALUES.has(mode))
        : [];
    }

    const data = { ...updateData };
    if (sanitizedModes !== undefined) data.businessModes = sanitizedModes;
    if (isHidden !== undefined) data.isHidden = Boolean(isHidden);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        brand: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(`Failed to update product ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Product not found' 
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to update product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// DELETE /api/products/manage/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete product ${req.params.id}:`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'NOT_FOUND',
        message: 'Product not found' 
      });
    }

    if (error.code === 'P2003') {
      return res.status(409).json({ 
        error: 'CONSTRAINT_VIOLATION',
        message: 'Cannot delete product with associated orders or other records',
      });
    }

    res.status(500).json({ 
      error: 'DATABASE_ERROR',
      message: 'Failed to delete product',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;

