import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { verifyToken, authorize } from '../../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Encryption helpers (simple base64 encoding for demo - use proper encryption in production)
const encrypt = (text) => {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!', 'utf8');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decrypt = (encryptedText) => {
  try {
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!', 'utf8');
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    return null;
  }
};

// GET /api/integrations - Get all integrations
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.sub; // From auth middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        key: true, // Will be decrypted
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Decrypt keys for display (masked)
    const maskedKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.service.charAt(0).toUpperCase() + key.service.slice(1),
      key: key.key ? maskKey(key.key) : '',
      masked: true,
      service: key.service,
      status: key.status || 'disconnected',
    }));

    // Get OAuth connections
    const oauthConnections = await prisma.oAuthConnection.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        connected: true,
        accountName: true,
        lastSync: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      apiKeys: maskedKeys,
      oauthConnections,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/integrations/api-keys - Save API key (requires auth)
router.post('/api-keys', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { service, key } = req.body;
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!service || !key) {
      return res.status(400).json({ error: 'Service and key are required' });
    }

    // Encrypt key
    const encryptedKey = encrypt(key);

    // Upsert API key
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_service: {
          userId,
          service,
        },
      },
      update: {
        key: encryptedKey,
        status: 'disconnected', // Will be tested
        updatedAt: new Date(),
      },
      create: {
        userId,
        service,
        key: encryptedKey,
        status: 'disconnected',
      },
    });

    // Test the key
    const testResult = await testApiKey(service, key);
    if (testResult.success) {
      await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { status: 'connected' },
      });
    }

    res.json({
      success: true,
      message: testResult.success ? 'API key saved and verified' : 'API key saved but test failed',
      apiKey: {
        id: apiKey.id,
        service: apiKey.service,
        status: testResult.success ? 'connected' : 'disconnected',
      },
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/integrations/test/:service - Test API key (requires auth)
router.post('/test/:service', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { service } = req.params;
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get API key
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_service: {
          userId,
          service,
        },
      },
    });

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Decrypt key
    const decryptedKey = decrypt(apiKey.key);
    if (!decryptedKey) {
      return res.status(500).json({ error: 'Failed to decrypt API key' });
    }

    // Test the key
    const testResult = await testApiKey(service, decryptedKey);

    // Update status
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { status: testResult.success ? 'connected' : 'disconnected' },
    });

    res.json({
      success: testResult.success,
      message: testResult.message,
    });
  } catch (error) {
    return next(error);
  }
});

