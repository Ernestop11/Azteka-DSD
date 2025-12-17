# QuickBooks API Integration Specification

## Overview
Complete QuickBooks Online API integration for syncing inventory items and customers to PostgreSQL database using OAuth 2.0 authentication.

## Prerequisites

### 1. QuickBooks Developer Account Setup
1. Go to https://developer.intuit.com/
2. Sign up for Intuit Developer account
3. Create new app in "My Apps" dashboard
4. Get credentials:
   - **Client ID**: Your app's client ID
   - **Client Secret**: Your app's client secret
5. Set OAuth Redirect URI: `https://yourdomain.com/api/qb/callback`
6. Enable scopes:
   - `com.intuit.quickbooks.accounting` - Access to accounting data
   - `com.intuit.quickbooks.company.read` - Read company info

### 2. Environment Variables
```bash
# .env file
QB_CLIENT_ID=your_client_id_here
QB_CLIENT_SECRET=your_client_secret_here
QB_REDIRECT_URI=https://yourdomain.com/api/qb/callback
QB_ENVIRONMENT=sandbox  # or 'production'
QB_DISCOVERY_DOCUMENT=https://developer.api.intuit.com/.well-known/openid_configuration/

# Database encryption key for storing tokens
QB_TOKEN_ENCRYPTION_KEY=your_32_char_encryption_key_here
```

### 3. Install Dependencies
```bash
npm install intuit-oauth node-quickbooks axios crypto
```

---

## API Endpoints

### 1. GET /api/qb/auth
**Purpose**: Initiate OAuth 2.0 authorization flow

**Flow**:
1. Generate random state parameter for CSRF protection
2. Store state in session/redis with 10-minute expiry
3. Build authorization URL
4. Redirect user to QuickBooks OAuth page

**Implementation**:
```javascript
const OAuthClient = require('intuit-oauth');
const crypto = require('crypto');

// Initialize OAuth client
const oauthClient = new OAuthClient({
  clientId: process.env.QB_CLIENT_ID,
  clientSecret: process.env.QB_CLIENT_SECRET,
  environment: process.env.QB_ENVIRONMENT || 'sandbox',
  redirectUri: process.env.QB_REDIRECT_URI,
});

app.get('/api/qb/auth', async (req, res) => {
  try {
    // Generate CSRF state token
    const state = crypto.randomBytes(32).toString('hex');

    // Store state in session/redis (expires in 10 minutes)
    await redis.set(`qb_oauth_state:${state}`, req.user.id, 'EX', 600);

    // Build authorization URL
    const authUri = oauthClient.authorizeUri({
      scope: [
        OAuthClient.scopes.Accounting,
        OAuthClient.scopes.OpenId,
      ],
      state: state,
    });

    res.redirect(authUri);
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to start OAuth flow' });
  }
});
```

---

### 2. GET /api/qb/callback
**Purpose**: Handle OAuth callback and exchange code for tokens

**Query Parameters**:
- `code`: Authorization code from QuickBooks
- `state`: CSRF state parameter
- `realmId`: QuickBooks company ID

**Implementation**:
```javascript
app.get('/api/qb/callback', async (req, res) => {
  try {
    const { code, state, realmId } = req.query;

    // Validate state to prevent CSRF
    const userId = await redis.get(`qb_oauth_state:${state}`);
    if (!userId) {
      return res.status(400).send('Invalid or expired state parameter');
    }

    // Delete used state
    await redis.del(`qb_oauth_state:${state}`);

    // Exchange code for tokens
    const authResponse = await oauthClient.createToken(req.url);
    const tokens = authResponse.getJson();

    // Encrypt tokens before storing
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = encrypt(tokens.refresh_token);

    // Get company info
    const companyInfo = await getCompanyInfo(tokens.access_token, realmId);

    // Store tokens in database
    await db('quickbooks_connections').insert({
      id: uuidv4(),
      user_id: userId,
      realm_id: realmId,
      company_name: companyInfo.CompanyName,
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000),
      created_at: new Date(),
      updated_at: new Date(),
    }).onConflict('user_id').merge();

    // Redirect to admin page
    res.redirect('/admin/quickbooks?connected=true');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/admin/quickbooks?error=oauth_failed');
  }
});

// Encryption helper
function encrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.QB_TOKEN_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.QB_TOKEN_ENCRYPTION_KEY, 'hex');
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function getCompanyInfo(accessToken, realmId) {
  const QuickBooks = require('node-quickbooks');
  const qbo = new QuickBooks(
    process.env.QB_CLIENT_ID,
    process.env.QB_CLIENT_SECRET,
    accessToken,
    false, // no token secret for OAuth 2.0
    realmId,
    process.env.QB_ENVIRONMENT !== 'production',
    true, // use OAuth 2.0
    null,
    '2.0',
    '2.0'
  );

  return new Promise((resolve, reject) => {
    qbo.getCompanyInfo(realmId, (err, companyInfo) => {
      if (err) reject(err);
      else resolve(companyInfo);
    });
  });
}
```

