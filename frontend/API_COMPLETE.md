<<<<<<< HEAD
# 🔌 VendorConnect Complete API Reference

*Multi-Domain REST APIs for Next.js + MAUI Integration*

---

## 📊 API DOMAINS OVERVIEW

| Domain | Status | Description |
|--------|--------|-------------|
| 🔐 Auth & Registration | ✅ Done | User signup, login, verification |
| 📁 Project Management | 🔨 Build | Create projects, assign members |
| 🏗️ Machine/Resource | 🔨 Build | Cranes, wagons, equipment |
| 📍 Location Tracking | 🔨 Build | FREE GPS-based tracking |
| 📝 Daily Reports | 🔨 Build | Work progress, photos |
| 💬 Communication | 🔨 Build | Chat, announcements |

### 💰 Cost Analysis
```
✅ All APIs: FREE (self-hosted)
✅ GPS Tracking: FREE (device GPS, no Google)
✅ Maps Display: FREE (OpenStreetMap + Leaflet)
✅ MongoDB: FREE tier (512MB)
✅ Vercel/Railway: FREE tier available
```

---

## 1️⃣ AUTH & REGISTRATION APIs ✅

> **Status:** COMPLETED

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/registration/step1` | POST | ❌ | Create account |
| `/api/registration/step2` | PUT | Bearer | Profile setup |
| `/api/registration/step3` | PUT | Bearer | Role details |
| `/api/registration/submit` | POST | Bearer | Submit for verification |
| `/api/registration/status` | GET | Bearer | Get current status |
| `/api/auth/login` | POST | ❌ | Login, get JWT |
| `/api/auth/me` | GET | Bearer | Get current user |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/{id}` | PUT | Admin | Approve/reject/update |

See `REGISTRATION_API.md` for full details.

---

## 2️⃣ PROJECT MANAGEMENT APIs

### Create Project
`POST /api/projects`

```json
{
  "projectName": "Metro CP-303",
  "projectCode": "CP-303",
  "location": "Delhi",
  "address": "Sector 21, Dwarka",
  "description": "Delhi Metro Phase 4 Construction",
  "startDate": "2024-12-15",
  "endDate": "2025-03-15",
  "budget": 50000000,
  "pmId": "user_123"
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

### Get All Projects (PM Dashboard)
`GET /api/projects/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectId": "proj_303",
      "projectName": "Metro CP-303",
      "status": "IN_PROGRESS",
      "progress": 35,
      "vendorsCount": 5,
      "machinesCount": 3,
      "pendingReports": 2
    }
  ]
}
```

---

### Get Single Project
`GET /api/projects/{projectId}`

---

### Update Project
`PUT /api/projects/{projectId}`

```json
{
  "status": "IN_PROGRESS",
  "progress": 45
}
```

---

### Assign Members to Project
`POST /api/projects/{projectId}/assign`

```json
{
  "vendors": ["user_v1", "user_v2"],
  "supervisors": ["user_s1"],
  "projectManagers": ["user_pm1"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendorsAdded": 2,
    "supervisorsAdded": 1,
    "totalMembers": 4
  }
}
```

---

### Get Project Members
`GET /api/projects/{projectId}/members`

---

### Remove Member
`DELETE /api/projects/{projectId}/members/{userId}`

---

## 3️⃣ MACHINE / RESOURCE MANAGEMENT APIs

### 🏗️ Machine Registry

#### Create Machine
`POST /api/machines`

```json
{
  "machineType": "TOWER_CRANE",
  "machineCode": "TC-05",
  "name": "Tower Crane 5",
  "vendorId": "vendor_123",
  "capacity": "10T",
  "specifications": {
    "height": "50m",
    "radius": "40m",
    "power": "Electric"
  },
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

#### List All Machines
`GET /api/machines`

**Query params:**
- `?type=TOWER_CRANE`
- `?vendorId=vendor_123`
- `?status=AVAILABLE`
- `?projectId=proj_303`

---

#### Get Single Machine
`GET /api/machines/{machineId}`

---

#### Update Machine
`PUT /api/machines/{machineId}`

---

#### Delete Machine
`DELETE /api/machines/{machineId}`

---

### 📅 Machine Assignment

#### Assign Machine to Project + Person
`POST /api/machines/{machineId}/assign`

```json
{
  "projectId": "proj_303",
  "assignedToUserId": "supervisor_456",
  "from": "2024-12-15T06:00:00Z",
  "to": "2024-12-20T18:00:00Z",
  "notes": "Required for slab casting work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": "assign_789",
    "machineCode": "TC-05",
    "assignedTo": "John Supervisor",
    "project": "Metro CP-303",
    "period": "Dec 15 - Dec 20"
  }
}
```

---

#### Get Machine Assignments
`GET /api/machines/{machineId}/assignments`

---

#### Release Machine
`DELETE /api/machines/{machineId}/assignments/{assignmentId}`

---

### 📊 Machine Availability

#### Check Availability by Date
`GET /api/machines/availability?date=2024-12-16`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-16",
    "available": [
      { "machineId": "m_01", "code": "TC-02", "type": "TOWER_CRANE" },
      { "machineId": "m_02", "code": "TC-04", "type": "TOWER_CRANE" }
    ],
    "assigned": [
      { 
        "machineId": "m_03", 
        "code": "TC-05", 
        "type": "TOWER_CRANE",
        "project": "CP-303",
        "assignedTo": "John Supervisor"
      }
    ],
    "maintenance": [
      { "machineId": "m_04", "code": "TC-01", "reason": "Annual servicing" }
    ]
  }
}
```

---

#### Check Availability for Date Range
`GET /api/machines/availability?from=2024-12-15&to=2024-12-20&type=TOWER_CRANE`

---

## 4️⃣ LOCATION TRACKING APIs (FREE - NO GOOGLE BILLING)

### 📍 Strategy: Device GPS + Your API

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  MAUI App       │────▶│  Your API    │────▶│  MongoDB    │
│  (Device GPS)   │     │  (Next.js)   │     │  (Free)     │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                                            │
        │                                            ▼
        │                              ┌─────────────────────┐
        │                              │  OpenStreetMap      │
        │                              │  + Leaflet (FREE)   │
        └──────────────────────────────│  Map Display        │
                                       └─────────────────────┘
```