// Test API key function
async function testApiKey(service, key) {
  try {
    switch (service) {
      case 'openai':
        const openaiRes = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${key}`,
          },
        });
        if (openaiRes.ok) {
          return { success: true, message: 'OpenAI API key is valid' };
        }
        return { success: false, message: 'OpenAI API key is invalid' };

      case 'claude':
        // Claude API test (Anthropic)
        const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'test' }],
          }),
        });
        if (claudeRes.ok || claudeRes.status === 400) {
          // 400 might mean invalid request but key is valid
          return { success: true, message: 'Claude API key is valid' };
        }
        return { success: false, message: 'Claude API key is invalid' };

      case 'gemini':
        // Gemini API test
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        if (geminiRes.ok) {
          return { success: true, message: 'Gemini API key is valid' };
        }
        return { success: false, message: 'Gemini API key is invalid' };

      default:
        return { success: false, message: 'Unknown service' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Test failed' };
  }
}

// GET /api/integrations/canva/auth - Initiate Canva OAuth (requires auth)
router.get('/canva/auth', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
    const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'http://localhost:4000/api/integrations/canva/callback';
    const CANVA_SCOPE = 'design:read design:write';

    if (!CANVA_CLIENT_ID) {
      return res.status(500).json({
        error: 'Canva OAuth not configured',
        message: 'Please set CANVA_CLIENT_ID in environment variables',
      });
    }

    // Generate state for OAuth
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in database
    await prisma.oAuthState.create({
      data: {
        userId,
        service: 'canva',
        state,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    const authUrl = `https://www.canva.com/api/oauth/authorize?` +
      `client_id=${CANVA_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(CANVA_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(CANVA_SCOPE)}&` +
      `response_type=code&` +
      `state=${state}`;

    res.json({
      success: true,
      authUrl,
      message: 'Redirect to Canva for authorization',
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/integrations/canva/callback - Canva OAuth callback
router.get('/canva/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Verify state
    const oauthState = await prisma.oAuthState.findFirst({
      where: {
        state,
        service: 'canva',
        expiresAt: { gt: new Date() },
      },
    });

    if (!oauthState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    const userId = oauthState.userId;

    // Exchange code for tokens
    const CANVA_CLIENT_ID = process.env.CANVA_CLIENT_ID;
    const CANVA_CLIENT_SECRET = process.env.CANVA_CLIENT_SECRET;
    const CANVA_REDIRECT_URI = process.env.CANVA_REDIRECT_URI || 'http://localhost:4000/api/integrations/canva/callback';

    const tokenRes = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CANVA_REDIRECT_URI,
        client_id: CANVA_CLIENT_ID,
        client_secret: CANVA_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      return res.status(500).json({ error: 'Failed to exchange code for tokens' });
    }

    const tokenData = await tokenRes.json();

    // Get user info
    const userRes = await fetch('https://api.canva.com/rest/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    let accountName = 'Canva User';
    if (userRes.ok) {
      const userData = await userRes.json();
      accountName = userData.name || userData.email || 'Canva User';
    }

    // Save OAuth connection
    await prisma.oAuthConnection.upsert({
      where: {
        userId_service: {
          userId,
          service: 'canva',
        },
      },
      update: {
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountName,
        connected: true,
        lastSync: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        service: 'canva',
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountName,
        connected: true,
        lastSync: new Date(),
      },
    });

    // Delete state
    await prisma.oAuthState.delete({
      where: { id: oauthState.id },
    });

    // Redirect to success page
    res.redirect('/admin/integrations?connected=canva');
  } catch (error) {
    return next(error);
  }
});

// GET /api/integrations/bolt/auth - Initiate Bolt.new OAuth (requires auth)
router.get('/bolt/auth', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const BOLT_CLIENT_ID = process.env.BOLT_CLIENT_ID;
    const BOLT_REDIRECT_URI = process.env.BOLT_REDIRECT_URI || 'http://localhost:4000/api/integrations/bolt/callback';
    const BOLT_SCOPE = 'read write';

    if (!BOLT_CLIENT_ID) {
      return res.status(500).json({
        error: 'Bolt.new OAuth not configured',
        message: 'Please set BOLT_CLIENT_ID in environment variables',
      });
    }

    // Generate state for OAuth
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state in database
    await prisma.oAuthState.create({
      data: {
        userId,
        service: 'bolt',
        state,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Bolt.new OAuth URL (adjust based on actual Bolt.new API)
    const authUrl = `https://bolt.new/oauth/authorize?` +
      `client_id=${BOLT_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(BOLT_REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(BOLT_SCOPE)}&` +
      `response_type=code&` +
      `state=${state}`;

    res.json({
      success: true,
      authUrl,
      message: 'Redirect to Bolt.new for authorization',
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/integrations/bolt/callback - Bolt.new OAuth callback
router.get('/bolt/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state' });
    }

    // Verify state
    const oauthState = await prisma.oAuthState.findFirst({
      where: {
        state,
        service: 'bolt',
        expiresAt: { gt: new Date() },
      },
    });

    if (!oauthState) {
      return res.status(400).json({ error: 'Invalid or expired state' });
    }

    const userId = oauthState.userId;

    // Exchange code for tokens (adjust based on actual Bolt.new API)
    const BOLT_CLIENT_ID = process.env.BOLT_CLIENT_ID;
    const BOLT_CLIENT_SECRET = process.env.BOLT_CLIENT_SECRET;
    const BOLT_REDIRECT_URI = process.env.BOLT_REDIRECT_URI || 'http://localhost:4000/api/integrations/bolt/callback';

    const tokenRes = await fetch('https://bolt.new/api/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: BOLT_REDIRECT_URI,
        client_id: BOLT_CLIENT_ID,
        client_secret: BOLT_CLIENT_SECRET,
      }),
    });

    if (!tokenRes.ok) {
      return res.status(500).json({ error: 'Failed to exchange code for tokens' });
    }

    const tokenData = await tokenRes.json();

    // Get user info (adjust based on actual Bolt.new API)
    const userRes = await fetch('https://bolt.new/api/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    let accountName = 'Bolt.new User';
    if (userRes.ok) {
      const userData = await userRes.json();
      accountName = userData.name || userData.email || 'Bolt.new User';
    }

    // Save OAuth connection
    await prisma.oAuthConnection.upsert({
      where: {
        userId_service: {
          userId,
          service: 'bolt',
        },
      },
      update: {
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountName,
        connected: true,
        lastSync: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId,
        service: 'bolt',
        accessToken: encrypt(tokenData.access_token),
        refreshToken: tokenData.refresh_token ? encrypt(tokenData.refresh_token) : null,
        accountName,
        connected: true,
        lastSync: new Date(),
      },
    });

    // Delete state
    await prisma.oAuthState.delete({
      where: { id: oauthState.id },
    });

    // Redirect to success page
    res.redirect('/admin/integrations?connected=bolt');
  } catch (error) {
    return next(error);
  }
});

// POST /api/integrations/:service/disconnect - Disconnect OAuth (requires auth)
router.post('/:service/disconnect', verifyToken, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { service } = req.params;
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.oAuthConnection.update({
      where: {
        userId_service: {
          userId,
          service,
        },
      },
      data: {
        connected: false,
        accessToken: null,
        refreshToken: null,
      },
    });

    res.json({
      success: true,
      message: `${service} disconnected successfully`,
    });
  } catch (error) {
    return next(error);
  }
});

// Helper function to mask API key
function maskKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return `${key.substring(0, 4)}${'•'.repeat(key.length - 8)}${key.substring(key.length - 4)}`;
}

export default router;

