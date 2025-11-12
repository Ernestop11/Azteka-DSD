# 🚨 URGENT: Fix White Page - Three.js Error

## 🐛 Problem

**White page caused by Three.js error in CustomerPortal.tsx**

Error: `Uncaught TypeError: Cannot read properties of undefined (reading 'S')` in `three-vendor-Bh2ekQP6.js:4010`

## ✅ Solution

### Quick Fix: Remove Three.js from CustomerPortal

The `CustomerPortal.tsx` component imports Three.js which is failing. We need to either:
1. Remove Three.js and use simple 2D components (RECOMMENDED - fastest)
2. Add error boundary around Three.js (slower, more complex)

## 🚀 Copy This Prompt Into VS Code Claude Chat

```
URGENT: My app shows white page with Three.js error. Need immediate fix.

Error: Uncaught TypeError: Cannot read properties of undefined (reading 'S') in three-vendor-Bh2ekQP6.js:4010

The problem:
- CustomerPortal.tsx imports Three.js (@react-three/fiber, @react-three/drei)
- Three.js is failing to initialize, causing white page
- The app worked briefly but now shows white page again

What I need:
1. Remove Three.js from CustomerPortal.tsx
2. Replace 3D Canvas with simple 2D components
3. Keep all other functionality (loyalty points, rewards, showcases)
4. Preserve beautiful UI design
5. Make sure app works immediately

The app is at: /Users/ernestoponce/dev/azteka-dsd
CustomerPortal is at: src/pages/CustomerPortal.tsx

CRITICAL REQUIREMENTS:
1. MUST fix white page immediately
2. MUST remove Three.js imports (Canvas, useFrame, OrbitControls, Float)
3. MUST replace 3D mesh with simple 2D div/image
4. MUST preserve loyalty points, rewards, showcases functionality
5. MUST preserve beautiful UI design
6. MUST not break any other features

Current CustomerPortal has:
- Three.js 3D mesh (ProductMesh component)
- Canvas with OrbitControls
- Loyalty points display
- Rewards display
- Showcases with Lottie animations

Replace the 3D Canvas section with:
- Simple 2D div with gradient background
- Product image or icon
- Same beautiful styling
- Keep all other features working

Fix the white page so the app works immediately!
```

## 📋 Alternative: If You Want to Keep Three.js

If you want to keep Three.js, add error boundary:

```
Add error boundary around Three.js components in CustomerPortal.tsx:

1. Import ErrorBoundary from react-error-boundary
2. Wrap Canvas in ErrorBoundary
3. Add fallback UI if Three.js fails
4. Make sure app still works if Three.js fails

But I recommend removing Three.js - it's simpler and faster.
```

## ✅ After Fix

1. Rebuild: `npm run build`
2. Deploy to VPS
3. Test: https://aztekafoods.com
4. Verify: No white page, app works

---

**Use the prompt above to fix immediately!**