### Update Location (From MAUI)
`POST /api/location/update`

```json
{
  "entityType": "MACHINE",
  "entityId": "machine_tc_05",
  "lat": 28.6139,
  "lng": 77.2090,
  "accuracy": 12,
  "altitude": 230,
  "speed": 0,
  "heading": 45,
  "batteryLevel": 85,
  "timestamp": "2024-12-14T18:00:00Z"
}
```

**Entity Types:**
- `MACHINE` - Crane, wagon, excavator
- `VEHICLE` - Trucks, transport
- `USER` - Field supervisors

**Response:**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

### Get Latest Location
`GET /api/location/{entityType}/{entityId}/latest`

**Example:** `GET /api/location/machine/tc_05/latest`

**Response:**
```json
{
  "success": true,
  "data": {
    "entityType": "MACHINE",
    "entityId": "tc_05",
    "machineCode": "TC-05",
    "machineName": "Tower Crane 5",
    "assignedTo": {
      "userId": "supervisor_456",
      "name": "Rajesh Kumar"
    },
    "project": {
      "projectId": "proj_303",
      "name": "Metro CP-303"
    },
    "location": {
      "lat": 28.6139,
      "lng": 77.2090,
      "accuracy": 12
    },
    "lastUpdated": "2024-12-14T18:00:00Z",
    "lastUpdatedAgo": "5 mins ago",
    "status": "ACTIVE"
  }
}
```

---

### Get Location History
`GET /api/location/{entityType}/{entityId}/history`

**Query params:**
- `?from=2024-12-14T00:00:00Z`
- `?to=2024-12-14T23:59:59Z`
- `?limit=100`

---

### Get All Locations for Project
`GET /api/location/project/{projectId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "machines": [
      {
        "machineId": "tc_05",
        "code": "TC-05",
        "lat": 28.6139,
        "lng": 77.2090,
        "lastUpdated": "5 mins ago"
      }
    ],
    "supervisors": [
      {
        "userId": "sup_456",
        "name": "Rajesh",
        "lat": 28.6140,
        "lng": 77.2091,
        "lastUpdated": "2 mins ago"
      }
    ]
  }
}
```

---

