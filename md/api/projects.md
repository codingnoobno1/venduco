<<<<<<< HEAD
# 📁 Project APIs

Project management endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/projects` | GET | Bearer | List all projects |
| `/api/projects` | POST | Bearer | Create project |
| `/api/projects/my` | GET | Bearer | Get user's projects |
| `/api/projects/assigned` | GET | Bearer | Get assigned projects (supervisor) |
| `/api/projects/{id}` | GET | Bearer | Get single project |
| `/api/projects/{id}` | PUT | Bearer | Update project |
| `/api/projects/{id}/members` | GET | Bearer | Get project members |
| `/api/projects/{id}/members` | POST | Bearer | Add members |

---

## POST /api/projects

Create a new project.

**Request:**
```json
{
  "name": "Metro CP-303",
  "projectCode": "CP-303",
  "location": "Delhi",
  "address": "Sector 21, Dwarka",
  "description": "Delhi Metro Phase 4 Construction",
  "startDate": "2024-12-15",
  "endDate": "2025-03-15",
  "budget": 50000000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "projectId": "proj_303",
    "projectCode": "CP-303",
    "status": "PLANNING"
  }
}
```

---

## GET /api/projects/my

Get PM's projects with stats.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectId": "proj_303",
      "name": "Metro CP-303",
      "status": "IN_PROGRESS",
      "progress": 35,
      "vendorsCount": 5,
      "machinesCount": 3
    }
  ]
}
```

---

## PUT /api/projects/{id}

Update project details.

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "progress": 45
}
```

---

## POST /api/projects/{id}/members

Assign members to project.

**Request:**
```json
{
  "userId": "user_123",
  "role": "SUPERVISOR"
}
```
=======
# 📁 Project APIs

Project management endpoints.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/projects` | GET | Bearer | List all projects |
| `/api/projects` | POST | Bearer | Create project |
| `/api/projects/my` | GET | Bearer | Get user's projects |
| `/api/projects/assigned` | GET | Bearer | Get assigned projects (supervisor) |
| `/api/projects/{id}` | GET | Bearer | Get single project |
| `/api/projects/{id}` | PUT | Bearer | Update project |
| `/api/projects/{id}/members` | GET | Bearer | Get project members |
| `/api/projects/{id}/members` | POST | Bearer | Add members |

---

## POST /api/projects

Create a new project.

**Request:**
```json
{
  "name": "Metro CP-303",
  "projectCode": "CP-303",
  "location": "Delhi",
  "address": "Sector 21, Dwarka",
  "description": "Delhi Metro Phase 4 Construction",
  "startDate": "2024-12-15",
  "endDate": "2025-03-15",
  "budget": 50000000
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "projectId": "proj_303",
    "projectCode": "CP-303",
    "status": "PLANNING"
  }
}
```

---

## GET /api/projects/my

Get PM's projects with stats.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectId": "proj_303",
      "name": "Metro CP-303",
      "status": "IN_PROGRESS",
      "progress": 35,
      "vendorsCount": 5,
      "machinesCount": 3
    }
  ]
}
```

---

## PUT /api/projects/{id}

Update project details.

**Request:**
```json
{
  "status": "IN_PROGRESS",
  "progress": 45
}
```

---

## POST /api/projects/{id}/members

Assign members to project.

**Request:**
```json
{
  "userId": "user_123",
  "role": "SUPERVISOR"
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
