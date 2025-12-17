/**
 * Mock Catalog Data for Azteka DSD
 * Realistic Mexican DSD products, brands, and bundles
 * SurtiRico style with authentic product names
 */

import type {
  CatalogProduct,
  Brand,
  Bundle,
  MarqueeItem,
  Billboard,
  HeroBanner,
} from '@/types/catalog'

// ============================================================================
// BRANDS - Mexican & Popular DSD Brands
// ============================================================================

export const mockBrands: Brand[] = [
  {
    id: 'brand-sabritas',
    name: 'Sabritas',
    slug: 'sabritas',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Sabritas_logo.svg/200px-Sabritas_logo.svg.png',
    imageUrl: '/brands/sabritas-banner.jpg',
    description: 'La botana favorita de México',
    productCount: 12,
    featured: true,
    priority: 1,
  },
  {
    id: 'brand-bimbo',
    name: 'Bimbo',
    slug: 'bimbo',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Grupo_Bimbo_logo.svg/200px-Grupo_Bimbo_logo.svg.png',
    imageUrl: '/brands/bimbo-banner.jpg',
    description: 'Pan de calidad para toda la familia',
    productCount: 15,
    featured: true,
    priority: 2,
  },
  {
    id: 'brand-coca-cola',
    name: 'Coca-Cola',
    slug: 'coca-cola',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/200px-Coca-Cola_logo.svg.png',
    imageUrl: '/brands/coca-cola-banner.jpg',
    description: 'Destapa la felicidad',
    productCount: 8,
    featured: true,
    priority: 3,
  },
  {
    id: 'brand-gamesa',
    name: 'Gamesa',
    slug: 'gamesa',
    logoUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200',
    imageUrl: '/brands/gamesa-banner.jpg',
    description: 'Galletas y productos horneados',
    productCount: 10,
    featured: false,
    priority: 4,
  },
  {
    id: 'brand-jarritos',
    name: 'Jarritos',
    slug: 'jarritos',
    logoUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200',
    imageUrl: '/brands/jarritos-banner.jpg',
    description: 'Sabor 100% natural',
    productCount: 6,
    featured: false,
    priority: 5,
  },
]

// ============================================================================
// PRODUCTS - 20 Realistic Mexican DSD Products
// ============================================================================

