# 🚀 Quick Test Reference Card

## One-Command Test
```bash
npm run test:e2e
```

## Individual Tests

### Database
```bash
npm run db:count-products    # Should show: 642
npm run db:count-bundles     # Should show: 3+
npm run db:verify-bundle-consistency
```

### API
```bash
curl http://localhost:3000/api/products | jq length        # 642
curl http://localhost:3000/api/admin/bundles | jq length   # 3+
curl http://localhost:3000/api/health                      # {"status":"ok"}
```

### Frontend (Manual)
1. **Admin:** `http://localhost:3000/admin/bundles/edit`
   - Create bundle "Carlos Test Pack"
   - Add 3 products, 10% discount
   - Upload image, save

2. **Customer:** Login as `sales@aztekafoods.com` / `sales123`
   - Browse catalog → verify bundles
   - Add bundle to cart
   - Complete checkout

3. **Mobile:** Test on mobile browser
   - Bundle creation
   - Bundle ordering

## Success Criteria ✓

- [ ] 642 products in database
- [ ] 3+ bundles in database
- [ ] Admin can create bundles
- [ ] Bundles appear in catalog
- [ ] Sales rep can add bundles to cart
- [ ] Checkout works with bundles
- [ ] Mobile interface functional
- [ ] No console errors

## Full Guide
See `E2E_TEST_GUIDE.md` for detailed instructions.

