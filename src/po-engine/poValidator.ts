// PO Validator - stub implementation
// TODO: Implement PO validation

interface ValidationIssue {
  lineNumber?: number
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}

export const poValidator = {
  validate(items: any[]): ValidationIssue[] {
    // Stub - no issues
    return []
  }
}
