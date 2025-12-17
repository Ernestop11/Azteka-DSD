import type { RawLine } from './poTextExtractor';

export type ValidationIssue = {
  line: RawLine;
  message: string;
};

export const poValidator = {
  validate(items: RawLine[]) {
    const issues: ValidationIssue[] = [];
    items.forEach(item => {
      if (!item.sku) {
        issues.push({ line: item, message: 'Missing SKU' });
      }
      if (!item.quantity) {
        issues.push({ line: item, message: 'Missing quantity' });
      }
    });
    return issues;
  },
};
