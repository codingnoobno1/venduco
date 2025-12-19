<<<<<<< HEAD
# 🏗️ Machine APIs

Machine and equipment management.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/machines` | GET | Bearer | List machines |
| `/api/machines` | POST | Bearer | Create machine |
| `/api/machines/{id}` | GET | Bearer | Get single machine |
| `/api/machines/{id}` | PUT | Bearer | Update machine |
| `/api/machines/{id}` | DELETE | Bearer | Delete machine |
| `/api/machines/availability` | GET | Bearer | Check availability |

---

## POST /api/machines

Create a new machine/equipment.

**Request:**
```json
{
  "machineType": "TOWER_CRANE",
  "machineCode": "TC-05",
  "name": "Tower Crane 5",
  "capacity": "10T",
  "specifications": {
    "height": "50m",
    "radius": "40m",
    "power": "Electric"
  },
  "dailyRate": 15000,
  "status": "AVAILABLE"
}
```

**Machine Types:**
- `TOWER_CRANE`
- `MOBILE_CRANE`
- `WAGON`
- `EXCAVATOR`
- `CONCRETE_MIXER`
- `LOADER`
- `BULLDOZER`
- `OTHER`

---

## GET /api/machines

List machines with filters.

**Query Params:**
- `?type=TOWER_CRANE`
- `?vendorId=vendor_123`
- `?status=AVAILABLE`
- `?projectId=proj_303`

---

## GET /api/machines/availability

Check machine availability for date/range.

**Query:**
- `?date=2024-12-16`
- `?from=2024-12-15&to=2024-12-20&type=TOWER_CRANE`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": [
      { "machineId": "m_01", "code": "TC-02", "type": "TOWER_CRANE" }
    ],
    "assigned": [
      { "machineId": "m_03", "code": "TC-05", "project": "CP-303" }
    ]
  }
}
```
=======
# 🏗️ Machine APIs

Machine and equipment management.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/machines` | GET | Bearer | List machines |
| `/api/machines` | POST | Bearer | Create machine |
| `/api/machines/{id}` | GET | Bearer | Get single machine |
| `/api/machines/{id}` | PUT | Bearer | Update machine |
| `/api/machines/{id}` | DELETE | Bearer | Delete machine |
| `/api/machines/availability` | GET | Bearer | Check availability |

---

## POST /api/machines

Create a new machine/equipment.

**Request:**
```json
{
  "machineType": "TOWER_CRANE",
  "machineCode": "TC-05",
  "name": "Tower Crane 5",
  "capacity": "10T",
  "specifications": {
    "height": "50m",
    "radius": "40m",
    "power": "Electric"
  },
  "dailyRate": 15000,
  "status": "AVAILABLE"
}
```

**Machine Types:**
- `TOWER_CRANE`
- `MOBILE_CRANE`
- `WAGON`
- `EXCAVATOR`
- `CONCRETE_MIXER`
- `LOADER`
- `BULLDOZER`
- `OTHER`

---

## GET /api/machines

List machines with filters.

**Query Params:**
- `?type=TOWER_CRANE`
- `?vendorId=vendor_123`
- `?status=AVAILABLE`
- `?projectId=proj_303`

---

## GET /api/machines/availability

Check machine availability for date/range.

**Query:**
- `?date=2024-12-16`
- `?from=2024-12-15&to=2024-12-20&type=TOWER_CRANE`

**Response:**
```json
{
  "success": true,
  "data": {
    "available": [
      { "machineId": "m_01", "code": "TC-02", "type": "TOWER_CRANE" }
    ],
    "assigned": [
      { "machineId": "m_03", "code": "TC-05", "project": "CP-303" }
    ]
  }
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
