import fs from 'fs'
import { parse } from 'csv-parse/sync'

function toSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function analyzeCategories() {
  console.log('\n📊 ANALYZING CATEGORIES CSV\n')
  console.log('=' .repeat(60))
  
  const csvPath = './data/categories.csv'
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    return { valid: 0, invalid: 0, errors: [] }
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let valid = 0
  let invalid = 0
  const errors = []
  const samples = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const name = record['Category Name']?.trim()
    
    if (!name) {
      invalid++
      errors.push(`Row ${i + 2}: Missing category name`)
      continue
    }

    const slug = toSlug(name)
    if (samples.length < 3) {
      samples.push({ name, slug })
    }
    valid++
  }

  console.log(`✅ Valid records: ${valid}`)
  console.log(`❌ Invalid records: ${invalid}`)
  if (samples.length > 0) {
    console.log('\n📝 Sample records:')
    samples.forEach(s => console.log(`   - "${s.name}" → slug: "${s.slug}"`))
  }
  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Errors:')
    errors.forEach(e => console.log(`   ${e}`))
  } else if (errors.length > 10) {
    console.log(`\n⚠️  ${errors.length} errors (showing first 10):`)
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`))
  }

  return { valid, invalid, errors }
}

async function analyzeBrands() {
  console.log('\n📊 ANALYZING BRANDS CSV\n')
  console.log('=' .repeat(60))
  
  const csvPath = './data/brands.csv'
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    return { valid: 0, invalid: 0, errors: [] }
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let valid = 0
  let invalid = 0
  const errors = []
  const samples = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const name = record['Brand Name']?.trim()
    
    if (!name) {
      invalid++
      errors.push(`Row ${i + 2}: Missing brand name`)
      continue
    }

    const slug = toSlug(name)
    if (samples.length < 3) {
      samples.push({ name, slug })
    }
    valid++
  }

  console.log(`✅ Valid records: ${valid}`)
  console.log(`❌ Invalid records: ${invalid}`)
  if (samples.length > 0) {
    console.log('\n📝 Sample records:')
    samples.forEach(s => console.log(`   - "${s.name}" → slug: "${s.slug}"`))
  }
  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Errors:')
    errors.forEach(e => console.log(`   ${e}`))
  } else if (errors.length > 10) {
    console.log(`\n⚠️  ${errors.length} errors (showing first 10):`)
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`))
  }

  return { valid, invalid, errors }
}

async function analyzeProducts() {
  console.log('\n📊 ANALYZING PRODUCTS CSV\n')
  console.log('=' .repeat(60))
  
  const csvPath = './data/products.csv'
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    return { valid: 0, invalid: 0, errors: [] }
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  // Load categories and brands for validation
  const categoriesCsv = fs.readFileSync('./data/categories.csv', 'utf-8')
  const categories = parse(categoriesCsv, { columns: true, skip_empty_lines: true, trim: true })
  const categoryNames = new Set(categories.map(c => c['Category Name']?.trim().toLowerCase()).filter(Boolean))

  const brandsCsv = fs.readFileSync('./data/brands.csv', 'utf-8')
  const brands = parse(brandsCsv, { columns: true, skip_empty_lines: true, trim: true })
  const brandNames = new Set(brands.map(b => b['Brand Name']?.trim().toLowerCase()).filter(Boolean))

  let valid = 0
  let invalid = 0
  const errors = []
  const samples = []
  const missingCategories = new Set()
  const missingBrands = new Set()

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const name = record['Product Name']?.trim()
    const productId = record.ID?.trim() || record.id?.trim()
    let sku = record['SKU#']?.trim()?.toUpperCase()
    
    // Generate SKU from product ID if missing (same logic as seed script)
    if (!sku && productId) {
      sku = `PROD-${productId.padStart(6, '0')}`.toUpperCase()
    }
    
    // Generate SKU from name slug if still missing
    if (!sku && name) {
      const nameSlug = name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 20).toUpperCase().replace(/-/g, '')
      sku = `GEN-${nameSlug}`.toUpperCase()
    }
    
    const categoryName = record.Category?.trim()
    const brandName = record.Brand?.trim()
    const priceCase = record['Sales Price']
    const unitsPerCase = record['Case Pack']

    if (!name || !sku) {
      invalid++
      errors.push(`Row ${i + 2}: Missing name or SKU (name: ${name || 'MISSING'}, SKU: ${sku || 'MISSING'})`)
      continue
    }

    if (!categoryName || !categoryNames.has(categoryName.toLowerCase())) {
      invalid++
      if (categoryName) {
        missingCategories.add(categoryName)
        errors.push(`Row ${i + 2}: Category "${categoryName}" not found in categories CSV`)
      } else {
        errors.push(`Row ${i + 2}: Missing category`)
      }
      continue
    }

    if (!brandName || !brandNames.has(brandName.toLowerCase())) {
      invalid++
      if (brandName) {
        missingBrands.add(brandName)
        errors.push(`Row ${i + 2}: Brand "${brandName}" not found in brands CSV`)
      } else {
        errors.push(`Row ${i + 2}: Missing brand`)
      }
      continue
    }

    const priceCaseValue = priceCase ? parseFloat(String(priceCase)) : null
    const unitsPerCaseValue = unitsPerCase ? parseInt(String(unitsPerCase), 10) : null

    if (!priceCaseValue || isNaN(priceCaseValue)) {
      invalid++
      errors.push(`Row ${i + 2}: Invalid priceCase (${priceCase})`)
      continue
    }

    if (!unitsPerCaseValue || isNaN(unitsPerCaseValue)) {
      invalid++
      errors.push(`Row ${i + 2}: Invalid unitsPerCase (${unitsPerCase})`)
      continue
    }

    if (samples.length < 3) {
      samples.push({ name, sku, category: categoryName, brand: brandName, priceCase: priceCaseValue, unitsPerCase: unitsPerCaseValue })
    }
    valid++
  }

  console.log(`✅ Valid records: ${valid}`)
  console.log(`❌ Invalid records: ${invalid}`)
  if (samples.length > 0) {
    console.log('\n📝 Sample records:')
    samples.forEach(s => console.log(`   - "${s.name}" (SKU: ${s.sku}) | Category: ${s.category} | Brand: ${s.brand} | Price: $${s.priceCase} | Units: ${s.unitsPerCase}`))
  }
  if (missingCategories.size > 0) {
    console.log(`\n⚠️  Missing categories (${missingCategories.size}):`)
    Array.from(missingCategories).slice(0, 10).forEach(c => console.log(`   - "${c}"`))
  }
  if (missingBrands.size > 0) {
    console.log(`\n⚠️  Missing brands (${missingBrands.size}):`)
    Array.from(missingBrands).slice(0, 10).forEach(b => console.log(`   - "${b}"`))
  }
  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Sample errors:')
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`))
  } else if (errors.length > 10) {
    console.log(`\n⚠️  ${errors.length} errors (showing first 10):`)
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`))
  }

  return { valid, invalid, errors, missingCategories, missingBrands }
}

