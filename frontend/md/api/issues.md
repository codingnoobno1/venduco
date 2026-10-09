<<<<<<< HEAD
# ⚠️ Issues APIs

Issue and delay tracking.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/issues` | GET | Bearer | List issues |
| `/api/issues` | POST | Bearer | Create issue |
| `/api/issues/{id}` | PUT | Bearer | Update issue |
| `/api/issues/{id}/convert-to-task` | POST | Bearer | Convert to task |

---

## POST /api/issues

Report a new issue.

**Request:**
```json
{
  "projectId": "proj_303",
  "title": "Material delay",
  "description": "Cement delivery delayed by 2 days",
  "category": "MATERIAL",
  "priority": "HIGH"
}
```

**Categories:**
- `DELAY`
- `MATERIAL`
- `MACHINE`
- `LABOUR`
- `WEATHER`
- `SAFETY`
- `OTHER`

---

## GET /api/issues

List issues with filters.

**Query Params:**
- `?projectId=proj_303`
- `?status=OPEN`
- `?priority=HIGH`

---

## PUT /api/issues/{id}

Update issue status.

**Request:**
```json
{
  "status": "RESOLVED",
  "resolution": "Material arrived, work resumed"
}
```

**Status Values:**
- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

---

## POST /api/issues/{id}/convert-to-task

Convert issue to a task for tracking.

**Request:**
```json
{
  "assignTo": "supervisor_123",
  "dueDate": "2024-12-20",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "_id": "task_456", "title": "Fix: Material delay" },
    "issueId": "issue_123"
  }
}
```
=======
# ⚠️ Issues APIs

Issue and delay tracking.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/issues` | GET | Bearer | List issues |
| `/api/issues` | POST | Bearer | Create issue |
| `/api/issues/{id}` | PUT | Bearer | Update issue |
| `/api/issues/{id}/convert-to-task` | POST | Bearer | Convert to task |

---

## POST /api/issues

Report a new issue.

**Request:**
```json
{
  "projectId": "proj_303",
  "title": "Material delay",
  "description": "Cement delivery delayed by 2 days",
  "category": "MATERIAL",
  "priority": "HIGH"
}
```

**Categories:**
- `DELAY`
- `MATERIAL`
- `MACHINE`
- `LABOUR`
- `WEATHER`
- `SAFETY`
- `OTHER`

---

## GET /api/issues

List issues with filters.

**Query Params:**
- `?projectId=proj_303`
- `?status=OPEN`
- `?priority=HIGH`

---

## PUT /api/issues/{id}

Update issue status.

**Request:**
```json
{
  "status": "RESOLVED",
  "resolution": "Material arrived, work resumed"
}
```

**Status Values:**
- `OPEN`
- `IN_PROGRESS`
- `RESOLVED`
- `CLOSED`

---

## POST /api/issues/{id}/convert-to-task

Convert issue to a task for tracking.

**Request:**
```json
{
  "assignTo": "supervisor_123",
  "dueDate": "2024-12-20",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "task": { "_id": "task_456", "title": "Fix: Material delay" },
    "issueId": "issue_123"
  }
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
