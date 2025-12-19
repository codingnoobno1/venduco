<<<<<<< HEAD
# 🔌 Registration API Documentation

*Multi-Step REST API for Registration Flow*

---

## 📋 Overview

This API enables **any client** (Next.js, MAUI, Mobile, etc.) to complete the multi-step registration process.

### Flow
```
Step 1: Create Account → Returns userId + token
Step 2: Update Profile → Select role, location
Step 3: Submit Role Details → Vendor/PM/Supervisor specific
Step 4: Upload Documents (OPTIONAL)
Step 5: Submit for Verification
```

---

## 🔐 Authentication

After Step 1, all subsequent requests require:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### Step 1: Create Account
`POST /api/registration/step1`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "675d...",
    "token": "eyJhbG...",
    "registrationStep": 1,
    "status": "PENDING_PROFILE"
  }
}
```

---

### Step 2: Profile Setup
`PUT /api/registration/step2`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "city": "Mumbai",
  "state": "MH",
  "preferredLanguage": "en",
  "requestedRole": "VENDOR",
  "operatingRegions": ["MH", "GJ"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 2,
    "status": "ROLE_DECLARED",
    "requestedRole": "VENDOR"
  }
}
```

---

### Step 3: Role-Specific Details
`PUT /api/registration/step3`

**Headers:** `Authorization: Bearer <token>`

#### For VENDOR:
```json
{
  "businessType": "PVT_LTD",
  "businessName": "ABC Suppliers",
  "yearsOfOperation": 5,
  "serviceCategories": ["MACHINERY", "MATERIALS"],
  "gstNumber": "22ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "bankAccountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "bankAccountName": "ABC Suppliers"
}
```

#### For PROJECT_MANAGER:
```json
{
  "employmentType": "COMPANY",
  "currentOrganization": "XYZ Corp",
  "yearsOfExperience": 10,
  "pastProjects": "Metro Phase 1, Highway NH48",
  "certifications": "PMP, PRINCE2",
  "declarationAccepted": true
}
```

#### For SUPERVISOR:
```json
{
  "siteExperience": 5,
  "skillCategories": ["CIVIL", "ELECTRICAL"],
  "workingUnderType": "COMPANY",
  "workingUnderName": "XYZ Corp"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 3,
    "status": "DETAILS_COMPLETED"
  }
}
```

---

### Step 4: Upload Documents (OPTIONAL)
`POST /api/registration/upload-document`

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
```
documentType: "GOV_ID" | "BUSINESS_REG" | "GST_CERT" | "BANK_PROOF"
file: <binary>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "fileName": "aadhaar.pdf",
    "status": "UPLOADED"
  }
}
```

---

### Step 5: Submit for Verification
`POST /api/registration/submit`

**Headers:** `Authorization: Bearer <token>`

**Request:** (empty body or optional notes)
```json
{
  "additionalNotes": "Please verify quickly"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 5,
    "status": "UNDER_VERIFICATION",
    "submittedAt": "2024-12-14T17:00:00Z"
  }
}
```

---

### Get Registration Status
`GET /api/registration/status`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "675d...",
    "email": "john@example.com",
    "name": "John Doe",
    "registrationStep": 3,
    "status": "DETAILS_COMPLETED",
    "requestedRole": "VENDOR",
    "profileCompleteness": 75
  }
}
```

---

## 📊 Status Values

| Status | Description |
|--------|-------------|
| `PENDING_PROFILE` | Account created, profile incomplete |
| `ROLE_DECLARED` | Role selected, awaiting details |
| `DETAILS_COMPLETED` | Role details submitted |
| `UNDER_VERIFICATION` | Submitted for admin review |
| `ACTIVE` | Approved and activated |
| `REJECTED` | Application rejected |

---

## ⚠️ Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email is required",
  "field": "email"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**409 - Conflict:**
```json
{
  "success": false,
  "error": "DUPLICATE_EMAIL",
  "message": "Email already registered"
}
```

---

## 🔄 MAUI/Mobile Integration

```csharp
// C# Example for MAUI
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", token);

var response = await client.PutAsync(
    "https://api.vendorconnect.com/api/registration/step2",
    new StringContent(JsonSerializer.Serialize(profileData), 
        Encoding.UTF8, "application/json"));
