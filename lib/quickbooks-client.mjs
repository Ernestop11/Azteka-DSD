import fetch from 'node-fetch';
import { getValidAccessToken } from './quickbooks-auth.mjs';

const QB_API_BASE = 'https://quickbooks.api.intuit.com/v3/company';
const QB_SANDBOX_BASE = 'https://sandbox-quickbooks.api.intuit.com/v3/company';

export async function fetchQB(endpoint, options = {}) {
  const realmId = process.env.QB_REALM_ID;
  const useSandbox = process.env.QB_USE_SANDBOX === 'true';

  if (!realmId) {
    throw new Error('QB_REALM_ID missing in environment');
  }

  const accessToken = await getValidAccessToken();
  const baseUrl = useSandbox ? QB_SANDBOX_BASE : QB_API_BASE;
  const url = `${baseUrl}/${realmId}/${endpoint}`;

  const defaultOptions = {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`QuickBooks API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export async function queryQB(sql) {
  const endpoint = `query?query=${encodeURIComponent(sql)}`;
  return await fetchQB(endpoint);
}

export async function getQBItem(itemId) {
  return await fetchQB(`item/${itemId}`);
}

export async function getQBItems(options = {}) {
  const { maxResults = 1000, startPosition = 1, active = true } = options;

  let sql = `SELECT * FROM Item WHERE Type = 'Inventory'`;

  if (active !== null) {
    sql += ` AND Active = ${active}`;
  }

  sql += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;

  const result = await queryQB(sql);
  return result.QueryResponse?.Item || [];
}

export async function createQBItem(itemData) {
  return await fetchQB('item', {
    method: 'POST',
    body: JSON.stringify(itemData),
  });
}

export async function updateQBItem(itemId, itemData) {
  const existing = await getQBItem(itemId);
  const updated = {
    ...existing.Item,
    ...itemData,
    SyncToken: existing.Item.SyncToken,
  };

  return await fetchQB('item', {
    method: 'POST',
    body: JSON.stringify(updated),
  });
}

export async function getQBCustomer(customerId) {
  return await fetchQB(`customer/${customerId}`);
}

export async function getQBCustomers(options = {}) {
  const { maxResults = 1000, startPosition = 1, active = true } = options;

  let sql = `SELECT * FROM Customer`;

  if (active !== null) {
    sql += ` WHERE Active = ${active}`;
  }

  sql += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;

  const result = await queryQB(sql);
  return result.QueryResponse?.Customer || [];
}

export async function createQBCustomer(customerData) {
  return await fetchQB('customer', {
    method: 'POST',
    body: JSON.stringify(customerData),
  });
}

export async function updateQBCustomer(customerId, customerData) {
  const existing = await getQBCustomer(customerId);
  const updated = {
    ...existing.Customer,
    ...customerData,
    SyncToken: existing.Customer.SyncToken,
  };

  return await fetchQB('customer', {
    method: 'POST',
    body: JSON.stringify(updated),
  });
}

export async function getQBVendors(options = {}) {
  const { maxResults = 1000, startPosition = 1, active = true } = options;

  let sql = `SELECT * FROM Vendor`;

  if (active !== null) {
    sql += ` WHERE Active = ${active}`;
  }

  sql += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;

  const result = await queryQB(sql);
  return result.QueryResponse?.Vendor || [];
}

export async function getQBAccounts(type = null) {
  let sql = 'SELECT * FROM Account';

  if (type) {
    sql += ` WHERE AccountType = '${type}'`;
  }

  sql += ' MAXRESULTS 1000';

  const result = await queryQB(sql);
  return result.QueryResponse?.Account || [];
}

export async function getQBInvoices(options = {}) {
  const { maxResults = 100, startPosition = 1, customerId = null } = options;

  let sql = `SELECT * FROM Invoice`;

  if (customerId) {
    sql += ` WHERE CustomerRef = '${customerId}'`;
  }

  sql += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;

  const result = await queryQB(sql);
  return result.QueryResponse?.Invoice || [];
}

export async function getQBPurchaseOrders(options = {}) {
  const { maxResults = 100, startPosition = 1, vendorId = null } = options;

  let sql = `SELECT * FROM PurchaseOrder`;

  if (vendorId) {
    sql += ` WHERE VendorRef = '${vendorId}'`;
  }

  sql += ` MAXRESULTS ${maxResults} STARTPOSITION ${startPosition}`;

  const result = await queryQB(sql);
  return result.QueryResponse?.PurchaseOrder || [];
}

export async function getQBCompanyInfo() {
  return await fetchQB('companyinfo/1');
}

export async function batchRequest(operations) {
  return await fetchQB('batch', {
    method: 'POST',
    body: JSON.stringify({
      BatchItemRequest: operations,
    }),
  });
}

