export function mapQBItemToAztekaProduct(qbItem) {
  const name = qbItem.Name || qbItem.FullyQualifiedName || 'Unnamed Product';
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return {
    name,
    slug,
    sku: qbItem.Sku || qbItem.Id,
    description: qbItem.Description || '',
    price: parseFloat(qbItem.UnitPrice || 0),
    cost: parseFloat(qbItem.PurchaseCost || 0),
    quantity: parseFloat(qbItem.QtyOnHand || 0),
    inStock: qbItem.Active && parseFloat(qbItem.QtyOnHand || 0) > 0,
    qbItemId: qbItem.Id,
    qbSyncToken: qbItem.SyncToken,
    source: 'quickbooks',
    qbData: {
      Type: qbItem.Type,
      FullyQualifiedName: qbItem.FullyQualifiedName,
      Taxable: qbItem.Taxable,
      TrackQtyOnHand: qbItem.TrackQtyOnHand,
      AssetAccountRef: qbItem.AssetAccountRef,
      IncomeAccountRef: qbItem.IncomeAccountRef,
      ExpenseAccountRef: qbItem.ExpenseAccountRef,
    },
  };
}

export function mapAztekaProductToQBItem(product, options = {}) {
  const {
    incomeAccountRef = { value: '1' },
    assetAccountRef = { value: '1' },
    expenseAccountRef = { value: '1' },
  } = options;

  const qbItem = {
    Name: product.name,
    Description: product.description || '',
    Type: 'Inventory',
    TrackQtyOnHand: true,
    QtyOnHand: product.quantity || 0,
    InvStartDate: new Date().toISOString().split('T')[0],
    UnitPrice: product.price || 0,
    PurchaseCost: product.cost || product.costPerCase || 0,
    Active: product.inStock !== false,
    IncomeAccountRef: incomeAccountRef,
    AssetAccountRef: assetAccountRef,
    ExpenseAccountRef: expenseAccountRef,
  };

  if (product.sku && product.sku !== product.qbItemId) {
    qbItem.Sku = product.sku;
  }

  if (product.qbItemId) {
    qbItem.Id = product.qbItemId;
  }

  if (product.qbSyncToken) {
    qbItem.SyncToken = product.qbSyncToken;
  }

  return qbItem;
}

export function compareProductSync(aztekaProduct, qbItem) {
  const differences = [];

  if (aztekaProduct.name !== qbItem.Name) {
    differences.push({ field: 'name', azteka: aztekaProduct.name, qb: qbItem.Name });
  }

  const aztekaPrice = parseFloat(aztekaProduct.price || 0);
  const qbPrice = parseFloat(qbItem.UnitPrice || 0);
  if (Math.abs(aztekaPrice - qbPrice) > 0.01) {
    differences.push({ field: 'price', azteka: aztekaPrice, qb: qbPrice });
  }

  const aztekaCost = parseFloat(aztekaProduct.cost || 0);
  const qbCost = parseFloat(qbItem.PurchaseCost || 0);
  if (Math.abs(aztekaCost - qbCost) > 0.01) {
    differences.push({ field: 'cost', azteka: aztekaCost, qb: qbCost });
  }

  const aztekaQty = parseFloat(aztekaProduct.quantity || 0);
  const qbQty = parseFloat(qbItem.QtyOnHand || 0);
  if (Math.abs(aztekaQty - qbQty) > 0.01) {
    differences.push({ field: 'quantity', azteka: aztekaQty, qb: qbQty });
  }

  return {
    inSync: differences.length === 0,
    differences,
  };
}

export function mergeProductData(aztekaProduct, qbItem, strategy = 'qb-priority') {
  if (strategy === 'qb-priority') {
    return {
      ...aztekaProduct,
      name: qbItem.Name || aztekaProduct.name,
      description: qbItem.Description || aztekaProduct.description,
      price: parseFloat(qbItem.UnitPrice || aztekaProduct.price || 0),
      cost: parseFloat(qbItem.PurchaseCost || aztekaProduct.cost || 0),
      quantity: parseFloat(qbItem.QtyOnHand || aztekaProduct.quantity || 0),
      inStock: qbItem.Active && parseFloat(qbItem.QtyOnHand || 0) > 0,
      qbItemId: qbItem.Id,
      qbSyncToken: qbItem.SyncToken,
    };
  }

  if (strategy === 'azteka-priority') {
    return {
      ...aztekaProduct,
      qbItemId: qbItem.Id,
      qbSyncToken: qbItem.SyncToken,
    };
  }

  return aztekaProduct;
}