```

---

## 📁 File Structure

```
src/app/api/registration/
├── step1/route.ts      # Create account
├── step2/route.ts      # Profile setup
├── step3/route.ts      # Role details
├── upload-document/route.ts
├── submit/route.ts     # Final submission
└── status/route.ts     # Get current status
```
=======
# 🔌 Registration API Documentation

*Multi-Step REST API for Registration Flow*

---

## 📋 Overview

This API enables **any client** (Next.js, MAUI, Mobile, etc.) to complete the multi-step registration process.

### Flow
```
Step 1: Create Account → Returns userId + token
Step 2: Update Profile → Select role, location
Step 3: Submit Role Details → Vendor/PM/Supervisor specific
Step 4: Upload Documents (OPTIONAL)
Step 5: Submit for Verification
```

---

## 🔐 Authentication

After Step 1, all subsequent requests require:
```
Authorization: Bearer <token>
```

---

## 📡 API Endpoints

### Step 1: Create Account
`POST /api/registration/step1`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "675d...",
    "token": "eyJhbG...",
    "registrationStep": 1,
    "status": "PENDING_PROFILE"
  }
}
```

---

### Step 2: Profile Setup
`PUT /api/registration/step2`

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "city": "Mumbai",
  "state": "MH",
  "preferredLanguage": "en",
  "requestedRole": "VENDOR",
  "operatingRegions": ["MH", "GJ"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 2,
    "status": "ROLE_DECLARED",
    "requestedRole": "VENDOR"
  }
}
```

---

### Step 3: Role-Specific Details
`PUT /api/registration/step3`

**Headers:** `Authorization: Bearer <token>`

#### For VENDOR:
```json
{
  "businessType": "PVT_LTD",
  "businessName": "ABC Suppliers",
  "yearsOfOperation": 5,
  "serviceCategories": ["MACHINERY", "MATERIALS"],
  "gstNumber": "22ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F",
  "bankAccountNumber": "1234567890",
  "ifscCode": "SBIN0001234",
  "bankAccountName": "ABC Suppliers"
}
```

#### For PROJECT_MANAGER:
```json
{
  "employmentType": "COMPANY",
  "currentOrganization": "XYZ Corp",
  "yearsOfExperience": 10,
  "pastProjects": "Metro Phase 1, Highway NH48",
  "certifications": "PMP, PRINCE2",
  "declarationAccepted": true
}
```

#### For SUPERVISOR:
```json
{
  "siteExperience": 5,
  "skillCategories": ["CIVIL", "ELECTRICAL"],
  "workingUnderType": "COMPANY",
  "workingUnderName": "XYZ Corp"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 3,
    "status": "DETAILS_COMPLETED"
  }
}
```

---

### Step 4: Upload Documents (OPTIONAL)
`POST /api/registration/upload-document`

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
```
documentType: "GOV_ID" | "BUSINESS_REG" | "GST_CERT" | "BANK_PROOF"
file: <binary>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "fileName": "aadhaar.pdf",
    "status": "UPLOADED"
  }
}
```

---

### Step 5: Submit for Verification
`POST /api/registration/submit`

**Headers:** `Authorization: Bearer <token>`

**Request:** (empty body or optional notes)
```json
{
  "additionalNotes": "Please verify quickly"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "registrationStep": 5,
    "status": "UNDER_VERIFICATION",
    "submittedAt": "2024-12-14T17:00:00Z"
  }
}
```

---

### Get Registration Status
`GET /api/registration/status`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "675d...",
    "email": "john@example.com",
    "name": "John Doe",
    "registrationStep": 3,
    "status": "DETAILS_COMPLETED",
    "requestedRole": "VENDOR",
    "profileCompleteness": 75
  }
}
```

---

## 📊 Status Values

| Status | Description |
|--------|-------------|
| `PENDING_PROFILE` | Account created, profile incomplete |
| `ROLE_DECLARED` | Role selected, awaiting details |
| `DETAILS_COMPLETED` | Role details submitted |
| `UNDER_VERIFICATION` | Submitted for admin review |
| `ACTIVE` | Approved and activated |
| `REJECTED` | Application rejected |

---

## ⚠️ Error Responses

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Email is required",
  "field": "email"
}
```

**401 - Unauthorized:**
```json
{
  "success": false,
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token"
}
```

**409 - Conflict:**
```json
{
  "success": false,
  "error": "DUPLICATE_EMAIL",
  "message": "Email already registered"
}
```

---

## 🔄 MAUI/Mobile Integration

```csharp
// C# Example for MAUI
var client = new HttpClient();
client.DefaultRequestHeaders.Authorization = 
    new AuthenticationHeaderValue("Bearer", token);

var response = await client.PutAsync(
    "https://api.vendorconnect.com/api/registration/step2",
    new StringContent(JsonSerializer.Serialize(profileData), 
        Encoding.UTF8, "application/json"));
```

---

## 📁 File Structure

```
src/app/api/registration/
├── step1/route.ts      # Create account
├── step2/route.ts      # Profile setup
├── step3/route.ts      # Role details
├── upload-document/route.ts
├── submit/route.ts     # Final submission
└── status/route.ts     # Get current status
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