export const mockProducts: CatalogProduct[] = [
  // === SABRITAS PRODUCTS ===
  {
    id: 'prod-sabritas-original-62g',
    name: 'Sabritas Clásicas Sal',
    description: 'Papas fritas sabor sal, el clásico que nunca falla',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500',
    price: 18.50,
    originalPrice: 22.00,
    sku: 'SAB-CLA-62',
    tier: 'A',
    badge: 'HOT',
    brand: 'Sabritas',
    brandId: 'brand-sabritas',
    category: 'Botanas',
    categoryId: 'cat-botanas',
    priceTierA: 16.50,
    priceTierB: 18.50,
    priceTierC: 20.00,
    rewardsPoints: 50,
    rating: 5,
    reviewCount: 342,
    inStock: true,
    stockCount: 250,
    glossLevel: 'premium',
    sparkle: true,
  },
  {
    id: 'prod-sabritas-adobadas-62g',
    name: 'Sabritas Adobadas',
    description: 'Papas con el inconfundible sabor adobado',
    imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=500',
    price: 18.50,
    sku: 'SAB-ADO-62',
    tier: 'A',
    badge: 'NEW',
    brand: 'Sabritas',
    brandId: 'brand-sabritas',
    category: 'Botanas',
    categoryId: 'cat-botanas',
    priceTierA: 16.50,
    priceTierB: 18.50,
    priceTierC: 20.00,
    rewardsPoints: 50,
    rating: 5,
    reviewCount: 201,
    inStock: true,
    stockCount: 180,
    glossLevel: 'premium',
  },
  {
    id: 'prod-sabritas-flamin-hot',
    name: 'Sabritas Flamin\' Hot',
    description: 'Papas picantes con chile y limón',
    imageUrl: 'https://images.unsplash.com/photo-1613919671781-3f14b9b96e41?w=500',
    price: 19.50,
    originalPrice: 24.00,
    sku: 'SAB-FH-62',
    tier: 'A',
    badge: 'SALE',
    brand: 'Sabritas',
    brandId: 'brand-sabritas',
    category: 'Botanas',
    categoryId: 'cat-botanas',
    priceTierA: 17.50,
    priceTierB: 19.50,
    priceTierC: 21.00,
    rewardsPoints: 55,
    rating: 5,
    reviewCount: 487,
    inStock: true,
    stockCount: 320,
    glossLevel: 'premium',
    sparkle: true,
  },

  // === BIMBO PRODUCTS ===
  {
    id: 'prod-bimbo-blanco-680g',
    name: 'Pan Blanco Bimbo Grande',
    description: 'Pan de caja blanco, suave y esponjoso. 680g',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    price: 42.00,
    sku: 'BIM-BLA-680',
    tier: 'B',
    brand: 'Bimbo',
    brandId: 'brand-bimbo',
    category: 'Panadería',
    categoryId: 'cat-panaderia',
    priceTierA: 38.00,
    priceTierB: 42.00,
    priceTierC: 45.00,
    rewardsPoints: 75,
    rating: 5,
    reviewCount: 654,
    inStock: true,
    stockCount: 145,
    glossLevel: 'soft',
  },
  {
    id: 'prod-bimbo-integral-680g',
    name: 'Pan Integral Bimbo',
    description: 'Pan 100% integral con granos. 680g',
    imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=500',
    price: 48.00,
    originalPrice: 52.00,
    sku: 'BIM-INT-680',
    tier: 'A',
    badge: 'NEW',
    brand: 'Bimbo',
    brandId: 'brand-bimbo',
    category: 'Panadería',
    categoryId: 'cat-panaderia',
    priceTierA: 44.00,
    priceTierB: 48.00,
    priceTierC: 50.00,
    rewardsPoints: 85,
    rating: 5,
    reviewCount: 298,
    inStock: true,
    stockCount: 98,
    glossLevel: 'premium',
  },
  {
    id: 'prod-bimbo-roles-canela',
    name: 'Bimbo Roles de Canela',
    description: 'Deliciosos roles con sabor a canela',
    imageUrl: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=500',
    price: 32.00,
    sku: 'BIM-ROL-CNL',
    tier: 'B',
    badge: 'HOT',
    seasonal: 'christmas',
    brand: 'Bimbo',
    brandId: 'brand-bimbo',
    category: 'Panadería',
    categoryId: 'cat-panaderia',
    priceTierA: 29.00,
    priceTierB: 32.00,
    priceTierC: 34.00,
    rewardsPoints: 60,
    rating: 5,
    reviewCount: 412,
    inStock: true,
    stockCount: 175,
    glossLevel: 'soft',
    theme: 'holiday',
  },

  // === COCA-COLA PRODUCTS ===
  {
    id: 'prod-coca-cola-600ml',
    name: 'Coca-Cola 600ml',
    description: 'Refresco Coca-Cola original. Botella 600ml',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500',
    price: 16.00,
    sku: 'CC-600',
    tier: 'C',
    brand: 'Coca-Cola',
    brandId: 'brand-coca-cola',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 14.00,
    priceTierB: 16.00,
    priceTierC: 17.50,
    rewardsPoints: 35,
    rating: 5,
    reviewCount: 1023,
    inStock: true,
    stockCount: 450,
    glossLevel: 'soft',
  },
  {
    id: 'prod-coca-cola-2l',
    name: 'Coca-Cola 2 Litros',
    description: 'Refresco Coca-Cola para compartir. Botella 2L',
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=500',
    price: 32.00,
    originalPrice: 36.00,
    sku: 'CC-2L',
    tier: 'B',
    badge: 'SALE',
    brand: 'Coca-Cola',
    brandId: 'brand-coca-cola',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 28.00,
    priceTierB: 32.00,
    priceTierC: 34.00,
    rewardsPoints: 60,
    rating: 5,
    reviewCount: 756,
    inStock: true,
    stockCount: 280,
    glossLevel: 'premium',
    sparkle: true,
  },
  {
    id: 'prod-sprite-600ml',
    name: 'Sprite 600ml',
    description: 'Refresco sabor lima-limón. Botella 600ml',
    imageUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=500',
    price: 16.00,
    sku: 'SPR-600',
    tier: 'C',
    brand: 'Coca-Cola',
    brandId: 'brand-coca-cola',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 14.00,
    priceTierB: 16.00,
    priceTierC: 17.50,
    rewardsPoints: 35,
    rating: 5,
    reviewCount: 432,
    inStock: true,
    stockCount: 310,
    glossLevel: 'soft',
  },

  // === GAMESA PRODUCTS ===
  {
    id: 'prod-gamesa-marias-200g',
    name: 'Galletas Marías Gamesa',
    description: 'Galletas María tradicionales. Paquete 200g',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
    price: 24.00,
    sku: 'GAM-MAR-200',
    tier: 'C',
    brand: 'Gamesa',
    brandId: 'brand-gamesa',
    category: 'Galletas',
    categoryId: 'cat-galletas',
    priceTierA: 21.00,
    priceTierB: 24.00,
    priceTierC: 26.00,
    rewardsPoints: 40,
    rating: 5,
    reviewCount: 589,
    inStock: true,
    stockCount: 220,
    glossLevel: 'soft',
  },
  {
    id: 'prod-gamesa-emperador-300g',
    name: 'Emperador Chocolate',
    description: 'Galletas Emperador rellenas de chocolate. 300g',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500',
    price: 36.00,
    originalPrice: 42.00,
    sku: 'GAM-EMP-300',
    tier: 'B',
    badge: 'HOT',
    brand: 'Gamesa',
    brandId: 'brand-gamesa',
    category: 'Galletas',
    categoryId: 'cat-galletas',
    priceTierA: 32.00,
    priceTierB: 36.00,
    priceTierC: 38.00,
    rewardsPoints: 65,
    rating: 5,
    reviewCount: 823,
    inStock: true,
    stockCount: 195,
    glossLevel: 'premium',
    sparkle: true,
  },
  {
    id: 'prod-gamesa-chokis-265g',
    name: 'Chokis Gamesa',
    description: 'Galletas con chispas de chocolate. 265g',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
    price: 28.00,
    sku: 'GAM-CHO-265',
    tier: 'C',
    badge: 'NEW',
    brand: 'Gamesa',
    brandId: 'brand-gamesa',
    category: 'Galletas',
    categoryId: 'cat-galletas',
    priceTierA: 25.00,
    priceTierB: 28.00,
    priceTierC: 30.00,
    rewardsPoints: 50,
    rating: 5,
    reviewCount: 367,
    inStock: true,
    stockCount: 165,
    glossLevel: 'soft',
  },

  // === JARRITOS PRODUCTS ===
  {
    id: 'prod-jarritos-tamarindo-370ml',
    name: 'Jarritos Tamarindo',
    description: 'Refresco sabor tamarindo 100% natural. 370ml',
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=500',
    price: 14.00,
    sku: 'JAR-TAM-370',
    tier: 'C',
    badge: 'LIMITED',
    seasonal: 'summer',
    brand: 'Jarritos',
    brandId: 'brand-jarritos',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 12.00,
    priceTierB: 14.00,
    priceTierC: 15.50,
    rewardsPoints: 30,
    rating: 5,
    reviewCount: 245,
    inStock: true,
    stockCount: 140,
    glossLevel: 'premium',
    theme: 'summer',
  },
  {
    id: 'prod-jarritos-mandarina-370ml',
    name: 'Jarritos Mandarina',
    description: 'Refresco sabor mandarina. 370ml',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    price: 14.00,
    sku: 'JAR-MAN-370',
    tier: 'C',
    brand: 'Jarritos',
    brandId: 'brand-jarritos',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 12.00,
    priceTierB: 14.00,
    priceTierC: 15.50,
    rewardsPoints: 30,
    rating: 5,
    reviewCount: 198,
    inStock: true,
    stockCount: 125,
    glossLevel: 'soft',
  },
  {
    id: 'prod-jarritos-jamaica-370ml',
    name: 'Jarritos Jamaica',
    description: 'Refresco sabor jamaica. 370ml',
    imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500',
    price: 14.00,
    sku: 'JAR-JAM-370',
    tier: 'C',
    badge: 'HOT',
    seasonal: 'dia-muertos',
    brand: 'Jarritos',
    brandId: 'brand-jarritos',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 12.00,
    priceTierB: 14.00,
    priceTierC: 15.50,
    rewardsPoints: 30,
    rating: 5,
    reviewCount: 312,
    inStock: true,
    stockCount: 158,
    glossLevel: 'premium',
    theme: 'muertos',
  },

  // === ADDITIONAL VARIETY PRODUCTS ===
  {
    id: 'prod-tostitos-salsa-verde',
    name: 'Tostitos Salsa Verde',
    description: 'Totopos horneados sabor salsa verde. 62g',
    imageUrl: 'https://images.unsplash.com/photo-1613564834361-9436948817d1?w=500',
    price: 20.00,
    originalPrice: 24.00,
    sku: 'TOS-SV-62',
    tier: 'A',
    badge: 'SALE',
    brand: 'Sabritas',
    brandId: 'brand-sabritas',
    category: 'Botanas',
    categoryId: 'cat-botanas',
    priceTierA: 18.00,
    priceTierB: 20.00,
    priceTierC: 22.00,
    rewardsPoints: 55,
    rating: 5,
    reviewCount: 267,
    inStock: true,
    stockCount: 185,
    glossLevel: 'premium',
  },
  {
    id: 'prod-bimbo-conchas-chocolate',
    name: 'Conchas Bimbo Chocolate',
    description: 'Pan dulce estilo concha sabor chocolate',
    imageUrl: 'https://images.unsplash.com/photo-1600353068440-6361ef3a86e8?w=500',
    price: 28.00,
    sku: 'BIM-CON-CHO',
    tier: 'B',
    badge: 'NEW',
    seasonal: 'christmas',
    brand: 'Bimbo',
    brandId: 'brand-bimbo',
    category: 'Panadería',
    categoryId: 'cat-panaderia',
    priceTierA: 25.00,
    priceTierB: 28.00,
    priceTierC: 30.00,
    rewardsPoints: 50,
    rating: 5,
    reviewCount: 421,
    inStock: true,
    stockCount: 132,
    glossLevel: 'soft',
    theme: 'holiday',
  },
  {
    id: 'prod-fanta-naranja-600ml',
    name: 'Fanta Naranja 600ml',
    description: 'Refresco sabor naranja. Botella 600ml',
    imageUrl: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=500',
    price: 16.00,
    sku: 'FAN-NAR-600',
    tier: 'C',
    brand: 'Coca-Cola',
    brandId: 'brand-coca-cola',
    category: 'Bebidas',
    categoryId: 'cat-bebidas',
    priceTierA: 14.00,
    priceTierB: 16.00,
    priceTierC: 17.50,
    rewardsPoints: 35,
    rating: 4,
    reviewCount: 389,
    inStock: true,
    stockCount: 265,
    glossLevel: 'soft',
  },
  {
    id: 'prod-gamesa-arcoiris-300g',
    name: 'Galletas Arcoíris Gamesa',
    description: 'Galletas con malvaviscos de colores. 300g',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500',
    price: 32.00,
    sku: 'GAM-ARC-300',
    tier: 'B',
    badge: 'LIMITED',
    brand: 'Gamesa',
    brandId: 'brand-gamesa',
    category: 'Galletas',
    categoryId: 'cat-galletas',
    priceTierA: 29.00,
    priceTierB: 32.00,
    priceTierC: 34.00,
    rewardsPoints: 60,
    rating: 5,
    reviewCount: 512,
    inStock: true,
    stockCount: 98,
    glossLevel: 'premium',
    sparkle: true,
  },
  {
    id: 'prod-doritos-nacho-62g',
    name: 'Doritos Nacho Cheese',
    description: 'Totopos sabor queso nacho. 62g',
    imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=500',
    price: 19.00,
    originalPrice: 23.00,
    sku: 'DOR-NAC-62',
    tier: 'A',
    badge: 'HOT',
    brand: 'Sabritas',
    brandId: 'brand-sabritas',
    category: 'Botanas',
    categoryId: 'cat-botanas',
    priceTierA: 17.00,
    priceTierB: 19.00,
    priceTierC: 21.00,
    rewardsPoints: 50,
    rating: 5,
    reviewCount: 678,
    inStock: true,
    stockCount: 342,
    glossLevel: 'premium',
    sparkle: true,
  },
  {
    id: 'prod-bimbo-donas-azucaradas',
    name: 'Donas Bimbo Azucaradas',
    description: 'Donas esponjosas cubiertas de azúcar',
    imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500',
    price: 26.00,
    sku: 'BIM-DON-AZU',
    tier: 'C',
    brand: 'Bimbo',
    brandId: 'brand-bimbo',
    category: 'Panadería',
    categoryId: 'cat-panaderia',
    priceTierA: 23.00,
    priceTierB: 26.00,
    priceTierC: 28.00,
    rewardsPoints: 45,
    rating: 5,
    reviewCount: 298,
    inStock: true,
    stockCount: 167,
    glossLevel: 'soft',
  },
]

