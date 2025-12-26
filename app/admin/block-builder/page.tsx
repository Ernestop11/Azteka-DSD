'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { CartBlocksBuilder, RewardsBuilder, CategoryBuilder, BrandBuilder } from '@/components/admin/builders'

// Main Tabs for Block Builder
type MainTab = 'catalog' | 'cart' | 'rewards' | 'categories' | 'brands'

const MAIN_TABS: { id: MainTab; name: string; icon: string; description: string }[] = [
  { id: 'catalog', name: 'Catalog', icon: '📦', description: 'Build catalog page layout' },
  { id: 'cart', name: 'Cart', icon: '🛒', description: 'Customize cart upsells & blocks' },
  { id: 'rewards', name: 'Rewards', icon: '🏆', description: 'Trade-offs, tiers & prizes' },
  { id: 'categories', name: 'Categories', icon: '📂', description: 'Category page layouts' },
  { id: 'brands', name: 'Brands', icon: '🏷️', description: 'Brand showcase pages' },
]

// Types
interface Product {
  id: string
  name: string
  sku: string
  price: number
  imageUrl: string | null
  brand?: { id: string; name: string } | null
  category?: { id: string; name: string } | null
}

interface Category {
  id: string
  name: string
  slug: string
}

interface CatalogBlock {
  id: string
  type: 'HERO' | 'PRODUCT_GRID' | 'PRODUCT_CARDS' | 'BANNER' | 'CATEGORY_ROW' | 'PROMO_SECTION' | 'RACK_BUNDLE' | 'VENDOR_SPOTLIGHT' | 'CASE_DEAL' | 'NEW_ARRIVALS' | 'QUICK_REORDER' | 'BULK_BUILDER' | 'SEASONAL_THEME' | 'BRAND_SHOWCASE' | 'CHARACTER_STAGE'
  title: string | null
  subtitle: string | null
  badgeText: string | null
  ctaText: string | null
  ctaLink: string | null
  config: Record<string, unknown>
  position: number
  active: boolean
  products: { id: string; productId: string; displayOrder: number; product: Product }[]
}

interface CatalogSettings {
  id?: string
  backgroundGradient: string
  backgroundPattern: string | null
  patternOpacity: number
  patternSize: string | null
  primaryColor: string
  secondaryColor: string
  animation: string | null
  glowEffect: boolean
  particleEffect: string | null
}