---

### 3. GET /api/qb/status
**Purpose**: Check QuickBooks connection status

**Response**:
```typescript
{
  connected: boolean;
  companyName?: string;
  lastSync?: string;  // ISO timestamp
  realmId?: string;
}
```

**Implementation**:
```javascript
app.get('/api/qb/status', authenticateUser, async (req, res) => {
  try {
    const connection = await db('quickbooks_connections')
      .where('user_id', req.user.id)
      .first();

    if (!connection) {
      return res.json({ connected: false });
    }

    // Get last sync time
    const lastSync = await db('qb_sync_history')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .first();

    res.json({
      connected: true,
      companyName: connection.company_name,
      realmId: connection.realm_id,
      lastSync: lastSync?.created_at,
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});
```

---

### 4. POST /api/qb/sync/inventory
**Purpose**: Sync inventory items from QuickBooks to products table

**Response**:
```typescript
{
  success: true;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  errors: string[];
}
```

**Implementation**:
```javascript
const QuickBooks = require('node-quickbooks');

app.post('/api/qb/sync/inventory', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get connection and refresh token if needed
    const { qbo, realmId } = await getQBOClient(userId);

    // Create sync log entry
    const syncLog = await db('qb_sync_history').insert({
      id: uuidv4(),
      user_id: userId,
      sync_type: 'inventory',
      status: 'in_progress',
      created_at: new Date(),
    }).returning('*');

    let productsAdded = 0;
    let productsUpdated = 0;
    let productsSkipped = 0;
    const errors = [];

    // Fetch all items from QuickBooks
    const items = await fetchAllQBItems(qbo);

    for (const item of items) {
      try {
        // Skip non-inventory items
        if (item.Type !== 'Inventory') continue;

        // Map QuickBooks item to our schema
        const productData = mapQBItemToProduct(item);

        // Check if product exists by SKU
        const existing = await db('products')
          .where('sku', productData.sku)
          .first();

        if (existing) {
          // Update existing product
          await db('products')
            .where('id', existing.id)
            .update({
              ...productData,
              updated_at: new Date(),
            });
          productsUpdated++;
        } else {
          // Insert new product
          await db('products').insert({
            id: uuidv4(),
            ...productData,
            created_at: new Date(),
            updated_at: new Date(),
          });
          productsAdded++;
        }
      } catch (itemError) {
        console.error(`Error processing item ${item.Name}:`, itemError);
        errors.push(`${item.Name}: ${itemError.message}`);
        productsSkipped++;
      }
    }

    // Update sync log
    await db('qb_sync_history')
      .where('id', syncLog[0].id)
      .update({
        status: errors.length === items.length ? 'error' : 'success',
        products_added: productsAdded,
        products_updated: productsUpdated,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        updated_at: new Date(),
      });

    res.json({
      success: true,
      productsAdded,
      productsUpdated,
      productsSkipped,
      errors,
    });
  } catch (error) {
    console.error('Inventory sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      errors: [error.message],
    });
  }
});

// Helper: Get QuickBooks client with token refresh
async function getQBOClient(userId) {
  const connection = await db('quickbooks_connections')
    .where('user_id', userId)
    .first();

  if (!connection) {
    throw new Error('QuickBooks not connected');
  }

  let accessToken = decrypt(connection.access_token);

  // Check if token expired
  if (new Date() >= new Date(connection.expires_at)) {
    // Refresh token
    const oauthClient = new OAuthClient({
      clientId: process.env.QB_CLIENT_ID,
      clientSecret: process.env.QB_CLIENT_SECRET,
      environment: process.env.QB_ENVIRONMENT || 'sandbox',
      redirectUri: process.env.QB_REDIRECT_URI,
    });

    oauthClient.setToken({
      refresh_token: decrypt(connection.refresh_token),
    });

    const authResponse = await oauthClient.refresh();
    const tokens = authResponse.getJson();

    accessToken = tokens.access_token;

    // Update stored tokens
    await db('quickbooks_connections')
      .where('id', connection.id)
      .update({
        access_token: encrypt(tokens.access_token),
        refresh_token: encrypt(tokens.refresh_token),
        expires_at: new Date(Date.now() + tokens.expires_in * 1000),
        updated_at: new Date(),
      });
  }

  // Create QuickBooks client
  const qbo = new QuickBooks(
    process.env.QB_CLIENT_ID,
    process.env.QB_CLIENT_SECRET,
    accessToken,
    false,
    connection.realm_id,
    process.env.QB_ENVIRONMENT !== 'production',
    true,
    null,
    '2.0',
    '2.0'
  );

  return { qbo, realmId: connection.realm_id };
}

// Helper: Fetch all items with pagination
async function fetchAllQBItems(qbo) {
  const items = [];
  let startPosition = 1;
  const maxResults = 1000;
  let hasMore = true;

  while (hasMore) {
    const query = `SELECT * FROM Item WHERE Type='Inventory' STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

    const result = await new Promise((resolve, reject) => {
      qbo.reportQuery(query, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (result.QueryResponse.Item) {
      items.push(...result.QueryResponse.Item);
    }

    hasMore = result.QueryResponse.Item?.length === maxResults;
    startPosition += maxResults;
  }

  return items;
}

// Helper: Map QuickBooks item to product schema
function mapQBItemToProduct(qbItem) {
  return {
    name: qbItem.Name,
    sku: qbItem.Sku || qbItem.Name.replace(/\s+/g, '-').toUpperCase(),
    description: qbItem.Description || '',
    price: parseFloat(qbItem.UnitPrice || 0),
    cost: parseFloat(qbItem.PurchaseCost || 0),
    stock: parseInt(qbItem.QtyOnHand || 0),
    in_stock: parseInt(qbItem.QtyOnHand || 0) > 0,
    category_id: null, // Map later if categories exist
    brand: qbItem.ManufacturerPartNumber || null,
    image_url: null, // QB doesn't store images
  };
}
```

---

### 5. POST /api/qb/sync/customers
**Purpose**: Sync customers from QuickBooks to customers table

**Response**:
```typescript
{
  success: true;
  customersAdded: number;
  customersUpdated: number;
  customersSkipped: number;
  errors: string[];
}
```

**Implementation**:
```javascript
app.post('/api/qb/sync/customers', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get connection
    const { qbo, realmId } = await getQBOClient(userId);

    // Create sync log
    const syncLog = await db('qb_sync_history').insert({
      id: uuidv4(),
      user_id: userId,
      sync_type: 'customers',
      status: 'in_progress',
      created_at: new Date(),
    }).returning('*');

    let customersAdded = 0;
    let customersUpdated = 0;
    let customersSkipped = 0;
    const errors = [];

    // Fetch all customers
    const customers = await fetchAllQBCustomers(qbo);

    for (const customer of customers) {
      try {
        // Map QuickBooks customer to our schema
        const customerData = mapQBCustomerToCustomer(customer);

        // Skip if no email
        if (!customerData.email) {
          productsSkipped++;
          continue;
        }

        // Check if customer exists by email
        const existing = await db('customers')
          .where('email', customerData.email)
          .first();

        if (existing) {
          // Update existing customer
          await db('customers')
            .where('id', existing.id)
            .update({
              ...customerData,
              updated_at: new Date(),
            });
          customersUpdated++;
        } else {
          // Insert new customer
          await db('customers').insert({
            id: uuidv4(),
            ...customerData,
            created_at: new Date(),
            updated_at: new Date(),
          });
          customersAdded++;
        }
      } catch (customerError) {
        console.error(`Error processing customer ${customer.DisplayName}:`, customerError);
        errors.push(`${customer.DisplayName}: ${customerError.message}`);
        customersSkipped++;
      }
    }

    // Update sync log
    await db('qb_sync_history')
      .where('id', syncLog[0].id)
      .update({
        status: errors.length === customers.length ? 'error' : 'success',
        customers_added: customersAdded,
        customers_updated: customersUpdated,
        error_message: errors.length > 0 ? errors.join('; ') : null,
        updated_at: new Date(),
      });

    res.json({
      success: true,
      customersAdded,
      customersUpdated,
      customersSkipped,
      errors,
    });
  } catch (error) {
    console.error('Customer sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      customersAdded: 0,
      customersUpdated: 0,
      customersSkipped: 0,
      errors: [error.message],
    });
  }
});

