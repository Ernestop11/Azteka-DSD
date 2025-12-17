# Design Studio - Professional Editor Suite

## Overview

The Design Studio is a comprehensive suite of professional editing tools for managing your Azteka DSD catalog visuals. It provides real-time preview, drag-and-drop functionality, and preset management for all visual elements.

## Access

Navigate to: **`/admin/design-studio`**

## Features

### 1. Product Editor Pro
**Location**: Design Studio → Product Editor Tab

**Features**:
- ✅ **Live Preview**: See changes in real-time as you edit
- ✅ **Split-Panel Design**: Editor on left, preview on right
- ✅ **4 Editing Tabs**:
  - **Basic Info**: Name, SKU, price, description, category, brand
  - **Visuals**: Colors, gradients, effects, badges
  - **Pricing**: Base price, case pricing, quantity discounts
  - **Advanced**: Tags, visibility, featured status

**Visual Controls**:
- 8 Gradient Presets (Ocean, Sunset, Fire, Forest, Sky, Grape, Peach, Mint)
- Auto-category styling (automatically applies brand colors based on category)
- Gloss levels (None, Soft, Premium)
- Sparkle effect toggle
- Badge customization (NEW, HOT, LIMITED, SALE)
- Custom gradient CSS editor
- Color picker for backgrounds

**How to Use**:
1. Select a product from the dropdown or create a new one
2. Use the tabs to edit different aspects
3. Preview updates in real-time on the right panel
4. Click "Apply Auto-Category Style" for quick preset application
5. Save when satisfied with the design

---

### 2. Bundle Editor Pro
**Location**: Design Studio → Bundle Editor Tab

**Features**:
- ✅ **Product Search & Selection**: Find and add products to bundles
- ✅ **Drag-to-Reorder**: Organize products in your preferred order
- ✅ **Auto-Calculated Pricing**: Automatic total calculation with discount percentage
- ✅ **Live Savings Display**: Shows customer savings in real-time
- ✅ **Badge Customization**: Create eye-catching bundle badges
- ✅ **Image Upload**: Add custom bundle images
- ✅ **Discount Slider**: 0-50% with quick preset buttons (10%, 15%, 20%, 25%)

**How to Use**:
1. Enter bundle name and description
2. Search for products and click "Add to Bundle"
3. Adjust quantities using the number inputs
4. Use the discount slider to set bundle pricing
5. Customize badge text and color
6. Upload a bundle image (optional)
7. Save the bundle

**Pricing Calculation**:
- Total Value = Sum of (Product Price × Quantity)
- Discount Amount = Total Value × (Discount % / 100)
- Final Price = Total Value - Discount Amount

---

### 3. Image Editor Pro
**Location**: Design Studio → Image Tools Tab

**Features**:
- ✅ **Drag & Drop Upload**: Intuitive image uploading
- ✅ **Rotation Controls**: 0-360° with quick presets (0°, 90°, 180°, 270°)
- ✅ **Zoom**: 50%-300% zoom range
- ✅ **Brightness**: 0-200% adjustment
- ✅ **Contrast**: 0-200% adjustment
- ✅ **Saturation**: 0-200% adjustment
- ✅ **Crop Presets**: Square, 4:3, 16:9, 3:2
- ✅ **Real-time Canvas Preview**: See changes instantly
- ✅ **Download**: Export edited images

**Supported Formats**: PNG, JPG, GIF up to 10MB

**How to Use**:
1. Click upload area or drag an image
2. Use sliders to adjust rotation, zoom, and filters
3. Enter crop mode for aspect ratio cropping
4. Click "Apply" to save changes
5. Download the edited image

---

### 4. Gradient Editor Pro
**Location**: Design Studio → Gradient Editor Tab

**Features**:
- ✅ **Multi-Stop Gradients**: Create complex gradients with unlimited color stops
- ✅ **Linear & Radial**: Support for both gradient types
- ✅ **Angle Control**: 0-360° with quick presets
- ✅ **Live Preview**: See gradients on product cards, bundles, and hero banners
- ✅ **CSS Export**: Copy gradient CSS to clipboard
- ✅ **Save Custom Gradients**: Save your favorites for later use
- ✅ **10 Built-in Presets**: Ocean, Sunset, Fire, Forest, Sky, Grape, Peach, Mint, Royal, Candy

**Preview Modes**:
- Product Card Preview
- Bundle Card Preview
- Hero Banner Preview

**How to Use**:
1. Choose gradient type (Linear or Radial)
2. Adjust angle (for linear gradients)
3. Add/remove color stops with the slider
4. Use preset gradients for quick starts
5. Preview on different card types
6. Copy CSS or save for later

**Gradient CSS Format**:
```css
linear-gradient(135deg, #667eea 0%, #764ba2 100%)
radial-gradient(circle, #667eea 0%, #764ba2 100%)
```

---

### 5. Preset Library Pro
**Location**: Design Studio → Preset Library Tab

