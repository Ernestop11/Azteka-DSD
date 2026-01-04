// PO Parser - stub implementation
// TODO: Implement full PO parsing logic

interface ParsedItem {
  sku?: string
  description?: string
  quantity?: number
  price?: number
  lineNumber?: number
}

interface ParsedPO {
  supplier?: string
  items: ParsedItem[]
  date?: string
  poNumber?: string
}

export const poParser = {
  parse(content: string): ParsedPO {
    // Basic stub - returns empty parsed result
    return {
      supplier: undefined,
      items: [],
      date: undefined,
      poNumber: undefined,
    }
  }
}