// Helper: Fetch all customers with pagination
async function fetchAllQBCustomers(qbo) {
  const customers = [];
  let startPosition = 1;
  const maxResults = 1000;
  let hasMore = true;

  while (hasMore) {
    const query = `SELECT * FROM Customer STARTPOSITION ${startPosition} MAXRESULTS ${maxResults}`;

    const result = await new Promise((resolve, reject) => {
      qbo.reportQuery(query, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (result.QueryResponse.Customer) {
      customers.push(...result.QueryResponse.Customer);
    }

    hasMore = result.QueryResponse.Customer?.length === maxResults;
    startPosition += maxResults;
  }

  return customers;
}

// Helper: Map QuickBooks customer to customer schema
function mapQBCustomerToCustomer(qbCustomer) {
  const billAddr = qbCustomer.BillAddr || {};
  const shipAddr = qbCustomer.ShipAddr || {};
  const email = qbCustomer.PrimaryEmailAddr?.Address || null;
  const phone = qbCustomer.PrimaryPhone?.FreeFormNumber || null;

  return {
    business_name: qbCustomer.DisplayName || qbCustomer.CompanyName,
    contact_name: qbCustomer.FullyQualifiedName || qbCustomer.DisplayName,
    email: email,
    phone: phone,
    address: billAddr.Line1 || null,
    city: billAddr.City || null,
    state: billAddr.CountrySubDivisionCode || null,
    zip_code: billAddr.PostalCode || null,
    shipping_address: shipAddr.Line1 || billAddr.Line1 || null,
    payment_terms: qbCustomer.PaymentMethodRef?.value || null,
  };
}
```

---

### 6. POST /api/qb/sync/all
**Purpose**: Sync both inventory and customers in one operation

**Response**:
```typescript
{
  success: true;
  productsAdded: number;
  productsUpdated: number;
  productsSkipped: number;
  customersAdded: number;
  customersUpdated: number;
  customersSkipped: number;
  errors: string[];
}
```

**Implementation**:
```javascript
app.post('/api/qb/sync/all', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Create sync log
    const syncLog = await db('qb_sync_history').insert({
      id: uuidv4(),
      user_id: userId,
      sync_type: 'all',
      status: 'in_progress',
      created_at: new Date(),
    }).returning('*');

    // Sync inventory
    const inventoryResult = await syncInventoryInternal(userId);

    // Sync customers
    const customersResult = await syncCustomersInternal(userId);

    // Combine results
    const allErrors = [...inventoryResult.errors, ...customersResult.errors];

    // Update sync log
    await db('qb_sync_history')
      .where('id', syncLog[0].id)
      .update({
        status: allErrors.length > 0 ? 'error' : 'success',
        products_added: inventoryResult.productsAdded,
        products_updated: inventoryResult.productsUpdated,
        customers_added: customersResult.customersAdded,
        customers_updated: customersResult.customersUpdated,
        error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
        updated_at: new Date(),
      });

    res.json({
      success: true,
      productsAdded: inventoryResult.productsAdded,
      productsUpdated: inventoryResult.productsUpdated,
      productsSkipped: inventoryResult.productsSkipped,
      customersAdded: customersResult.customersAdded,
      customersUpdated: customersResult.customersUpdated,
      customersSkipped: customersResult.customersSkipped,
      errors: allErrors,
    });
  } catch (error) {
    console.error('Full sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      productsAdded: 0,
      productsUpdated: 0,
      productsSkipped: 0,
      customersAdded: 0,
      customersUpdated: 0,
      customersSkipped: 0,
      errors: [error.message],
    });
  }
});
```

---

### 7. GET /api/qb/sync/history
**Purpose**: Get sync history

**Response**:
```typescript
{
  history: Array<{
    id: string;
    sync_type: 'inventory' | 'customers' | 'all';
    status: 'success' | 'error' | 'in_progress';
    products_added: number;
    products_updated: number;
    customers_added: number;
    customers_updated: number;
    error_message?: string;
    created_at: string;
  }>;
}
```

**Implementation**:
```javascript
app.get('/api/qb/sync/history', authenticateUser, async (req, res) => {
  try {
    const history = await db('qb_sync_history')
      .where('user_id', req.user.id)
      .orderBy('created_at', 'desc')
      .limit(50);

    res.json({ history });
  } catch (error) {
    console.error('Sync history error:', error);
    res.status(500).json({ error: 'Failed to fetch sync history' });
  }
});
```

---

### 8. POST /api/qb/disconnect
**Purpose**: Disconnect QuickBooks integration

**Implementation**:
```javascript
app.post('/api/qb/disconnect', authenticateUser, async (req, res) => {
  try {
    // Revoke tokens with QuickBooks
    const connection = await db('quickbooks_connections')
      .where('user_id', req.user.id)
      .first();

    if (connection) {
      try {
        const oauthClient = new OAuthClient({
          clientId: process.env.QB_CLIENT_ID,
          clientSecret: process.env.QB_CLIENT_SECRET,
          environment: process.env.QB_ENVIRONMENT || 'sandbox',
          redirectUri: process.env.QB_REDIRECT_URI,
        });

        oauthClient.setToken({
          access_token: decrypt(connection.access_token),
        });

        await oauthClient.revoke();
      } catch (revokeError) {
        console.error('Token revocation error:', revokeError);
        // Continue even if revocation fails
      }
    }

    // Delete connection from database
    await db('quickbooks_connections')
      .where('user_id', req.user.id)
      .delete();

    res.json({ success: true, message: 'QuickBooks disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect QuickBooks' });
  }
});
```

---

## Database Schema

### quickbooks_connections table
```sql
CREATE TABLE quickbooks_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  realm_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  access_token TEXT NOT NULL,         -- Encrypted
  refresh_token TEXT NOT NULL,        -- Encrypted
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_qb_connections_user ON quickbooks_connections(user_id);
CREATE INDEX idx_qb_connections_realm ON quickbooks_connections(realm_id);
```

### qb_sync_history table
```sql
CREATE TABLE qb_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sync_type VARCHAR(50) NOT NULL,     -- 'inventory', 'customers', 'all'
  status VARCHAR(50) NOT NULL,        -- 'success', 'error', 'in_progress'
  products_added INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  customers_added INTEGER DEFAULT 0,
  customers_updated INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qb_sync_history_user ON qb_sync_history(user_id);
