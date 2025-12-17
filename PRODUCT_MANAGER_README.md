# Product Manager Module - Implementation Guide

## Overview

The Product Manager is a comprehensive admin module for managing products, categories, brands, and front-page catalog layouts with drag-and-drop functionality and Galaxy Tab S9 FE preview.

## Features

- **Product Management**: Full CRUD with image upload, pricing, inventory
- **Category & Brand Management**: Simple UI for organizing products
- **Front-Page Layout Editor**: Drag-and-drop section ordering with 5 section types
- **Live Preview**: Galaxy Tab S9 FE (1080×1920) device simulation
- **Responsive UI**: Built with Tailwind CSS and Framer Motion

## Module Structure

```
src/modules/product-manager/
├── index.tsx                          # Main component
├── types/index.ts                     # TypeScript definitions
├── api/
│   ├── products.ts                    # Product API calls
│   ├── categories.ts                  # Category API calls
│   ├── brands.ts                      # Brand API calls
│   └── sections.ts                    # Front-page layout API calls
└── components/
    ├── ProductForm.tsx                # Product create/edit form
    ├── ProductList.tsx                # Product grid with search
    ├── CategoryManager.tsx            # Category CRUD UI
    ├── BrandManager.tsx               # Brand CRUD UI
    ├── LayoutEditor.tsx               # Drag-and-drop layout editor
    ├── SortableSection.tsx            # Draggable section component
    ├── SectionEditor.tsx              # Section configuration modal
    └── LayoutPreview.tsx              # Device preview modal
```

## Installation

### 1. Install Dependencies

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Add Route

In `src/main.tsx`:

```typescript
import ProductManager from './modules/product-manager';

// Add route
<Route path="/admin/products" element={<ProductManager />} />
```

### 3. Add Navigation Link

```tsx
<Link to="/admin/products">Product Manager</Link>
```

## Server-Side Implementation

### Required Prisma Schema Additions

```prisma
model FrontPageLayout {
  id        String   @id @default(uuid())
  name      String
  isActive  Boolean  @default(false)
  sections  Section[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Section {
  id           String            @id @default(uuid())
  layoutId     String
  layout       FrontPageLayout   @relation(fields: [layoutId], references: [id], onDelete: Cascade)
  type         String            // 'hero', 'two-column-grid', 'brand-row', 'bundle-block', 'scrolling-section'
  title        String?
  subtitle     String?
  displayOrder Int
  config       Json              // Section-specific configuration
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt

  @@index([layoutId])
  @@index([displayOrder])
}
```

### API Routes Implementation

Create `server/routes/front-page.mjs`:

```javascript
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get active layout
router.get('/layouts/active', async (req, res) => {
  try {
    const layout = await prisma.frontPageLayout.findFirst({
      where: { isActive: true },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    res.json(layout || { sections: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get layout by ID
router.get('/layouts/:id', async (req, res) => {
  try {
    const layout = await prisma.frontPageLayout.findUnique({
      where: { id: req.params.id },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!layout) {
      return res.status(404).json({ error: 'Layout not found' });
    }

    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all layouts
router.get('/layouts', async (req, res) => {
  try {
    const layouts = await prisma.frontPageLayout.findMany({
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(layouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create layout
router.post('/layouts', async (req, res) => {
  try {
    const { name, isActive, sections } = req.body;

    // If setting as active, deactivate others
    if (isActive) {
      await prisma.frontPageLayout.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const layout = await prisma.frontPageLayout.create({
      data: {
        name,
        isActive: isActive || false,
        sections: {
          create: sections || [],
        },
      },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update layout
router.put('/layouts/:id', async (req, res) => {
  try {
    const { name, isActive, sections } = req.body;

    // If setting as active, deactivate others
    if (isActive) {
      await prisma.frontPageLayout.updateMany({
        where: { id: { not: req.params.id }, isActive: true },
        data: { isActive: false },
      });
    }

    // Delete existing sections
    await prisma.section.deleteMany({
      where: { layoutId: req.params.id },
    });

    // Update layout with new sections
    const layout = await prisma.frontPageLayout.update({
      where: { id: req.params.id },
      data: {
        name,
        isActive,
        sections: {
          create: sections || [],
        },
      },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete layout
router.delete('/layouts/:id', async (req, res) => {
  try {
    await prisma.frontPageLayout.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create section
router.post('/layouts/:layoutId/sections', async (req, res) => {
  try {
    const section = await prisma.section.create({
      data: {
        ...req.body,
        layoutId: req.params.layoutId,
      },
    });

    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update section
router.put('/layouts/:layoutId/sections/:sectionId', async (req, res) => {
  try {
    const section = await prisma.section.update({
      where: { id: req.params.sectionId },
      data: req.body,
    });

    res.json(section);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete section
router.delete('/layouts/:layoutId/sections/:sectionId', async (req, res) => {
  try {
    await prisma.section.delete({
      where: { id: req.params.sectionId },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder sections
router.post('/layouts/:layoutId/reorder', async (req, res) => {
  try {
    const { sectionIds } = req.body;

    // Update display order for each section
    await Promise.all(
      sectionIds.map((id, index) =>
        prisma.section.update({
          where: { id },
          data: { displayOrder: index },
        })
      )
    );

    const layout = await prisma.frontPageLayout.findUnique({
      where: { id: req.params.layoutId },
      include: {
        sections: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### Register Routes in `server/index.mjs`

```javascript
import frontPageRoutes from './routes/front-page.mjs';

app.use('/api/front-page', frontPageRoutes);
```

## Section Types

### 1. Hero Section
Full-width banner with image, title, subtitle, and CTA button.

**Config:**
- `heroImageUrl`: Background image URL
- `heroTitle`: Main headline
- `heroSubtitle`: Supporting text
- `heroCta`: Button text
- `heroCtaLink`: Button link

### 2. Two-Column Grid
Grid layout displaying selected products.

**Config:**
- `columns`: Number of columns (2-4)
- `productIds`: Array of product IDs to display

### 3. Brand Row
Horizontal scrolling row of products from a specific brand.

**Config:**
- `brandId`: Brand to feature
- `maxProducts`: Maximum products to show (default: 6)

### 4. Bundle Block
Special offer card displaying bundled products with discount price.

**Config:**
- `bundleTitle`: Bundle name
- `bundlePrice`: Discounted price
- `bundleProductIds`: Array of products in bundle

### 5. Scrolling Section
Auto-scrolling horizontal product carousel.

**Config:**
- `categoryId`: Optional category filter
- `scrollSpeed`: 'slow' | 'medium' | 'fast'

## Usage Example

```tsx
import ProductManager from './modules/product-manager';

function AdminPanel() {
  return (
    <div>
      <ProductManager />
    </div>
  );
}
```

## Customization

### Styling
All components use Tailwind CSS classes. Modify in component files.

### Device Preview Dimensions
Edit in `LayoutPreview.tsx`:
```tsx
style={{ width: '360px' }} // Change tablet width
style={{ height: '640px' }} // Change tablet height
```

### API Base URL
Change in API files if needed:
```typescript
const API_BASE = '/api'; // Change to your API base
```

## Troubleshooting

### Drag and Drop Not Working
Ensure `@dnd-kit` packages are installed:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### Images Not Uploading
Verify multipart/form-data support in your server:
```javascript
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });
app.post('/api/products', upload.single('image'), handler);
```

### Sections Not Saving
Check Prisma schema includes `FrontPageLayout` and `Section` models.

## Future Enhancements

- [ ] Bulk product import from CSV
- [ ] Advanced image editor
- [ ] A/B testing for layouts
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Product variants
- [ ] Inventory alerts

## License

MIT
