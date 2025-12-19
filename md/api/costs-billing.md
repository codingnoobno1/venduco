<<<<<<< HEAD
# 💰 Costs & Billing APIs

Cost tracking and vendor billing.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/costs` | GET | PM/Admin | Auto-calculated costs |
| `/api/vendor/billing/summary` | GET | Vendor | Billing summary |

---

## GET /api/costs

Get auto-calculated project costs (PM only).

**Query Params:**
- `?projectId=proj_303`

**Response:**
```json
{
  "success": true,
  "summary": {
    "budget": 5000000,
    "spent": 1250000,
    "budgetUsedPercent": 25,
    "machineUsage": 450000,
    "materialOrders": 550000,
    "labourEstimate": 250000
  },
  "breakdown": [
    { "category": "Labour", "amount": 250000, "percent": 20 },
    { "category": "Materials", "amount": 550000, "percent": 44 },
    { "category": "Machines", "amount": 450000, "percent": 36 }
  ],
  "rates": {
    "skilled": 800,
    "unskilled": 500
  }
}
```

**Labour Cost Formula:**
```
dailyLabourCost = (skilled × ₹800) + (unskilled × ₹500)
```

---

## GET /api/vendor/billing/summary

Get vendor's billing summary.

**Query Params:**
- `?period=month` (week, month, quarter, year)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 850000,
    "pendingAmount": 250000,
    "paidAmount": 600000,
    "ordersCompleted": 15,
    "transactions": [
      {
        "type": "MATERIAL",
        "projectName": "Metro CP-303",
        "amount": 185000,
        "status": "PAID",
        "date": "2024-12-10"
      }
    ]
  }
}
```
=======
# 💰 Costs & Billing APIs

Cost tracking and vendor billing.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/costs` | GET | PM/Admin | Auto-calculated costs |
| `/api/vendor/billing/summary` | GET | Vendor | Billing summary |

---

## GET /api/costs

Get auto-calculated project costs (PM only).

**Query Params:**
- `?projectId=proj_303`

**Response:**
```json
{
  "success": true,
  "summary": {
    "budget": 5000000,
    "spent": 1250000,
    "budgetUsedPercent": 25,
    "machineUsage": 450000,
    "materialOrders": 550000,
    "labourEstimate": 250000
  },
  "breakdown": [
    { "category": "Labour", "amount": 250000, "percent": 20 },
    { "category": "Materials", "amount": 550000, "percent": 44 },
    { "category": "Machines", "amount": 450000, "percent": 36 }
  ],
  "rates": {
    "skilled": 800,
    "unskilled": 500
  }
}
```

**Labour Cost Formula:**
```
dailyLabourCost = (skilled × ₹800) + (unskilled × ₹500)
```

---

## GET /api/vendor/billing/summary

Get vendor's billing summary.

**Query Params:**
- `?period=month` (week, month, quarter, year)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEarnings": 850000,
    "pendingAmount": 250000,
    "paidAmount": 600000,
    "ordersCompleted": 15,
    "transactions": [
      {
        "type": "MATERIAL",
        "projectName": "Metro CP-303",
        "amount": 185000,
        "status": "PAID",
        "date": "2024-12-10"
      }
    ]
  }
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
