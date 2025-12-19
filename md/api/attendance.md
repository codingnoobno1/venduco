<<<<<<< HEAD
# 👷 Attendance APIs

Daily labour attendance tracking.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/attendance` | POST | Bearer | Mark attendance |
| `/api/attendance` | GET | Bearer | Get attendance records |
| `/api/attendance/project/{id}` | GET | Bearer | Get by project |

---

## POST /api/attendance

Mark daily attendance (upsert).

**Request:**
```json
{
  "projectId": "proj_303",
  "skilledCount": 25,
  "unskilledCount": 15,
  "shift": "DAY",
  "notes": "Full team present"
}
```

**Shift Values:**
- `DAY`
- `NIGHT`
- `DOUBLE`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "projectId": "proj_303",
    "skilledCount": 25,
    "unskilledCount": 15,
    "shift": "DAY"
  }
}
```

---

## GET /api/attendance

Get supervisor's attendance records.

**Query Params:**
- `?limit=10`
- `?projectId=proj_303`

---

## GET /api/attendance/project/{id}

Get attendance records for a specific project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-12-15",
      "skilledCount": 25,
      "unskilledCount": 15,
      "shift": "DAY",
      "supervisorName": "Rajesh"
    }
  ]
}
```
=======
# 👷 Attendance APIs

Daily labour attendance tracking.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/attendance` | POST | Bearer | Mark attendance |
| `/api/attendance` | GET | Bearer | Get attendance records |
| `/api/attendance/project/{id}` | GET | Bearer | Get by project |

---

## POST /api/attendance

Mark daily attendance (upsert).

**Request:**
```json
{
  "projectId": "proj_303",
  "skilledCount": 25,
  "unskilledCount": 15,
  "shift": "DAY",
  "notes": "Full team present"
}
```

**Shift Values:**
- `DAY`
- `NIGHT`
- `DOUBLE`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-15",
    "projectId": "proj_303",
    "skilledCount": 25,
    "unskilledCount": 15,
    "shift": "DAY"
  }
}
```

---

## GET /api/attendance

Get supervisor's attendance records.

**Query Params:**
- `?limit=10`
- `?projectId=proj_303`

---

## GET /api/attendance/project/{id}

Get attendance records for a specific project.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-12-15",
      "skilledCount": 25,
      "unskilledCount": 15,
      "shift": "DAY",
      "supervisorName": "Rajesh"
    }
  ]
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
