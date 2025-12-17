import fetch from 'node-fetch';

const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';

let cachedAccessToken = null;
let tokenExpiry = null;

export async function refreshAccessToken() {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  const refreshToken = process.env.QB_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('QuickBooks credentials missing in environment');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to refresh QuickBooks token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

export async function getValidAccessToken() {
  if (!cachedAccessToken || !tokenExpiry || Date.now() >= tokenExpiry) {
    const tokens = await refreshAccessToken();
    return tokens.access_token;
  }
  return cachedAccessToken;
}

export async function exchangeCodeForTokens(authCode) {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  const redirectUri = process.env.QB_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('QuickBooks OAuth configuration missing');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(QB_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange auth code: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  cachedAccessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    realm_id: data.realmId,
  };
}

export function getAuthorizationUrl(state = null) {
  const clientId = process.env.QB_CLIENT_ID;
  const redirectUri = process.env.QB_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    throw new Error('QuickBooks OAuth configuration missing');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: redirectUri,
    response_type: 'code',
    state: state || Math.random().toString(36).substring(7),
  });

  return `${QB_AUTH_URL}?${params.toString()}`;
}

export async function revokeToken() {
  const clientId = process.env.QB_CLIENT_ID;
  const clientSecret = process.env.QB_CLIENT_SECRET;
  const refreshToken = process.env.QB_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('QuickBooks credentials missing');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/revoke', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      token: refreshToken,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to revoke token: ${response.status} - ${errorText}`);
  }

  cachedAccessToken = null;
  tokenExpiry = null;

  return true;
}

