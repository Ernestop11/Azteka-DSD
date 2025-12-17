import express from 'express';
import { getAuthorizationUrl, exchangeCodeForTokens, revokeToken } from '../lib/quickbooks-auth.mjs';
import { getQBCompanyInfo } from '../lib/quickbooks-client.mjs';
import { syncProductsFromQuickBooks, syncProductsToQuickBooks } from '../services/quickbooks-product-sync.mjs';
import { syncCustomersFromQuickBooks, syncCustomersToQuickBooks } from '../services/quickbooks-customer-sync.mjs';

const router = express.Router();

router.get('/auth/url', (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7);
    const authUrl = getAuthorizationUrl(state);
    res.json({ success: true, auth_url: authUrl, state });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/auth/callback', async (req, res) => {
  try {
    const { code, realmId } = req.query;
    if (!code) return res.status(400).json({ success: false, error: 'Authorization code missing' });

    const tokens = await exchangeCodeForTokens(code);
    res.json({
      success: true,
      message: 'QuickBooks connected successfully',
      realm_id: realmId || tokens.realm_id,
      expires_in: tokens.expires_in,
      instructions: 'Save refresh_token to QB_REFRESH_TOKEN',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/auth/revoke', async (req, res) => {
  try {
    await revokeToken();
    res.json({ success: true, message: 'QuickBooks token revoked' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/status', async (req, res) => {
  try {
    const companyInfo = await getQBCompanyInfo();
    res.json({
      success: true,
      connected: true,
      company: companyInfo.CompanyInfo,
      realm_id: process.env.QB_REALM_ID,
    });
  } catch (error) {
    res.status(500).json({ success: false, connected: false, error: error.message });
  }
});

router.post('/sync/products/pull', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    if (!prisma) return res.status(500).json({ success: false, error: 'DB unavailable' });
    const results = await syncProductsFromQuickBooks(prisma);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sync/products/push', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    if (!prisma) return res.status(500).json({ success: false, error: 'DB unavailable' });
    const results = await syncProductsToQuickBooks(prisma);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sync/customers/pull', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    if (!prisma) return res.status(500).json({ success: false, error: 'DB unavailable' });
    const results = await syncCustomersFromQuickBooks(prisma);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sync/customers/push', async (req, res) => {
  try {
    const prisma = req.app.locals.prisma;
    if (!prisma) return res.status(500).json({ success: false, error: 'DB unavailable' });
    const results = await syncCustomersToQuickBooks(prisma);
    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

