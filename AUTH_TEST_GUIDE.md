# 🔐 Authentication Test Guide

## ✅ Backend Status: WORKING

The authentication API is fully functional. All tests pass.

---

## 📋 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@aztekafoods.com` | `admin123` |
| **Sales Rep** | `sales@aztekafoods.com` | `sales123` |
| **Driver** | `driver@aztekafoods.com` | `driver123` |
| **Customer** | `customer@example.com` | `customer123` |

---

## 🧪 Smoke Test Results

### ✅ Backend API Tests (All Passing)

1. **Login Endpoint**: ✅ Working
   ```bash
   curl -X POST https://aztekafoods.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@aztekafoods.com","password":"admin123"}'
   ```
   **Response**: `{"success":true,"user":{...}}`

2. **Session Cookie**: ✅ Being Set
   - Cookie name: `session_azteka`
   - HttpOnly: Yes
   - Secure: Yes (in production)
   - SameSite: Lax

3. **Auth/Me Endpoint**: ✅ Working
   ```bash
   curl -X GET https://aztekafoods.com/api/auth/me \
     -H "Cookie: session_azteka=..."
   ```
   **Response**: `{"id":"...","email":"admin@aztekafoods.com","role":"ADMIN"}`

4. **Password Verification**: ✅ Working
   - Bcrypt hashing: ✅ Correct format
   - Password comparison: ✅ Working

---

## 🌐 Frontend Test Steps

### Test 1: Login via Web Browser

1. **Navigate to**: `https://aztekafoods.com/auth/login` or `https://aztekafoods.com/login`

2. **Enter Credentials**:
   - Email: `admin@aztekafoods.com`
   - Password: `admin123`

3. **Expected Result**:
   - ✅ Login succeeds
   - ✅ Redirects to `/admin/products` or `/catalog`
   - ✅ Session cookie is set in browser
   - ✅ User can access protected routes

### Test 2: Verify Session Persistence

1. **After Login**:
   - Open browser DevTools → Application → Cookies
   - Verify `session_azteka` cookie exists
   - Cookie should be HttpOnly and Secure

2. **Refresh Page**:
   - ✅ User should remain logged in
   - ✅ `/api/auth/me` should return user data

3. **Navigate to Protected Route**:
   - Try accessing `/admin/products`
   - ✅ Should load without redirecting to login

### Test 3: Logout

1. **Call Logout** (if implemented):
   - Should clear `session_azteka` cookie
   - Should redirect to login page

---

## 🔧 Troubleshooting

### If Login Fails in Browser:

1. **Check Browser Console**:
   - Look for CORS errors
   - Check for cookie-related errors
   - Verify network requests

2. **Check Cookie Settings**:
   - Ensure cookies are enabled
   - Check if browser blocks third-party cookies
   - Verify `credentials: 'include'` in fetch calls

3. **Check Network Tab**:
   - Verify POST to `/api/auth/login` returns 200
   - Check if `Set-Cookie` header is present
   - Verify cookie is being sent on subsequent requests

4. **Test Direct API Call**:
   ```bash
   # From browser console:
   fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({
       email: 'admin@aztekafoods.com',
       password: 'admin123'
     })
   }).then(r => r.json()).then(console.log)
   ```

---

## 📊 Current Status

- ✅ **Backend API**: Fully functional
- ✅ **Session Creation**: Working
- ✅ **Cookie Setting**: Working
- ✅ **Password Hashing**: Working
- ✅ **Database**: Connected and working
- ⚠️ **Frontend**: Needs browser testing

---

## 🎯 Quick Test Command

```bash
# Test login from command line
curl -X POST https://aztekafoods.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aztekafoods.com","password":"admin123"}' \
  -c cookies.txt -v

# Test auth/me with cookie
curl -X GET https://aztekafoods.com/api/auth/me \
  -b cookies.txt
```

---

## 📝 Notes

- All passwords are hashed with bcrypt (10 rounds)
- Sessions expire after 30 days
- Cookies are HttpOnly (not accessible via JavaScript)
- Cookies are Secure in production (HTTPS only)
- Session tokens are stored in database

---

**Last Updated**: 2025-12-17
**Status**: ✅ Backend Working - Ready for Frontend Testing







