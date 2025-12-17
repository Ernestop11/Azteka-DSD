import { NextResponse } from 'next/server';
import { poParser } from '../../../../src/po-engine/poParser';
import { poSkuMatcher } from '../../../../src/po-engine/poSkuMatcher';
import { poNewProductDetector } from '../../../../src/po-engine/poNewProductDetector';
import { poInventoryUpdater } from '../../../../src/po-engine/poInventoryUpdater';
import { poValidator } from '../../../../src/po-engine/poValidator';

export const POST = async (request: Request) => {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  const content = Buffer.from(buffer).toString('utf-8');

  const parsed = poParser.parse(content);
  const matchedItems = parsed.items.map(item => ({
    ...item,
    match: item.sku ? poSkuMatcher.match(item.sku) : undefined,
  }));

  const newProducts = poNewProductDetector.detect(parsed.items);
  const inventoryUpdate = poInventoryUpdater.buildUpdates(parsed.items);
  const validationIssues = poValidator.validate(parsed.items);

  return NextResponse.json({
    supplierDetected: parsed.supplier,
    parsedItems: matchedItems,
    newProducts,
    inventoryUpdate,
    validationIssues,
    confidence: matchedItems.length ? 0.8 : 0.4,
  });
};