### MAUI Code Example (FREE GPS)
```csharp
// Get location - NO COST
var location = await Geolocation.GetLocationAsync(new GeolocationRequest
{
    DesiredAccuracy = GeolocationAccuracy.High,
    Timeout = TimeSpan.FromSeconds(10)
});

// Send to your API
await httpClient.PostAsJsonAsync("/api/location/update", new
{
    EntityType = "MACHINE",
    EntityId = "tc_05",
    Lat = location.Latitude,
    Lng = location.Longitude,
    Accuracy = location.Accuracy,
    Timestamp = DateTime.UtcNow
});
```

---

## 5️⃣ DAILY REPORTS & PROGRESS APIs

### Submit Daily Report
`POST /api/reports/daily`

```json
{
  "projectId": "proj_303",
  "machineId": "tc_05",
  "date": "2024-12-14",
  "workDone": "Slab casting for Block A, Level 3",
  "hoursUsed": 6,
  "materialsUsed": [
    { "name": "Cement", "quantity": 50, "unit": "bags" },
    { "name": "Steel", "quantity": 2, "unit": "tonnes" }
  ],
  "manpower": 15,
  "issues": "Minor delay due to rain",
  "photos": ["url1", "url2"],
  "submittedBy": "supervisor_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_xyz",
    "status": "SUBMITTED"
  }
}
```

---

### Get Today's Reports (PM View)
`GET /api/reports/project/{projectId}/today`

---

### Get Reports by Date Range
`GET /api/reports/project/{projectId}?from=2024-12-01&to=2024-12-14`

---

### Get Single Report
`GET /api/reports/{reportId}`

---

### Approve/Review Report
`PUT /api/reports/{reportId}`

```json
{
  "status": "APPROVED",
  "pmNotes": "Good progress. Continue."
}
```

---

### Upload Report Photo
`POST /api/reports/{reportId}/photos`

**Content-Type:** `multipart/form-data`

---

## 6️⃣ COMMUNICATION APIs (WhatsApp Replacement)

### 💬 Project Chat

#### Send Message
`POST /api/chat/{projectId}`

```json
{
  "message": "Concrete pour completed for Block A",
  "attachments": ["photo_url"],
  "replyTo": "msg_123"
}
```

---

#### Get Messages
`GET /api/chat/{projectId}`

**Query params:**
- `?limit=50`
- `?before=msg_456` (pagination)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_789",
        "sender": {
          "userId": "sup_456",
          "name": "Rajesh",
          "role": "SUPERVISOR"
        },
        "message": "Concrete pour completed",
        "attachments": ["photo.jpg"],
        "timestamp": "2024-12-14T14:30:00Z"
      }
    ],
    "hasMore": true
  }
}
```

---

### 📢 Announcements

#### Create Announcement
`POST /api/announcements`

```json
{
  "scope": "PROJECT",
  "scopeId": "proj_303",
  "title": "Important: Site Inspection Tomorrow",
  "message": "All supervisors must be present at 9 AM for safety inspection.",
  "priority": "HIGH",
  "expiresAt": "2024-12-16T18:00:00Z"
}
```

**Scope Options:**
- `PROJECT` - Single project
- `VENDOR` - All vendor's workers
- `GLOBAL` - All users (admin only)

---

#### Get Announcements
`GET /api/announcements?scope=PROJECT&scopeId=proj_303`

---

#### Mark as Read
`PUT /api/announcements/{announcementId}/read`

---

## 📊 DATABASE MODELS REQUIRED

```
┌──────────────────────────────────────────────────────┐
│ EXISTING MODELS                                       │
├──────────────────────────────────────────────────────┤
│ User, Project, Task, Vendor, InventoryItem            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ NEW MODELS NEEDED                                     │
├──────────────────────────────────────────────────────┤
│ Machine - Equipment registry                          │
│ MachineAssignment - Who has what machine              │
│ Location - GPS coordinates log                        │
│ DailyReport - Work progress reports                   │
│ ChatMessage - Project chat messages                   │
│ Announcement - Broadcasts                             │
│ ProjectMember - User-Project relationship             │
└──────────────────────────────────────────────────────┘
```

---

## 🗺️ FREE MAP INTEGRATION

### For Next.js (Web)

**Library:** React-Leaflet + OpenStreetMap

```bash
npm install react-leaflet leaflet
```

```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

