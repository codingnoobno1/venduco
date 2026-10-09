<<<<<<< HEAD
# 🔑 Admin APIs

Admin-only endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/{id}` | PUT | Admin | Update/verify user |

---

## GET /api/admin/users

List all users with filters.

**Query Params:**
- `?status=PENDING_VERIFICATION`
- `?role=VENDOR`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "VENDOR",
      "status": "PENDING_VERIFICATION",
      "createdAt": "2024-12-14T10:00:00Z"
    }
  ],
  "counts": {
    "total": 150,
    "pending": 5,
    "approved": 140,
    "rejected": 5
  }
}
```

---

## PUT /api/admin/users/{id}

Verify or update user.

**Approve:**
```json
{
  "status": "APPROVED"
}
```

**Reject:**
```json
{
  "status": "REJECTED",
  "rejectionReason": "Incomplete documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User verified successfully"
}
```
=======
# 🔑 Admin APIs

Admin-only endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/{id}` | PUT | Admin | Update/verify user |

---

## GET /api/admin/users

List all users with filters.

**Query Params:**
- `?status=PENDING_VERIFICATION`
- `?role=VENDOR`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "user_123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "VENDOR",
      "status": "PENDING_VERIFICATION",
      "createdAt": "2024-12-14T10:00:00Z"
    }
  ],
  "counts": {
    "total": 150,
    "pending": 5,
    "approved": 140,
    "rejected": 5
  }
}
```

---

## PUT /api/admin/users/{id}

Verify or update user.

**Approve:**
```json
{
  "status": "APPROVED"
}
```

**Reject:**
```json
{
  "status": "REJECTED",
  "rejectionReason": "Incomplete documents"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User verified successfully"
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
