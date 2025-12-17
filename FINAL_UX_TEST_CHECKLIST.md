# Final UX Test Checklist - Azteka DSD MVP
## Comprehensive Manual Testing Guide

**Tester:** Ernesto Ponce
**Date:** ___________
**Build:** ___________
**Environment:** http://localhost:3000

---

## 🎯 Test Overview

- **Total Tests:** 70
- **Estimated Time:** 2-3 hours
- **Prerequisites:** npm run dev running, database seeded

---

## 📋 Section 1: Admin Product Editor (15 tests)

### 1.1 Navigation & Access
- [ ] **T001:** Navigate to /admin/products
- [ ] **T002:** Click "Edit" on any product
- [ ] **T003:** Product editor loads without errors
- [ ] **T004:** All form fields populated with product data

### 1.2 Visual Design Panel - Preset Mode
- [ ] **T005:** Click "Presets" mode button
- [ ] **T006:** See three tabs: Gradient, Glow, Splash
- [ ] **T007:** Click "Gradient" tab - presets display in grid
- [ ] **T008:** Click a gradient preset - live preview updates immediately
- [ ] **T009:** Scroll preset grid - no overlap with sticky preview
- [ ] **T010:** Search for preset name - results filter correctly

### 1.3 Visual Design Panel - Custom Mode
- [ ] **T011:** Click "Custom" mode button
- [ ] **T012:** See color picker input
- [ ] **T013:** Click color picker - choose color - preview updates
- [ ] **T014:** Enter gradient CSS in textarea - preview updates
- [ ] **T015:** Enter splash overlay URL - preview updates

---

## 📋 Section 2: Admin Product Editor - Accessibility (8 tests)

### 2.1 Keyboard Navigation
- [ ] **T016:** Tab through all form fields - focus visible
- [ ] **T017:** Tab to preset grid - arrow keys navigate presets
- [ ] **T018:** Press Enter on preset - selects it
- [ ] **T019:** Press Escape in search - clears search
- [ ] **T020:** Tab to mode toggle buttons - Enter/Space switches mode

### 2.2 Screen Reader (VoiceOver/NVDA)
- [ ] **T021:** Preset grid announces as "listbox"
- [ ] **T022:** Each preset announces with name
- [ ] **T023:** Search input has clear label
- [ ] **T024:** Mode toggle buttons announce state (pressed/not pressed)

---

## 📋 Section 3: Admin Catalog Management (10 tests)

### 3.1 Product Upload
- [ ] **T025:** Navigate to /admin/products
- [ ] **T026:** Click "Upload Image" button
- [ ] **T027:** Select valid image (PNG <5MB) - uploads successfully
- [ ] **T028:** Try invalid file (PDF) - see error message
- [ ] **T029:** Try large file (>5MB) - see size error
- [ ] **T030:** See loading spinner during upload

### 3.2 Bulk Operations
- [ ] **T031:** Select multiple products with checkboxes
- [ ] **T032:** Click "Bulk Edit" - modal opens
- [ ] **T033:** Apply changes - all selected products update
- [ ] **T034:** See success toast message

---

## 📋 Section 4: Sales Multi-Store Order (12 tests)

### 4.1 Store Selection
- [ ] **T035:** Navigate to /sales/multi-store
- [ ] **T036:** See list of stores on left sidebar (desktop)
- [ ] **T037:** Click a store - becomes highlighted
- [ ] **T038:** See store badge count if cart has items
- [ ] **T039:** Subtotal displays in badge (e.g., "$124.50")

### 4.2 Cart Management
- [ ] **T040:** Add product to cart - cart badge updates
- [ ] **T041:** See cart items in right panel
- [ ] **T042:** Update quantity - subtotal recalculates
- [ ] **T043:** Remove item - cart updates

### 4.3 Bundle Recommendations
- [ ] **T044:** See bundle section if store has recommendations
- [ ] **T045:** Bundle card shows savings amount
- [ ] **T046:** Click "Add Bundle" - all bundle products added to cart

### 4.4 Create Orders
- [ ] **T047:** Click "Create All Orders" button
- [ ] **T048:** See progress bar at top
- [ ] **T049:** Progress modal shows per-store status
- [ ] **T050:** All orders complete - see success checkmarks

---

## 📋 Section 5: Customer Catalog (15 tests)

### 5.1 Product Browsing
- [ ] **T051:** Navigate to /catalog
- [ ] **T052:** See hero banner with featured products
- [ ] **T053:** Hero products have staggered animation (smooth entrance)
- [ ] **T054:** Scroll to product grid - products load
- [ ] **T055:** Hover product card - smooth scale effect

