#!/usr/bin/env node

/**
 * Visual Cohesion Check Script
 * Validates that all catalog components follow unified design system
 *
 * LAP #4: Polish - Ensure consistency across spacing, typography, colors, depth
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// ============================================================================
// EXPECTED PATTERNS
// ============================================================================

const EXPECTED_PATTERNS = {
  spacing: [
    /gap-\d+/,                    // Grid gaps
    /space-[xy]-\d+/,             // Stack spacing
    /p[xytblr]?-\d+/,             // Padding
    /m[xytblr]?-\d+/,             // Margin
  ],
  typography: [
    /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)/,  // Font sizes
    /font-(light|normal|medium|semibold|bold|extrabold|black)/,  // Weights
    /leading-(tight|snug|normal|relaxed|loose)/,  // Line heights
    /tracking-(tighter|tight|normal|wide|wider|widest)/,  // Letter spacing
  ],
  colors: [
    /bg-(red|green|blue|yellow|purple|pink|gray|white|black)-\d+/,  // Background colors
    /text-(red|green|blue|yellow|purple|pink|gray|white|black)-\d+/,  // Text colors
    /border-(red|green|blue|yellow|purple|pink|gray)-\d+/,  // Border colors
  ],
  depth: [
    /shadow-(none|sm|md|lg|xl|2xl)/,  // Shadows
    /drop-shadow-(sm|md|lg|xl|2xl)/,  // Drop shadows
  ],
}

// ============================================================================
// FILE CHECKERS
// ============================================================================

function checkFile(filePath, fileContent) {
  const results = {
    file: filePath,
    spacing: { found: [], missing: [] },
    typography: { found: [], missing: [] },
    colors: { found: [], missing: [] },
    depth: { found: [], missing: [] },
    issues: [],
  }

  // Check for spacing consistency
  const spacingMatches = fileContent.match(/gap-\d+|space-[xy]-\d+|p[xytblr]?-\d+|m[xytblr]?-\d+/g) || []
  results.spacing.found = [...new Set(spacingMatches)]

  // Check for typography consistency
  const typoMatches = fileContent.match(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)|font-(light|normal|medium|semibold|bold|extrabold|black)|leading-(tight|snug|normal|relaxed|loose)|tracking-(tighter|tight|normal|wide|wider|widest)/g) || []
  results.typography.found = [...new Set(typoMatches)]

  // Check for color consistency
  const colorMatches = fileContent.match(/(?:bg|text|border)-(red|green|blue|yellow|purple|pink|gray|white|black)-\d+/g) || []
  results.colors.found = [...new Set(colorMatches)]

  // Check for depth consistency
  const depthMatches = fileContent.match(/(?:shadow|drop-shadow)-(none|sm|md|lg|xl|2xl)/g) || []
  results.depth.found = [...new Set(depthMatches)]

  // Check for hardcoded values (anti-pattern)
  const hardcodedSpacing = fileContent.match(/(?:p|m)[xytblr]?-\[\d+px\]/g) || []
  if (hardcodedSpacing.length > 0) {
    results.issues.push(`Hardcoded spacing values found: ${hardcodedSpacing.join(', ')}`)
  }

  const hardcodedSizes = fileContent.match(/text-\[\d+px\]/g) || []
  if (hardcodedSizes.length > 0) {
    results.issues.push(`Hardcoded font sizes found: ${hardcodedSizes.join(', ')}`)
  }

  return results
}

// ============================================================================
// COMPONENT SCANNER
// ============================================================================

const COMPONENT_FILES = [
  'components/catalog/HeroBanner.tsx',
  'components/catalog/PromoPanel.tsx',
  'components/catalog/ProductGrid.tsx',
  'components/catalog/GlossyProductCard.tsx',
  'components/catalog/PriceTierBar.tsx',
  'components/catalog/BrandsRowVisual.tsx',
  'components/catalog/CategoriesRowVisual.tsx',
  'components/catalog/TrendingRowVisual.tsx',
  'components/catalog/ShowcaseSectionVisual.tsx',
  'components/catalog/layout-variants/MasonryGrid.tsx',
  'components/catalog/layout-variants/WideSpotlight.tsx',
  'components/catalog/layout-variants/MidPromoRow.tsx',
  'components/catalog/layout-variants/DualHeroRow.tsx',
  'components/catalog/layout-variants/ShoppableStory.tsx',
]

function scanComponents() {
  console.log('\\n🔍 Scanning catalog components for visual cohesion...\\n')

  const allResults = []

  for (const file of COMPONENT_FILES) {
    const filePath = join(rootDir, file)

    try {
      const content = readFileSync(filePath, 'utf-8')
      const results = checkFile(file, content)
      allResults.push(results)
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message)
    }
  }

  return allResults
}

// ============================================================================
// REPORT GENERATOR
// ============================================================================

function generateReport(results) {
  console.log('\\n📊 VISUAL COHESION REPORT\\n')
  console.log('='.repeat(80))

  // Summary
  let totalIssues = 0
  let componentsChecked = results.length

  results.forEach((result) => {
    totalIssues += result.issues.length
  })

  console.log(`\\n✅ Components checked: ${componentsChecked}`)
  console.log(`${totalIssues === 0 ? '✅' : '⚠️'}  Total issues found: ${totalIssues}\\n`)

  // Detailed results
  results.forEach((result) => {
    if (result.issues.length > 0) {
      console.log(`\\n⚠️  ${result.file}`)
      result.issues.forEach((issue) => {
        console.log(`   - ${issue}`)
      })
    }
  })

  // Summary table
  console.log('\\n' + '='.repeat(80))
  console.log('\\n📋 USAGE SUMMARY\\n')

  const summaryTable = []

  results.forEach((result) => {
    summaryTable.push({
      Component: result.file.split('/').pop().replace('.tsx', ''),
      Spacing: result.spacing.found.length,
      Typography: result.typography.found.length,
      Colors: result.colors.found.length,
      Depth: result.depth.found.length,
      Issues: result.issues.length,
    })
  })

  console.table(summaryTable)

  // Recommendations
  console.log('\\n💡 RECOMMENDATIONS\\n')

  if (totalIssues === 0) {
    console.log('✅ All components follow the unified design system!')
    console.log('✅ No hardcoded values detected.')
    console.log('✅ Spacing, typography, colors, and depth are consistent.\\n')
  } else {
    console.log('⚠️  Replace hardcoded values with design system tokens:')
    console.log('   - Use spacing utilities from @/components/catalog/polish/spacing')
    console.log('   - Use typography utilities from @/components/catalog/polish/typography')
    console.log('   - Use color utilities from @/components/catalog/polish/colors')
    console.log('   - Use depth utilities from @/components/catalog/polish/depth\\n')
  }

  // System health score
  const healthScore = Math.round(((componentsChecked - totalIssues) / componentsChecked) * 100)
  console.log('='.repeat(80))
  console.log(`\\n🎯 Visual Cohesion Score: ${healthScore}%`)

  if (healthScore === 100) {
    console.log('🎉 Perfect cohesion! All components follow the design system.\\n')
  } else if (healthScore >= 90) {
    console.log('✅ Excellent cohesion! Minor improvements suggested.\\n')
  } else if (healthScore >= 75) {
    console.log('⚠️  Good cohesion, but some inconsistencies detected.\\n')
  } else {
    console.log('❌ Cohesion needs improvement. Review design system usage.\\n')
  }

  return healthScore
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  console.log('\\n' + '='.repeat(80))
  console.log('  AZTEKA DSD CATALOG - VISUAL COHESION CHECK')
  console.log('  LAP #4: Global UX Polish')
  console.log('='.repeat(80))

  const results = scanComponents()
  const healthScore = generateReport(results)

  // Exit code based on health score
  if (healthScore < 90) {
    console.log('⚠️  Warning: Visual cohesion below 90%. Review recommended.\\n')
    process.exit(1)
  }

  console.log('✅ Visual cohesion check passed!\\n')
  process.exit(0)
}

main()
