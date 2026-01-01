# 📁 Project APIs

Project management endpoints for handling project lifecycles, members, and status.

## 🚀 Endpoints Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/projects` | GET | Bearer | List all projects (Admin/Global) |
| `/api/projects` | POST | Bearer | Create a new project |
| `/api/projects/my` | GET | Bearer | Get user's projects with stats |
| `/api/projects/assigned` | GET | Bearer | Get projects assigned to supervisor |
| `/api/projects/{id}` | GET | Bearer | Get detailed single project view |
| `/api/projects/{id}` | PUT | Bearer | Update project status or progress |
| `/api/projects/{id}/members` | GET | Bearer | List all members of a project |
| `/api/projects/{id}/members` | POST | Bearer | Add new members (Supervisor/Vendor) |

---

## 📝 Detailed Endpoint Specs

### POST `/api/projects`
Create a new project entry.

**Request Body:**
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

**Response (201 Created):**
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

### GET `/api/projects/my`
Retrieve projects managed by the authenticated PM, including summary stats.

**Response (200 OK):**
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

### PUT `/api/projects/{id}`
Update project attributes like status or progress percentage.

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "progress": 45
}
```

---

### POST `/api/projects/{id}/members`
Assign new users to a project team.

**Request Body:**
```json
{
  "userId": "user_123",
  "role": "SUPERVISOR"
}
```