// ============================================================================
// BUNDLES - 3 Curated Product Bundles
// ============================================================================

export const mockBundles: Bundle[] = [
  {
    id: 'bundle-fiesta-familiar',
    name: 'Paquete Fiesta Familiar',
    slug: 'fiesta-familiar',
    description: 'Todo lo que necesitas para una reunión familiar perfecta',
    products: [
      {
        id: 'prod-coca-cola-2l',
        name: 'Coca-Cola 2L',
        imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=200',
        price: 32.00,
        quantity: 3,
      },
      {
        id: 'prod-sabritas-original-62g',
        name: 'Sabritas Clásicas',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200',
        price: 18.50,
        quantity: 5,
      },
      {
        id: 'prod-doritos-nacho-62g',
        name: 'Doritos Nacho',
        imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=200',
        price: 19.00,
        quantity: 5,
      },
      {
        id: 'prod-gamesa-emperador-300g',
        name: 'Emperador Chocolate',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200',
        price: 36.00,
        quantity: 2,
      },
    ],
    originalPrice: 365.50,
    bundlePrice: 299.00,
    savings: 66.50,
    savingsPercent: 18,
    badge: 'BEST VALUE',
    imageUrl: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=600',
    featured: true,
    seasonal: null,
  },
  {
    id: 'bundle-desayuno-completo',
    name: 'Desayuno Completo Bimbo',
    slug: 'desayuno-completo',
    description: 'Empieza tu día con el mejor sabor y calidad',
    products: [
      {
        id: 'prod-bimbo-blanco-680g',
        name: 'Pan Blanco Grande',
        imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200',
        price: 42.00,
        quantity: 2,
      },
      {
        id: 'prod-bimbo-integral-680g',
        name: 'Pan Integral',
        imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=200',
        price: 48.00,
        quantity: 1,
      },
      {
        id: 'prod-bimbo-roles-canela',
        name: 'Roles de Canela',
        imageUrl: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=200',
        price: 32.00,
        quantity: 2,
      },
      {
        id: 'prod-bimbo-donas-azucaradas',
        name: 'Donas Azucaradas',
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200',
        price: 26.00,
        quantity: 2,
      },
    ],
    originalPrice: 248.00,
    bundlePrice: 199.00,
    savings: 49.00,
    savingsPercent: 20,
    badge: 'POPULAR',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600',
    featured: true,
    seasonal: null,
  },
  {
    id: 'bundle-sabores-mexicanos',
    name: 'Sabores 100% Mexicanos',
    slug: 'sabores-mexicanos',
    description: 'Lo mejor de México en un solo paquete',
    products: [
      {
        id: 'prod-jarritos-tamarindo-370ml',
        name: 'Jarritos Tamarindo',
        imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200',
        price: 14.00,
        quantity: 6,
      },
      {
        id: 'prod-jarritos-mandarina-370ml',
        name: 'Jarritos Mandarina',
        imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200',
        price: 14.00,
        quantity: 6,
      },
      {
        id: 'prod-jarritos-jamaica-370ml',
        name: 'Jarritos Jamaica',
        imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200',
        price: 14.00,
        quantity: 6,
      },
      {
        id: 'prod-sabritas-adobadas-62g',
        name: 'Sabritas Adobadas',
        imageUrl: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=200',
        price: 18.50,
        quantity: 4,
      },
    ],
    originalPrice: 326.00,
    bundlePrice: 259.00,
    savings: 67.00,
    savingsPercent: 21,
    badge: 'LIMITED TIME',
    imageUrl: 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=600',
    featured: false,
    seasonal: 'dia-muertos',
  },
]

