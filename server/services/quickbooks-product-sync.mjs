import { getQBItems, createQBItem, updateQBItem, getQBAccounts } from '../lib/quickbooks-client.mjs';
import { mapQBItemToAztekaProduct, mapAztekaProductToQBItem } from '../models/qb-product-map.mjs';

export async function fetchQuickBooksProducts(options = {}) {
  const qbItems = await getQBItems(options);
  return qbItems.map(mapQBItemToAztekaProduct);
}

export async function syncProductsFromQuickBooks(prisma) {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const qbItems = await getQBItems({ maxResults: 1000 });
    results.total = qbItems.length;

    for (const qbItem of qbItems) {
      try {
        const productData = mapQBItemToAztekaProduct(qbItem);

        const existing = await prisma.product.findFirst({
          where: {
            OR: [{ sku: productData.sku }, { qbItemId: productData.qbItemId }],
          },
        });

        if (existing) {
          if (existing.qbSyncToken === productData.qbSyncToken) {
            results.skipped++;
            continue;
          }

          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              cost: productData.cost,
              inStock: productData.inStock,
              qbItemId: productData.qbItemId,
              qbSyncToken: productData.qbSyncToken,
              qbLastSync: new Date(),
              updatedAt: new Date(),
            },
          });

          results.updated++;
        } else {
          await prisma.product.create({
            data: {
              name: productData.name,
              slug: productData.slug,
              sku: productData.sku,
              description: productData.description,
              price: productData.price,
              cost: productData.cost,
              inStock: productData.inStock,
              source: 'quickbooks',
              qbItemId: productData.qbItemId,
              qbSyncToken: productData.qbSyncToken,
              qbLastSync: new Date(),
              unitType: 'case',
              unitsPerCase: 1,
              minOrderQuantity: 1,
              backgroundColor: '#f3f4f6',
              imageUrl: '',
            },
          });

          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing QB item ${qbItem.Id}:`, error);
        results.errors.push({
          item_id: qbItem.Id,
          item_name: qbItem.Name,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('QB products sync error:', error);
    throw error;
  }
}

export async function syncProductsToQuickBooks(prisma) {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const products = await prisma.product.findMany({
      where: {
        OR: [{ qbItemId: null }, { source: { not: 'quickbooks' } }],
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    results.total = products.length;

    const accounts = await getQBAccounts();
    const incomeAccount = accounts.find((a) => a.AccountType === 'Income') || { Id: '1' };
    const assetAccount = accounts.find((a) => a.AccountType === 'Other Current Asset') || { Id: '1' };
    const expenseAccount = accounts.find((a) => a.AccountType === 'Cost of Goods Sold') || { Id: '1' };

    for (const product of products) {
      try {
        const qbItemData = mapAztekaProductToQBItem(product, {
          incomeAccountRef: { value: incomeAccount.Id },
          assetAccountRef: { value: assetAccount.Id },
          expenseAccountRef: { value: expenseAccount.Id },
        });

        let result;
        if (product.qbItemId) {
          result = await updateQBItem(product.qbItemId, qbItemData);
          results.updated++;
        } else {
          result = await createQBItem(qbItemData);
          results.created++;
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            qbItemId: result.Item.Id,
            qbSyncToken: result.Item.SyncToken,
            qbLastSync: new Date(),
            source: 'quickbooks',
          },
        });
      } catch (error) {
        console.error(`Error pushing product ${product.id}:`, error);
        results.errors.push({
          product_id: product.id,
          product_name: product.name,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('QB products push error:', error);
    throw error;
  }
}

