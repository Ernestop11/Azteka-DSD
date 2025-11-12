# Fix ProductCard White Page - VS Code Prompt

## 🚨 PROMPT: Fix ProductCard White Page Issue

Copy this into VS Code Claude chat:

---

```
I have a white page issue. AppTest works (shows "Success! Got 5 products") but AppMinimal shows white screen.

The difference:
- AppTest: Shows products as plain text (works ✅)
- AppMinimal: Uses ProductCard component (white screen ❌)

This means ProductCard is crashing or has an error.

Please:
1. Check ProductCard.tsx for errors
2. Check what properties ProductCard expects:
   - Does it need image_url? (API returns imageUrl)
   - Does it need background_color? (API returns backgroundColor)
   - Does it need in_stock? (API returns inStock)
   - What other snake_case properties does it need?

3. Check AppMinimal.tsx transformation:
   - Is it transforming camelCase → snake_case correctly?
   - Are all required properties present?
   - Are there any undefined values?

4. Add error boundary around ProductCard:
   - Catch any errors from ProductCard
   - Show error message instead of white screen
   - Log error to console

5. Create a fallback version:
   - If ProductCard fails, show simple product card
   - Use basic HTML/CSS
   - Still show product info

6. Test with console.log:
   - Log each product before passing to ProductCard
   - Log what ProductCard receives
   - Log any errors

The app is at: /Users/ernestoponce/dev/azteka-dsd
ProductCard is at: src/components/ProductCard.tsx
AppMinimal is at: src/AppMinimal.tsx

Fix ProductCard to handle missing properties gracefully and prevent white screen!
```

---

## 🔧 Alternative: Create Simple Product Card

If ProductCard is too complex, create a simpler version:

```
Create SimpleProductCard.tsx that:
- Takes same props as ProductCard
- Uses basic HTML/CSS (no complex gradients)
- Handles missing properties gracefully
- Shows: image, name, price, "Add to Cart" button
- Works even if some properties are missing

Then update AppMinimal to use SimpleProductCard instead of ProductCard.

This will get the catalog working immediately, then we can enhance ProductCard later.
```

---

## 🎯 Quick Fix: Add Error Boundary

Add this to AppMinimal.tsx to catch ProductCard errors:

```typescript
// Wrap ProductCard in try-catch
{products.map((product, index) => {
  try {
    return (
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={handleAddToCart}
      />
    );
  } catch (error) {
    console.error('ProductCard error:', error, product);
    return (
      <div key={product.id} className="p-4 border rounded">
        <h3>{product.name}</h3>
        <p>${product.price}</p>
        <p className="text-red-500">Error rendering card</p>
      </div>
    );
  }
})}
```

This will show which product is causing the error!