**Features**:
- ✅ **Visual Preset Storage**: Save complete visual configurations
- ✅ **Search & Filter**: Find presets by name, type, or favorites
- ✅ **Type Categories**: Product, Bundle, Hero, Promo
- ✅ **Favorites System**: Star your most-used presets
- ✅ **Duplicate**: Create variations of existing presets
- ✅ **Import/Export**: Share presets between environments
- ✅ **Live Preview**: See how presets look before applying

**Preset Properties**:
- Background color/gradient
- Text color
- Badge color and text
- Gloss level
- Sparkle effect
- Border radius
- Shadow style

**How to Use**:
1. Browse presets by category (All, Products, Bundles, Heroes, Promos)
2. Search by name or badge text
3. Click star icon to favorite
4. Click "Use" to apply to current product/bundle
5. Click "Duplicate" to create variations
6. Export presets as JSON for backup
7. Import presets from JSON files

**Import/Export**:
- Export: Saves all presets to JSON file
- Import: Loads presets from JSON file
- File format: `azteka-presets-{timestamp}.json`

---

### 6. Catalog Layout Builder
**Location**: Design Studio → Layout Builder Tab

**Features**:
- ✅ **Drag & Drop Sections**: Reorder sections visually
- ✅ **7 Section Types**: Hero, Brands, Categories, Products, Bundles, Promo, Custom
- ✅ **Show/Hide Sections**: Toggle visibility without deleting
- ✅ **Layout Configurations**: Grid, Carousel, or Row layouts
- ✅ **Column Control**: 2-6 columns for grid layouts
- ✅ **Background Customization**: Colors and gradients per section
- ✅ **Height Control**: Adjust hero and promo section heights
- ✅ **Live Preview**: See layout structure in real-time

**Section Types**:

1. **Hero Banner**
   - Purpose: Main visual banner at top of page
   - Config: Height (100-600px), background color/gradient
   - Use for: Promotions, seasonal themes, announcements

2. **Brand Showcase**
   - Purpose: Display brand logos
   - Config: Layout (grid/carousel/row), columns, items per page
   - Use for: Featured brands, brand navigation

3. **Categories**
   - Purpose: Category navigation cards
   - Config: Layout, columns, items per page
   - Use for: Product category browsing

4. **Product Grid**
   - Purpose: Main product display
   - Config: Layout, columns, items per page, show filters toggle
   - Use for: Primary product catalog

5. **Bundle Section**
   - Purpose: Showcase bundle deals
   - Config: Layout, columns, featured flag
   - Use for: Promotional bundles, special offers

6. **Promotional Banner**
   - Purpose: Call-to-action banners
   - Config: Height, background color/gradient
   - Use for: Sales, limited offers, announcements

7. **Custom Section**
   - Purpose: Flexible content area
   - Config: Layout, columns
   - Use for: Special content, seasonal sections

**How to Use**:
1. Click section type in left panel to add
2. Use up/down arrows to reorder sections
3. Click eye icon to show/hide sections
4. Click settings icon to configure section
5. Click duplicate icon to copy sections
6. Click trash icon to delete sections
7. Click "Save Layout" to persist changes
8. Use "Preview Mode" to see final result

**Configuration Options**:
- **Title**: Section display name
- **Layout**: Grid, Carousel, or Row
- **Columns**: Number of columns (2-6)
- **Background Color**: Hex color picker
- **Height**: Pixel height for hero/promo sections
- **Show Filters**: Toggle for product sections

---

## Integration with Existing Admin

The Design Studio complements the existing admin pages:

### Product Management
- **Old Flow**: `/admin/products` → Basic product editing
- **New Flow**: `/admin/design-studio` → Professional visual editing
- **Use both**:
  - `/admin/products` for bulk management, quick edits, data-focused tasks
  - `/admin/design-studio` for visual styling, branding, creative work

### Bundle Management
- **Old Flow**: `/admin/bundles` → Basic bundle creation
- **New Flow**: `/admin/design-studio` → Bundle Editor Pro with live preview
- **Use both**:
  - `/admin/bundles` for quick bundle creation
  - `/admin/design-studio` for styled, promotional bundles

---

## Best Practices

### 1. Product Styling
✅ **Do**:
- Use auto-category styling as a starting point
- Apply consistent gradient styles within categories
- Use sparkle effect sparingly (featured products only)
- Test gloss levels on different backgrounds

❌ **Don't**:
- Mix too many gradient styles in one category
- Overuse sparkle effects (reduces impact)
- Use low-contrast text colors

### 2. Bundle Creation
✅ **Do**:
- Keep discount percentages realistic (10-25%)
- Use clear, action-oriented badge text
- Add custom images for premium bundles
- Calculate total value accurately

❌ **Don't**:
- Offer excessive discounts (>30% without approval)
- Use generic bundle names
- Skip the bundle description

### 3. Image Editing
✅ **Do**:
- Maintain consistent image sizes (400x400px recommended)
- Use square or 4:3 aspect ratios
- Adjust brightness for consistency
- Save originals before editing