CREATE INDEX idx_qb_sync_history_date ON qb_sync_history(created_at DESC);
```

---

## Data Mapping

### QuickBooks Item → Product
```javascript
{
  // QuickBooks fields → Product fields
  Name → name
  Sku → sku (or generate from name if missing)
  Description → description
  UnitPrice → price
  PurchaseCost → cost
  QtyOnHand → stock
  QtyOnHand > 0 → in_stock
  ManufacturerPartNumber → brand
}
```

### QuickBooks Customer → Customer
```javascript
{
  // QuickBooks fields → Customer fields
  DisplayName/CompanyName → business_name
  FullyQualifiedName → contact_name
  PrimaryEmailAddr.Address → email
  PrimaryPhone.FreeFormNumber → phone
  BillAddr.Line1 → address
  BillAddr.City → city
  BillAddr.CountrySubDivisionCode → state
  BillAddr.PostalCode → zip_code
  ShipAddr.Line1 → shipping_address
}
```

---

## Error Handling

### Token Expiration
- Automatically refresh tokens before making API calls
- If refresh fails, mark connection as invalid
- Prompt user to reconnect

### Rate Limits
- QuickBooks has rate limits:
  - 500 requests per minute
  - 5000 requests per day (sandbox)
  - Handle 429 errors with exponential backoff

**Implementation**:
```javascript
async function makeQBRequest(qbo, method, ...args) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await new Promise((resolve, reject) => {
        qbo[method](...args, (err, data) => {
          if (err) reject(err);
          else resolve(data);
        });
      });
    } catch (error) {
      if (error.statusCode === 429) {
        // Rate limit hit, wait and retry
        const waitTime = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        retries++;
      } else {
        throw error;
      }
    }
  }

  throw new Error('Max retries exceeded');
}
```

### Data Validation
- Validate all fields before inserting/updating
- Skip invalid records and log errors
- Continue processing remaining records

### Network Errors
- Retry failed requests with exponential backoff
- Log errors for debugging
- Show user-friendly error messages

---

## Security Measures

### 1. Token Encryption
- Encrypt access/refresh tokens before storing in database
- Use AES-256-CBC encryption
- Store encryption key in environment variable (not in code)

### 2. CSRF Protection
- Use random state parameter in OAuth flow
- Validate state on callback
- Expire state after 10 minutes

### 3. Token Refresh
- Automatically refresh expired tokens
- Never expose tokens in API responses
- Rotate refresh tokens periodically

### 4. Audit Logging
- Log all sync operations
- Log OAuth connections/disconnections
- Track who synced what and when

### 5. Input Validation
- Validate all user inputs
- Sanitize data from QuickBooks
- Prevent SQL injection with parameterized queries

---

## Testing

### 1. OAuth Flow
```bash
# Test authorization URL generation
curl http://localhost:3000/api/qb/auth