<MapContainer center={[28.6139, 77.2090]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap'
  />
  <Marker position={[28.6139, 77.2090]} />
</MapContainer>
```

**Cost:** FREE ✅

---

### For MAUI (Mobile)

**Library:** Mapsui (FREE) or Esri (FREE tier)

```csharp
// Mapsui - 100% FREE
var mapControl = new MapControl();
mapControl.Map.Layers.Add(OpenStreetMap.CreateTileLayer());
```

**Cost:** FREE ✅

---

## 📁 API FILE STRUCTURE

```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── me/route.ts
│
├── registration/
│   ├── step1/route.ts
│   ├── step2/route.ts
│   ├── step3/route.ts
│   ├── submit/route.ts
│   └── status/route.ts
│
├── admin/
│   └── users/
│       ├── route.ts
│       └── [id]/route.ts
│
├── projects/
│   ├── route.ts                    # GET all, POST create
│   ├── my/route.ts                 # GET user's projects
│   └── [projectId]/
│       ├── route.ts                # GET, PUT, DELETE
│       ├── assign/route.ts         # POST assign members
│       └── members/route.ts        # GET, DELETE members
│
├── machines/
│   ├── route.ts                    # GET all, POST create
│   ├── availability/route.ts       # GET availability
│   └── [machineId]/
│       ├── route.ts                # GET, PUT, DELETE
│       ├── assign/route.ts         # POST assign
│       └── assignments/route.ts    # GET, DELETE
│
├── location/
│   ├── update/route.ts             # POST update location
│   ├── project/[projectId]/route.ts
│   └── [entityType]/[entityId]/
│       ├── latest/route.ts         # GET latest
│       └── history/route.ts        # GET history
│
├── reports/
│   ├── daily/route.ts              # POST create
│   ├── [reportId]/
│   │   ├── route.ts                # GET, PUT
│   │   └── photos/route.ts         # POST upload
│   └── project/[projectId]/
│       └── route.ts                # GET by project
│
├── chat/
│   └── [projectId]/route.ts        # GET, POST messages
│
└── announcements/
    ├── route.ts                    # GET, POST
    └── [id]/
        ├── route.ts                # GET, PUT, DELETE
        └── read/route.ts           # PUT mark as read
```

---

## 💰 COST SUMMARY

| Component | Technology | Cost |
|-----------|------------|------|
| Backend API | Next.js on Vercel/Railway | **FREE** |
| Database | MongoDB Atlas (512MB) | **FREE** |
| GPS Tracking | Device GPS (Android/iOS) | **FREE** |
| Location Storage | MongoDB | **FREE** |
| Map Display (Web) | OpenStreetMap + Leaflet | **FREE** |
| Map Display (Mobile) | Mapsui | **FREE** |
| File Storage | Cloudinary (25GB) | **FREE** |
| Authentication | JWT (self-hosted) | **FREE** |

### ❌ AVOID (Paid Services)
- Google Maps SDK
- Google Geofencing
- Google Location APIs
- AWS Lambda (can get expensive)
- Firebase (can exceed free tier)

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Week 1) ✅
- [x] Auth & Registration APIs
- [x] Admin Verification Dashboard

### Phase 2 (Week 2)
- [ ] Project CRUD APIs
- [ ] Project Members Management
- [ ] Machine Registry APIs

### Phase 3 (Week 3)
- [ ] Machine Assignment APIs
- [ ] Location Tracking APIs
- [ ] Free Map Integration

### Phase 4 (Week 4)
- [ ] Daily Reports APIs
- [ ] Chat APIs
- [ ] Announcements APIs

---

## 🔐 AUTHENTICATION PATTERN

All protected routes use JWT Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Token includes:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "role": "VENDOR",
  "exp": 1734567890
}
```

---

## 📱 MAUI INTEGRATION GUIDE

### HTTP Client Setup
```csharp
public class ApiClient
{
    private readonly HttpClient _http;
    private string _token;

    public ApiClient()
    {
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://vendorconnect.vercel.app")
        };
    }

    public void SetToken(string token)
    {
        _token = token;
        _http.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }

    // Example: Get My Projects
    public async Task<List<Project>> GetMyProjects()
    {
        var response = await _http.GetAsync("/api/projects/my");
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<Project>>>();
        return result.Data;
    }
}
```

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2024  
**Author:** VendorConnect Dev Team
=======
# 🔌 VendorConnect Complete API Reference

*Multi-Domain REST APIs for Next.js + MAUI Integration*

---

## 📊 API DOMAINS OVERVIEW

| Domain | Status | Description |
|--------|--------|-------------|
| 🔐 Auth & Registration | ✅ Done | User signup, login, verification |
| 📁 Project Management | 🔨 Build | Create projects, assign members |
| 🏗️ Machine/Resource | 🔨 Build | Cranes, wagons, equipment |
| 📍 Location Tracking | 🔨 Build | FREE GPS-based tracking |
| 📝 Daily Reports | 🔨 Build | Work progress, photos |
| 💬 Communication | 🔨 Build | Chat, announcements |

### 💰 Cost Analysis
```
✅ All APIs: FREE (self-hosted)
✅ GPS Tracking: FREE (device GPS, no Google)
✅ Maps Display: FREE (OpenStreetMap + Leaflet)
✅ MongoDB: FREE tier (512MB)
✅ Vercel/Railway: FREE tier available
```

---

## 1️⃣ AUTH & REGISTRATION APIs ✅

> **Status:** COMPLETED

### Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/registration/step1` | POST | ❌ | Create account |
| `/api/registration/step2` | PUT | Bearer | Profile setup |
| `/api/registration/step3` | PUT | Bearer | Role details |
| `/api/registration/submit` | POST | Bearer | Submit for verification |
| `/api/registration/status` | GET | Bearer | Get current status |
| `/api/auth/login` | POST | ❌ | Login, get JWT |
| `/api/auth/me` | GET | Bearer | Get current user |
| `/api/admin/users` | GET | Admin | List all users |
| `/api/admin/users/{id}` | PUT | Admin | Approve/reject/update |

See `REGISTRATION_API.md` for full details.

---

## 2️⃣ PROJECT MANAGEMENT APIs

### Create Project
`POST /api/projects`

```json
{
  "projectName": "Metro CP-303",
  "projectCode": "CP-303",
  "location": "Delhi",
  "address": "Sector 21, Dwarka",
  "description": "Delhi Metro Phase 4 Construction",
  "startDate": "2024-12-15",
  "endDate": "2025-03-15",
  "budget": 50000000,
  "pmId": "user_123"
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

### Get All Projects (PM Dashboard)
`GET /api/projects/my`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "projectId": "proj_303",
      "projectName": "Metro CP-303",
      "status": "IN_PROGRESS",
      "progress": 35,
      "vendorsCount": 5,
      "machinesCount": 3,
      "pendingReports": 2
    }
  ]
}
```

---

### Get Single Project
`GET /api/projects/{projectId}`

---

### Update Project
`PUT /api/projects/{projectId}`

```json
{
  "status": "IN_PROGRESS",
  "progress": 45
}
```

---

### Assign Members to Project
`POST /api/projects/{projectId}/assign`

```json
{
  "vendors": ["user_v1", "user_v2"],
  "supervisors": ["user_s1"],
  "projectManagers": ["user_pm1"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendorsAdded": 2,
    "supervisorsAdded": 1,
    "totalMembers": 4
  }
}
```

---

### Get Project Members
`GET /api/projects/{projectId}/members`

---

### Remove Member
`DELETE /api/projects/{projectId}/members/{userId}`

---

## 3️⃣ MACHINE / RESOURCE MANAGEMENT APIs

### 🏗️ Machine Registry

#### Create Machine
`POST /api/machines`

```json
{
  "machineType": "TOWER_CRANE",
  "machineCode": "TC-05",
  "name": "Tower Crane 5",
  "vendorId": "vendor_123",
  "capacity": "10T",
  "specifications": {
    "height": "50m",
    "radius": "40m",
    "power": "Electric"
  },
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

#### List All Machines
`GET /api/machines`

**Query params:**
- `?type=TOWER_CRANE`
- `?vendorId=vendor_123`
- `?status=AVAILABLE`
- `?projectId=proj_303`

---

#### Get Single Machine
`GET /api/machines/{machineId}`

---

#### Update Machine
`PUT /api/machines/{machineId}`

---

#### Delete Machine
`DELETE /api/machines/{machineId}`

---

### 📅 Machine Assignment

#### Assign Machine to Project + Person
`POST /api/machines/{machineId}/assign`

```json
{
  "projectId": "proj_303",
  "assignedToUserId": "supervisor_456",
  "from": "2024-12-15T06:00:00Z",
  "to": "2024-12-20T18:00:00Z",
  "notes": "Required for slab casting work"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assignmentId": "assign_789",
    "machineCode": "TC-05",
    "assignedTo": "John Supervisor",
    "project": "Metro CP-303",
    "period": "Dec 15 - Dec 20"
  }
}
```

---

#### Get Machine Assignments
`GET /api/machines/{machineId}/assignments`

---

#### Release Machine
`DELETE /api/machines/{machineId}/assignments/{assignmentId}`

---

### 📊 Machine Availability

#### Check Availability by Date
`GET /api/machines/availability?date=2024-12-16`

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-12-16",
    "available": [
      { "machineId": "m_01", "code": "TC-02", "type": "TOWER_CRANE" },
      { "machineId": "m_02", "code": "TC-04", "type": "TOWER_CRANE" }
    ],
    "assigned": [
      { 
        "machineId": "m_03", 
        "code": "TC-05", 
        "type": "TOWER_CRANE",
        "project": "CP-303",
        "assignedTo": "John Supervisor"
      }
    ],
    "maintenance": [
      { "machineId": "m_04", "code": "TC-01", "reason": "Annual servicing" }
    ]
  }
}
```

