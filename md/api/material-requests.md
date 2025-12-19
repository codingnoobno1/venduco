<<<<<<< HEAD
# 📦 Material Requests APIs

Material requests and vendor quotes.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/material-requests` | GET | Bearer | List requests |
| `/api/material-requests` | POST | Bearer | Create request (PM) |
| `/api/material-requests/{id}/quote` | POST | Bearer | Submit quote (Vendor) |
| `/api/material-requests/{id}/quotes` | GET | Bearer | Compare quotes (PM) |
| `/api/material-requests/{id}/approve` | POST | Bearer | Approve quote (PM) |

---

## POST /api/material-requests

Create material request (PM).

**Request:**
```json
{
  "projectId": "proj_303",
  "materialName": "Cement OPC 53 Grade",
  "quantity": 500,
  "unit": "bags",
  "category": "CEMENT",
  "requiredBy": "2024-12-20",
  "broadcast": true
}
```

---

## POST /api/material-requests/{id}/quote

Submit a quote (Vendor).

**Request:**
```json
{
  "unitPrice": 380,
  "totalPrice": 190000,
  "deliveryDays": 3,
  "notes": "Price valid for 7 days"
}
```

---

## GET /api/material-requests/{id}/quotes

Compare all quotes (PM only).

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "materialName": "Cement OPC 53 Grade",
      "quantity": 500,
      "unit": "bags"
    },
    "quotes": [
      {
        "vendorId": "v_1",
        "vendorName": "ABC Materials",
        "totalPrice": 185000,
        "deliveryDays": 3,
        "priceRank": 1,
        "deliveryRank": 2
      },
      {
        "vendorId": "v_2",
        "vendorName": "XYZ Supplies",
        "totalPrice": 190000,
        "deliveryDays": 2,
        "priceRank": 2,
        "deliveryRank": 1
      }
    ],
    "comparison": {
      "totalQuotes": 2,
      "minPrice": 185000,
      "maxPrice": 190000,
      "bestValue": "ABC Materials"
    }
  }
}
```

---

## POST /api/material-requests/{id}/approve

Approve a vendor quote.

**Request:**
```json
{
  "vendorId": "v_1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote approved successfully"
}
```
=======
# 📦 Material Requests APIs

Material requests and vendor quotes.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/material-requests` | GET | Bearer | List requests |
| `/api/material-requests` | POST | Bearer | Create request (PM) |
| `/api/material-requests/{id}/quote` | POST | Bearer | Submit quote (Vendor) |
| `/api/material-requests/{id}/quotes` | GET | Bearer | Compare quotes (PM) |
| `/api/material-requests/{id}/approve` | POST | Bearer | Approve quote (PM) |

---

## POST /api/material-requests

Create material request (PM).

**Request:**
```json
{
  "projectId": "proj_303",
  "materialName": "Cement OPC 53 Grade",
  "quantity": 500,
  "unit": "bags",
  "category": "CEMENT",
  "requiredBy": "2024-12-20",
  "broadcast": true
}
```

---

## POST /api/material-requests/{id}/quote

Submit a quote (Vendor).

**Request:**
```json
{
  "unitPrice": 380,
  "totalPrice": 190000,
  "deliveryDays": 3,
  "notes": "Price valid for 7 days"
}
```

---

## GET /api/material-requests/{id}/quotes

Compare all quotes (PM only).

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "materialName": "Cement OPC 53 Grade",
      "quantity": 500,
      "unit": "bags"
    },
    "quotes": [
      {
        "vendorId": "v_1",
        "vendorName": "ABC Materials",
        "totalPrice": 185000,
        "deliveryDays": 3,
        "priceRank": 1,
        "deliveryRank": 2
      },
      {
        "vendorId": "v_2",
        "vendorName": "XYZ Supplies",
        "totalPrice": 190000,
        "deliveryDays": 2,
        "priceRank": 2,
        "deliveryRank": 1
      }
    ],
    "comparison": {
      "totalQuotes": 2,
      "minPrice": 185000,
      "maxPrice": 190000,
      "bestValue": "ABC Materials"
    }
  }
}
```

---

## POST /api/material-requests/{id}/approve

Approve a vendor quote.

**Request:**
```json
{
  "vendorId": "v_1"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quote approved successfully"
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
