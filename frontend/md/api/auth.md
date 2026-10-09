<<<<<<< HEAD
# 🔐 Auth APIs

Authentication and registration endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Login, get JWT |
| `/api/auth/me` | GET | Bearer | Get current user |

---

## POST /api/auth/login

Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "VENDOR"
  }
}
```

---

## GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "VENDOR",
    "status": "APPROVED"
  }
}
```

---

## Token Structure

```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "VENDOR",
  "exp": 1734567890
}
```
=======
# 🔐 Auth APIs

Authentication and registration endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/login` | POST | ❌ | Login, get JWT |
| `/api/auth/me` | GET | Bearer | Get current user |

---

## POST /api/auth/login

Login and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "VENDOR"
  }
}
```

---

## GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "VENDOR",
    "status": "APPROVED"
  }
}
```

---

## Token Structure

```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "VENDOR",
  "exp": 1734567890
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
