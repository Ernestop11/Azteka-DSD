import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const router = Router();
const prisma = new PrismaClient();

// QuickBooks OAuth configuration
const QB_CLIENT_ID = process.env.QUICKBOOKS_CLIENT_ID;
const QB_CLIENT_SECRET = process.env.QUICKBOOKS_CLIENT_SECRET;
const QB_REDIRECT_URI = process.env.QUICKBOOKS_REDIRECT_URI || 'http://localhost:4000/api/quickbooks/callback';
const QB_SCOPE = 'com.intuit.quickbooks.accounting';
const QB_BASE_URL = process.env.QUICKBOOKS_BASE_URL || 'https://sandbox-quickbooks.api.intuit.com';

// Store tokens (in production, use database)
let accessToken = null;
let refreshToken = null;
let realmId = null;

// GET /api/quickbooks/auth - Initiate OAuth flow
router.get('/auth', (req, res) => {
  if (!QB_CLIENT_ID || !QB_CLIENT_SECRET) {
    return res.status(500).json({
      error: 'QuickBooks API not configured',
      message: 'Please set QUICKBOOKS_CLIENT_ID and QUICKBOOKS_CLIENT_SECRET in environment variables',
    });
  }

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${QB_CLIENT_ID}&` +
    `scope=${QB_SCOPE}&` +
    `redirect_uri=${encodeURIComponent(QB_REDIRECT_URI)}&` +
    `response_type=code&` +
    `access_type=offline`;

  res.json({
    authUrl,
    message: 'Visit the authUrl to authorize QuickBooks access',
  });
});

// GET /api/quickbooks/callback - OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code, realmId: qbRealmId } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: QB_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      return res.status(500).json({ error: 'Token exchange failed', details: error });
    }

    const tokenData = await tokenResponse.json();
    accessToken = tokenData.access_token;
    refreshToken = tokenData.refresh_token;
    realmId = qbRealmId;

    res.json({
      success: true,
      message: 'QuickBooks connected successfully',
      realmId,
    });
  } catch (error) {
    console.error('QuickBooks callback error:', error);
    res.status(500).json({
      error: 'QuickBooks connection failed',
      message: error.message,
    });
  }
});

// GET /api/quickbooks/status - Check connection status
router.get('/status', (req, res) => {
  res.json({
    connected: !!accessToken,
    realmId,
    configured: !!(QB_CLIENT_ID && QB_CLIENT_SECRET),
  });
});

// Helper function to make QuickBooks API requests
async function qbRequest(endpoint, method = 'GET', body = null) {
  if (!accessToken || !realmId) {
    throw new Error('QuickBooks not connected. Please authorize first.');
  }

  const url = `${QB_BASE_URL}/v3/company/${realmId}/${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`QuickBooks API error: ${error}`);
  }

  return response.json();
}

// GET /api/quickbooks/items - Sync inventory from QuickBooks
router.post('/sync/inventory', async (req, res, next) => {
  try {
    if (!accessToken || !realmId) {
      return res.status(401).json({
        error: 'QuickBooks not connected',
        message: 'Please authorize QuickBooks first',
      });
    }

    // Fetch items from QuickBooks
    const qbItems = await qbRequest('query?query=SELECT * FROM Item MAXRESULTS 1000');

    if (!qbItems.QueryResponse || !qbItems.QueryResponse.Item) {
      return res.json({
        success: true,
        synced: 0,
        message: 'No items found in QuickBooks',
      });
    }

    const items = Array.isArray(qbItems.QueryResponse.Item)
      ? qbItems.QueryResponse.Item
      : [qbItems.QueryResponse.Item];

    let synced = 0;
    let updated = 0;
    let created = 0;

    // Sync each item
    for (const item of items) {
      if (!item.Name || !item.Type || item.Type !== 'Inventory') {
        continue; // Skip non-inventory items
      }

      const sku = item.Sku || item.Name.toLowerCase().replace(/\s+/g, '-');
      const price = item.UnitPrice || 0;
      const stock = item.QtyOnHand || 0;
      const cost = item.PurchaseCost || price * 0.7; // Estimate cost if not available

      // Check if product exists
      const existing = await prisma.product.findUnique({
        where: { sku },
      });

      if (existing) {
        // Update existing product
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            name: item.Name,
            price: price,
            cost: cost,
            stock: stock,
            inStock: stock > 0,
            description: item.Description || existing.description,
          },
        });
        updated++;
      } else {
        // Create new product
        await prisma.product.create({
          data: {
            sku,
            name: item.Name,
            price: price,
            cost: cost,
            stock: stock,
            inStock: stock > 0,
            description: item.Description || '',
            supplier: 'QuickBooks',
            minStock: 10,
          },
        });
        created++;
      }

      synced++;
    }

    res.json({
      success: true,
      synced,
      created,
      updated,
      message: `Synced ${synced} items from QuickBooks`,
    });
  } catch (error) {
    console.error('QuickBooks inventory sync error:', error);
    return next(error);
  }
});

// POST /api/quickbooks/sync/customers - Sync customers from QuickBooks
router.post('/sync/customers', async (req, res, next) => {
  try {
    if (!accessToken || !realmId) {
      return res.status(401).json({
        error: 'QuickBooks not connected',
        message: 'Please authorize QuickBooks first',
      });
    }

    // Fetch customers from QuickBooks
    const qbCustomers = await qbRequest('query?query=SELECT * FROM Customer MAXRESULTS 1000');

    if (!qbCustomers.QueryResponse || !qbCustomers.QueryResponse.Customer) {
      return res.json({
        success: true,
        synced: 0,
        message: 'No customers found in QuickBooks',
      });
    }

    const customers = Array.isArray(qbCustomers.QueryResponse.Customer)
      ? qbCustomers.QueryResponse.Customer
      : [qbCustomers.QueryResponse.Customer];

    let synced = 0;
    let updated = 0;
    let created = 0;

    // Sync each customer
    for (const customer of customers) {
      if (!customer.DisplayName) {
        continue;
      }

      const email = customer.PrimaryEmailAddr?.Address || `${customer.DisplayName.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      const phone = customer.PrimaryPhone?.FreeFormNumber || '';
      const address = customer.BillAddr?.Line1 || '';
      const city = customer.BillAddr?.City || '';
      const state = customer.BillAddr?.CountrySubDivisionCode || '';
      const zipCode = customer.BillAddr?.PostalCode || '';

      // Check if customer exists
      const existing = await prisma.customer.findUnique({
        where: { email },
      });

      if (existing) {
        // Update existing customer
        await prisma.customer.update({
          where: { id: existing.id },
          data: {
            businessName: customer.DisplayName,
            contactName: customer.GivenName || customer.DisplayName,
            phone,
            address,
            city,
            state,
            zipCode,
          },
        });
        updated++;
      } else {
        // Create new customer
        await prisma.customer.create({
          data: {
            businessName: customer.DisplayName,
            contactName: customer.GivenName || customer.DisplayName,
            email,
            phone,
            address,
            city,
            state,
            zipCode,
            active: true,
          },
        });
        created++;
      }

      synced++;
    }

    res.json({
      success: true,
      synced,
      created,
      updated,
      message: `Synced ${synced} customers from QuickBooks`,
    });
  } catch (error) {
    console.error('QuickBooks customer sync error:', error);
    return next(error);
  }
});

export default router;