---

#### Check Availability for Date Range
`GET /api/machines/availability?from=2024-12-15&to=2024-12-20&type=TOWER_CRANE`

---

## 4️⃣ LOCATION TRACKING APIs (FREE - NO GOOGLE BILLING)

### 📍 Strategy: Device GPS + Your API

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  MAUI App       │────▶│  Your API    │────▶│  MongoDB    │
│  (Device GPS)   │     │  (Next.js)   │     │  (Free)     │
└─────────────────┘     └──────────────┘     └─────────────┘
        │                                            │
        │                                            ▼
        │                              ┌─────────────────────┐
        │                              │  OpenStreetMap      │
        │                              │  + Leaflet (FREE)   │
        └──────────────────────────────│  Map Display        │
                                       └─────────────────────┘
```

### Update Location (From MAUI)
`POST /api/location/update`

```json
{
  "entityType": "MACHINE",
  "entityId": "machine_tc_05",
  "lat": 28.6139,
  "lng": 77.2090,
  "accuracy": 12,
  "altitude": 230,
  "speed": 0,
  "heading": 45,
  "batteryLevel": 85,
  "timestamp": "2024-12-14T18:00:00Z"
}
```

**Entity Types:**
- `MACHINE` - Crane, wagon, excavator
- `VEHICLE` - Trucks, transport
- `USER` - Field supervisors

**Response:**
```json
{
  "success": true,
  "message": "Location updated"
}
```

---

### Get Latest Location
`GET /api/location/{entityType}/{entityId}/latest`

**Example:** `GET /api/location/machine/tc_05/latest`

**Response:**
```json
{
  "success": true,
  "data": {
    "entityType": "MACHINE",
    "entityId": "tc_05",
    "machineCode": "TC-05",
    "machineName": "Tower Crane 5",
    "assignedTo": {
      "userId": "supervisor_456",
      "name": "Rajesh Kumar"
    },
    "project": {
      "projectId": "proj_303",
      "name": "Metro CP-303"
    },
    "location": {
      "lat": 28.6139,
      "lng": 77.2090,
      "accuracy": 12
    },
    "lastUpdated": "2024-12-14T18:00:00Z",
    "lastUpdatedAgo": "5 mins ago",
    "status": "ACTIVE"
  }
}
```

---

### Get Location History
`GET /api/location/{entityType}/{entityId}/history`

**Query params:**
- `?from=2024-12-14T00:00:00Z`
- `?to=2024-12-14T23:59:59Z`
- `?limit=100`

---

### Get All Locations for Project
`GET /api/location/project/{projectId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "machines": [
      {
        "machineId": "tc_05",
        "code": "TC-05",
        "lat": 28.6139,
        "lng": 77.2090,
        "lastUpdated": "5 mins ago"
      }
    ],
    "supervisors": [
      {
        "userId": "sup_456",
        "name": "Rajesh",
        "lat": 28.6140,
        "lng": 77.2091,
        "lastUpdated": "2 mins ago"
      }
    ]
  }
}
```

---

### MAUI Code Example (FREE GPS)
```csharp
// Get location - NO COST
var location = await Geolocation.GetLocationAsync(new GeolocationRequest
{
    DesiredAccuracy = GeolocationAccuracy.High,
    Timeout = TimeSpan.FromSeconds(10)
});

