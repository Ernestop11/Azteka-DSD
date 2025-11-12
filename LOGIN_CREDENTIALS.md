# AZTEKA Wholesale Distribution - Login Credentials & URLs

## 🚀 Quick Access

**Main URL:** `http://localhost:5173/`
**Login Page:** `http://localhost:5173/login`

---

## 👥 User Credentials

### Admin Account (Carlos Rodriguez)
- **Email:** `admin@azteka.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access, admin dashboard, analytics, automation

### Sales Rep Account (Maria Gonzalez)
- **Email:** `sales@azteka.com`
- **Password:** `sales123`
- **Role:** Sales Representative
- **Access:** Catalog, sales dashboard, leaderboard

### Driver Account (Juan Martinez)
- **Email:** `driver@azteka.com`
- **Password:** `driver123`
- **Role:** Driver
- **Access:** Driver dashboard, delivery routes, gamification

---

## 📱 Features by Role

### Admin Features
- Product catalog management
- Invoice upload system
- Purchase order management
- Order management
- AI analytics & insights
- Automation center
- Executive dashboard
- Image processing tools

### Sales Rep Features
- Product catalog (tablet-optimized)
- Real-time ordering
- Sales leaderboard
- Gamification & rewards
- Performance tracking
- Customer portal access

### Driver Features
- Delivery dashboard
- Route optimization
- Gamification badges
- Performance metrics
- Delivery tracking

---

## 🎨 New UI Features

### Brand Showcases
- **La Molienda:** Premium Mexican baked goods (Red theme)
- **Marinela:** Sweet treats and bakery (Blue theme)

### Rotating Brand Carousel
- FREE display rack bundles
- Dynamic pricing with savings badges
- Auto-rotating every 5 seconds
- Manual navigation controls

### Category Grid
- Visual card-based navigation
- Colorful gradients per category
- Item counts per category
- Animated selection indicators

### Enhanced Product Cards
- High-margin indicators
- Stock status badges
- Weekly special tags
- Hover animations
- Quick add-to-cart

### Specials Grid
- Weekly promotions
- Discount badges
- Limited-time offers
- Visual countdown timers

---

## 🛒 Shopping Flow

1. **Browse Catalog** - Select from 6 visual categories
2. **View Products** - See detailed product cards with pricing
3. **Add to Cart** - Quick add with quantity controls
4. **Checkout** - Streamlined checkout process
5. **Order Confirmation** - Instant confirmation with tracking

---

## 📦 Bundle Promotions

### La Molienda Starter Bundle - $349
- Premium 5-tier display rack (FREE)
- 24 Churros mix
- 24 Conchas
- 12 Pan Dulce variety
- **Save $101**

### Marinela Premium Package - $399
- Deluxe 6-tier display rack (FREE)
- 36 Gansitos
- 36 Príncipe cookies
- 24 Roles
- **Save $121**

---

## 💻 Testing Notes

### Tablet Optimization (768px - 1024px)
- Catalog grid: 2-3 columns
- Touch-friendly buttons
- Optimized for portrait & landscape

### Mobile Optimization (< 768px)
- Catalog grid: 1-2 columns
- Bundle builder optimized for mobile
- Collapsible navigation menu
- Bottom cart summary

### Desktop Experience (> 1024px)
- Full 4-column product grid
- Floating cart widget
- Advanced filters
- Multi-column category layout

---

## 🔧 Technical Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Framer Motion
- **Routing:** React Router v7
- **State:** React Context API
- **Icons:** Lucide React
- **Auth:** Mock authentication (role-based)
- **Data:** Local mock data (brandData.ts)

---

## 🚀 Getting Started

1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/login`
3. Click any quick login button OR enter credentials manually
4. Explore the catalog and brand showcases
5. Add products to cart and test checkout flow

---

## 📝 Implementation Status

✅ Brand-focused UI with La Molienda & Marinela
✅ Rotating brand carousel with rack bundles
✅ Visual category grid navigation
✅ Enhanced product cards with animations
✅ Weekly specials grid
✅ Tablet & mobile optimization
✅ Role-based authentication
✅ Shopping cart with floating widget
✅ Responsive design (mobile/tablet/desktop)

⚠️ Pending (requires backend):
- Invoice uploader functionality
- Real-time inventory updates
- Payment processing
- Order history persistence

---

## 🎯 Next Steps

1. Test on actual tablets (iPad, Android tablets)
2. Add more brand products (expand catalog)
3. Implement bundle builder for mobile
4. Add product search & filtering
5. Integrate with real backend API
6. Add payment gateway integration
7. Implement order tracking system

---

**Last Updated:** 2025-11-11
**Version:** 2.0.0 - Revolutionary UI Overhaul