# Manually complete OAuth flow in browser
# Verify callback works and tokens are stored
```

### 2. Inventory Sync
```bash
curl -X POST http://localhost:3000/api/qb/sync/inventory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### 3. Customer Sync
```bash
curl -X POST http://localhost:3000/api/qb/sync/customers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

### 4. Sync All
```bash
curl -X POST http://localhost:3000/api/qb/sync/all \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

---

## Production Checklist

- [ ] Create QuickBooks developer account
- [ ] Create production app in QuickBooks
- [ ] Get production Client ID and Secret
- [ ] Set OAuth redirect URI to production URL
- [ ] Generate encryption key for tokens
- [ ] Set all environment variables
- [ ] Create database tables
- [ ] Test OAuth flow in sandbox
- [ ] Test inventory sync
- [ ] Test customer sync
- [ ] Test error handling
- [ ] Test token refresh
- [ ] Set up monitoring/alerts
- [ ] Deploy to production
- [ ] Test production OAuth flow
- [ ] Run production sync

---

## Cost Estimate

**QuickBooks Costs**:
- QuickBooks Online subscription required by user
- Developer account: FREE
- API usage: FREE (within rate limits)

**Infrastructure Costs**:
- No additional costs (uses existing backend)
- Token encryption: Built-in
- Database storage: Minimal (~1 KB per connection)

