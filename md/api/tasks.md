<<<<<<< HEAD
# 📋 Tasks APIs

Task management for PM and supervisors.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/tasks` | GET | Bearer | List tasks (PM) |
| `/api/tasks` | POST | Bearer | Create task |
| `/api/tasks/assigned` | GET | Bearer | Get assigned tasks (Supervisor) |
| `/api/tasks/{id}/progress` | PUT | Bearer | Update progress |

---

## POST /api/tasks

Create a new task.

**Request:**
```json
{
  "projectId": "proj_303",
  "title": "Complete foundation work",
  "description": "Level 1 foundation for Block A",
  "assignedTo": "supervisor_123",
  "priority": "HIGH",
  "dueDate": "2024-12-20"
}
```

**Priority Values:**
- `LOW`
- `NORMAL`
- `HIGH`
- `CRITICAL`

---

## GET /api/tasks

List tasks with filters.

**Query Params:**
- `?projectId=proj_303`
- `?status=IN_PROGRESS`
- `?assignedTo=user_123`

---

## GET /api/tasks/assigned

Get tasks assigned to current user (Supervisor).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_123",
      "title": "Complete foundation work",
      "projectName": "Metro CP-303",
      "progress": 50,
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2024-12-20"
    }
  ]
}
```

---

## PUT /api/tasks/{id}/progress

Update task progress.

**Request:**
```json
{
  "progress": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": 75,
    "status": "IN_PROGRESS"
  }
}
```

**Auto Status Update:**
- `0%` → `TODO`
- `1-99%` → `IN_PROGRESS`
- `100%` → `COMPLETED`
=======
# 📋 Tasks APIs

Task management for PM and supervisors.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/tasks` | GET | Bearer | List tasks (PM) |
| `/api/tasks` | POST | Bearer | Create task |
| `/api/tasks/assigned` | GET | Bearer | Get assigned tasks (Supervisor) |
| `/api/tasks/{id}/progress` | PUT | Bearer | Update progress |

---

## POST /api/tasks

Create a new task.

**Request:**
```json
{
  "projectId": "proj_303",
  "title": "Complete foundation work",
  "description": "Level 1 foundation for Block A",
  "assignedTo": "supervisor_123",
  "priority": "HIGH",
  "dueDate": "2024-12-20"
}
```

**Priority Values:**
- `LOW`
- `NORMAL`
- `HIGH`
- `CRITICAL`

---

## GET /api/tasks

List tasks with filters.

**Query Params:**
- `?projectId=proj_303`
- `?status=IN_PROGRESS`
- `?assignedTo=user_123`

---

## GET /api/tasks/assigned

Get tasks assigned to current user (Supervisor).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "task_123",
      "title": "Complete foundation work",
      "projectName": "Metro CP-303",
      "progress": 50,
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "dueDate": "2024-12-20"
    }
  ]
}
```

---

## PUT /api/tasks/{id}/progress

Update task progress.

**Request:**
```json
{
  "progress": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": 75,
    "status": "IN_PROGRESS"
  }
}
```

**Auto Status Update:**
- `0%` → `TODO`
- `1-99%` → `IN_PROGRESS`
- `100%` → `COMPLETED`
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