// Send to your API
await httpClient.PostAsJsonAsync("/api/location/update", new
{
    EntityType = "MACHINE",
    EntityId = "tc_05",
    Lat = location.Latitude,
    Lng = location.Longitude,
    Accuracy = location.Accuracy,
    Timestamp = DateTime.UtcNow
});
```

---

## 5️⃣ DAILY REPORTS & PROGRESS APIs

### Submit Daily Report
`POST /api/reports/daily`

```json
{
  "projectId": "proj_303",
  "machineId": "tc_05",
  "date": "2024-12-14",
  "workDone": "Slab casting for Block A, Level 3",
  "hoursUsed": 6,
  "materialsUsed": [
    { "name": "Cement", "quantity": 50, "unit": "bags" },
    { "name": "Steel", "quantity": 2, "unit": "tonnes" }
  ],
  "manpower": 15,
  "issues": "Minor delay due to rain",
  "photos": ["url1", "url2"],
  "submittedBy": "supervisor_456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reportId": "report_xyz",
    "status": "SUBMITTED"
  }
}
```

---

### Get Today's Reports (PM View)
`GET /api/reports/project/{projectId}/today`

---

### Get Reports by Date Range
`GET /api/reports/project/{projectId}?from=2024-12-01&to=2024-12-14`

---

### Get Single Report
`GET /api/reports/{reportId}`

---

### Approve/Review Report
`PUT /api/reports/{reportId}`

```json
{
  "status": "APPROVED",
  "pmNotes": "Good progress. Continue."
}
```

---

### Upload Report Photo
`POST /api/reports/{reportId}/photos`

**Content-Type:** `multipart/form-data`

---

## 6️⃣ COMMUNICATION APIs (WhatsApp Replacement)

### 💬 Project Chat

#### Send Message
`POST /api/chat/{projectId}`

```json
{
  "message": "Concrete pour completed for Block A",
  "attachments": ["photo_url"],
  "replyTo": "msg_123"
}
```

---

#### Get Messages
`GET /api/chat/{projectId}`

**Query params:**
- `?limit=50`
- `?before=msg_456` (pagination)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_789",
        "sender": {
          "userId": "sup_456",
          "name": "Rajesh",
          "role": "SUPERVISOR"
        },
        "message": "Concrete pour completed",
        "attachments": ["photo.jpg"],
        "timestamp": "2024-12-14T14:30:00Z"
      }
    ],
    "hasMore": true
  }
}
```