**Total**: $0 (assuming user has QuickBooks Online subscription)

---

## Maintenance

### Token Refresh
- Tokens refresh automatically before expiration
- Refresh tokens valid for 100 days
- User must re-authorize if refresh token expires

### API Updates
- QuickBooks API is stable (minor version 2.0)
- Monitor QuickBooks developer blog for changes
- Test sync after QuickBooks updates

### Database Maintenance
- Regularly clean old sync history (>90 days)
- Monitor token expiration
- Audit connection usage

---

## Support Resources

- **QuickBooks API Docs**: https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/item
- **OAuth 2.0 Guide**: https://developer.intuit.com/app/developer/qbo/docs/develop/authentication-and-authorization/oauth-2.0
- **Sample Apps**: https://github.com/IntuitDeveloper
- **Support**: https://help.developer.intuit.com/

---

## Next Steps for Backend Developer

1. **Set up QuickBooks developer account** and create sandbox app
2. **Install dependencies**: `npm install intuit-oauth node-quickbooks axios crypto`
3. **Create database tables** (quickbooks_connections, qb_sync_history)
4. **Implement OAuth endpoints** (/auth, /callback)
5. **Implement sync endpoints** (/sync/inventory, /sync/customers, /sync/all)
6. **Implement helper functions** (token refresh, encryption, data mapping)
7. **Test in sandbox** with sample data
8. **Add error handling** and rate limiting
9. **Deploy to production**
10. **Monitor and maintain**

The frontend UI is ready and will work seamlessly once these backend endpoints are implemented!