// Hero gradient presets (for individual blocks)
const HERO_GRADIENT_PRESETS = [
  { id: 'mexican', name: 'Mexican Tricolor', value: 'linear-gradient(135deg, #006341 0%, #006341 33%, #ffffff 33%, #ffffff 66%, #ce1126 66%, #ce1126 100%)' },
  { id: 'sunset', name: 'Desert Sunset', value: 'linear-gradient(135deg, #1a472a 0%, #d97706 50%, #dc2626 100%)' },
  { id: 'ocean', name: 'Ocean', value: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #075985 100%)' },
  { id: 'berry', name: 'Berry', value: 'linear-gradient(135deg, #701a75 0%, #a21caf 50%, #c026d3 100%)' },
  { id: 'forest', name: 'Forest', value: 'linear-gradient(135deg, #0f3d0f 0%, #166534 50%, #15803d 100%)' },
  { id: 'fire', name: 'Fire', value: 'linear-gradient(135deg, #b91c1c 0%, #f97316 50%, #fbbf24 100%)' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%)' },
  { id: 'tropical', name: 'Tropical', value: 'linear-gradient(135deg, #f59e0b 0%, #10b981 50%, #06b6d4 100%)' },
]

// Page background gradient presets
const PAGE_GRADIENT_PRESETS = [
  { id: 'forest', name: 'Forest Green', value: 'linear-gradient(180deg, #0f3d0f 0%, #1a4d1a 50%, #0d2e0d 100%)' },
  { id: 'emerald', name: 'Emerald', value: 'linear-gradient(180deg, #064e3b 0%, #059669 50%, #047857 100%)' },
  { id: 'ocean', name: 'Ocean Blue', value: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 50%, #075985 100%)' },
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #fb923c 100%)' },
  { id: 'berry', name: 'Berry', value: 'linear-gradient(180deg, #701a75 0%, #a21caf 50%, #c026d3 100%)' },
  { id: 'midnight', name: 'Midnight', value: 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)' },
  { id: 'warmBlack', name: 'Warm Black', value: 'linear-gradient(180deg, #1c1917 0%, #292524 50%, #1c1917 100%)' },
  { id: 'slate', name: 'Slate', value: 'linear-gradient(180deg, #1e293b 0%, #334155 50%, #1e293b 100%)' },
]

// Mexico 98 Jersey Inspired Patterns - Aztec & Geometric
const PATTERN_PRESETS = [
  { id: 'none', name: 'None', value: null, size: null, preview: '⬜' },
  {
    id: 'aztec-zigzag',
    name: 'Aztec Zigzag',
    value: `repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.08) 10px, rgba(255,255,255,0.08) 20px), repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
    size: '40px 40px',
    preview: '⚡'
  },
  {
    id: 'aztec-diamonds',
    name: 'Aztec Diamonds',
    value: `linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)`,
    size: '30px 30px',
    preview: '◆'
  },
  {
    id: 'mexico98-stripes',
    name: 'Mexico 98 Stripes',
    value: `repeating-linear-gradient(90deg, rgba(0,99,65,0.15), rgba(0,99,65,0.15) 2px, transparent 2px, transparent 20px, rgba(206,17,38,0.15) 20px, rgba(206,17,38,0.15) 22px, transparent 22px, transparent 40px)`,
    size: '40px 100%',
    preview: '🇲🇽'
  },
  {
    id: 'quetzal-feathers',
    name: 'Quetzal Feathers',
    value: `radial-gradient(ellipse at 0% 50%, rgba(0,200,100,0.1) 0%, transparent 50%), radial-gradient(ellipse at 100% 50%, rgba(0,200,100,0.1) 0%, transparent 50%), repeating-linear-gradient(0deg, transparent, transparent 15px, rgba(255,215,0,0.08) 15px, rgba(255,215,0,0.08) 17px)`,
    size: '60px 30px',
    preview: '🦅'
  },
  {
    id: 'serpent-scales',
    name: 'Serpent Scales',
    value: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 50%, transparent 50%), radial-gradient(circle at 0% 50%, rgba(255,255,255,0.08) 50%, transparent 50%), radial-gradient(circle at 100% 50%, rgba(255,255,255,0.08) 50%, transparent 50%)`,
    size: '24px 24px',
    preview: '🐍'
  },
  {
    id: 'sun-stone',
    name: 'Sun Stone',
    value: `repeating-radial-gradient(circle at center, rgba(255,215,0,0.05) 0px, rgba(255,215,0,0.05) 2px, transparent 2px, transparent 20px, rgba(255,215,0,0.03) 20px, rgba(255,215,0,0.03) 22px, transparent 22px, transparent 40px)`,
    size: '80px 80px',
    preview: '☀️'
  },
  {
    id: 'pyramid-steps',
    name: 'Pyramid Steps',
    value: `repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255,255,255,0.06) 8px, rgba(255,255,255,0.06) 16px), repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 16px)`,
    size: '32px 32px',
    preview: '🏛️'
  },
  {
    id: 'tribal-waves',
    name: 'Tribal Waves',
    value: `repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,150,100,0.1) 5px, rgba(0,150,100,0.1) 10px, transparent 10px, transparent 15px, rgba(200,50,50,0.1) 15px, rgba(200,50,50,0.1) 20px)`,
    size: '40px 40px',
    preview: '〰️'
  },
  // New Aztec/Mexican Patterns
  {
    id: 'quetzalcoatl-spiral',
    name: 'Quetzalcoatl Spiral',
    value: `repeating-radial-gradient(circle at 50% 50%, transparent 0px, transparent 10px, rgba(255,215,0,0.06) 10px, rgba(255,215,0,0.06) 12px, transparent 12px, transparent 22px), repeating-radial-gradient(circle at 25% 25%, rgba(0,200,100,0.05) 0px, rgba(0,200,100,0.05) 5px, transparent 5px, transparent 15px)`,
    size: '60px 60px',
    preview: '🌀'
  },
  {
    id: 'maya-glyphs',
    name: 'Maya Glyphs',
    value: `linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(45deg, transparent 40%, rgba(255,215,0,0.06) 40%, rgba(255,215,0,0.06) 60%, transparent 60%)`,
    size: '40px 40px',
    preview: '🔷'
  },
  {
    id: 'stars-scattered',
    name: 'Scattered Stars',
    value: `radial-gradient(circle at 15% 25%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.15) 2px, transparent 2px), radial-gradient(circle at 85% 75%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.12) 2px, transparent 2px), radial-gradient(circle at 45% 60%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.1) 1px, transparent 1px), radial-gradient(circle at 70% 20%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.14) 2px, transparent 2px), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.08) 1px, transparent 1px)`,
    size: '100px 100px',
    preview: '✨'
  },
  {
    id: 'flourish-vines',
    name: 'Flourish Vines',
    value: `repeating-linear-gradient(60deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 21px), repeating-linear-gradient(-60deg, transparent, transparent 20px, rgba(255,255,255,0.04) 20px, rgba(255,255,255,0.04) 21px), radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 30%)`,
    size: '50px 50px',
    preview: '🌿'
  },
  {
    id: 'eagle-warrior',
    name: 'Eagle Warrior',
    value: `linear-gradient(135deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(225deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(315deg, rgba(0,0,0,0.1) 25%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(255,215,0,0.08) 0%, transparent 40%)`,
    size: '40px 40px',
    preview: '🦅'
  },
  {
    id: 'teotihuacan-grid',
    name: 'Teotihuacan Grid',
    value: `linear-gradient(rgba(255,255,255,0.06) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.06) 2px, transparent 2px), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
    size: '50px 50px, 50px 50px, 10px 10px, 10px 10px',
    preview: '📐'
  },
  {
    id: 'obsidian-sparkle',
    name: 'Obsidian Sparkle',
    value: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.2) 0%, transparent 1%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.18) 0%, transparent 1%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 1%), radial-gradient(circle at 20% 70%, rgba(255,255,255,0.12) 0%, transparent 1%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.16) 0%, transparent 1%), radial-gradient(circle at 35% 35%, rgba(255,255,255,0.1) 0%, transparent 1%)`,
    size: '80px 80px',
    preview: '💎'
  },
  {
    id: 'jade-circles',
    name: 'Jade Circles',
    value: `radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,200,100,0.08) 40%, rgba(0,200,100,0.08) 50%, transparent 50%), radial-gradient(circle at 0% 0%, transparent 40%, rgba(0,200,100,0.06) 40%, rgba(0,200,100,0.06) 50%, transparent 50%), radial-gradient(circle at 100% 100%, transparent 40%, rgba(0,200,100,0.06) 40%, rgba(0,200,100,0.06) 50%, transparent 50%)`,
    size: '60px 60px',
    preview: '🟢'
  },
  {
    id: 'gold-filigree',
    name: 'Gold Filigree',
    value: `repeating-linear-gradient(45deg, rgba(255,215,0,0.04) 0px, rgba(255,215,0,0.04) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(-45deg, rgba(255,215,0,0.04) 0px, rgba(255,215,0,0.04) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(0deg, rgba(255,215,0,0.03) 0px, rgba(255,215,0,0.03) 1px, transparent 1px, transparent 20px)`,
    size: '30px 30px',
    preview: '✴️'
  },
  {
    id: 'aztec-calendar',
    name: 'Aztec Calendar',
    value: `repeating-radial-gradient(circle at center, rgba(255,215,0,0.06) 0px, rgba(255,215,0,0.06) 3px, transparent 3px, transparent 8px, rgba(255,255,255,0.04) 8px, rgba(255,255,255,0.04) 10px, transparent 10px, transparent 20px), linear-gradient(0deg, rgba(255,255,255,0.02) 50%, transparent 50%)`,
    size: '100px 100px',
    preview: '🗓️'
  },
  {
    id: 'starburst-glow',
    name: 'Starburst Glow',
    value: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 25%), repeating-conic-gradient(from 0deg, rgba(255,255,255,0.05) 0deg 15deg, transparent 15deg 30deg)`,
    size: '80px 80px',
    preview: '💫'
  },
  {
    id: 'feathered-serpent',
    name: 'Feathered Serpent',
    value: `repeating-linear-gradient(45deg, transparent 0px, transparent 20px, rgba(0,200,100,0.06) 20px, rgba(0,200,100,0.06) 22px, transparent 22px, transparent 40px, rgba(255,0,0,0.04) 40px, rgba(255,0,0,0.04) 42px), repeating-linear-gradient(-45deg, transparent 0px, transparent 20px, rgba(255,215,0,0.05) 20px, rgba(255,215,0,0.05) 22px)`,
    size: '60px 60px',
    preview: '🐉'
  },
  // Mariachi Silver String Patterns - High Sparkle
  {
    id: 'mariachi-silver-strings',
    name: '🎸 Mariachi Silver',
    value: `repeating-linear-gradient(90deg, transparent 0px, transparent 8px, rgba(255,255,255,0.35) 8px, rgba(255,255,255,0.35) 9px, transparent 9px, transparent 20px), repeating-linear-gradient(0deg, transparent 0px, transparent 30px, rgba(192,192,192,0.25) 30px, rgba(192,192,192,0.25) 31px, transparent 31px, transparent 60px), radial-gradient(circle at 20% 50%, rgba(255,255,255,0.4) 0%, transparent 3%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.35) 0%, transparent 2%), radial-gradient(circle at 50% 70%, rgba(255,255,255,0.3) 0%, transparent 2%)`,
    size: '60px 60px',
    preview: '🎸'
  },
  {
    id: 'silver-sparkle-intense',
    name: '✨ Silver Sparkle',
    value: `radial-gradient(circle at 10% 20%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 2px, transparent 2px), radial-gradient(circle at 90% 10%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.45) 3px, transparent 3px), radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) 2px, transparent 2px), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.5) 2px, transparent 2px), radial-gradient(circle at 50% 40%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.55) 3px, transparent 3px), radial-gradient(circle at 85% 55%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.35) 2px, transparent 2px), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.4) 2px, transparent 2px), radial-gradient(circle at 60% 15%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.45) 2px, transparent 2px)`,
    size: '120px 120px',
    preview: '✨'
  },
  {
    id: 'charro-embroidery',
    name: '🪡 Charro Gold',
    value: `repeating-linear-gradient(45deg, transparent 0px, transparent 15px, rgba(255,215,0,0.3) 15px, rgba(255,215,0,0.3) 16px, transparent 16px, transparent 30px), repeating-linear-gradient(-45deg, transparent 0px, transparent 15px, rgba(255,215,0,0.25) 15px, rgba(255,215,0,0.25) 16px, transparent 16px, transparent 30px), radial-gradient(circle at 50% 50%, rgba(255,215,0,0.4) 0%, transparent 20%)`,
    size: '60px 60px',
    preview: '🪡'
  },
  {
    id: 'guitar-strings',
    name: '🎵 Guitar Strings',
    value: `repeating-linear-gradient(90deg, transparent 0px, transparent 12px, rgba(255,255,255,0.4) 12px, rgba(255,255,255,0.15) 13px, transparent 13px, transparent 25px), repeating-linear-gradient(90deg, transparent 0px, transparent 6px, rgba(192,192,192,0.3) 6px, rgba(192,192,192,0.1) 7px, transparent 7px, transparent 18px)`,
    size: '50px 100%',
    preview: '🎵'
  },
  {
    id: 'diamond-sparkle',
    name: '💎 Diamond Sparkle',
    value: `linear-gradient(45deg, rgba(255,255,255,0.4) 25%, transparent 25%), linear-gradient(-45deg, rgba(255,255,255,0.4) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.4) 75%), linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.4) 75%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.5) 0%, transparent 30%)`,
    size: '40px 40px',
    preview: '💎'
  },
  {
    id: 'fiesta-lights',
    name: '🎉 Fiesta Lights',
    value: `radial-gradient(circle at 20% 30%, rgba(255,0,0,0.4) 0%, transparent 15%), radial-gradient(circle at 50% 20%, rgba(0,255,0,0.35) 0%, transparent 12%), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.5) 0%, transparent 10%), radial-gradient(circle at 35% 70%, rgba(255,215,0,0.4) 0%, transparent 12%), radial-gradient(circle at 70% 75%, rgba(0,200,255,0.35) 0%, transparent 10%), radial-gradient(circle at 90% 85%, rgba(255,100,200,0.3) 0%, transparent 8%)`,
    size: '150px 150px',
    preview: '🎉'
  },
]

// Animation presets
const ANIMATION_PRESETS = [
  { id: 'none', name: 'None', value: null, description: 'No animation', icon: '⛔' },
  { id: 'pulse', name: 'Pulse Glow', value: 'pulse', description: 'Subtle breathing glow', icon: '💫' },
  { id: 'shimmer', name: 'Shimmer', value: 'shimmer', description: 'Light sweep effect', icon: '✨' },
  { id: 'gradient-shift', name: 'Color Flow', value: 'gradient-shift', description: 'Slowly shifting colors', icon: '🌊' },
  { id: 'aurora', name: 'Aurora', value: 'aurora', description: 'Northern lights wave', icon: '🌌' },
]

// Product Card Style Presets - Showcase Styles with Glow
const CARD_STYLE_PRESETS = [
  { id: 'dark-red', name: 'Dark Red', cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)', borderColor: '#334155', accentColor: '#ef4444', glowColor: '#ef4444', textLight: true, icon: '🔴' },
  { id: 'dark-emerald', name: 'Dark Emerald', cardBg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', imageBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', borderColor: '#10b981', accentColor: '#10b981', glowColor: '#10b981', textLight: true, icon: '🟢' },
  { id: 'dark-gold', name: 'Dark Gold', cardBg: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)', imageBg: 'linear-gradient(180deg, #292524 0%, #1c1917 100%)', borderColor: '#d97706', accentColor: '#f59e0b', glowColor: '#fbbf24', textLight: true, icon: '🟡' },
  { id: 'dark-purple', name: 'Dark Purple', cardBg: 'linear-gradient(180deg, #1e1b4b 0%, #0f0d22 100%)', imageBg: 'linear-gradient(180deg, #312e81 0%, #1e1b4b 100%)', borderColor: '#7c3aed', accentColor: '#8b5cf6', glowColor: '#a78bfa', textLight: true, icon: '🟣' },
  { id: 'clean-white', name: 'Clean White', cardBg: '#ffffff', imageBg: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)', borderColor: '#e2e8f0', accentColor: '#ef4444', glowColor: '#ef4444', textLight: false, icon: '⬜' },
  { id: 'aztec-jade', name: 'Aztec Jade', cardBg: 'linear-gradient(180deg, #064e3b 0%, #065f46 100%)', imageBg: 'linear-gradient(180deg, #022c22 0%, #064e3b 100%)', borderColor: '#10b981', accentColor: '#fbbf24', glowColor: '#fbbf24', textLight: true, icon: '🌿' },
  { id: 'fiesta-red', name: 'Fiesta Red', cardBg: 'linear-gradient(180deg, #7f1d1d 0%, #991b1b 100%)', imageBg: 'linear-gradient(180deg, #450a0a 0%, #7f1d1d 100%)', borderColor: '#f87171', accentColor: '#fbbf24', glowColor: '#fbbf24', textLight: true, icon: '❤️' },
  { id: 'ocean-blue', name: 'Ocean Blue', cardBg: 'linear-gradient(180deg, #0c4a6e 0%, #075985 100%)', imageBg: 'linear-gradient(180deg, #082f49 0%, #0c4a6e 100%)', borderColor: '#0ea5e9', accentColor: '#0ea5e9', glowColor: '#38bdf8', textLight: true, icon: '💙' },
]

// Card Image Effect Presets - WOW Effects!
const CARD_IMAGE_EFFECTS = [
  { id: 'none', name: 'None', value: '', icon: '⬜' },
  { id: 'soft-shadow', name: 'Soft Shadow', value: 'drop-shadow(0 10px 20px rgba(0,0,0,0.15))', icon: '🌫️' },
  { id: 'strong-shadow', name: 'Strong Shadow', value: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))', icon: '⬛' },
  { id: 'glow-white', name: 'White Glow', value: 'drop-shadow(0 0 20px rgba(255,255,255,0.5))', icon: '✨' },
  { id: 'glow-gold', name: 'Gold Glow', value: 'drop-shadow(0 0 20px rgba(255,215,0,0.4))', icon: '🌟' },
  { id: 'glow-emerald', name: 'Emerald Glow', value: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))', icon: '💚' },
  { id: 'float-3d', name: '3D Float', value: 'drop-shadow(0 25px 25px rgba(0,0,0,0.25)) drop-shadow(0 5px 10px rgba(0,0,0,0.1))', icon: '🎯' },
  // WOW Effects
  { id: 'neon-red', name: 'Neon Red', value: 'drop-shadow(0 0 10px rgba(239,68,68,0.8)) drop-shadow(0 0 30px rgba(239,68,68,0.5)) drop-shadow(0 0 50px rgba(239,68,68,0.3))', icon: '🔴' },
  { id: 'neon-blue', name: 'Neon Blue', value: 'drop-shadow(0 0 10px rgba(59,130,246,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 0 50px rgba(59,130,246,0.3))', icon: '🔵' },
  { id: 'neon-purple', name: 'Neon Purple', value: 'drop-shadow(0 0 10px rgba(139,92,246,0.8)) drop-shadow(0 0 30px rgba(139,92,246,0.5)) drop-shadow(0 0 50px rgba(139,92,246,0.3))', icon: '🟣' },
  { id: 'fire', name: 'Fire', value: 'drop-shadow(0 0 15px rgba(251,146,60,0.9)) drop-shadow(0 0 30px rgba(239,68,68,0.6)) drop-shadow(0 5px 20px rgba(234,179,8,0.4))', icon: '🔥' },
  { id: 'ice', name: 'Ice', value: 'drop-shadow(0 0 15px rgba(147,197,253,0.8)) drop-shadow(0 0 30px rgba(59,130,246,0.5)) drop-shadow(0 5px 20px rgba(255,255,255,0.4))', icon: '❄️' },
  { id: 'electric', name: 'Electric', value: 'drop-shadow(0 0 8px rgba(250,204,21,1)) drop-shadow(0 0 20px rgba(234,179,8,0.8)) drop-shadow(0 0 40px rgba(251,191,36,0.5))', icon: '⚡' },
  { id: 'premium', name: 'Premium Gold', value: 'drop-shadow(0 0 15px rgba(251,191,36,0.9)) drop-shadow(0 10px 30px rgba(180,83,9,0.6)) drop-shadow(0 5px 15px rgba(255,215,0,0.4))', icon: '👑' },
  { id: 'hologram', name: 'Hologram', value: 'drop-shadow(-5px 0 15px rgba(239,68,68,0.5)) drop-shadow(5px 0 15px rgba(59,130,246,0.5)) drop-shadow(0 0 20px rgba(16,185,129,0.4))', icon: '🌈' },
  { id: 'mega-3d', name: 'Mega 3D', value: 'drop-shadow(0 35px 35px rgba(0,0,0,0.4)) drop-shadow(0 15px 15px rgba(0,0,0,0.2)) drop-shadow(0 5px 5px rgba(0,0,0,0.1))', icon: '🚀' },
  { id: 'spotlight', name: 'Spotlight', value: 'drop-shadow(0 0 40px rgba(255,255,255,0.8)) drop-shadow(0 20px 40px rgba(0,0,0,0.5))', icon: '💡' },
]

// Block type configs - DSD Wholesale focused
const BLOCK_TYPES = [
  // Core blocks
  { type: 'HERO', name: 'Hero Banner', icon: '🎯', description: 'Large promotional banner', category: 'core' },
  { type: 'PRODUCT_GRID', name: 'Product Grid', icon: '📦', description: 'Grid of product cards', category: 'core' },
  { type: 'PRODUCT_CARDS', name: 'Product Cards', icon: '🃏', description: 'Horizontal card row', category: 'core' },
  { type: 'BANNER', name: 'Banner', icon: '📢', description: 'Promotional banner strip', category: 'core' },
  { type: 'CATEGORY_ROW', name: 'Category Row', icon: '📂', description: 'Category navigation', category: 'core' },
  { type: 'PROMO_SECTION', name: 'Promo Section', icon: '🎁', description: 'Special offers section', category: 'core' },
  // DSD Wholesale blocks
  { type: 'RACK_BUNDLE', name: 'Rack Display Bundle', icon: '🗄️', description: 'Rack image + products, one-click order all', category: 'dsd' },
  { type: 'VENDOR_SPOTLIGHT', name: 'Vendor Spotlight', icon: '⭐', description: 'Featured vendor with logo + best sellers', category: 'dsd' },
  { type: 'CASE_DEAL', name: 'Case Deal', icon: '📦', description: 'Buy X cases get Y% off deal', category: 'dsd' },
  { type: 'NEW_ARRIVALS', name: 'New Arrivals', icon: '🆕', description: 'Latest products with "NEW" badges', category: 'dsd' },
  { type: 'QUICK_REORDER', name: 'Quick Reorder', icon: '🔄', description: 'Customer\'s frequent purchases', category: 'dsd' },
  { type: 'BULK_BUILDER', name: 'Bulk Builder', icon: '🏗️', description: 'Mix & match cases with volume pricing', category: 'dsd' },
  { type: 'SEASONAL_THEME', name: 'Seasonal Theme', icon: '🎄', description: 'Holiday/seasonal themed section', category: 'dsd' },
  { type: 'BRAND_SHOWCASE', name: 'Brand Showcase', icon: '🏷️', description: 'Brand logo banner + product carousel', category: 'dsd' },
  // Creative/Visual blocks
  { type: 'CHARACTER_STAGE', name: 'Character Stage', icon: '🎭', description: 'Character peeks behind products (Santa, mascots)', category: 'creative' },
]

// Block type categories for organization
const BLOCK_CATEGORIES = [
  { id: 'core', name: 'Core Blocks', description: 'Essential catalog building blocks' },
  { id: 'dsd', name: 'DSD Wholesale', description: 'Specialized blocks for wholesale/DSD' },
  { id: 'creative', name: 'Creative & Visual', description: 'Eye-catching visual effects & scenes' },
]

export default function BlockBuilderPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const previewRef = useRef<HTMLIFrameElement>(null)
  const [mainTab, setMainTab] = useState<MainTab>('catalog')
  const [selectedBlock, setSelectedBlock] = useState<CatalogBlock | null>(null)
  const [showAddBlock, setShowAddBlock] = useState(false)
  const [newBlockType, setNewBlockType] = useState<string>('PRODUCT_GRID')
  const [editingSettings, setEditingSettings] = useState(false)
  const [localSettings, setLocalSettings] = useState<Partial<CatalogSettings>>({})
  const [showLivePreview, setShowLivePreview] = useState(true)
  const [settingsTab, setSettingsTab] = useState<'gradient' | 'pattern' | 'effects'>('gradient')
  const [previewKey, setPreviewKey] = useState(0)

  // Fetch blocks
  const { data: blocks = [], isLoading: blocksLoading } = useQuery<CatalogBlock[]>({
    queryKey: ['catalog-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/blocks')
      const json = await res.json()
      return json.data || []
    },
  })

  // Keep selectedBlock in sync with latest data from query
  useEffect(() => {
    if (selectedBlock && blocks.length > 0) {
      const updatedBlock = blocks.find(b => b.id === selectedBlock.id)
      if (updatedBlock && JSON.stringify(updatedBlock) !== JSON.stringify(selectedBlock)) {
        setSelectedBlock(updatedBlock)
      }
    }
  }, [blocks, selectedBlock])

  // Fetch settings
  const { data: settings } = useQuery<CatalogSettings>({
    queryKey: ['catalog-settings'],
    queryFn: async () => {
      const res = await fetch('/api/catalog/settings')
      const json = await res.json()
      return json.data
    },
  })

  // Fetch products for picker
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products-for-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/products?limit=500')
      const json = await res.json()
      return json.data || []
    },
  })

  // Fetch categories for product picker filter
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-blocks'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      const json = await res.json()
      return json.data || []
    },
  })

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Refresh live preview - force iframe reload
  const refreshPreview = useCallback(() => {
    setPreviewKey(prev => prev + 1)
  }, [])

  // Mutations with live preview refresh
  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<CatalogSettings>) => {
      const res = await fetch('/api/catalog/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      })
      if (!res.ok) throw new Error('Failed to save')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-settings'] })
      refreshPreview()
    },
  })

  const createBlockMutation = useMutation({
    mutationFn: async (data: { type: string; title: string; config: Record<string, unknown> }) => {
      const res = await fetch('/api/catalog/blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      setShowAddBlock(false)
      refreshPreview()
    },
  })

  const updateBlockMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: unknown }) => {
      const res = await fetch(`/api/catalog/blocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      refreshPreview()
    },
  })

  const deleteBlockMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/catalog/blocks/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      setSelectedBlock(null)
      refreshPreview()
    },
  })

  const reorderBlocksMutation = useMutation({
    mutationFn: async (blockIds: string[]) => {
      const res = await fetch('/api/catalog/blocks/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      refreshPreview()
    },
  })

  const addProductToBlockMutation = useMutation({
    mutationFn: async ({ blockId, productId }: { blockId: string; productId: string }) => {
      const res = await fetch(`/api/catalog/blocks/${blockId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      refreshPreview()
    },
  })

  const removeProductFromBlockMutation = useMutation({
    mutationFn: async ({ blockId, productId }: { blockId: string; productId: string }) => {
      const res = await fetch(`/api/catalog/blocks/${blockId}/products/${productId}`, {
        method: 'DELETE',
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-blocks'] })
      refreshPreview()
    },
  })

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const newOrder = [...blocks]
    const [moved] = newOrder.splice(index, 1)
    newOrder.splice(newIndex, 0, moved)

    reorderBlocksMutation.mutate(newOrder.map(b => b.id))
  }

  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position)

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header with Page Title */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Block Builder</h1>
            <p className="text-slate-400 text-sm mt-1">Design and customize your storefront pages</p>
          </div>
          {mainTab === 'catalog' && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditingSettings(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg flex items-center gap-2 transition-all shadow-lg font-medium"
              >
                <span>🎨</span> Design Studio
              </button>
              <button
                onClick={() => setShowAddBlock(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <span>➕</span> Add Block
              </button>
              <button
                onClick={() => setShowLivePreview(!showLivePreview)}
                className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-colors font-medium ${
                  showLivePreview ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <span>{showLivePreview ? '📺' : '👁️'}</span> {showLivePreview ? 'Hide Preview' : 'Preview'}
              </button>
              <a
                href="/catalog"
                target="_blank"
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center gap-2 transition-colors font-medium"
              >
                <span>🔗</span> Open Catalog
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="bg-slate-900/50 border-b border-slate-800">
        <div className="flex gap-1 px-4 py-2">
          {MAIN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMainTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all font-medium ${
                mainTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {mainTab === 'catalog' && (
      <div className="flex">
        {/* Block List Sidebar */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 min-h-[calc(100vh-73px)] p-4">
          <h2 className="text-lg font-semibold mb-4 text-slate-200">Blocks</h2>

          {blocksLoading ? (
            <div className="text-slate-400">Loading...</div>
          ) : sortedBlocks.length === 0 ? (
            <div className="text-slate-400 text-center py-8">
              <p>No blocks yet</p>
              <button
                onClick={() => setShowAddBlock(true)}
                className="mt-2 text-blue-400 hover:text-blue-300"
              >
                Add your first block
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedBlock?.id === block.id
                      ? 'bg-blue-600 ring-2 ring-blue-400'
                      : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedBlock(block)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{BLOCK_TYPES.find(t => t.type === block.type)?.icon || '📦'}</span>
                      <span className="font-medium text-sm">{block.title || block.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'up') }}
                        disabled={index === 0}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); moveBlock(index, 'down') }}
                        disabled={index === sortedBlocks.length - 1}
                        className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 text-xs"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {block.products.length} products
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Editor Area */}
        <div className={`flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)] ${showLivePreview ? 'w-1/2' : ''}`}>
          {selectedBlock ? (
            <BlockEditor
              block={selectedBlock}
              products={products}
              categories={categories}
              onUpdate={(data) => updateBlockMutation.mutate({ id: selectedBlock.id, ...data })}
              onDelete={() => deleteBlockMutation.mutate(selectedBlock.id)}
              onAddProduct={(productId) => addProductToBlockMutation.mutate({ blockId: selectedBlock.id, productId })}
              onRemoveProduct={(productId) => removeProductFromBlockMutation.mutate({ blockId: selectedBlock.id, productId })}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-xl mb-2">Select a block to edit</p>
                <p className="text-sm">Or add a new block to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {showLivePreview && (
          <div className="w-1/2 bg-slate-950 border-l border-slate-800 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-slate-300">Live Preview</h3>
              <button
                onClick={refreshPreview}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs font-medium"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-slate-900 h-[calc(100vh-160px)] ring-1 ring-slate-800">
              <iframe
                key={previewKey}
                ref={previewRef}
                src="/catalog"
                className="w-full h-full border-0"
                title="Catalog Preview"
              />
            </div>
          </div>
        )}
      </div>
      )}

      {/* Cart Tab */}
      {mainTab === 'cart' && (
        <div className="p-6">
          <CartBlocksBuilder products={products} />
        </div>
      )}

      {/* Rewards Tab */}
      {mainTab === 'rewards' && (
        <div className="p-6">
          <RewardsBuilder products={products} />
        </div>
      )}

      {/* Categories Tab */}
      {mainTab === 'categories' && (
        <div className="p-6">
          <CategoryBuilder />
        </div>
      )}

      {/* Brands Tab */}
      {mainTab === 'brands' && (
        <div className="p-6">
          <BrandBuilder />
        </div>
      )}

      {/* Add Block Modal - Enhanced with Categories */}
      {showAddBlock && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddBlock(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl ring-1 ring-slate-800" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Add New Block</h2>
                  <p className="text-slate-400 text-sm mt-1">Choose a block type to add to your catalog</p>
                </div>
                <button onClick={() => setShowAddBlock(false)} className="text-slate-400 hover:text-white text-2xl p-2 hover:bg-slate-700 rounded-xl transition-colors">×</button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              {BLOCK_CATEGORIES.map((category) => (
                <div key={category.id} className="mb-6 last:mb-0">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-lg text-white">{category.name}</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{category.description}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {BLOCK_TYPES.filter(t => t.category === category.id).map((type) => (
                      <button
                        key={type.type}
                        onClick={() => setNewBlockType(type.type)}
                        className={`p-4 rounded-xl text-left transition-all border-2 ${
                          newBlockType === type.type
                            ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-400/50'
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{type.icon}</span>
                          <span className="font-semibold text-sm">{type.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{type.description}</p>
                        {type.category === 'dsd' && (
                          <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded-full">
                            DSD Feature
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected Block Preview */}
              {newBlockType && (
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{BLOCK_TYPES.find(t => t.type === newBlockType)?.icon}</span>
                    <div>
                      <p className="font-bold text-white">{BLOCK_TYPES.find(t => t.type === newBlockType)?.name}</p>
                      <p className="text-sm text-slate-400">{BLOCK_TYPES.find(t => t.type === newBlockType)?.description}</p>
                    </div>
                  </div>
                  {/* DSD Block specific info */}
                  {['RACK_BUNDLE', 'VENDOR_SPOTLIGHT', 'CASE_DEAL', 'BULK_BUILDER'].includes(newBlockType) && (
                    <div className="mt-3 p-3 bg-emerald-900/20 border border-emerald-800/50 rounded-lg">
                      <p className="text-emerald-300 text-xs flex items-center gap-2">
                        <span>💡</span>
                        {newBlockType === 'RACK_BUNDLE' && 'Upload a rack photo, add products, customers can order all items with one click'}
                        {newBlockType === 'VENDOR_SPOTLIGHT' && 'Feature a vendor with their logo and top-selling products'}
                        {newBlockType === 'CASE_DEAL' && 'Set up volume discounts: Buy X cases, get Y% off'}
                        {newBlockType === 'BULK_BUILDER' && 'Let customers mix & match products to build custom cases'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-800 px-6 py-4 border-t border-slate-700 flex gap-3">
              <button
                onClick={() => setShowAddBlock(false)}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const blockType = BLOCK_TYPES.find(t => t.type === newBlockType)
                  const defaultConfig: Record<string, unknown> = {}

                  // Set default configs based on block type
                  if (newBlockType === 'HERO') {
                    defaultConfig.gradient = HERO_GRADIENT_PRESETS[0].value
                  } else if (newBlockType === 'RACK_BUNDLE') {
                    defaultConfig.rackImageUrl = null
                    defaultConfig.bundleDiscount = 0
                    defaultConfig.showOneClickOrder = true
                    defaultConfig.backgroundColor = '#1a1a2e'
                  } else if (newBlockType === 'CASE_DEAL') {
                    defaultConfig.minCases = 3
                    defaultConfig.discountPercent = 10
                    defaultConfig.dealBadge = 'VOLUME DEAL'
                  } else if (newBlockType === 'BULK_BUILDER') {
                    defaultConfig.minItems = 6
                    defaultConfig.mixMatchDiscount = 5
                  } else if (newBlockType === 'VENDOR_SPOTLIGHT') {
                    defaultConfig.vendorLogoUrl = null
                    defaultConfig.vendorName = ''
                    defaultConfig.showTopSellers = true
                  } else if (newBlockType === 'BRAND_SHOWCASE') {
                    defaultConfig.brandLogoUrl = null
                    defaultConfig.brandColor = '#000000'
                    defaultConfig.carouselSpeed = 5000
                  }

                  createBlockMutation.mutate({
                    type: newBlockType,
                    title: blockType?.name || 'New Block',
                    config: defaultConfig,
                  })
                }}
                disabled={!newBlockType}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors font-bold flex items-center justify-center gap-2"
              >
                <span>➕</span> Create Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Design Studio Modal - Completely Redesigned */}
      {editingSettings && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl ring-1 ring-slate-700 flex flex-col">
            {/* Modal Header - Solid Background */}
            <div className="bg-slate-800 px-6 py-5 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
                    🎨
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Design Studio</h2>
                    <p className="text-slate-400 text-sm">Customize your catalog appearance</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSettings(false)}
                  className="text-slate-400 hover:text-white text-2xl p-2 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-slate-850 border-b border-slate-700">
              <div className="flex">
                {[
                  { id: 'gradient', label: 'Gradients', icon: '🌈', desc: 'Background colors' },
                  { id: 'pattern', label: 'Patterns', icon: '🔲', desc: 'Aztec overlays' },
                  { id: 'effects', label: 'Effects', icon: '✨', desc: 'Animations' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id as typeof settingsTab)}
                    className={`flex-1 px-6 py-4 text-center transition-all relative group ${
                      settingsTab === tab.id
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{tab.icon}</span>
                    <span className="font-semibold block">{tab.label}</span>
                    <span className="text-xs opacity-60 block">{tab.desc}</span>
                    {settingsTab === tab.id && (
                      <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-900">
              {/* Gradient Tab */}
              {settingsTab === 'gradient' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-4 text-white">Choose Background Gradient</label>
                    <div className="grid grid-cols-4 gap-4">
                      {PAGE_GRADIENT_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setLocalSettings({ ...localSettings, backgroundGradient: preset.value })}
                          className={`p-1 rounded-2xl transition-all ${
                            localSettings.backgroundGradient === preset.value
                              ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-105'
                              : 'hover:scale-102 hover:ring-2 hover:ring-slate-600'
                          }`}
                        >
                          <div
                            className="h-24 rounded-xl flex items-end justify-center pb-3 relative overflow-hidden"
                            style={{ background: preset.value }}
                          >
                            <span className="text-white text-sm font-semibold drop-shadow-lg bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <label className="block text-sm font-semibold mb-3 text-white">Custom Gradient CSS</label>
                    <textarea
                      value={localSettings.backgroundGradient || ''}
                      onChange={(e) => setLocalSettings({ ...localSettings, backgroundGradient: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                      placeholder="linear-gradient(180deg, #0f3d0f 0%, #1a4d1a 100%)"
                    />
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <label className="block text-sm font-semibold mb-4 text-white">Brand Colors</label>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-xs text-slate-400 mb-2 block font-medium">Primary Color</label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={localSettings.primaryColor || '#10b981'}
                            onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                            className="w-14 h-12 rounded-xl cursor-pointer border-2 border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={localSettings.primaryColor || '#10b981'}
                            onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-2 block font-medium">Secondary Color</label>
                        <div className="flex gap-3">
                          <input
                            type="color"
                            value={localSettings.secondaryColor || '#f59e0b'}
                            onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                            className="w-14 h-12 rounded-xl cursor-pointer border-2 border-slate-600 bg-transparent"
                          />
                          <input
                            type="text"
                            value={localSettings.secondaryColor || '#f59e0b'}
                            onChange={(e) => setLocalSettings({ ...localSettings, secondaryColor: e.target.value })}
                            className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Pattern Tab - Mexico 98 Inspired */}
              {settingsTab === 'pattern' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-800/50 rounded-xl p-4 mb-6">
                    <p className="text-emerald-300 text-sm flex items-center gap-2">
                      <span className="text-xl">🇲🇽</span>
                      <span>Mexico 98 World Cup inspired patterns - Aztec geometric designs</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-4 text-white">Select Pattern Overlay</label>
                    <div className="grid grid-cols-4 gap-4">
                      {PATTERN_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setLocalSettings({
                            ...localSettings,
                            backgroundPattern: preset.value,
                            patternSize: preset.size
                          })}
                          className={`rounded-2xl transition-all overflow-hidden ${
                            localSettings.backgroundPattern === preset.value
                              ? 'ring-3 ring-emerald-400 ring-offset-2 ring-offset-slate-900 scale-105'
                              : 'hover:scale-102 hover:ring-2 hover:ring-slate-600'
                          }`}
                        >
                          <div
                            className="h-28 relative flex flex-col items-center justify-center"
                            style={{ background: localSettings.backgroundGradient || PAGE_GRADIENT_PRESETS[0].value }}
                          >
                            {preset.value && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: preset.value,
                                  backgroundSize: preset.size || '100% 100%',
                                  opacity: 0.6,
                                }}
                              />
                            )}
                            <span className="text-3xl relative z-10 mb-1">{preset.preview}</span>
                            <span className="text-white text-xs font-semibold relative z-10 bg-black/40 px-2 py-0.5 rounded-full">
                              {preset.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <label className="block text-sm font-semibold mb-4 text-white">Pattern Intensity</label>
                    <div className="flex items-center gap-6">
                      <span className="text-slate-400 text-sm">Subtle</span>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        value={Math.round((localSettings.patternOpacity || 0.1) * 100)}
                        onChange={(e) => setLocalSettings({ ...localSettings, patternOpacity: parseInt(e.target.value) / 100 })}
                        className="flex-1 h-3 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-slate-400 text-sm">MAX</span>
                      <span className="text-white font-bold text-lg w-16 text-right">
                        {Math.round((localSettings.patternOpacity || 0.1) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Effects Tab */}
              {settingsTab === 'effects' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-4 text-white">Animation Effects</label>
                    <div className="grid grid-cols-2 gap-4">
                      {ANIMATION_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => setLocalSettings({ ...localSettings, animation: preset.value })}
                          className={`p-5 rounded-2xl text-left transition-all ${
                            localSettings.animation === preset.value
                              ? 'bg-emerald-900/50 ring-2 ring-emerald-400'
                              : 'bg-slate-800 hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <span className="text-4xl">{preset.icon}</span>
                            <div>
                              <p className="font-bold text-white text-lg">{preset.name}</p>
                              <p className="text-sm text-slate-400">{preset.description}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-xl p-5">
                    <label className="flex items-center gap-4 cursor-pointer group">
                      <div className={`w-14 h-8 rounded-full transition-all relative ${
                        localSettings.glowEffect ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}>
                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all ${
                          localSettings.glowEffect ? 'left-7' : 'left-1'
                        }`} />
                      </div>
                      <input
                        type="checkbox"
                        checked={localSettings.glowEffect || false}
                        onChange={(e) => setLocalSettings({ ...localSettings, glowEffect: e.target.checked })}
                        className="sr-only"
                      />
                      <div>
                        <span className="font-bold text-white text-lg block">Ambient Glow</span>
                        <p className="text-sm text-slate-400">Adds a soft glow effect to hero sections</p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4">
                    <p className="text-amber-300 text-sm flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <span>Effects are applied in real-time when you save. Check the live preview!</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Preview & Actions */}
            <div className="bg-slate-800 border-t border-slate-700 p-6">
              {/* Live Preview */}
              <div className="mb-5">
                <label className="block text-sm font-semibold mb-3 text-white">Preview</label>
                <div
                  className="h-36 rounded-xl relative overflow-hidden transition-all duration-500 ring-1 ring-slate-700"
                  style={{ background: localSettings.backgroundGradient || PAGE_GRADIENT_PRESETS[0].value }}
                >
                  {localSettings.backgroundPattern && (
                    <div
                      className="absolute inset-0 transition-opacity duration-500"
                      style={{
                        backgroundImage: localSettings.backgroundPattern,
                        backgroundSize: localSettings.patternSize || '40px 40px',
                        opacity: localSettings.patternOpacity || 0.1,
                      }}
                    />
                  )}
                  {localSettings.glowEffect && (
                    <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent animate-pulse" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-white font-black text-2xl drop-shadow-lg mb-1">Azteka DSD</h3>
                      <p className="text-white/70 text-sm">Your catalog preview</p>
                      {localSettings.animation && (
                        <span className="inline-block mt-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs">
                          {localSettings.animation} animation active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setLocalSettings(settings || {})
                    setEditingSettings(false)
                  }}
                  className="flex-1 px-6 py-3.5 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    saveSettingsMutation.mutate(localSettings)
                    setEditingSettings(false)
                  }}
                  disabled={saveSettingsMutation.isPending}
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {saveSettingsMutation.isPending ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving...
                    </>
                  ) : (
                    <>
                      <span>💾</span> Save & Apply
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Block Editor Component
function BlockEditor({
  block,
  products,
  categories,
  onUpdate,
  onDelete,
  onAddProduct,
  onRemoveProduct,
}: {
  block: CatalogBlock
  products: Product[]
  categories: Category[]
  onUpdate: (data: Partial<CatalogBlock>) => void
  onDelete: () => void
  onAddProduct: (productId: string) => void
  onRemoveProduct: (productId: string) => void
}) {
  const [title, setTitle] = useState(block.title || '')
  const [subtitle, setSubtitle] = useState(block.subtitle || '')
  const [badgeText, setBadgeText] = useState(block.badgeText || '')
  const [ctaText, setCtaText] = useState(block.ctaText || '')
  const [ctaLink, setCtaLink] = useState(block.ctaLink || '')
  const [showProductPicker, setShowProductPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [blockConfig, setBlockConfig] = useState<Record<string, unknown>>(block.config || {})

  useEffect(() => {
    setTitle(block.title || '')
    setSubtitle(block.subtitle || '')
    setBadgeText(block.badgeText || '')
    setCtaText(block.ctaText || '')
    setCtaLink(block.ctaLink || '')
    setBlockConfig(block.config || {})
  }, [block])

  const blockProductIds = new Set(block.products.map(p => p.productId))
  const availableProducts = products.filter(p => !blockProductIds.has(p.id))

  // Filter by category first, then by search term
  const categoryFilteredProducts = categoryFilter === 'all'
    ? availableProducts
    : availableProducts.filter(p => p.category?.id === categoryFilter)

  const filteredProducts = searchTerm
    ? categoryFilteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : categoryFilteredProducts

  const updateConfig = (key: string, value: unknown) => {
    const newConfig = { ...blockConfig, [key]: value }
    setBlockConfig(newConfig)
    onUpdate({ config: newConfig })
  }

  // Apply multiple config values at once (fixes preset selection bug)
  const applyPreset = (presetValues: Record<string, unknown>) => {
    const newConfig = { ...blockConfig, ...presetValues }
    setBlockConfig(newConfig)
    onUpdate({ config: newConfig })
  }

  return (
    <div className="space-y-6">
      {/* Block Header */}
      <div className="flex items-center justify-between bg-slate-800 rounded-xl p-4 ring-1 ring-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{BLOCK_TYPES.find(t => t.type === block.type)?.icon}</span>
          <div>
            <h2 className="text-xl font-bold">{block.title || block.type}</h2>
            <p className="text-slate-400 text-sm">{BLOCK_TYPES.find(t => t.type === block.type)?.description}</p>
          </div>
        </div>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm transition-colors font-medium"
        >
          Delete Block
        </button>
      </div>

      {/* Block Settings */}
      <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
        <h3 className="font-semibold mb-4 text-lg">Block Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => onUpdate({ title })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              onBlur={() => onUpdate({ subtitle })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Badge Text</label>
            <input
              type="text"
              value={badgeText}
              onChange={(e) => setBadgeText(e.target.value)}
              onBlur={() => onUpdate({ badgeText })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., WEEKEND SPECIAL"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">CTA Text</label>
            <input
              type="text"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
              onBlur={() => onUpdate({ ctaText })}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Shop Now"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-slate-400 mb-1.5">CTA Link</label>
          <input
            type="text"
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
            onBlur={() => onUpdate({ ctaLink })}
            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., /catalog/category/chips"
          />
        </div>
      </div>

      {/* Hero-specific gradient settings */}
      {block.type === 'HERO' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg">Hero Gradient</h3>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {HERO_GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => updateConfig('gradient', preset.value)}
                className={`p-1 rounded-xl transition-all ${
                  blockConfig.gradient === preset.value ? 'ring-2 ring-blue-400 scale-105' : 'hover:scale-102'
                }`}
              >
                <div
                  className="h-16 rounded-lg flex items-center justify-center"
                  style={{ background: preset.value }}
                >
                  <span className="text-white text-xs font-semibold drop-shadow-lg bg-black/30 px-2 py-0.5 rounded-full">{preset.name}</span>
                </div>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Custom Gradient</label>
            <input
              type="text"
              value={(blockConfig.gradient as string) || ''}
              onChange={(e) => updateConfig('gradient', e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
              placeholder="linear-gradient(135deg, #1a472a 0%, #d97706 100%)"
            />
          </div>
        </div>
      )}

      {/* Rack Bundle Settings */}
      {block.type === 'RACK_BUNDLE' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>🗄️</span> Rack Display Settings
          </h3>

          {/* Rack Image Upload */}
          <div className="mb-5">
            <label className="block text-sm text-slate-400 mb-2">Rack Display Photo</label>
            <div className="relative">
              {blockConfig.rackImageUrl ? (
                <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                  <img
                    src={blockConfig.rackImageUrl as string}
                    alt="Rack Display"
                    className="w-full h-48 object-contain"
                  />
                  <button
                    onClick={() => updateConfig('rackImageUrl', null)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-600 rounded-xl bg-slate-900/50 cursor-pointer hover:bg-slate-900 hover:border-slate-500 transition-all">
                  <span className="text-4xl mb-2">📸</span>
                  <span className="text-slate-400 text-sm">Click to upload rack photo</span>
                  <span className="text-slate-500 text-xs mt-1">PNG, JPG up to 5MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const formData = new FormData()
                      formData.append('image', file)
                      formData.append('type', 'rack')
                      try {
                        const res = await fetch('/api/admin/catalog/upload-image', {
                          method: 'POST',
                          body: formData,
                        })
                        const data = await res.json()
                        if (data.url) updateConfig('rackImageUrl', data.url)
                      } catch (err) {
                        console.error('Upload failed:', err)
                      }
                    }}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Bundle Settings */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Bundle Discount %</label>
              <input
                type="number"
                min="0"
                max="50"
                value={(blockConfig.bundleDiscount as number) || 0}
                onChange={(e) => updateConfig('bundleDiscount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
                placeholder="0"
              />
              <p className="text-xs text-slate-500 mt-1">Discount when ordering entire rack</p>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Background Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.backgroundColor as string) || '#1a1a2e'}
                  onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.backgroundColor as string) || '#1a1a2e'}
                  onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* One-Click Order Toggle */}
          <label className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
            <div className={`w-12 h-7 rounded-full transition-all relative ${blockConfig.showOneClickOrder ? 'bg-emerald-500' : 'bg-slate-600'}`}>
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-md transition-all ${blockConfig.showOneClickOrder ? 'left-6' : 'left-1'}`} />
            </div>
            <input
              type="checkbox"
              checked={(blockConfig.showOneClickOrder as boolean) ?? true}
              onChange={(e) => updateConfig('showOneClickOrder', e.target.checked)}
              className="sr-only"
            />
            <div>
              <span className="font-semibold text-white block">One-Click "Order All" Button</span>
              <p className="text-xs text-slate-400">Add all rack products to cart with one click</p>
            </div>
          </label>
        </div>
      )}

      {/* Case Deal Settings */}
      {block.type === 'CASE_DEAL' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>📦</span> Volume Deal Settings
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Min Cases</label>
              <input
                type="number"
                min="1"
                value={(blockConfig.minCases as number) || 3}
                onChange={(e) => updateConfig('minCases', parseInt(e.target.value) || 3)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Discount %</label>
              <input
                type="number"
                min="0"
                max="50"
                value={(blockConfig.discountPercent as number) || 10}
                onChange={(e) => updateConfig('discountPercent', parseInt(e.target.value) || 10)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Deal Badge</label>
              <input
                type="text"
                value={(blockConfig.dealBadge as string) || 'VOLUME DEAL'}
                onChange={(e) => updateConfig('dealBadge', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
          </div>
          <div className="p-4 bg-emerald-900/20 border border-emerald-800/50 rounded-xl">
            <p className="text-emerald-300 text-sm flex items-center gap-2">
              <span className="text-xl">💡</span>
              Buy {(blockConfig.minCases as number) || 3}+ cases, get {(blockConfig.discountPercent as number) || 10}% off
            </p>
          </div>
        </div>
      )}

      {/* Vendor Spotlight Settings */}
      {block.type === 'VENDOR_SPOTLIGHT' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>⭐</span> Vendor Spotlight Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Vendor Name</label>
              <input
                type="text"
                value={(blockConfig.vendorName as string) || ''}
                onChange={(e) => updateConfig('vendorName', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
                placeholder="e.g., Sabritas"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">Vendor Logo</label>
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <span>📤</span>
                <span className="text-sm">{blockConfig.vendorLogoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('image', file)
                    formData.append('type', 'vendor')
                    try {
                      const res = await fetch('/api/admin/catalog/upload-image', {
                        method: 'POST',
                        body: formData,
                      })
                      const data = await res.json()
                      if (data.url) updateConfig('vendorLogoUrl', data.url)
                    } catch (err) {
                      console.error('Upload failed:', err)
                    }
                  }}
                />
              </label>
            </div>
          </div>
          {blockConfig.vendorLogoUrl && (
            <div className="mb-4 p-3 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center">
              <img src={blockConfig.vendorLogoUrl as string} alt="Vendor Logo" className="h-16 object-contain" />
            </div>
          )}
          <label className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={(blockConfig.showTopSellers as boolean) ?? true}
              onChange={(e) => updateConfig('showTopSellers', e.target.checked)}
              className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-emerald-500"
            />
            <div>
              <span className="font-semibold text-white block">Show "Top Sellers" Badge</span>
              <p className="text-xs text-slate-400">Highlight best-selling products from this vendor</p>
            </div>
          </label>
        </div>
      )}

      {/* Bulk Builder Settings */}
      {block.type === 'BULK_BUILDER' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>🏗️</span> Mix & Match Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Min Items for Discount</label>
              <input
                type="number"
                min="2"
                value={(blockConfig.minItems as number) || 6}
                onChange={(e) => updateConfig('minItems', parseInt(e.target.value) || 6)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Mix & Match Discount %</label>
              <input
                type="number"
                min="0"
                max="30"
                value={(blockConfig.mixMatchDiscount as number) || 5}
                onChange={(e) => updateConfig('mixMatchDiscount', parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
              />
            </div>
          </div>
          <div className="p-4 bg-blue-900/20 border border-blue-800/50 rounded-xl">
            <p className="text-blue-300 text-sm flex items-center gap-2">
              <span className="text-xl">🔀</span>
              Mix & Match any {(blockConfig.minItems as number) || 6}+ items for {(blockConfig.mixMatchDiscount as number) || 5}% off
            </p>
          </div>
        </div>
      )}

      {/* Brand Showcase Settings */}
      {block.type === 'BRAND_SHOWCASE' && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>🏷️</span> Brand Showcase Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Brand Logo</label>
              <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                <span>📤</span>
                <span className="text-sm">{blockConfig.brandLogoUrl ? 'Change Logo' : 'Upload Logo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const formData = new FormData()
                    formData.append('image', file)
                    formData.append('type', 'brand')
                    try {
                      const res = await fetch('/api/admin/catalog/upload-image', {
                        method: 'POST',
                        body: formData,
                      })
                      const data = await res.json()
                      if (data.url) updateConfig('brandLogoUrl', data.url)
                    } catch (err) {
                      console.error('Upload failed:', err)
                    }
                  }}
                />
              </label>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Brand Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.brandColor as string) || '#000000'}
                  onChange={(e) => updateConfig('brandColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.brandColor as string) || '#000000'}
                  onChange={(e) => updateConfig('brandColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>
          {blockConfig.brandLogoUrl && (
            <div
              className="mb-4 p-4 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: (blockConfig.brandColor as string) || '#000000' }}
            >
              <img src={blockConfig.brandLogoUrl as string} alt="Brand Logo" className="h-16 object-contain" />
            </div>
          )}
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Carousel Speed (ms)</label>
            <input
              type="number"
              min="2000"
              max="10000"
              step="500"
              value={(blockConfig.carouselSpeed as number) || 5000}
              onChange={(e) => updateConfig('carouselSpeed', parseInt(e.target.value) || 5000)}
              className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Character Stage Settings */}
      {block.type === 'CHARACTER_STAGE' && (
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-5 ring-1 ring-purple-500/30">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>🎭</span> Character Stage Settings
          </h3>
          <p className="text-sm text-purple-300/80 mb-4">
            Create stunning scenes where characters appear behind your products - like Santa peeking through holiday snacks!
          </p>

          {/* Character/Scene Image Upload */}
          <div className="mb-5 p-4 bg-purple-900/30 rounded-xl border border-purple-500/30">
            <label className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <span>🎅</span> Character/Scene Image
            </label>
            <p className="text-xs text-purple-400/70 mb-3">Upload character images (Santa, mascots, holiday figures) that will appear BEHIND the products</p>
            {blockConfig.characterImageUrl ? (
              <div className="relative mb-3">
                <img
                  src={blockConfig.characterImageUrl as string}
                  alt="Character"
                  className="w-full h-48 object-contain rounded-lg bg-black/20"
                />
                <button
                  onClick={() => updateConfig('characterImageUrl', null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
                >
                  ×
                </button>
              </div>
            ) : null}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/30 border border-purple-500/50 rounded-lg cursor-pointer hover:bg-purple-600/50 transition-colors">
              <span>📤</span>
              <span className="text-sm">{blockConfig.characterImageUrl ? 'Change Character' : 'Upload Character'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', 'character')
                    const res = await fetch('/api/admin/catalog/upload-image', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await res.json()
                    if (data.url) updateConfig('characterImageUrl', data.url)
                  } catch (err) {
                    console.error('Upload failed:', err)
                  }
                }}
              />
            </label>
          </div>

          {/* Character Position & Size */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-purple-300 mb-2">Character Position</label>
              <select
                value={(blockConfig.characterPosition as string) || 'center'}
                onChange={(e) => updateConfig('characterPosition', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-purple-500/30 rounded-lg text-sm"
              >
                <option value="left">Left Side</option>
                <option value="center">Center (Behind)</option>
                <option value="right">Right Side</option>
                <option value="peek-left">Peek from Left</option>
                <option value="peek-right">Peek from Right</option>
                <option value="peek-top">Peek from Top</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-2">Character Size</label>
              <select
                value={(blockConfig.characterSize as string) || 'large'}
                onChange={(e) => updateConfig('characterSize', e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-900 border border-purple-500/30 rounded-lg text-sm"
              >
                <option value="small">Small (50%)</option>
                <option value="medium">Medium (75%)</option>
                <option value="large">Large (100%)</option>
                <option value="xlarge">Extra Large (120%)</option>
                <option value="full">Full Height</option>
              </select>
            </div>
          </div>

          {/* Character Depth (z-index behavior) */}
          <div className="mb-5">
            <label className="block text-sm text-purple-300 mb-2">Depth Effect</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'behind', name: 'Behind All', icon: '⬇️', desc: 'Character fully behind products' },
                { id: 'peek', name: 'Peeking', icon: '👀', desc: 'Character peeks around products' },
                { id: 'overlay', name: 'Overlay', icon: '⬆️', desc: 'Character in front of products' },
              ].map((depth) => (
                <button
                  key={depth.id}
                  onClick={() => updateConfig('characterDepth', depth.id)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    (blockConfig.characterDepth || 'behind') === depth.id
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-2xl block mb-1">{depth.icon}</span>
                  <span className="text-xs font-medium">{depth.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scene Background (gradient behind character) */}
          <div className="mb-5">
            <label className="block text-sm text-purple-300 mb-2">Scene Background</label>
            <div className="flex gap-2 mb-3">
              <input
                type="color"
                value={(blockConfig.sceneGradientStart as string) || '#1e3a5f'}
                onChange={(e) => updateConfig('sceneGradientStart', e.target.value)}
                className="w-14 h-10 rounded-lg cursor-pointer border border-purple-500/30 bg-transparent"
              />
              <input
                type="color"
                value={(blockConfig.sceneGradientEnd as string) || '#0c1929'}
                onChange={(e) => updateConfig('sceneGradientEnd', e.target.value)}
                className="w-14 h-10 rounded-lg cursor-pointer border border-purple-500/30 bg-transparent"
              />
              <select
                value={(blockConfig.sceneGradientDirection as string) || '135deg'}
                onChange={(e) => updateConfig('sceneGradientDirection', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-purple-500/30 rounded-lg text-sm"
              >
                <option value="0deg">Top to Bottom</option>
                <option value="90deg">Left to Right</option>
                <option value="135deg">Diagonal ↘</option>
                <option value="180deg">Bottom to Top</option>
                <option value="radial">Radial (Center Out)</option>
              </select>
            </div>
            <div
              className="h-16 rounded-lg border border-purple-500/30"
              style={{
                background: (blockConfig.sceneGradientDirection as string) === 'radial'
                  ? `radial-gradient(circle, ${blockConfig.sceneGradientStart || '#1e3a5f'}, ${blockConfig.sceneGradientEnd || '#0c1929'})`
                  : `linear-gradient(${blockConfig.sceneGradientDirection || '135deg'}, ${blockConfig.sceneGradientStart || '#1e3a5f'}, ${blockConfig.sceneGradientEnd || '#0c1929'})`
              }}
            />
          </div>

          {/* Ambient Effects */}
          <div className="mb-5">
            <label className="block text-sm text-purple-300 mb-2">Ambient Effects</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'none', name: 'None', icon: '⬜' },
                { id: 'snow', name: 'Snowfall', icon: '❄️' },
                { id: 'sparkle', name: 'Sparkles', icon: '✨' },
                { id: 'bokeh', name: 'Bokeh Lights', icon: '💫' },
                { id: 'confetti', name: 'Confetti', icon: '🎊' },
                { id: 'hearts', name: 'Hearts', icon: '💕' },
              ].map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => updateConfig('ambientEffect', effect.id)}
                  className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                    (blockConfig.ambientEffect || 'none') === effect.id
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>{effect.icon}</span>
                  <span>{effect.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Frame/Border Style */}
          <div className="mb-5">
            <label className="block text-sm text-purple-300 mb-2">Frame Style</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', name: 'No Frame', icon: '⬜' },
                { id: 'lights', name: 'String Lights', icon: '💡' },
                { id: 'garland', name: 'Garland', icon: '🌿' },
                { id: 'ornaments', name: 'Ornaments', icon: '🎄' },
                { id: 'ribbon', name: 'Ribbon', icon: '🎀' },
                { id: 'neon', name: 'Neon Glow', icon: '🌟' },
              ].map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => updateConfig('frameStyle', frame.id)}
                  className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                    (blockConfig.frameStyle || 'none') === frame.id
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <span>{frame.icon}</span>
                  <span className="text-xs">{frame.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Scene Presets */}
          <div>
            <label className="block text-sm text-purple-300 mb-2">Quick Scene Presets</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  id: 'santa',
                  name: '🎅 Santa\'s Workshop',
                  config: {
                    sceneGradientStart: '#1e3a5f',
                    sceneGradientEnd: '#0c1929',
                    ambientEffect: 'snow',
                    frameStyle: 'lights',
                    characterDepth: 'behind'
                  }
                },
                {
                  id: 'valentines',
                  name: '💕 Valentine\'s Day',
                  config: {
                    sceneGradientStart: '#831843',
                    sceneGradientEnd: '#500724',
                    ambientEffect: 'hearts',
                    frameStyle: 'ribbon',
                    characterDepth: 'peek'
                  }
                },
                {
                  id: 'fiesta',
                  name: '🎉 Fiesta',
                  config: {
                    sceneGradientStart: '#065f46',
                    sceneGradientEnd: '#064e3b',
                    ambientEffect: 'confetti',
                    frameStyle: 'neon',
                    characterDepth: 'behind'
                  }
                },
                {
                  id: 'gold',
                  name: '✨ Golden Glow',
                  config: {
                    sceneGradientStart: '#78350f',
                    sceneGradientEnd: '#451a03',
                    ambientEffect: 'sparkle',
                    frameStyle: 'ornaments',
                    characterDepth: 'behind'
                  }
                },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    Object.entries(preset.config).forEach(([key, value]) => {
                      updateConfig(key, value)
                    })
                  }}
                  className="px-3 py-3 rounded-lg border border-purple-500/30 bg-slate-900/50 hover:bg-purple-600/30 transition-all text-left"
                >
                  <span className="font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Product Card Style Editor - For blocks with product cards */}
      {['PRODUCT_GRID', 'PRODUCT_CARDS', 'PROMO_SECTION', 'CATEGORY_ROW', 'RACK_BUNDLE', 'VENDOR_SPOTLIGHT', 'CASE_DEAL', 'NEW_ARRIVALS', 'QUICK_REORDER', 'BULK_BUILDER', 'SEASONAL_THEME', 'BRAND_SHOWCASE', 'CHARACTER_STAGE'].includes(block.type) && (
        <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
          <h3 className="font-semibold mb-4 text-lg flex items-center gap-2">
            <span>🃏</span> Product Card Style
          </h3>

          {/* Style Presets */}
          <div className="mb-5">
            <label className="block text-sm text-slate-400 mb-2">Style Preset</label>
            <div className="grid grid-cols-4 gap-2">
              {CARD_STYLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset({
                    cardStyle: preset.id,
                    cardBg: preset.cardBg,
                    cardImageBg: preset.imageBg,
                    cardBorderColor: preset.borderColor,
                    cardTextLight: preset.textLight || false,
                    cardAccentColor: preset.accentColor || '#ef4444',
                    cardGlowColor: preset.glowColor || preset.accentColor || '#ef4444',
                  })}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    blockConfig.cardStyle === preset.id
                      ? 'border-blue-500 bg-blue-600/20 ring-2 ring-blue-400/50'
                      : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{preset.icon}</span>
                  <span className="text-xs font-medium">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Card Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.cardBg as string)?.startsWith('#') ? blockConfig.cardBg as string : '#ffffff'}
                  onChange={(e) => updateConfig('cardBg', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.cardBg as string) || '#ffffff'}
                  onChange={(e) => updateConfig('cardBg', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                  placeholder="#ffffff or gradient"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Image Area Background</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.cardImageBg as string)?.startsWith('#') ? blockConfig.cardImageBg as string : '#f8fafc'}
                  onChange={(e) => updateConfig('cardImageBg', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.cardImageBg as string) || ''}
                  onChange={(e) => updateConfig('cardImageBg', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                  placeholder="gradient or color"
                />
              </div>
            </div>
          </div>

          {/* Image Effects */}
          <div className="mb-5">
            <label className="block text-sm text-slate-400 mb-2">Product Image Effect</label>
            <div className="grid grid-cols-4 gap-2">
              {CARD_IMAGE_EFFECTS.map((effect) => (
                <button
                  key={effect.id}
                  onClick={() => updateConfig('cardImageEffect', effect.value)}
                  className={`p-3 rounded-xl text-center transition-all border-2 ${
                    blockConfig.cardImageEffect === effect.value
                      ? 'border-blue-500 bg-blue-600/20'
                      : 'border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                  }`}
                >
                  <span className="text-xl block mb-1">{effect.icon}</span>
                  <span className="text-xs">{effect.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Border Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.cardBorderColor as string) || '#e2e8f0'}
                  onChange={(e) => updateConfig('cardBorderColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.cardBorderColor as string) || '#e2e8f0'}
                  onChange={(e) => updateConfig('cardBorderColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Accent Color (Selected)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={(blockConfig.cardAccentColor as string) || '#ef4444'}
                  onChange={(e) => updateConfig('cardAccentColor', e.target.value)}
                  className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
                />
                <input
                  type="text"
                  value={(blockConfig.cardAccentColor as string) || '#ef4444'}
                  onChange={(e) => updateConfig('cardAccentColor', e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Glow Color */}
          <div className="mb-4">
            <label className="block text-sm text-slate-400 mb-1.5">Glow Color (Selection Highlight)</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={(blockConfig.cardGlowColor as string) || (blockConfig.cardAccentColor as string) || '#ef4444'}
                onChange={(e) => updateConfig('cardGlowColor', e.target.value)}
                className="w-14 h-10 rounded-lg cursor-pointer border border-slate-600 bg-transparent"
              />
              <input
                type="text"
                value={(blockConfig.cardGlowColor as string) || ''}
                onChange={(e) => updateConfig('cardGlowColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-mono"
                placeholder="Leave empty to use accent color"
              />
            </div>
          </div>

          {/* Product Backdrop Upload - Like juice splash, candy effects */}
          <div className="mb-5 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30">
            <label className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
              <span>🎨</span> Product Backdrop Image
            </label>
            <p className="text-xs text-purple-400/70 mb-3">Upload splash effects, decorative backgrounds for product images</p>
            {blockConfig.cardBackdropUrl ? (
              <div className="relative mb-3">
                <img
                  src={blockConfig.cardBackdropUrl as string}
                  alt="Product Backdrop"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => updateConfig('cardBackdropUrl', null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
                >
                  ×
                </button>
              </div>
            ) : null}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/30 border border-purple-500/50 rounded-lg cursor-pointer hover:bg-purple-600/50 transition-colors">
              <span>📤</span>
              <span className="text-sm">{blockConfig.cardBackdropUrl ? 'Change Backdrop' : 'Upload Backdrop'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', 'backdrop')
                    const res = await fetch('/api/admin/catalog/upload-image', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await res.json()
                    if (data.url) updateConfig('cardBackdropUrl', data.url)
                  } catch (err) {
                    console.error('Upload failed:', err)
                  }
                }}
              />
            </label>
          </div>

          {/* Block Background Upload - Santa, gold bokeh, green rays etc */}
          <div className="mb-5 p-4 bg-gradient-to-r from-amber-900/30 to-orange-900/30 rounded-xl border border-amber-500/30">
            <label className="block text-sm font-semibold text-amber-300 mb-2 flex items-center gap-2">
              <span>🖼️</span> Block Background Image
            </label>
            <p className="text-xs text-amber-400/70 mb-3">Upload festive backgrounds like Santa, gold bokeh, sun rays</p>
            {blockConfig.blockBackgroundUrl ? (
              <div className="relative mb-3">
                <img
                  src={blockConfig.blockBackgroundUrl as string}
                  alt="Block Background"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => updateConfig('blockBackgroundUrl', null)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
                >
                  ×
                </button>
              </div>
            ) : null}
            <label className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/30 border border-amber-500/50 rounded-lg cursor-pointer hover:bg-amber-600/50 transition-colors">
              <span>📤</span>
              <span className="text-sm">{blockConfig.blockBackgroundUrl ? 'Change Background' : 'Upload Background'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  try {
                    const formData = new FormData()
                    formData.append('file', file)
                    formData.append('type', 'background')
                    const res = await fetch('/api/admin/catalog/upload-image', {
                      method: 'POST',
                      body: formData,
                    })
                    const data = await res.json()
                    if (data.url) updateConfig('blockBackgroundUrl', data.url)
                  } catch (err) {
                    console.error('Upload failed:', err)
                  }
                }}
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-amber-400/70 mb-1">Position</label>
                <select
                  value={(blockConfig.blockBackgroundPosition as string) || 'center'}
                  onChange={(e) => updateConfig('blockBackgroundPosition', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-amber-400/70 mb-1">Size</label>
                <select
                  value={(blockConfig.blockBackgroundSize as string) || 'cover'}
                  onChange={(e) => updateConfig('blockBackgroundSize', e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="100% auto">Full Width</option>
                  <option value="auto 100%">Full Height</option>
                </select>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={(blockConfig.cardTextLight as boolean) || false}
                onChange={(e) => updateConfig('cardTextLight', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm">Light Text</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={(blockConfig.cardShowBrand as boolean) !== false}
                onChange={(e) => updateConfig('cardShowBrand', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm">Show Brand</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={(blockConfig.cardShowCategory as boolean) !== false}
                onChange={(e) => updateConfig('cardShowCategory', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm">Show Category Badge</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
              <input
                type="checkbox"
                checked={(blockConfig.cardCompact as boolean) || false}
                onChange={(e) => updateConfig('cardCompact', e.target.checked)}
                className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
              <span className="text-sm">Compact Cards</span>
            </label>
          </div>

          {/* Preview hint */}
          <div className="mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>💡</span>
              Card styles are applied in real-time. Check the Live Preview to see changes.
            </p>
          </div>
        </div>
      )}

      {/* Products in Block */}
      <div className="bg-slate-800 rounded-xl p-5 ring-1 ring-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Products ({block.products.length})</h3>
          <button
            onClick={() => setShowProductPicker(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-colors font-medium"
          >
            + Add Products
          </button>
        </div>

        {block.products.length === 0 ? (
          <div className="text-slate-400 text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
            <p>No products in this block</p>
            <button
              onClick={() => setShowProductPicker(true)}
              className="mt-2 text-blue-400 hover:text-blue-300"
            >
              Click to add products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {block.products
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700 rounded-xl p-3 relative group hover:ring-2 hover:ring-blue-500 transition-all"
                >
                  <button
                    onClick={() => onRemoveProduct(item.productId)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 hover:bg-red-500 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                  <div className="aspect-square bg-slate-600 rounded-lg mb-2 overflow-hidden">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{item.product.name}</p>
                  <p className="text-xs text-emerald-400">${Number(item.product.price).toFixed(2)}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Product Picker Modal */}
      {showProductPicker && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]" onClick={() => setShowProductPicker(false)}>
          <div className="bg-slate-900 rounded-2xl p-6 w-[900px] max-h-[85vh] flex flex-col shadow-2xl ring-1 ring-slate-700" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Products to Block</h2>
              <button
                onClick={() => setShowProductPicker(false)}
                className="text-slate-400 hover:text-white text-2xl p-1 hover:bg-slate-800 rounded-lg"
              >
                ×
              </button>
            </div>

            {/* Search and Category Filter */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`min-w-[200px] px-4 py-3 rounded-xl font-medium cursor-pointer transition-colors ${
                  categoryFilter !== 'all'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                } border`}
              >
                <option value="all">All Categories ({availableProducts.length})</option>
                {categories.map(cat => {
                  const count = availableProducts.filter(p => p.category?.id === cat.id).length
                  return (
                    <option key={cat.id} value={cat.id}>{cat.name} ({count})</option>
                  )
                })}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No products found. Try a different category or search term.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => onAddProduct(product.id)}
                      className="bg-slate-800 hover:bg-slate-700 rounded-xl p-3 text-left transition-all hover:ring-2 hover:ring-blue-500"
                    >
                      <div className="aspect-square bg-slate-700 rounded-lg mb-2 overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No image
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-slate-400 truncate">{product.sku}</p>
                      <p className="text-sm text-emerald-400 font-medium">${Number(product.price).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
              <span className="text-sm text-slate-400">{filteredProducts.length} products available</span>
              <button
                onClick={() => setShowProductPicker(false)}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
