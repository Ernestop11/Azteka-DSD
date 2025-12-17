export function getCustomerReorderSuggestions(customerId?: string): string[] {
  if (customerId) {
    return [`${customerId}-bundle-1`, `${customerId}-bundle-2`, `${customerId}-bundle-3`]
  }

  return ['default-1', 'default-2', 'default-3']
}
