<<<<<<< HEAD
# 📝 Registration APIs

Multi-step user registration flow.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/registration/step1` | POST | ❌ | Create account |
| `/api/registration/step2` | PUT | Bearer | Profile setup |
| `/api/registration/step3` | PUT | Bearer | Role details |
| `/api/registration/submit` | POST | Bearer | Submit for verification |
| `/api/registration/status` | GET | Bearer | Get current status |

---

## POST /api/registration/step1

Create account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user_123"
}
```

---

## PUT /api/registration/step2

Add profile details.

**Request:**
```json
{
  "phone": "9876543210",
  "companyName": "ABC Construction",
  "address": "Delhi, India"
}
```

---

## PUT /api/registration/step3

Role-specific details.

**For VENDOR:**
```json
{
  "role": "VENDOR",
  "vendorType": "MACHINE_OWNER",
  "machineTypes": ["TOWER_CRANE", "EXCAVATOR"],
  "gstin": "29ABCDE1234F1Z5"
}
```

**For PM:**
```json
{
  "role": "PM",
  "companyId": "company_123",
  "experience": "10 years"
}
```

---

## POST /api/registration/submit

Submit registration for admin verification.

**Response:**
```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "message": "Your registration is pending admin approval"
}
```

---

## GET /api/registration/status

Check registration status.

**Response:**
```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "submittedAt": "2024-12-14T10:00:00Z"
}
```
=======
# 📝 Registration APIs

Multi-step user registration flow.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/registration/step1` | POST | ❌ | Create account |
| `/api/registration/step2` | PUT | Bearer | Profile setup |
| `/api/registration/step3` | PUT | Bearer | Role details |
| `/api/registration/submit` | POST | Bearer | Submit for verification |
| `/api/registration/status` | GET | Bearer | Get current status |

---

## POST /api/registration/step1

Create account with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "userId": "user_123"
}
```

---

## PUT /api/registration/step2

Add profile details.

**Request:**
```json
{
  "phone": "9876543210",
  "companyName": "ABC Construction",
  "address": "Delhi, India"
}
```

---

## PUT /api/registration/step3

Role-specific details.

**For VENDOR:**
```json
{
  "role": "VENDOR",
  "vendorType": "MACHINE_OWNER",
  "machineTypes": ["TOWER_CRANE", "EXCAVATOR"],
  "gstin": "29ABCDE1234F1Z5"
}
```

**For PM:**
```json
{
  "role": "PM",
  "companyId": "company_123",
  "experience": "10 years"
}
```

---

## POST /api/registration/submit

Submit registration for admin verification.

**Response:**
```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "message": "Your registration is pending admin approval"
}
```

---

## GET /api/registration/status

Check registration status.

**Response:**
```json
{
  "success": true,
  "status": "PENDING_VERIFICATION",
  "submittedAt": "2024-12-14T10:00:00Z"
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
