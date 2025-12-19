<<<<<<< HEAD
# 📊 Daily Plan & Summary APIs

Daily planning and auto-generated summaries.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/daily-plan/today` | GET | Bearer | Get today's plan |
| `/api/daily-plan/lock` | POST | Bearer | Lock day |
| `/api/daily-plan/lock` | GET | Bearer | Check if locked |
| `/api/daily-summary/{date}` | GET | Bearer | Auto-generated summary |

---

## GET /api/daily-plan/today

Get today's tasks, machines, and materials.

**Query Params:**
- `?projectId=proj_303`

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      { "title": "Foundation work", "progress": 50 }
    ],
    "machines": [
      { "machineCode": "TC-05", "name": "Tower Crane 5" }
    ],
    "expectedMaterials": [
      { "materialName": "Cement", "quantity": 100 }
    ]
  }
}
```

---

## POST /api/daily-plan/lock

Lock the day (prevents further edits).

**Request:**
```json
{
  "projectId": "proj_303",
  "snapshot": {
    "tasks": [{ "taskId": "t1", "title": "Work", "progress": 100 }],
    "attendance": { "skilledCount": 25, "unskilledCount": 15 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Day locked successfully. No further edits allowed."
}
```

---

## GET /api/daily-summary/{date}

Get auto-generated daily summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "isLocked": true,
    "attendance": {
      "skilledCount": 25,
      "unskilledCount": 15,
      "labourCost": 27500
    },
    "tasks": { "total": 5, "completed": 4 },
    "issues": { "raised": 2, "resolved": 1, "open": 3 },
    "totalDayCost": 35000,
    "textSummary": "📅 **Daily Summary - Sunday, 15 Dec 2024**\n👷 **Labour**: 40 workers (25S + 15U)..."
  }
}
```

**Text summary replaces WhatsApp end-of-day messages!**
=======
# 📊 Daily Plan & Summary APIs

Daily planning and auto-generated summaries.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/daily-plan/today` | GET | Bearer | Get today's plan |
| `/api/daily-plan/lock` | POST | Bearer | Lock day |
| `/api/daily-plan/lock` | GET | Bearer | Check if locked |
| `/api/daily-summary/{date}` | GET | Bearer | Auto-generated summary |

---

## GET /api/daily-plan/today

Get today's tasks, machines, and materials.

**Query Params:**
- `?projectId=proj_303`

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      { "title": "Foundation work", "progress": 50 }
    ],
    "machines": [
      { "machineCode": "TC-05", "name": "Tower Crane 5" }
    ],
    "expectedMaterials": [
      { "materialName": "Cement", "quantity": 100 }
    ]
  }
}
```

---

## POST /api/daily-plan/lock

Lock the day (prevents further edits).

**Request:**
```json
{
  "projectId": "proj_303",
  "snapshot": {
    "tasks": [{ "taskId": "t1", "title": "Work", "progress": 100 }],
    "attendance": { "skilledCount": 25, "unskilledCount": 15 }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Day locked successfully. No further edits allowed."
}
```

---

## GET /api/daily-summary/{date}

Get auto-generated daily summary.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "isLocked": true,
    "attendance": {
      "skilledCount": 25,
      "unskilledCount": 15,
      "labourCost": 27500
    },
    "tasks": { "total": 5, "completed": 4 },
    "issues": { "raised": 2, "resolved": 1, "open": 3 },
    "totalDayCost": 35000,
    "textSummary": "📅 **Daily Summary - Sunday, 15 Dec 2024**\n👷 **Labour**: 40 workers (25S + 15U)..."
  }
}
```

**Text summary replaces WhatsApp end-of-day messages!**
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