❌ **Don't**:
- Over-saturate product images
- Use extreme rotations
- Export at very high zoom levels

### 4. Gradient Design
✅ **Do**:
- Use 2-3 color stops maximum
- Test gradients on all preview types
- Save successful gradients as presets
- Use angle presets (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)

❌ **Don't**:
- Create jarring color combinations
- Use too many color stops
- Ignore preview feedback

### 5. Preset Management
✅ **Do**:
- Name presets descriptively
- Organize by type (product, bundle, hero, promo)
- Export presets regularly for backup
- Favorite frequently-used presets

❌ **Don't**:
- Create duplicate presets
- Delete built-in presets
- Skip the export process

### 6. Layout Building
✅ **Do**:
- Start with default layout
- Test visibility before deleting sections
- Use consistent section ordering
- Save layout before making major changes

❌ **Don't**:
- Hide all sections (page will be empty)
- Use too many sections (performance impact)
- Skip section titles

---

## Keyboard Shortcuts

### Global
- `Ctrl/Cmd + S` - Save current editor
- `Esc` - Close modal/cancel edit
- `Tab` - Next field
- `Shift + Tab` - Previous field

### Image Editor
- `R` - Rotate 90° clockwise
- `Shift + R` - Rotate 90° counter-clockwise
- `+` / `-` - Zoom in/out
- `0` - Reset zoom
- `C` - Toggle crop mode

### Gradient Editor
- `Arrow Up/Down` - Adjust angle ±15°
- `Shift + Arrow Up/Down` - Adjust angle ±45°
- `A` - Add color stop
- `Delete` - Remove selected stop

---

## Troubleshooting

### Issue: Changes not saving
**Solution**:
- Check for unsaved changes indicator
- Ensure required fields are filled
- Check browser console for errors
- Try refreshing the page

### Issue: Live preview not updating
**Solution**:
- Check if preview mode is enabled
- Refresh the editor
- Clear browser cache
- Check for JavaScript errors

### Issue: Images not uploading
**Solution**:
- Verify file size (<10MB)
- Check file format (PNG, JPG, GIF only)
- Ensure proper permissions
- Check network connectivity

### Issue: Presets not loading
**Solution**:
- Check localStorage (may be full)
- Clear browser cache
- Re-import presets from backup
- Check browser console

### Issue: Layout builder not saving
**Solution**:
- Click "Save Layout" button
- Check localStorage quota
- Export layout as backup
- Refresh and try again

---

## Tips & Tricks

### Speed Up Your Workflow
1. **Use Presets**: Create presets for common styles
2. **Duplicate**: Use duplicate feature instead of creating from scratch
3. **Keyboard Shortcuts**: Learn and use shortcuts
4. **Favorites**: Star frequently-used presets
5. **Export/Import**: Share presets between projects

### Create Consistent Designs
1. **Category Colors**: Stick to category-based color schemes
2. **Gradient Library**: Use same gradients across similar products
3. **Badge Standards**: Standardize badge colors and text
4. **Layout Template**: Create and stick to a layout template
5. **Preset System**: Build a comprehensive preset library

### Optimize Performance
1. **Image Sizes**: Keep images under 500KB
2. **Section Count**: Use 4-6 sections max
3. **Gradient Complexity**: Limit to 3 color stops
4. **Preview Mode**: Exit preview when not needed
5. **Save Regularly**: Save changes frequently

---

## API Integration

The Design Studio integrates with these API endpoints:

### Products
- `GET /api/admin/products` - List products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products` - Update product
- `DELETE /api/admin/products` - Delete product

### Bundles
- `GET /api/admin/bundles` - List bundles
- `POST /api/admin/bundles` - Create bundle
- `PUT /api/admin/bundles` - Update bundle
- `DELETE /api/admin/bundles` - Delete bundle

### Categories
- `GET /api/admin/categories` - List categories

### Brands
- `GET /api/admin/brands` - List brands

### Images
- `POST /api/admin/products/uploadImage` - Upload product image
- `POST /api/admin/bundles/uploadImage` - Upload bundle image

### Presets (localStorage)
- Stored locally in browser
- Export/import via JSON files
- No server-side storage currently

### Layout (localStorage)
- Stored locally in browser
- Can be synced to server via custom API endpoint

---

## Future Enhancements

### Planned Features
- [ ] Real-time collaboration
- [ ] Version history and rollback
- [ ] Advanced image filters (blur, sharpen, etc.)
- [ ] Video upload support
- [ ] A/B testing for layouts
- [ ] Mobile-specific layout builder
- [ ] Animation presets
- [ ] AI-powered gradient suggestions
- [ ] Bulk product styling
- [ ] Template marketplace

### API Enhancements
- [ ] Server-side preset storage
- [ ] Cloud image processing
- [ ] Layout versioning API
- [ ] Analytics integration
- [ ] Automated backups

---

## Support

For issues, questions, or feature requests:
1. Check this guide first
2. Review troubleshooting section
3. Check browser console for errors
4. Contact development team

---

**Last Updated**: November 22, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
