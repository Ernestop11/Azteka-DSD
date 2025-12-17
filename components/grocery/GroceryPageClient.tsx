'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, ArrowLeft, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react';

interface GroceryProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  weekendPrice: number | null;
  isWeekendSpecial: boolean;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  inStock: boolean;
  stock?: number | null;
  unit?: string | null;
  displayOrder: number;
}

interface GroceryPageClientProps {
  products: GroceryProduct[];
  weekendSpecials: GroceryProduct[];
}

export default function GroceryPageClient({
  products,
  weekendSpecials,
}: GroceryPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSpecialIndex, setCurrentSpecialIndex] = useState(0);
  const [cart, setCart] = useState<Map<string, number>>(new Map());

  // Auto-rotate weekend specials carousel
  useEffect(() => {
    if (weekendSpecials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSpecialIndex((prev) => (prev + 1) % weekendSpecials.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [weekendSpecials.length]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(['all']);
    products.forEach((p) => {
      if (p.category?.name) cats.add(p.category.name);
    });
    return Array.from(cats);
  }, [products]);

  // Filter items by category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category?.name === selectedCategory);
  }, [products, selectedCategory]);

  // Get cart quantity for an item
  const getCartQuantity = (itemId: string) => {
    return cart.get(itemId) || 0;
  };

  // Handle add to cart
  const handleAddToCart = (product: GroceryProduct) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      const current = newCart.get(product.id) || 0;
      newCart.set(product.id, current + 1);
      return newCart;
    });
  };

  // Handle increment quantity
  const handleIncrement = (itemId: string, currentQuantity: number) => {
    setCart((prev) => {
      const newCart = new Map(prev);
      newCart.set(itemId, currentQuantity + 1);
      return newCart;
    });
  };

  // Handle decrement quantity
  const handleDecrement = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 0) {
      setCart((prev) => {
        const newCart = new Map(prev);
        newCart.set(itemId, currentQuantity - 1);
        return newCart;
      });
    }
  };

  // Calculate cart total
  const cartTotal = useMemo(() => {
    let total = 0;
    cart.forEach((qty, productId) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        const price = product.isWeekendSpecial && product.weekendPrice
          ? product.weekendPrice
          : product.price;
        total += price * qty;
      }
    });
    return total;
  }, [cart, products]);

  const totalItems = useMemo(() => {
    let total = 0;
    cart.forEach((qty) => {
      total += qty;
    });
    return total;
  }, [cart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-700 border-b border-white/20 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white transition"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm">Back to Menu</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  🛒 Azteka Foods - Grocery Store
                </h1>
                <p className="text-white/60 text-sm">Fresh Produce & Pantry Staples</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {totalItems > 0 && (
                <button
                  onClick={() => {/* Navigate to checkout */}}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-full text-gray-900 font-bold transition shadow-lg flex items-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>{totalItems} items • ${cartTotal.toFixed(2)}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekend Specials Carousel - EXACT ALESSA LAYOUT */}
      {weekendSpecials.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-3xl overflow-hidden shadow-2xl">
            <div className="relative h-96 md:h-[500px]">
              {weekendSpecials.map((special, index) => {
                const savings = special.price - (special.weekendPrice || special.price);
                const savingsPercent = Math.round((savings / special.price) * 100);
                const quantity = getCartQuantity(special.id);

                return (
                  <div
                    key={special.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      index === currentSpecialIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="grid md:grid-cols-2 gap-8 h-full p-8 md:p-12">
                      {/* Image Side */}
                      <div className="flex items-center justify-center">
                        {special.imageUrl ? (
                          <img
                            src={special.imageUrl}
                            alt={special.name}
                            className="w-full h-full max-h-80 md:max-h-96 object-contain drop-shadow-2xl"
                          />
                        ) : (
                          <div className="w-full h-80 flex items-center justify-center bg-white/20 rounded-2xl">
                            <ShoppingCart className="h-32 w-32 text-white/40" />
                          </div>
                        )}
                      </div>

                      {/* Content Side */}
                      <div className="flex flex-col justify-center text-white">
                        <div className="inline-block">
                          <span className="bg-white text-red-600 text-sm md:text-base font-black px-4 py-2 rounded-full mb-4 inline-block animate-pulse">
                            🌟 WEEKEND SPECIAL
                          </span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
                          {special.name}
                        </h2>

                        <p className="text-xl md:text-2xl mb-6 text-white/90 font-medium">
                          {special.description || 'Special offer'}
                        </p>

                        {/* Pricing */}
                        <div className="flex items-center gap-6 mb-8">
                          <div>
                            <p className="text-lg text-white/70 line-through">
                              ${special.price.toFixed(2)}
                              {special.unit && ` / ${special.unit}`}
                            </p>
                            <p className="text-5xl md:text-7xl font-black text-white drop-shadow-lg">
                              ${(special.weekendPrice || special.price).toFixed(2)}
                              {special.unit && <span className="text-3xl md:text-4xl ml-2">/ {special.unit}</span>}
                            </p>
                          </div>
                          {savingsPercent > 0 && (
                            <div className="bg-white text-red-600 px-6 py-3 rounded-2xl">
                              <p className="text-3xl md:text-4xl font-black">
                                -{savingsPercent}%
                              </p>
                              <p className="text-sm font-bold">SAVE</p>
                            </div>
                          )}
                        </div>

                        {/* Add to Cart */}
                        {quantity === 0 ? (
                          <button
                            onClick={() => handleAddToCart(special)}
                            className="bg-white text-gray-900 px-8 py-5 rounded-2xl text-xl md:text-2xl font-black hover:bg-gray-100 transition shadow-2xl flex items-center justify-center gap-3 max-w-md"
                          >
                            <Plus className="h-7 w-7" />
                            ADD TO CART
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 max-w-md">
                            <button
                              onClick={() => handleDecrement(special.id, quantity)}
                              className="flex-1 bg-white text-red-600 font-black py-4 px-6 rounded-xl transition shadow-lg hover:bg-gray-100"
                            >
                              <Minus className="h-6 w-6 mx-auto" />
                            </button>
                            <div className="flex-1 bg-white/20 border-4 border-white text-white font-black py-4 px-6 rounded-xl text-center text-3xl backdrop-blur">
                              {quantity}
                            </div>
                            <button
                              onClick={() => handleIncrement(special.id, quantity)}
                              className="flex-1 bg-white text-green-600 font-black py-4 px-6 rounded-xl transition shadow-lg hover:bg-gray-100"
                            >
                              <Plus className="h-6 w-6 mx-auto" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            {weekendSpecials.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentSpecialIndex((prev) => (prev - 1 + weekendSpecials.length) % weekendSpecials.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur text-white p-3 rounded-full transition"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={() => setCurrentSpecialIndex((prev) => (prev + 1) % weekendSpecials.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur text-white p-3 rounded-full transition"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {weekendSpecials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSpecialIndex(index)}
                      className={`w-3 h-3 rounded-full transition ${
                        index === currentSpecialIndex
                          ? 'bg-white scale-125'
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Cross-promotion banner - EXACT ALESSA STYLE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/catalog"
          className="block bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-6 text-white hover:shadow-2xl transition group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">🌮 Don&apos;t forget to order food!</h3>
              <p className="text-white/90">Browse our authentic Mexican menu - your groceries ship together with your meal</p>
            </div>
            <ArrowLeft className="h-8 w-8 rotate-180 group-hover:translate-x-2 transition" />
          </div>
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-[88px] z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 py-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid - EXACT ALESSA STYLE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">🥬 Individual Grocery Items</h2>
          <p className="text-white/70">Fresh ingredients and specialty products</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => {
            const cartQty = getCartQuantity(product.id);
            const displayPrice = product.isWeekendSpecial && product.weekendPrice
              ? product.weekendPrice
              : product.price;

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                <div className="relative aspect-square">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">🛒</span>
                    </div>
                  )}
                  {product.isWeekendSpecial && (
                    <div className="absolute top-2 right-2 bg-yellow-400 px-3 py-1 rounded-full">
                      <span className="text-xs font-bold text-gray-900">🌟 WEEKEND SPECIAL</span>
                    </div>
                  )}
                  {product.stock !== null && product.stock > 0 && product.stock < 10 && (
                    <div className="absolute bottom-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Only {product.stock} left!
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.description || 'Grocery item'}
                  </p>
                  <div className="flex items-baseline gap-2 mb-4">
                    {product.isWeekendSpecial && product.weekendPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {product.unit && (
                      <span className="text-sm text-gray-500">/ {product.unit}</span>
                    )}
                  </div>
                  {cartQty === 0 ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition"
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDecrement(product.id, cartQty)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold py-2 rounded-lg transition flex items-center justify-center"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="font-bold text-lg w-12 text-center">{cartQty}</span>
                      <button
                        onClick={() => handleIncrement(product.id, cartQty)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
