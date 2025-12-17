import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/products - Get all products (public for catalog viewing)
router.get('/', async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        inStock: true,
      },
      include: {
        category: true,
        brand: true,
        subcategory: true,
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Transform to camelCase for frontend
    const transformedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : null,
      margin: product.margin ? Number(product.margin) : null,
      imageUrl: product.imageUrl || '',
      splashImageUrl: product.splashImageUrl || '',
      special: product.special,
      backgroundRemoved: product.backgroundRemoved,
      inStock: product.inStock,
      stock: product.stock,
      minStock: product.minStock,
      supplier: product.supplier,
      featured: product.featured,
      unitType: product.unitType,
      unitsPerCase: product.unitsPerCase,
      minOrderQty: product.minOrderQty,
      backgroundColor: product.backgroundColor,
      categoryId: product.categoryId,
      brandId: product.brandId,
      subcategoryId: product.subcategoryId,
      // Add snake_case versions for ProductCard compatibility
      image_url: product.imageUrl || '',
      splash_image_url: product.splashImageUrl || '',
      background_color: product.backgroundColor || '#f3f4f6',
      in_stock: product.inStock,
      units_per_case: product.unitsPerCase,
      unit_type: product.unitType,
    }));

    res.json(transformedProducts);
  } catch (error) {
    return next(error);
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        subcategory: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Transform to camelCase
    const transformedProduct = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: Number(product.price),
      cost: product.cost ? Number(product.cost) : null,
      margin: product.margin ? Number(product.margin) : null,
      imageUrl: product.imageUrl || '',
      splashImageUrl: product.splashImageUrl || '',
      special: product.special,
      backgroundRemoved: product.backgroundRemoved,
      inStock: product.inStock,
      stock: product.stock,
      minStock: product.minStock,
      supplier: product.supplier,
      featured: product.featured,
      unitType: product.unitType,
      unitsPerCase: product.unitsPerCase,
      minOrderQty: product.minOrderQty,
      backgroundColor: product.backgroundColor,
      categoryId: product.categoryId,
      brandId: product.brandId,
      subcategoryId: product.subcategoryId,
      // Add snake_case versions
      image_url: product.imageUrl || '',
      splash_image_url: product.splashImageUrl || '',
      background_color: product.backgroundColor || '#f3f4f6',
      in_stock: product.inStock,
      units_per_case: product.unitsPerCase,
      unit_type: product.unitType,
    };

    res.json(transformedProduct);
  } catch (error) {
    return next(error);
  }
});

export default router;

