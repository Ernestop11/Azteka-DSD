# 🚀 Implementation Plan - Mobile, Roles, & Contract Workers

## 📋 Requirements Summary

1. **Mobile Optimization & PWA** - Make it look great on phones
2. **Carlos-Specific Bulk Ordering** - Login required, tailored for Carlos
3. **Role-Based Catalog Landing Page**:
   - A. General users (no prices, watered down)
   - B. Current customers (order again feed, social media style)
   - C. Sales reps (customizable modes: Mexican grocery, convenience store, gas station, hybrid)
4. **English/Spanish Toggle**
5. **Doordash-Style Contract Worker System** - Sales reps, delivery drivers, warehouse workers

---

## ✅ Implementation Order

### Phase 1: Mobile Optimization & PWA (Priority 1)
### Phase 2: Role-Based Catalog Views (Priority 2)
### Phase 3: Carlos Bulk Ordering (Priority 3)
### Phase 4: Language Toggle (Priority 4)
### Phase 5: Contract Worker System (Priority 5)

---

## 🎯 Phase 1: Mobile Optimization & PWA

### Tasks:
1. ✅ Check PWA manifest
2. ✅ Optimize mobile CSS (responsive design)
3. ✅ Add touch-friendly buttons
4. ✅ Optimize images for mobile
5. ✅ Add service worker for offline support
6. ✅ Test on mobile devices

---

## 🎯 Phase 2: Role-Based Catalog Landing Page

### Tasks:
1. ✅ Create `CatalogLanding.tsx` component
2. ✅ Implement role detection (general/customer/sales rep)
3. ✅ Create General User View (no prices, watered down)
4. ✅ Create Customer View (order again feed, social media style)
5. ✅ Create Sales Rep View (customizable modes)
6. ✅ Add mode selector for sales reps (Mexican grocery, convenience store, gas station, hybrid)
7. ✅ Implement onboarding/login flow

---

## 🎯 Phase 3: Carlos-Specific Bulk Ordering

### Tasks:
1. ✅ Create Carlos user account/login
2. ✅ Add "Bulk Order" button visible only to Carlos
3. ✅ Create guided bulk ordering flow
4. ✅ Add Carlos-specific features

---

## 🎯 Phase 4: Language Toggle

### Tasks:
1. ✅ Create language context (i18n)
2. ✅ Add English/Spanish translations
3. ✅ Add language toggle button
4. ✅ Persist language preference

---

## 🎯 Phase 5: Contract Worker System

### Tasks:
1. ✅ Create contract worker database models
2. ✅ Create job queue system
3. ✅ Create worker dashboard (sales rep, driver, warehouse)
4. ✅ Create job acceptance/confirmation flow
5. ✅ Create commission calculation system
6. ✅ Create communication system

---

## 📝 Files to Create/Modify

### New Files:
- `src/context/LanguageContext.tsx` - Language toggle
- `src/context/ContractWorkerContext.tsx` - Contract worker system
- `src/pages/CatalogLanding.tsx` - Role-based catalog
- `src/pages/ContractWorkerDashboard.tsx` - Worker dashboard
- `src/components/CarlosBulkOrder.tsx` - Carlos-specific bulk ordering
- `src/components/LanguageToggle.tsx` - Language switcher
- `src/components/ModeSelector.tsx` - Sales rep mode selector
- `src/i18n/en.json` - English translations
- `src/i18n/es.json` - Spanish translations
- `public/manifest.json` - PWA manifest (update)
- `public/sw.js` - Service worker

### Modified Files:
- `src/App.tsx` - Add role-based routing
- `src/AppWithRouter.tsx` - Update routing
- `src/index.css` - Mobile optimizations
- `index.html` - PWA meta tags
- `prisma/schema.prisma` - Add contract worker models

---

**Let's start implementing!**

