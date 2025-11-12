# 🚀 Fix White Page - Three.js Error Prompt

## Copy This Into VS Code Claude Chat

```
My app is showing a white page with this error:
Uncaught TypeError: Cannot read properties of undefined (reading 'S') in three-vendor-Bh2ekQP6.js:4010

The problem:
- CustomerPortal.tsx imports Three.js (@react-three/fiber, @react-three/drei)
- Three.js is failing to initialize, causing the white page
- The app worked briefly but now shows white page again

What I need:
1. Fix CustomerPortal.tsx to handle Three.js errors gracefully OR remove Three.js
2. Add error boundary around Three.js components
3. Make sure the app works even if Three.js fails
4. Preserve all other features (bundle ordering, PO invoice upload, beautiful UI)

The app is at: /Users/ernestoponce/dev/azteka-dsd
CustomerPortal is at: src/pages/CustomerPortal.tsx

CRITICAL REQUIREMENTS:
1. MUST fix the white page immediately
2. MUST preserve all other features
3. MUST handle Three.js errors gracefully
4. MUST not break bundle ordering or PO invoice upload

Options:
- Option 1: Add error boundary around Three.js in CustomerPortal
- Option 2: Remove Three.js from CustomerPortal and use simple 2D components (RECOMMENDED)
- Option 3: Lazy load Three.js so it doesn't block the app

I recommend Option 2 - remove Three.js and use simple 2D components. This is fastest and most reliable.

Fix the white page so the app works immediately!
```

