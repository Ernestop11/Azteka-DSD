import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Decryption helper
const decrypt = (encryptedText) => {
  try {
    if (!encryptedText) return null;
    const algorithm = 'aes-256-cbc';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-characters-long!!', 'utf8');
    const parts = encryptedText.split(':');
    if (parts.length !== 2) return null;
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

// Get API key for service
export async function getApiKey(userId, service) {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        userId_service: {
          userId,
          service,
        },
      },
    });

    if (!apiKey || apiKey.status !== 'connected') {
      return null;
    }

    const decrypted = decrypt(apiKey.key);
    return decrypted;
  } catch (error) {
    console.error(`Failed to get API key for ${service}:`, error);
    return null;
  }
}

// Get OAuth token for service
export async function getOAuthToken(userId, service) {
  try {
    const connection = await prisma.oAuthConnection.findUnique({
      where: {
        userId_service: {
          userId,
          service,
        },
      },
    });

    if (!connection || !connection.connected || !connection.accessToken) {
      return null;
    }

    const decrypted = decrypt(connection.accessToken);
    return decrypted;
  } catch (error) {
    console.error(`Failed to get OAuth token for ${service}:`, error);
    return null;
  }
}

// Use OpenAI API
export async function useOpenAI(userId, prompt, options = {}) {
  const apiKey = await getApiKey(userId, 'openai');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return response.json();
}

// Use Claude API
export async function useClaude(userId, prompt, options = {}) {
  const apiKey = await getApiKey(userId, 'claude');
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options.max_tokens || 1024,
      messages: [{ role: 'user', content: prompt }],
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  return response.json();
}

// Use Gemini API
export async function useGemini(userId, prompt, options = {}) {
  const apiKey = await getApiKey(userId, 'gemini');
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${options.model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }],
      }],
      ...options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  return response.json();
}

// Use Canva API
export async function useCanva(userId, endpoint, options = {}) {
  const accessToken = await getOAuthToken(userId, 'canva');
  if (!accessToken) {
    throw new Error('Canva not connected');
  }

  const response = await fetch(`https://api.canva.com/rest/v1/${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Canva API error: ${response.statusText}`);
  }

  return response.json();
}

// Use Bolt.new API
export async function useBolt(userId, endpoint, options = {}) {
  const accessToken = await getOAuthToken(userId, 'bolt');
  if (!accessToken) {
    throw new Error('Bolt.new not connected');
  }

  const response = await fetch(`https://bolt.new/api/${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Bolt.new API error: ${response.statusText}`);
  }

  return response.json();
}

