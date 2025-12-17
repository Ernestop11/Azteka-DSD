import { getQBCustomers, createQBCustomer, updateQBCustomer } from '../lib/quickbooks-client.mjs';
import { mapQBCustomerToAztekaCustomer, mapAztekaCustomerToQBCustomer } from '../models/qb-customer-map.mjs';

export async function fetchQuickBooksCustomers(options = {}) {
  const qbCustomers = await getQBCustomers(options);
  return qbCustomers.map(mapQBCustomerToAztekaCustomer);
}

export async function syncCustomersFromQuickBooks(prisma) {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const qbCustomers = await getQBCustomers({ maxResults: 1000 });
    results.total = qbCustomers.length;

    for (const qbCustomer of qbCustomers) {
      try {
        const customerData = mapQBCustomerToAztekaCustomer(qbCustomer);

        const existing = await prisma.user.findFirst({
          where: {
            OR: [{ email: customerData.email }, { qbCustomerId: customerData.qbCustomerId }],
          },
        });

        if (existing) {
          if (existing.qbSyncToken === customerData.qbSyncToken) {
            results.skipped++;
            continue;
          }

          await prisma.user.update({
            where: { id: existing.id },
            data: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              businessName: customerData.businessName,
              qbCustomerId: customerData.qbCustomerId,
              qbSyncToken: customerData.qbSyncToken,
              qbLastSync: new Date(),
              updatedAt: new Date(),
            },
          });

          results.updated++;
        } else {
          await prisma.user.create({
            data: {
              name: customerData.name,
              email: customerData.email,
              phone: customerData.phone,
              businessName: customerData.businessName,
              role: 'CUSTOMER',
              qbCustomerId: customerData.qbCustomerId,
              qbSyncToken: customerData.qbSyncToken,
              qbLastSync: new Date(),
              password: '',
            },
          });

          results.created++;
        }
      } catch (error) {
        console.error(`Error syncing QB customer ${qbCustomer.Id}:`, error);
        results.errors.push({
          customer_id: qbCustomer.Id,
          customer_name: qbCustomer.DisplayName,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('QB customers sync error:', error);
    throw error;
  }
}

export async function syncCustomersToQuickBooks(prisma) {
  const results = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
        qbCustomerId: null,
      },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    results.total = customers.length;

    for (const customer of customers) {
      try {
        const qbCustomerData = mapAztekaCustomerToQBCustomer(customer);

        let result;
        if (customer.qbCustomerId) {
          result = await updateQBCustomer(customer.qbCustomerId, qbCustomerData);
          results.updated++;
        } else {
          result = await createQBCustomer(qbCustomerData);
          results.created++;
        }

        await prisma.user.update({
          where: { id: customer.id },
          data: {
            qbCustomerId: result.Customer.Id,
            qbSyncToken: result.Customer.SyncToken,
            qbLastSync: new Date(),
          },
        });
      } catch (error) {
        console.error(`Error pushing customer ${customer.id}:`, error);
        results.errors.push({
          customer_id: customer.id,
          customer_name: customer.name,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error('QB customers push error:', error);
    throw error;
  }
}