// ============================================================================
// MARQUEE ITEMS - Trending Products Carousel
// ============================================================================

export const mockMarqueeItems: MarqueeItem[] = [
  {
    id: 'marquee-1',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400',
    title: 'Sabritas Clásicas en Oferta',
    price: 18.50,
    badge: 'HOT',
    linkUrl: '/products/prod-sabritas-original-62g',
  },
  {
    id: 'marquee-2',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
    title: 'Emperador - El Favorito',
    price: 36.00,
    badge: 'BEST SELLER',
    linkUrl: '/products/prod-gamesa-emperador-300g',
  },
  {
    id: 'marquee-3',
    imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400',
    title: 'Coca-Cola 2L - Ahorra',
    price: 32.00,
    badge: 'SALE',
    linkUrl: '/products/prod-coca-cola-2l',
  },
  {
    id: 'marquee-4',
    imageUrl: 'https://images.unsplash.com/photo-1613919671781-3f14b9b96e41?w=400',
    title: 'Flamin\' Hot - Nuevo',
    price: 19.50,
    badge: 'NEW',
    linkUrl: '/products/prod-sabritas-flamin-hot',
  },
  {
    id: 'marquee-5',
    imageUrl: 'https://images.unsplash.com/photo-1626094309830-abbb0c99da4a?w=400',
    title: 'Roles de Canela',
    price: 32.00,
    badge: 'LIMITED',
    linkUrl: '/products/prod-bimbo-roles-canela',
  },
  {
    id: 'marquee-6',
    imageUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400',
    title: 'Jarritos Tamarindo',
    price: 14.00,
    badge: 'SUMMER',
    linkUrl: '/products/prod-jarritos-tamarindo-370ml',
  },
  {
    id: 'marquee-7',
    imageUrl: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400',
    title: 'Doritos Nacho - Top',
    price: 19.00,
    badge: 'HOT',
    linkUrl: '/products/prod-doritos-nacho-62g',
  },
  {
    id: 'marquee-8',
    imageUrl: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400',
    title: 'Pan Integral Bimbo',
    price: 48.00,
    badge: 'HEALTHY',
    linkUrl: '/products/prod-bimbo-integral-680g',
  },
]

