# 🔧 Integrations Setup Guide

## 🚀 Quick Start

### 1. Run Database Migration

```bash
cd /Users/ernestoponce/dev/azteka-dsd
npx prisma migrate dev --name add_integrations
npx prisma generate
```

### 2. Set Encryption Key

Add to `.env.production`:

```bash
# Encryption key for API keys and OAuth tokens (32 characters)
ENCRYPTION_KEY=your-32-character-encryption-key-here!!
```

**Generate a secure key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Configure API Keys

1. Navigate to `/admin/integrations`
2. Add your API keys:
   - **OpenAI** - Get from https://platform.openai.com/api-keys
   - **Claude (Anthropic)** - Get from https://console.anthropic.com/
   - **Google Gemini** - Get from https://makersuite.google.com/app/apikey
3. Test each key
4. Verify status shows "connected"

### 4. Connect OAuth Services

#### Canva Pro
1. Register app at https://www.canva.com/developers/
2. Get Client ID and Client Secret
3. Set redirect URI: `http://localhost:4000/api/integrations/canva/callback`
4. Add to `.env.production`:
   ```bash
   CANVA_CLIENT_ID=your_canva_client_id
   CANVA_CLIENT_SECRET=your_canva_client_secret
   CANVA_REDIRECT_URI=http://localhost:4000/api/integrations/canva/callback
   ```
5. Click "Connect Canva Pro" in `/admin/integrations`
6. Complete OAuth flow

#### Bolt.new
1. Register app at https://bolt.new/developers (if available)
2. Get Client ID and Client Secret
3. Set redirect URI: `http://localhost:4000/api/integrations/bolt/callback`
4. Add to `.env.production`:
   ```bash
   BOLT_CLIENT_ID=your_bolt_client_id
   BOLT_CLIENT_SECRET=your_bolt_client_secret
   BOLT_REDIRECT_URI=http://localhost:4000/api/integrations/bolt/callback
   ```
5. Click "Connect Bolt.new" in `/admin/integrations`
6. Complete OAuth flow

---

## 📋 Complete Setup

### Environment Variables

Add to `.env.production`:

```bash
# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-here!!

# Canva OAuth
CANVA_CLIENT_ID=your_canva_client_id
CANVA_CLIENT_SECRET=your_canva_client_secret
CANVA_REDIRECT_URI=http://localhost:4000/api/integrations/canva/callback

# Bolt.new OAuth
BOLT_CLIENT_ID=your_bolt_client_id
BOLT_CLIENT_SECRET=your_bolt_client_secret
BOLT_REDIRECT_URI=http://localhost:4000/api/integrations/bolt/callback
```

### API Keys (Configure in UI)

1. **OpenAI**
   - Get from: https://platform.openai.com/api-keys
   - Add in `/admin/integrations`
   - Test key

2. **Claude (Anthropic)**
   - Get from: https://console.anthropic.com/
   - Add in `/admin/integrations`
   - Test key

3. **Google Gemini**
   - Get from: https://makersuite.google.com/app/apikey
   - Add in `/admin/integrations`
   - Test key

---

## ✅ Verification

### Test API Keys
1. Go to `/admin/integrations`
2. Click "Test" for each API key
3. Verify status shows "connected"

### Test OAuth Connections
1. Click "Connect Canva Pro"
2. Complete OAuth flow
3. Verify connection shows "connected"
4. Repeat for Bolt.new

### Test AI Services
1. Go to `/admin/test`
2. Run "Image Processing" tests
3. Run "AI PO Suggestions" tests
4. Verify all tests pass

---

## 🔧 Troubleshooting

### API Keys Not Working
1. Check key is saved in `/admin/integrations`
2. Test key using "Test" button
3. Verify key is valid
4. Check API quota limits

### OAuth Not Connecting
1. Check OAuth credentials in `.env.production`
2. Verify redirect URI matches
3. Check OAuth state expiration
4. Review OAuth callback logs

### AI Services Not Working
1. Check user has API key configured
2. Verify API key is valid
3. Check fallback to environment variables
4. Review error messages

---

## 📝 Next Steps

1. ✅ Run database migration
2. ✅ Set encryption key
3. ✅ Configure API keys
4. ✅ Connect OAuth services
5. ✅ Test all integrations

**Ready to use!** 🚀

