import prisma from '@/lib/prisma';
import GroceryPageClient from '@/components/grocery/GroceryPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function GroceryPage() {
  // Fetch all available products
  const rawProducts = await prisma.product.findMany({
    where: {
      inStock: true,
    },
    include: {
      Category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { name: 'asc' },
    ],
  });

  // Transform products for grocery UI
  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    weekendPrice: (p as any).weekendPrice ? Number((p as any).weekendPrice) : null,
    isWeekendSpecial: (p as any).isWeekendSpecial || false,
    imageUrl: p.imageUrl || null,
    category: p.Category
      ? {
          id: p.Category.id,
          name: p.Category.name,
        }
      : null,
    inStock: p.inStock,
    stock: p.stock,
    unit: p.unitType === 'case' ? 'case' : p.unitType || null,
    displayOrder: (p as any).displayOrder || 0,
  }));

  // Fetch weekend specials - for now, just return empty array until fields are in Prisma client
  // TODO: Once Prisma client is regenerated with new fields, use proper query
  const weekendSpecials: any[] = [];

  return (
    <GroceryPageClient
      products={products}
      weekendSpecials={weekendSpecials}
    />
  );
}

