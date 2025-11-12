#!/bin/bash

# Build Minimal Working Catalog
# This creates a fresh, working version that shows your beautiful catalog

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

LOCAL_DIR="/Users/ernestoponce/dev/azteka-dsd"
VPS_HOST="root@77.243.85.8"
VPS_DIR="/srv/azteka-dsd"

echo -e "${BLUE}=== Building Minimal Working Catalog ===${NC}"
echo ""

# Step 1: Create minimal working app
echo -e "${BLUE}Step 1: Creating minimal working app...${NC}"

cd "$LOCAL_DIR" || exit 1

# Create a simple working version
cat > src/AppMinimal.tsx << 'EOF'
import { useEffect, useState } from 'react';
import { fetchFromAPI } from './lib/apiClient';
import CatalogGrid from './components/CatalogGrid';
import ProductCard from './components/ProductCard';
import { Product } from './types';

export default function AppMinimal() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchFromAPI<Product>('api/products');
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    console.log('Add to cart:', product);
    // TODO: Implement cart
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading beautiful catalog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Catalog</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadProducts}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b-2 border-gray-200 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Azteka Foods</h1>
              <p className="text-sm text-gray-600">Wholesale Catalog</p>
            </div>
            <div className="text-sm text-gray-600">
              {products.length} products
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-black text-gray-900 mb-2">Product Catalog</h2>
          <p className="text-gray-600 text-lg">Browse our complete wholesale catalog</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600">No products found</p>
            <p className="text-sm text-gray-500 mt-2">Check your API connection</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
EOF

echo -e "${GREEN}✅ Minimal app created${NC}"
echo ""

# Step 2: Update main.tsx to use minimal app
echo -e "${BLUE}Step 2: Updating main.tsx...${NC}"

# Backup original
cp src/main.tsx src/main.tsx.backup

# Create new main.tsx
cat > src/main.tsx << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppMinimal from './AppMinimal.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMinimal />
  </StrictMode>
);
EOF

echo -e "${GREEN}✅ main.tsx updated${NC}"
echo ""

# Step 3: Verify types exist
echo -e "${BLUE}Step 3: Checking types...${NC}"
if [ ! -f src/types/index.ts ]; then
    echo -e "${YELLOW}⚠ Types file missing, creating...${NC}"
    mkdir -p src/types
    cat > src/types/index.ts << 'TYPESEOF'
export interface Product {
  id: string;
  category_id: string;
  brand_id?: string;
  subcategory_id?: string;
  name: string;
  slug: string;
  description: string;
  sku: string;
  image_url: string;
  background_color: string;
  price: number;
  unit_type: string;
  units_per_case: number;
  min_order_quantity: number;
  in_stock: boolean;
  featured: boolean;
}
TYPESEOF
    echo -e "${GREEN}✅ Types file created${NC}"
else
    echo -e "${GREEN}✅ Types file exists${NC}"
fi
echo ""

# Step 4: Build
echo -e "${BLUE}Step 4: Building...${NC}"
npm run build

if [ ! -f dist/index.html ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
echo ""

# Step 5: Deploy to VPS
echo -e "${BLUE}Step 5: Deploying to VPS...${NC}"
read -p "Deploy to VPS? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        
        # Backup
        BACKUP=\$(date +%Y%m%d-%H%M%S)
        tar -czf \"backup-\$BACKUP.tar.gz\" dist/ 2>/dev/null || true
        echo '✅ Backup created'
        
        # Pull latest
        if [ -d .git ]; then
            git pull origin main || echo '⚠ Git pull failed'
        fi
        
        # Copy build
        echo '📦 Copying build...'
    "
    
    # Copy dist folder
    rsync -avz --delete dist/ "$VPS_HOST:$VPS_DIR/dist/"
    
    ssh "$VPS_HOST" "
        cd $VPS_DIR
        
        # Clear nginx cache
        rm -rf /var/cache/nginx/* 2>/dev/null || true
        systemctl reload nginx
        
        echo '✅ Deployment complete!'
    "
    
    echo ""
    echo -e "${GREEN}✅ Deployed to VPS${NC}"
else
    echo -e "${YELLOW}⚠ Skipping VPS deployment${NC}"
fi
echo ""

echo -e "${GREEN}=== Build Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. Visit: https://aztekafoods.com"
echo "2. You should see the beautiful catalog!"
echo "3. If you see products, it's working!"
echo ""
echo "To restore original app:"
echo "  cp src/main.tsx.backup src/main.tsx"
echo "  npm run build"