---

### 📢 Announcements

#### Create Announcement
`POST /api/announcements`

```json
{
  "scope": "PROJECT",
  "scopeId": "proj_303",
  "title": "Important: Site Inspection Tomorrow",
  "message": "All supervisors must be present at 9 AM for safety inspection.",
  "priority": "HIGH",
  "expiresAt": "2024-12-16T18:00:00Z"
}
```

**Scope Options:**
- `PROJECT` - Single project
- `VENDOR` - All vendor's workers
- `GLOBAL` - All users (admin only)

---

#### Get Announcements
`GET /api/announcements?scope=PROJECT&scopeId=proj_303`

---

#### Mark as Read
`PUT /api/announcements/{announcementId}/read`

---

## 📊 DATABASE MODELS REQUIRED

```
┌──────────────────────────────────────────────────────┐
│ EXISTING MODELS                                       │
├──────────────────────────────────────────────────────┤
│ User, Project, Task, Vendor, InventoryItem            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ NEW MODELS NEEDED                                     │
├──────────────────────────────────────────────────────┤
│ Machine - Equipment registry                          │
│ MachineAssignment - Who has what machine              │
│ Location - GPS coordinates log                        │
│ DailyReport - Work progress reports                   │
│ ChatMessage - Project chat messages                   │
│ Announcement - Broadcasts                             │
│ ProjectMember - User-Project relationship             │
└──────────────────────────────────────────────────────┘
```

---

## 🗺️ FREE MAP INTEGRATION

### For Next.js (Web)

**Library:** React-Leaflet + OpenStreetMap

```bash
npm install react-leaflet leaflet
```

```tsx
import { MapContainer, TileLayer, Marker } from 'react-leaflet'

<MapContainer center={[28.6139, 77.2090]} zoom={13}>
  <TileLayer
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    attribution='&copy; OpenStreetMap'
  />
  <Marker position={[28.6139, 77.2090]} />
</MapContainer>
```