### 5.2 Search & Filters
- [ ] **T056:** Type in search box - wait 500ms - results update
- [ ] **T057:** Clear search - all products show again
- [ ] **T058:** Click "Filters" button (mobile) - drawer slides in from left
- [ ] **T059:** Select category filter - products filter correctly
- [ ] **T060:** Select brand filter - products filter correctly
- [ ] **T061:** Active filter chips show at top
- [ ] **T062:** Click "X" on filter chip - filter removed

### 5.3 Empty States
- [ ] **T063:** Search for "NONEXISTENT12345" - see empty state
- [ ] **T064:** Empty state shows magnifying glass icon
- [ ] **T065:** Empty state has helpful message

---

## 📋 Section 6: Accessibility (WCAG 2.1 AA) (8 tests)

### 6.1 Keyboard Navigation
- [ ] **T066:** Tab through entire page - all interactive elements focusable
- [ ] **T067:** Focus visible on all elements (blue ring)
- [ ] **T068:** No keyboard traps (can Tab out of all modals)
- [ ] **T069:** Escape key closes all modals

### 6.2 Screen Reader
- [ ] **T070:** All images have alt text
- [ ] **T071:** All buttons have clear labels
- [ ] **T072:** Form errors announced as "alert"
- [ ] **T073:** Loading states announced with aria-live

---

## 📋 Section 7: Mobile Responsiveness (10 tests)

### 7.1 Mobile Layout (iPhone 12 - 390px)
- [ ] **T074:** Catalog page displays correctly
- [ ] **T075:** Product cards stack vertically
- [ ] **T076:** "Filters" button opens drawer
- [ ] **T077:** Filter drawer full-screen on mobile
- [ ] **T078:** Close button visible in filter drawer

### 7.2 Tablet Layout (iPad - 768px)
- [ ] **T079:** Multi-store sidebar adapts to tablet width
- [ ] **T080:** Product editor preview not cut off
- [ ] **T081:** Preset grid columns adjust (3 instead of 4)

### 7.3 Touch Interactions
- [ ] **T082:** All buttons have 44px minimum touch target
- [ ] **T083:** Swipe gestures work in filter drawer

---

## 📋 Section 8: Loading & Error States (7 tests)

### 8.1 Loading Indicators
- [ ] **T084:** Login page shows spinner during login
- [ ] **T085:** Product grid shows skeleton cards while loading
- [ ] **T086:** Image upload shows spinner
- [ ] **T087:** Filter sidebar shows skeleton while loading

### 8.2 Error Handling
- [ ] **T088:** Invalid login shows error message
- [ ] **T089:** Failed image upload shows specific error
- [ ] **T090:** Network error shows retry button

---

## 📊 Test Results Summary

| Section | Total Tests | Passed | Failed | Notes |
|---------|-------------|--------|--------|-------|
| Admin Product Editor | 15 | ___ | ___ | |
| Admin Accessibility | 8 | ___ | ___ | |
| Admin Catalog | 10 | ___ | ___ | |
| Sales Multi-Store | 12 | ___ | ___ | |
| Customer Catalog | 15 | ___ | ___ | |
| Accessibility | 8 | ___ | ___ | |
| Mobile Responsive | 10 | ___ | ___ | |
| Loading/Errors | 7 | ___ | ___ | |
| **TOTAL** | **85** | **___** | **___** | |

---

## 🐛 Issues Found

### Critical (Blocks MVP)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### High (Should Fix Before Launch)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Medium (Nice to Have)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

### Low (Future Enhancement)
1. _______________________________________________________________
2. _______________________________________________________________
3. _______________________________________________________________

---

## ✅ Sign-Off

**Tester Name:** _______________________________
**Date:** _______________________________
**Signature:** _______________________________

**Overall Assessment:**
- [ ] ✅ Ready for MVP launch
- [ ] ⚠️ Ready with noted issues
- [ ] ❌ Not ready - critical issues found

**Comments:**
________________________________________________________________
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## 📝 Testing Notes

### Browser Compatibility
Tested on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] Desktop (1920×1080)
- [ ] Laptop (1366×768)
- [ ] Tablet (768×1024)
- [ ] Mobile (390×844)

### Network Conditions
- [ ] Fast 3G
- [ ] Slow 3G
- [ ] Offline mode

---

## 🎯 Quick Test (15 min version)

If time is limited, run these critical tests:

### Essential Path (Must Pass)
1. [ ] T001-T004: Access product editor
2. [ ] T007-T008: Select gradient preset - preview updates
3. [ ] T035-T038: Select store in multi-store
4. [ ] T040-T041: Add product to cart
5. [ ] T051-T054: Browse catalog
6. [ ] T056-T057: Search products
7. [ ] T066-T069: Keyboard navigation works
8. [ ] T074-T077: Mobile layout correct

**If all 8 groups pass:** ✅ Core functionality works
**If any group fails:** ❌ Investigate before launch

---

**End of Checklist**
**Version:** 1.0
**Last Updated:** 2025-11-19
