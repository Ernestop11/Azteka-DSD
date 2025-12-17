/**
 * Bundle Pricing and Discount Calculation Utilities
 * 
 * Provides helpers for calculating bundle discounts, savings,
 * and formatting price displays for the catalog UI.
 */

export interface BundlePricing {
  originalPrice: number;
  bundlePrice: number;
  savings: number;
  savingsPercent: number;
}

export interface DiscountCalculation {
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  discountPercent: number;
}

export interface PriceBadge {
  type: 'savings' | 'discount' | 'new' | 'hot';
  label: string;
  color: 'green' | 'red' | 'blue' | 'orange';
  value?: string;
}

/**
 * Calculate the savings amount from bundle pricing
 */
export const calculateBundleDiscount = (
  originalPrice: number,
  bundlePrice: number
): number => {
  if (originalPrice <= 0 || bundlePrice < 0) {
    return 0;
  }
  return Math.max(0, originalPrice - bundlePrice);
};

/**
 * Calculate savings between two prices
 */
export const calculateSavings = (
  originalPrice: number,
  discountPrice: number
): number => {
  if (originalPrice <= 0 || discountPrice < 0) {
    return 0;
  }
  return Math.max(0, originalPrice - discountPrice);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscountPercent = (
  originalPrice: number,
  discountPrice: number
): number => {
  if (originalPrice <= 0) {
    return 0;
  }
  const savings = calculateSavings(originalPrice, discountPrice);
  return Math.round((savings / originalPrice) * 100);
};

/**
 * Get complete bundle pricing breakdown
 */
export const getBundlePricing = (
  originalPrice: number,
  bundlePrice: number
): BundlePricing => {
  const savings = calculateBundleDiscount(originalPrice, bundlePrice);
  const savingsPercent = calculateDiscountPercent(originalPrice, bundlePrice);
  
  return {
    originalPrice,
    bundlePrice,
    savings,
    savingsPercent,
  };
};

/**
 * Get complete discount calculation
 */
export const getDiscountCalculation = (
  originalPrice: number,
  discountedPrice: number
): DiscountCalculation => {
  const discount = calculateSavings(originalPrice, discountedPrice);
  const discountPercent = calculateDiscountPercent(originalPrice, discountedPrice);
  
  return {
    originalPrice,
    discountedPrice,
    discount,
    discountPercent,
  };
};

/**
 * Format price to USD currency
 */
export const formatPrice = (price: number): string => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format savings amount
 */
export const formatSavings = (savings: number): string => {
  if (savings <= 0) {
    return '';
  }
  return `Save ${formatPrice(savings)}`;
};

/**
 * Format discount percentage
 */
export const formatDiscountPercent = (percent: number): string => {
  if (percent <= 0) {
    return '';
  }
  return `${percent}% OFF`;
};

/**
 * Get savings badge for UI display
 */
export const getSavingsBadge = (savingsPercent: number): PriceBadge | null => {
  if (savingsPercent < 5) {
    return null;
  }
  
  return {
    type: 'savings',
    label: `${savingsPercent}% OFF`,
    color: 'green',
    value: `${savingsPercent}`,
  };
};

/**
 * Get discount badge for UI display
 */
export const getDiscountBadge = (savings: number): PriceBadge | null => {
  if (savings <= 0) {
    return null;
  }
  
  return {
    type: 'discount',
    label: `Save ${formatPrice(savings)}`,
    color: 'red',
    value: formatPrice(savings),
  };
};

/**
 * Check if product has significant savings (>= 10%)
 */
export const hasSignificantSavings = (
  originalPrice: number,
  discountPrice: number
): boolean => {
  const percent = calculateDiscountPercent(originalPrice, discountPrice);
  return percent >= 10;
};

/**
 * Calculate price per unit
 */
export const calculatePricePerUnit = (
  totalPrice: number,
  quantity: number,
  unitType: string = 'unit'
): string => {
  if (quantity <= 0) {
    return '';
  }
  const pricePerUnit = totalPrice / quantity;
  return `${formatPrice(pricePerUnit)}/${unitType}`;
};

/**
 * Calculate bundle value (price per item in bundle)
 */
export const calculateBundleValue = (
  bundlePrice: number,
  itemCount: number
): string => {
  if (itemCount <= 0) {
    return formatPrice(bundlePrice);
  }
  const pricePerItem = bundlePrice / itemCount;
  return `${formatPrice(pricePerItem)} each`;
};

/**
 * Compare two prices and return the better deal
 */
export const comparePrices = (
  priceA: number,
  priceB: number
): 'A' | 'B' | 'equal' => {
  if (priceA < priceB) return 'A';
  if (priceB < priceA) return 'B';
  return 'equal';
};

/**
 * Calculate total price with tax
 */
export const calculateTotalWithTax = (
  subtotal: number,
  taxRate: number = 0.08
): { subtotal: number; tax: number; total: number } => {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return {
    subtotal,
    tax,
    total,
  };
};

/**
 * Format price breakdown for display
 */
export const formatPriceBreakdown = (
  subtotal: number,
  taxRate: number = 0.08
): {
  subtotal: string;
  tax: string;
  taxRate: string;
  total: string;
} => {
  const breakdown = calculateTotalWithTax(subtotal, taxRate);
  
  return {
    subtotal: formatPrice(breakdown.subtotal),
    tax: formatPrice(breakdown.tax),
    taxRate: `${Math.round(taxRate * 100)}%`,
    total: formatPrice(breakdown.total),
  };
};

/**
 * Check if bundle pricing is better than individual pricing
 */
export const isBundleBetterDeal = (
  individualPrice: number,
  bundlePrice: number,
  quantity: number,
  minSavingsPercent: number = 5
): boolean => {
  const totalIndividualPrice = individualPrice * quantity;
  const savingsPercent = calculateDiscountPercent(totalIndividualPrice, bundlePrice);
  return savingsPercent >= minSavingsPercent;
};

/**
 * Get recommended badge based on savings
 */
export const getRecommendedBadge = (
  originalPrice: number,
  discountPrice: number
): PriceBadge | null => {
  const savingsPercent = calculateDiscountPercent(originalPrice, discountPrice);
  
  if (savingsPercent >= 30) {
    return {
      type: 'hot',
      label: 'HOT DEAL',
      color: 'orange',
      value: `${savingsPercent}% OFF`,
    };
  }
  
  if (savingsPercent >= 15) {
    return {
      type: 'savings',
      label: 'GREAT VALUE',
      color: 'green',
      value: `${savingsPercent}% OFF`,
    };
  }
  
  if (savingsPercent >= 5) {
    return {
      type: 'discount',
      label: 'SAVE NOW',
      color: 'blue',
      value: `${savingsPercent}% OFF`,
    };
  }
  
  return null;
};

/**
 * Calculate quantity discount tiers
 */
export interface QuantityTier {
  minQuantity: number;
  maxQuantity?: number;
  pricePerUnit: number;
  discount: number;
  discountPercent: number;
}

export const calculateQuantityTiers = (
  basePrice: number,
  tiers: Array<{ quantity: number; discount: number }>
): QuantityTier[] => {
  return tiers.map((tier, index) => {
    const discountedPrice = basePrice - tier.discount;
    const discountPercent = calculateDiscountPercent(basePrice, discountedPrice);
    
    return {
      minQuantity: tier.quantity,
      maxQuantity: tiers[index + 1]?.quantity,
      pricePerUnit: discountedPrice,
      discount: tier.discount,
      discountPercent,
    };
  });
};

/**
 * Format compact price (e.g., $1.2K, $45.6K)
 */
export const formatCompactPrice = (price: number): string => {
  if (price < 1000) {
    return formatPrice(price);
  }
  
  if (price < 1000000) {
    const thousands = (price / 1000).toFixed(1);
    return `$${thousands}K`;
  }
  
  const millions = (price / 1000000).toFixed(1);
  return `$${millions}M`;
};

/**
 * Calculate and format bundle summary
 */
export const getBundleSummary = (
  originalPrice: number,
  bundlePrice: number,
  itemCount: number
): {
  originalTotal: string;
  bundleTotal: string;
  savings: string;
  savingsPercent: string;
  pricePerItem: string;
  badge: PriceBadge | null;
} => {
  const pricing = getBundlePricing(originalPrice, bundlePrice);
  
  return {
    originalTotal: formatPrice(originalPrice),
    bundleTotal: formatPrice(bundlePrice),
    savings: formatSavings(pricing.savings),
    savingsPercent: formatDiscountPercent(pricing.savingsPercent),
    pricePerItem: calculateBundleValue(bundlePrice, itemCount),
    badge: getSavingsBadge(pricing.savingsPercent),
  };
};
