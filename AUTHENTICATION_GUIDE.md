<<<<<<< HEAD
# Authentication API Guide

## ✅ YES! You Can Now Login and Register!

Authentication is fully set up with JWT tokens and password hashing.

---

## 🔐 Environment Setup

**Add to your `.env.local` file:**

```bash
MONGODB_URI=mongodb://localhost:27017/sampl1/?directConnection=true
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random string in production!

---

## 📡 Authentication Endpoints

### 1. **Register New User** - `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendorconnect.com",
    "password": "admin123",
    "name": "Admin User",
    "phone": "+91-9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "675d1234567890abcdef",
    "email": "admin@vendorconnect.com",
    "name": "Admin User",
    "phone": "+91-9876543210",
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2024-12-14T15:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

**Validations:**
- ✅ Email format validation
- ✅ Password minimum 6 characters
- ✅ Duplicate email check
- ✅ Password hashed with bcrypt (10 rounds)

---

### 2. **Login** - `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendorconnect.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "675d1234567890abcdef",
      "email": "admin@vendorconnect.com",
      "name": "Admin User",
      "phone": "+91-9876543210",
      "avatar": null,
      "emailVerified": false,
      "isActive": true,
      "lastLoginAt": "2024-12-14T15:05:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Features:**
- ✅ Password verification with bcrypt
- ✅ JWT token (valid for 7 days)
- ✅ Last login timestamp updated
- ✅ Active account check

**Save the token!** You'll need it for protected routes.

---

### 3. **Get Current User** - `GET /api/auth/me`

**Request (with token in header):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "675d1234567890abcdef",
    "email": "admin@vendorconnect.com",
    "name": "Admin User",
    "phone": "+91-9876543210",
    "avatar": null,
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2024-12-14T15:00:00.000Z",
    "updatedAt": "2024-12-14T15:05:00.000Z",
    "lastLoginAt": "2024-12-14T15:05:00.000Z"
  }
}
```

---

## 🔒 Using Authentication in Your App

### Frontend Login Example (React/Next.js)

```typescript
// Login function
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    
    // Redirect to dashboard
    window.location.href = '/dashboard'
  } else {
    alert(data.error)
  }
}

// Making authenticated requests
async function getProfile() {
  const token = localStorage.getItem('token')
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return await response.json()
}
```

---

## 🚀 Quick Test Flow

**1. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

**2. Login with that user:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**3. Copy the token from response and get user profile:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Security Features

✅ **Passwords** - Hashed with bcrypt (10 salt rounds)  
✅ **JWT Tokens** - Signed with secret, 7-day expiry  
✅ **Email Validation** - Regex pattern check  
✅ **Duplicate Prevention** - Email uniqueness enforced  
✅ **Account Status** - Inactive accounts blocked  
✅ **Token Verification** - All protected routes verified  

---

## ⚠️ Error Responses

**Invalid Credentials (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Email Already Exists (409):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

**Invalid Token (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## ✅ Status: **Authentication Ready!**

You can now:
- ✅ Register new users
- ✅ Login and get JWT tokens
- ✅ Access protected routes with tokens
- ✅ Get current user profile

**Next:** Build login/register UI components! 🎉
=======
# Authentication API Guide

## ✅ YES! You Can Now Login and Register!

Authentication is fully set up with JWT tokens and password hashing.

---

## 🔐 Environment Setup

**Add to your `.env.local` file:**

```bash
MONGODB_URI=mongodb://localhost:27017/sampl1/?directConnection=true
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random string in production!

---

## 📡 Authentication Endpoints

### 1. **Register New User** - `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendorconnect.com",
    "password": "admin123",
    "name": "Admin User",
    "phone": "+91-9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "675d1234567890abcdef",
    "email": "admin@vendorconnect.com",
    "name": "Admin User",
    "phone": "+91-9876543210",
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2024-12-14T15:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

**Validations:**
- ✅ Email format validation
- ✅ Password minimum 6 characters
- ✅ Duplicate email check
- ✅ Password hashed with bcrypt (10 rounds)

---

### 2. **Login** - `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@vendorconnect.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "675d1234567890abcdef",
      "email": "admin@vendorconnect.com",
      "name": "Admin User",
      "phone": "+91-9876543210",
      "avatar": null,
      "emailVerified": false,
      "isActive": true,
      "lastLoginAt": "2024-12-14T15:05:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Features:**
- ✅ Password verification with bcrypt
- ✅ JWT token (valid for 7 days)
- ✅ Last login timestamp updated
- ✅ Active account check

**Save the token!** You'll need it for protected routes.

---

### 3. **Get Current User** - `GET /api/auth/me`

**Request (with token in header):**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "675d1234567890abcdef",
    "email": "admin@vendorconnect.com",
    "name": "Admin User",
    "phone": "+91-9876543210",
    "avatar": null,
    "emailVerified": false,
    "isActive": true,
    "createdAt": "2024-12-14T15:00:00.000Z",
    "updatedAt": "2024-12-14T15:05:00.000Z",
    "lastLoginAt": "2024-12-14T15:05:00.000Z"
  }
}
```

---

## 🔒 Using Authentication in Your App

### Frontend Login Example (React/Next.js)

```typescript
// Login function
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  })

  const data = await response.json()

  if (data.success) {
    // Save token to localStorage
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data.user))
    
    // Redirect to dashboard
    window.location.href = '/dashboard'
  } else {
    alert(data.error)
  }
}

// Making authenticated requests
async function getProfile() {
  const token = localStorage.getItem('token')
  
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  return await response.json()
}
```

---

## 🚀 Quick Test Flow

**1. Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

**2. Login with that user:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

**3. Copy the token from response and get user profile:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🔐 Security Features

✅ **Passwords** - Hashed with bcrypt (10 salt rounds)  
✅ **JWT Tokens** - Signed with secret, 7-day expiry  
✅ **Email Validation** - Regex pattern check  
✅ **Duplicate Prevention** - Email uniqueness enforced  
✅ **Account Status** - Inactive accounts blocked  
✅ **Token Verification** - All protected routes verified  

---

## ⚠️ Error Responses

**Invalid Credentials (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Email Already Exists (409):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

**Invalid Token (401):**
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

---

## ✅ Status: **Authentication Ready!**

You can now:
- ✅ Register new users
- ✅ Login and get JWT tokens
- ✅ Access protected routes with tokens
- ✅ Get current user profile

**Next:** Build login/register UI components! 🎉
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
