# 🔧 Fix White Page - Three.js Error

## 🐛 Problem

The white page is caused by:
1. **Three.js error**: `Uncaught TypeError: Cannot read properties of undefined (reading 'S')` in `three-vendor-Bh2ekQP6.js:4010`
2. **CustomerPortal.tsx** imports Three.js (`@react-three/fiber`, `@react-three/drei`)
3. **VPS main.tsx** is using old `App.tsx` instead of `AppWithRouter.tsx`

## ✅ Solution

### Option 1: Fix Three.js in CustomerPortal (Quick Fix)

Make CustomerPortal handle Three.js errors gracefully:

```typescript
// src/pages/CustomerPortal.tsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Wrap Three.js components in error boundary
function CustomerPortal() {
  return (
    <ErrorBoundary fallback={<div>3D view unavailable</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        {/* Three.js components */}
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Option 2: Remove Three.js from CustomerPortal (Simpler)

Replace Three.js 3D view with a simple 2D component:

```typescript
// src/pages/CustomerPortal.tsx
// Remove: import { Canvas, useFrame } from '@react-three/fiber';
// Remove: import { OrbitControls, Float } from '@react-three/drei';

// Use simple 2D components instead
```

### Option 3: Update VPS main.tsx (If AppWithRouter exists)

If `AppWithRouter.tsx` exists on VPS, update `main.tsx`:

```typescript
// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppWithRouter from './AppWithRouter.tsx'; // Changed from App
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithRouter />
  </StrictMode>
);
```

## 🚀 Quick Fix Command

```bash
# SSH to VPS
ssh root@77.243.85.8

# Option 1: Update main.tsx to use AppWithRouter (if it exists)
cd /srv/azteka-dsd
cat src/main.tsx
# If it says "App" instead of "AppWithRouter", update it

# Option 2: Fix CustomerPortal to handle Three.js errors
# Edit src/pages/CustomerPortal.tsx to add error boundary

# Option 3: Remove Three.js from CustomerPortal
# Edit src/pages/CustomerPortal.tsx to remove Three.js imports

# Rebuild
npm run build

# Restart nginx
systemctl reload nginx
```

## 📋 Recommended Fix

**Use Option 2** - Remove Three.js from CustomerPortal and use simple 2D components. This is the fastest and most reliable fix.