// ============================================================================
// HERO BANNER - Main Homepage Banner
// ============================================================================

export const mockHeroBanner: HeroBanner = {
  title: '¡Ofertas de Navidad!',
  subtitle: 'Temporada Especial',
  imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200',
  ctaText: 'Ver Ofertas',
  ctaLink: '/ofertas/navidad',
  theme: 'christmas',
  overlay: 'gradient',
}

// ============================================================================
// BILLBOARD - Holiday Promotional Banner
// ============================================================================

export const mockHolidayBillboard: Billboard = {
  title: 'Paquetes Navideños 2024',
  subtitle: 'Ofertas Especiales',
  description: 'Ahorra hasta 25% en paquetes familiares. ¡Celebra con los mejores productos!',
  imageUrl: 'https://images.unsplash.com/photo-1482517967863-00e15c9b44be?w=800',
  imagePosition: 'right',
  ctaText: 'Ver Paquetes',
  ctaLink: '/bundles/navidad',
  theme: 'emerald',
  overlay: true,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get products by tier
 */
export function getProductsByTier(tier: 'A' | 'B' | 'C'): CatalogProduct[] {
  return mockProducts.filter((p) => p.tier === tier)
}

/**
 * Get products by brand
 */
export function getProductsByBrand(brandId: string): CatalogProduct[] {
  return mockProducts.filter((p) => p.brandId === brandId)
}

/**
 * Get products by category
 */
export function getProductsByCategory(categoryId: string): CatalogProduct[] {
  return mockProducts.filter((p) => p.categoryId === categoryId)
}

/**
 * Get seasonal products
 */
export function getSeasonalProducts(season: 'christmas' | 'summer' | 'dia-muertos'): CatalogProduct[] {
  return mockProducts.filter((p) => p.seasonal === season)
}

/**
 * Get featured products
 */
export function getFeaturedProducts(): CatalogProduct[] {
  return mockProducts.filter((p) => p.sparkle === true || p.rating === 5)
}

/**
 * Get products on sale
 */
export function getSaleProducts(): CatalogProduct[] {
  return mockProducts.filter((p) => p.badge === 'SALE' || p.originalPrice)
}

/**
 * Get new products
 */
export function getNewProducts(): CatalogProduct[] {
  return mockProducts.filter((p) => p.badge === 'NEW')
}

/**
 * Get random products
 */
export function getRandomProducts(count: number): CatalogProduct[] {
  const shuffled = [...mockProducts].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export const catalogMockData = {
  brands: mockBrands,
  products: mockProducts,
  bundles: mockBundles,
  marqueeItems: mockMarqueeItems,
  heroBanner: mockHeroBanner,
  holidayBillboard: mockHolidayBillboard,
  helpers: {
    getProductsByTier,
    getProductsByBrand,
    getProductsByCategory,
    getSeasonalProducts,
    getFeaturedProducts,
    getSaleProducts,
    getNewProducts,
    getRandomProducts,
  },
}

export default catalogMockData