**Cost:** FREE ✅

---

### For MAUI (Mobile)

**Library:** Mapsui (FREE) or Esri (FREE tier)

```csharp
// Mapsui - 100% FREE
var mapControl = new MapControl();
mapControl.Map.Layers.Add(OpenStreetMap.CreateTileLayer());
```

**Cost:** FREE ✅

---

## 📁 API FILE STRUCTURE

```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── me/route.ts
│
├── registration/
│   ├── step1/route.ts
│   ├── step2/route.ts
│   ├── step3/route.ts
│   ├── submit/route.ts
│   └── status/route.ts
│
├── admin/
│   └── users/
│       ├── route.ts
│       └── [id]/route.ts
│
├── projects/
│   ├── route.ts                    # GET all, POST create
│   ├── my/route.ts                 # GET user's projects
│   └── [projectId]/
│       ├── route.ts                # GET, PUT, DELETE
│       ├── assign/route.ts         # POST assign members
│       └── members/route.ts        # GET, DELETE members
│
├── machines/
│   ├── route.ts                    # GET all, POST create
│   ├── availability/route.ts       # GET availability
│   └── [machineId]/
│       ├── route.ts                # GET, PUT, DELETE
│       ├── assign/route.ts         # POST assign
│       └── assignments/route.ts    # GET, DELETE
│
├── location/
│   ├── update/route.ts             # POST update location
│   ├── project/[projectId]/route.ts
│   └── [entityType]/[entityId]/
│       ├── latest/route.ts         # GET latest
│       └── history/route.ts        # GET history
│
├── reports/
│   ├── daily/route.ts              # POST create
│   ├── [reportId]/
│   │   ├── route.ts                # GET, PUT
│   │   └── photos/route.ts         # POST upload
│   └── project/[projectId]/
│       └── route.ts                # GET by project
│
├── chat/
│   └── [projectId]/route.ts        # GET, POST messages
│
└── announcements/
    ├── route.ts                    # GET, POST
    └── [id]/
        ├── route.ts                # GET, PUT, DELETE
        └── read/route.ts           # PUT mark as read
```

---

## 💰 COST SUMMARY

| Component | Technology | Cost |
|-----------|------------|------|
| Backend API | Next.js on Vercel/Railway | **FREE** |
| Database | MongoDB Atlas (512MB) | **FREE** |
| GPS Tracking | Device GPS (Android/iOS) | **FREE** |
| Location Storage | MongoDB | **FREE** |
| Map Display (Web) | OpenStreetMap + Leaflet | **FREE** |
| Map Display (Mobile) | Mapsui | **FREE** |
| File Storage | Cloudinary (25GB) | **FREE** |
| Authentication | JWT (self-hosted) | **FREE** |

### ❌ AVOID (Paid Services)
- Google Maps SDK
- Google Geofencing
- Google Location APIs
- AWS Lambda (can get expensive)
- Firebase (can exceed free tier)

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Week 1) ✅
- [x] Auth & Registration APIs
- [x] Admin Verification Dashboard

### Phase 2 (Week 2)
- [ ] Project CRUD APIs
- [ ] Project Members Management
- [ ] Machine Registry APIs

### Phase 3 (Week 3)
- [ ] Machine Assignment APIs
- [ ] Location Tracking APIs
- [ ] Free Map Integration

### Phase 4 (Week 4)
- [ ] Daily Reports APIs
- [ ] Chat APIs
- [ ] Announcements APIs

---

## 🔐 AUTHENTICATION PATTERN

All protected routes use JWT Bearer token:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Token includes:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "role": "VENDOR",
  "exp": 1734567890
}
```

---

## 📱 MAUI INTEGRATION GUIDE

### HTTP Client Setup
```csharp
public class ApiClient
{
    private readonly HttpClient _http;
    private string _token;

    public ApiClient()
    {
        _http = new HttpClient
        {
            BaseAddress = new Uri("https://vendorconnect.vercel.app")
        };
    }

    public void SetToken(string token)
    {
        _token = token;
        _http.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }

    // Example: Get My Projects
    public async Task<List<Project>> GetMyProjects()
    {
        var response = await _http.GetAsync("/api/projects/my");
        var result = await response.Content.ReadFromJsonAsync<ApiResponse<List<Project>>>();
        return result.Data;
    }
}
```

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2024  
**Author:** VendorConnect Dev Team
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