async function analyzeCustomers() {
  console.log('\n📊 ANALYZING CUSTOMERS CSV\n')
  console.log('=' .repeat(60))
  
  const csvPath = './data/customers.csv'
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    return { valid: 0, invalid: 0, errors: [] }
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  })

  let valid = 0
  let invalid = 0
  const errors = []
  const samples = []

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const businessName = record['Business Name']?.trim()
    const name = businessName || record.name?.trim()
    const storeName = businessName || record.storeName?.trim() || name

    if (!name || !storeName) {
      invalid++
      errors.push(`Row ${i + 2}: Missing business name`)
      continue
    }

    const address = record['Street Address']?.trim() || null
    const city = record.City?.trim() || null
    const state = record.State?.trim() || null
    const zip = record['Zip Code']?.trim() || null
    const phone = record['Phone Number']?.trim() || null
    const email = record.User?.trim() || null

    if (samples.length < 3) {
      samples.push({ name, storeName, city, state, zip, phone, email })
    }
    valid++
  }

  console.log(`✅ Valid records: ${valid}`)
  console.log(`❌ Invalid records: ${invalid}`)
  if (samples.length > 0) {
    console.log('\n📝 Sample records:')
    samples.forEach(s => console.log(`   - "${s.name}" | ${s.city || 'N/A'}, ${s.state || 'N/A'} ${s.zip || ''} | Phone: ${s.phone || 'N/A'} | Email: ${s.email || 'N/A'}`))
  }
  if (errors.length > 0 && errors.length <= 10) {
    console.log('\n⚠️  Errors:')
    errors.forEach(e => console.log(`   ${e}`))
  } else if (errors.length > 10) {
    console.log(`\n⚠️  ${errors.length} errors (showing first 10):`)
    errors.slice(0, 10).forEach(e => console.log(`   ${e}`))
  }

  return { valid, invalid, errors }
}

async function main() {
  console.log('🔍 DRY-RUN ANALYSIS: Database Seed Preview')
  console.log('=' .repeat(60))
  console.log('\nThis analysis shows what will happen when seeding the database.')
  console.log('No data will be inserted into the database.\n')

  try {
    const categoriesResult = await analyzeCategories()
    const brandsResult = await analyzeBrands()
    const productsResult = await analyzeProducts()
    const customersResult = await analyzeCustomers()

    console.log('\n' + '=' .repeat(60))
    console.log('\n📈 SUMMARY\n')
    console.log('=' .repeat(60))
    console.log(`Categories: ${categoriesResult.valid} valid, ${categoriesResult.invalid} invalid`)
    console.log(`Brands: ${brandsResult.valid} valid, ${brandsResult.invalid} invalid`)
    console.log(`Products: ${productsResult.valid} valid, ${productsResult.invalid} invalid`)
    console.log(`Customers: ${customersResult.valid} valid, ${customersResult.invalid} invalid`)
    
    const totalValid = categoriesResult.valid + brandsResult.valid + productsResult.valid + customersResult.valid
    const totalInvalid = categoriesResult.invalid + brandsResult.invalid + productsResult.invalid + customersResult.invalid

    console.log(`\nTotal: ${totalValid} valid records, ${totalInvalid} invalid records`)

    if (totalInvalid === 0) {
      console.log('\n✅ All records are valid! Ready to seed.')
    } else {
      console.log(`\n⚠️  ${totalInvalid} records will be skipped. Review errors above.`)
    }

    console.log('\n' + '=' .repeat(60))
  } catch (error) {
    console.error('\n❌ Analysis failed:', error)
    process.exit(1)
  }
}

main()

