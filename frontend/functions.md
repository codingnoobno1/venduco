<<<<<<< HEAD
# API Functions & Backend Architecture

## 🔌 Overview

This document defines all **API routes** (backend functions) for VendorConnect. These routes handle business logic, database operations, authentication, and data validation. All routes follow Next.js App Router conventions and are located in `src/app/api/`.

---

## 🏗️ API Structure

```
src/app/api/
├── auth/
│   ├── login/route.ts           ← User authentication
│   ├── logout/route.ts          ← Session termination
│   ├── refresh/route.ts         ← Token refresh
│   ├── register/route.ts        ← New user signup
│   └── forgot-password/route.ts ← Password reset flow
│
├── projects/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [projectId]/
│       ├── route.ts             ← GET (detail), PUT (update), DELETE
│       ├── members/route.ts     ← Project team management
│       └── invite/route.ts      ← Send project invitations
│
├── users/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [userId]/
│       ├── route.ts             ← GET (profile), PUT (update)
│       └── roles/route.ts       ← Manage user roles in projects
│
├── tasks/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [taskId]/
│       ├── route.ts             ← GET (detail), PUT (update), DELETE
│       ├── assign/route.ts      ← Assign task to vendor/team
│       └── progress/route.ts    ← Update task progress
│
├── scheduling/
│   ├── route.ts                 ← GET (calendar view), POST (create schedule)
│   └── [scheduleId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       └── conflicts/route.ts   ← Check for scheduling conflicts
│
├── machines/
│   ├── route.ts                 ← GET (list), POST (add machine)
│   └── [machineId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       └── utilization/route.ts ← Usage statistics
│
├── warehouse/
│   ├── inventory/
│   │   ├── route.ts             ← GET (list items), POST (add item)
│   │   └── [itemId]/route.ts   ← GET, PUT, DELETE
│   ├── dispatch/
│   │   ├── route.ts             ← GET (requests), POST (dispatch)
│   │   └── [dispatchId]/route.ts
│   └── reorder/route.ts         ← Automatic reorder logic
│
├── vendors/
│   ├── route.ts                 ← GET (list), POST (add vendor)
│   └── [vendorId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       ├── performance/route.ts ← Vendor ratings & stats
│       └── availability/route.ts← Vendor calendar
│
├── alerts/
│   ├── route.ts                 ← GET (user alerts), POST (create)
│   └── [alertId]/
│       ├── route.ts             ← GET, PUT (mark read), DELETE
│       └── dismiss/route.ts     ← Dismiss notification
│
├── reports/
│   ├── project-summary/route.ts ← Overall project metrics
│   ├── vendor-performance/route.ts
│   ├── budget/route.ts          ← Budget tracking
│   └── export/route.ts          ← Export to PDF/Excel
│
└── webhooks/
    ├── stripe/route.ts          ← Payment webhooks
    └── notifications/route.ts   ← External notification services
```

---

## 🔐 Authentication API

### POST `/api/auth/login`

**Purpose**: Authenticate user and issue JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "usr_123",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "dGhpc2lzYXJlZnJl...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `429`: Too many login attempts

**Implementation**:
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    
    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/auth/refresh`

**Purpose**: Refresh expired access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "dGhpc2lzYXJlZnJl..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "expiresIn": 3600
}
```

---

## 📁 Projects API

### GET `/api/projects`

**Purpose**: List all projects accessible to the authenticated user

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `role` (optional): Filter by user's role in projects

**Response** (200 OK):
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "Site Alpha - Tower Construction",
      "location": "New York, NY",
      "userRole": "project-head",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z",
      "members": 24
    },
    {
      "id": "proj_456",
      "name": "Site Beta - Warehouse Expansion",
      "location": "Los Angeles, CA",
      "userRole": "supervisor",
      "status": "active",
      "createdAt": "2025-02-01T14:30:00Z",
      "members": 18
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20
  }
}
```

**Implementation**:
```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const roleFilter = searchParams.get('role');
  
  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId,
          ...(roleFilter && { role: roleFilter }),
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return NextResponse.json({
    projects: projects.map(project => ({
      id: project.id,
      name: project.name,
      location: project.location,
      userRole: project.members[0].role,
      status: project.status,
      createdAt: project.createdAt,
      members: project._count.members,
    })),
    pagination: {
      total: projects.length,
      page,
      limit,
    },
  });
}
```

---

### POST `/api/projects`

**Purpose**: Create a new project (Admin/Project Head only)

**Request Body**:
```json
{
  "name": "Site Gamma - Bridge Construction",
  "location": "San Francisco, CA",
  "description": "New bridge over Golden Gate",
  "budget": 5000000,
  "deadline": "2026-12-31"
}
```

**Response** (201 Created):
```json
{
  "id": "proj_789",
  "name": "Site Gamma - Bridge Construction",
  "createdAt": "2025-03-14T18:00:00Z"
}
```

**Errors**:
- `403`: User doesn't have permission to create projects
- `400`: Validation error

---

## 👥 Users API

### GET `/api/users`

**Purpose**: List users (Admin/Project Head only)

**Query Parameters**:
- `projectId` (optional): Filter by project membership
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "usr_123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": {
        "proj_123": "supervisor",
        "proj_456": "vendor"
      },
      "lastActive": "2025-03-14T10:30:00Z"
    }
  ]
}
```

---

### PUT `/api/users/[userId]/roles`

**Purpose**: Update user's role in a project

**Request Body**:
```json
{
  "projectId": "proj_123",
  "role": "supervisor"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "userId": "usr_123",
  "projectId": "proj_123",
  "newRole": "supervisor"
}
```

---

## ✅ Tasks API

### POST `/api/tasks`

**Purpose**: Create a new task

**Request Body**:
```json
{
  "projectId": "proj_123",
  "title": "Concrete pour - Floor 3",
  "description": "Pour concrete for third floor",
  "priority": "high",
  "deadline": "2025-03-20T16:00:00Z",
  "assignedTo": "usr_456",
  "machineRequired": "mach_789",
  "materialsNeeded": ["item_001", "item_002"]
}
```

**Response** (201 Created):
```json
{
  "id": "task_001",
  "projectId": "proj_123",
  "title": "Concrete pour - Floor 3",
  "status": "pending",
  "createdAt": "2025-03-14T18:15:00Z"
}
```

---

### PUT `/api/tasks/[taskId]/progress`

**Purpose**: Update task progress (Vendor/Supervisor)

**Request Body**:
```json
{
  "completionPercentage": 75,
  "notes": "Floor 3 pour 75% complete, minor delay due to weather",
  "photos": ["https://cdn.vendorconnect.com/photos/abc123.jpg"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "taskId": "task_001",
  "status": "in-progress",
  "completionPercentage": 75,
  "updatedAt": "2025-03-20T14:30:00Z"
}
```

---

## 📅 Scheduling API

### GET `/api/scheduling`

**Purpose**: Get schedule for a project

**Query Parameters**:
- `projectId`: Required
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date
- `view`: `day` | `week` | `month`

**Response** (200 OK):
```json
{
  "events": [
    {
      "id": "sch_001",
      "title": "Concrete pour - Floor 3",
      "start": "2025-03-20T09:00:00Z",
      "end": "2025-03-20T16:00:00Z",
      "assignedTo": {
        "id": "usr_456",
        "name": "ABC Vendor"
      },
      "machine": {
        "id": "mach_789",
        "name": "Concrete Mixer #3"
      },
      "status": "confirmed"
    }
  ]
}
```

---

### POST `/api/scheduling/[scheduleId]/conflicts`

**Purpose**: Check if a schedule has conflicts (double-booked resources)

**Response** (200 OK):
```json
{
  "hasConflicts": true,
  "conflicts": [
    {
      "type": "machine",
      "resourceId": "mach_789",
      "conflictingScheduleId": "sch_002",
      "timeRange": {
        "start": "2025-03-20T14:00:00Z",
        "end": "2025-03-20T16:00:00Z"
      }
    }
  ]
}
```

---

## 🚜 Machines API

### GET `/api/machines`

**Purpose**: List all machines in a project

**Query Parameters**:
- `projectId`: Required
- `status`: `available` | `in-use` | `maintenance`

**Response** (200 OK):
```json
{
  "machines": [
    {
      "id": "mach_001",
      "name": "Concrete Mixer #3",
      "type": "mixer",
      "status": "in-use",
      "currentTask": "task_001",
      "utilizationRate": 78,
      "lastMaintenance": "2025-02-15T10:00:00Z"
    }
  ]
}
```

---

## 📦 Warehouse API

### GET `/api/warehouse/inventory`

**Purpose**: Get inventory for a project

**Query Parameters**:
- `projectId`: Required
- `lowStock`: `true` | `false` (filter)

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "item_001",
      "name": "Cement (50kg bags)",
      "sku": "CEM-50KG",
      "quantity": 45,
      "unit": "bags",
      "minimumStock": 100,
      "location": "Warehouse A - Section 3",
      "supplier": "Acme Supplies",
      "lastUpdated": "2025-03-14T12:00:00Z"
    }
  ]
}
```

---

### POST `/api/warehouse/dispatch`

**Purpose**: Create a dispatch request

**Request Body**:
```json
{
  "projectId": "proj_123",
  "items": [
    {
      "itemId": "item_001",
      "quantity": 50
    }
  ],
  "destination": "Site Alpha - Floor 3",
  "requestedBy": "usr_456",
  "urgency": "high"
}
```

**Response** (201 Created):
```json
{
  "id": "dispatch_001",
  "status": "pending",
  "estimatedDispatchTime": "2025-03-15T08:00:00Z",
  "assignedDriver": null
}
```

---

## 🏢 Vendors API

### GET `/api/vendors/[vendorId]/performance`

**Purpose**: Get vendor performance metrics

**Response** (200 OK):
```json
{
  "vendorId": "usr_456",
  "metrics": {
    "tasksCompleted": 127,
    "onTimeCompletionRate": 92.5,
    "averageRating": 4.7,
    "totalEarnings": 125000,
    "responseTime": 45
  },
  "recentFeedback": [
    {
      "taskId": "task_100",
      "rating": 5,
      "comment": "Excellent work, finished ahead of schedule",
      "date": "2025-03-10T16:00:00Z"
    }
  ]
}
```

---

## 🔔 Alerts API

### GET `/api/alerts`

**Purpose**: Get alerts for the authenticated user

**Query Parameters**:
- `unreadOnly`: `true` | `false`
- `projectId` (optional): Filter by project

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "type": "warning",
      "title": "Material Shortage",
      "message": "Cement stock below minimum (45/100 bags)",
      "projectId": "proj_123",
      "isRead": false,
      "createdAt": "2025-03-14T10:00:00Z",
      "actionUrl": "/app/proj_123/warehouse"
    }
  ],
  "unreadCount": 5
}
```

---

## 📊 Reports API

### GET `/api/reports/project-summary`

**Purpose**: Generate comprehensive project report

**Query Parameters**:
- `projectId`: Required
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date

**Response** (200 OK):
```json
{
  "projectId": "proj_123",
  "period": {
    "start": "2025-03-01T00:00:00Z",
    "end": "2025-03-14T23:59:59Z"
  },
  "metrics": {
    "tasksCompleted": 45,
    "tasksPending": 18,
    "budgetUsed": 1200000,
    "budgetTotal": 1800000,
    "vendorsActive": 12,
    "machineUtilization": 73.5,
    "inventoryTurnover": 8.2
  },
  "topVendors": [
    {
      "id": "usr_456",
      "name": "ABC Vendor",
      "tasksCompleted": 15,
      "rating": 4.8
    }
  ]
}
```

---

## 🔐 Security & Middleware

### Auth Verification Utility

```typescript
// src/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
```

### RBAC Permission Check

```typescript
// src/lib/permissions.ts
type UserRole = 'admin' | 'project-head' | 'supervisor' | 'vendor' | 'warehouse' | 'driver';

const permissions = {
  'create-project': ['admin', 'project-head'],
  'create-task': ['admin', 'project-head', 'supervisor'],
  'manage-inventory': ['admin', 'project-head', 'warehouse'],
  'view-reports': ['admin', 'project-head', 'supervisor'],
  'update-task-progress': ['admin', 'project-head', 'supervisor', 'vendor'],
};

export function hasPermission(userRole: UserRole, action: keyof typeof permissions): boolean {
  return permissions[action]?.includes(userRole) ?? false;
}
```

---

## ⚡ Performance Optimizations

### Caching Strategy

```typescript
// Use Redis for frequently accessed data
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData(key: string, ttl: number, fetchFn: () => Promise<any>) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

---

## 🧪 Testing

### API Route Test Example

```typescript
// __tests__/api/projects.test.ts
import { POST } from '@/app/api/projects/route';
import { NextRequest } from 'next/server';

describe('POST /api/projects', () => {
  it('creates a new project', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        name: 'Test Project',
        location: 'Test Location',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.name).toBe('Test Project');
  });
  
  it('returns 403 for unauthorized users', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer vendor-token',
      },
      body: JSON.stringify({
        name: 'Test Project',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

---

## 📚 Related Documents

- [Data Models](./models.md) - Database schema
- [Dashboard Specifications](./dashboards.md) - Frontend integration
- [Security Plan](./plan.md#security-architecture) - Auth details

---

**Last Updated**: 2025-12-14  
**Version**: 1.0  
**Status**: 🟡 Planning Phase
=======
# API Functions & Backend Architecture

## 🔌 Overview

This document defines all **API routes** (backend functions) for VendorConnect. These routes handle business logic, database operations, authentication, and data validation. All routes follow Next.js App Router conventions and are located in `src/app/api/`.

---

## 🏗️ API Structure

```
src/app/api/
├── auth/
│   ├── login/route.ts           ← User authentication
│   ├── logout/route.ts          ← Session termination
│   ├── refresh/route.ts         ← Token refresh
│   ├── register/route.ts        ← New user signup
│   └── forgot-password/route.ts ← Password reset flow
│
├── projects/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [projectId]/
│       ├── route.ts             ← GET (detail), PUT (update), DELETE
│       ├── members/route.ts     ← Project team management
│       └── invite/route.ts      ← Send project invitations
│
├── users/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [userId]/
│       ├── route.ts             ← GET (profile), PUT (update)
│       └── roles/route.ts       ← Manage user roles in projects
│
├── tasks/
│   ├── route.ts                 ← GET (list), POST (create)
│   └── [taskId]/
│       ├── route.ts             ← GET (detail), PUT (update), DELETE
│       ├── assign/route.ts      ← Assign task to vendor/team
│       └── progress/route.ts    ← Update task progress
│
├── scheduling/
│   ├── route.ts                 ← GET (calendar view), POST (create schedule)
│   └── [scheduleId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       └── conflicts/route.ts   ← Check for scheduling conflicts
│
├── machines/
│   ├── route.ts                 ← GET (list), POST (add machine)
│   └── [machineId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       └── utilization/route.ts ← Usage statistics
│
├── warehouse/
│   ├── inventory/
│   │   ├── route.ts             ← GET (list items), POST (add item)
│   │   └── [itemId]/route.ts   ← GET, PUT, DELETE
│   ├── dispatch/
│   │   ├── route.ts             ← GET (requests), POST (dispatch)
│   │   └── [dispatchId]/route.ts
│   └── reorder/route.ts         ← Automatic reorder logic
│
├── vendors/
│   ├── route.ts                 ← GET (list), POST (add vendor)
│   └── [vendorId]/
│       ├── route.ts             ← GET, PUT, DELETE
│       ├── performance/route.ts ← Vendor ratings & stats
│       └── availability/route.ts← Vendor calendar
│
├── alerts/
│   ├── route.ts                 ← GET (user alerts), POST (create)
│   └── [alertId]/
│       ├── route.ts             ← GET, PUT (mark read), DELETE
│       └── dismiss/route.ts     ← Dismiss notification
│
├── reports/
│   ├── project-summary/route.ts ← Overall project metrics
│   ├── vendor-performance/route.ts
│   ├── budget/route.ts          ← Budget tracking
│   └── export/route.ts          ← Export to PDF/Excel
│
└── webhooks/
    ├── stripe/route.ts          ← Payment webhooks
    └── notifications/route.ts   ← External notification services
```

---

## 🔐 Authentication API

### POST `/api/auth/login`

**Purpose**: Authenticate user and issue JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": "usr_123",
    "name": "John Doe",
    "email": "user@example.com"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "dGhpc2lzYXJlZnJl...",
    "expiresIn": 3600
  }
}
```

**Errors**:
- `401`: Invalid credentials
- `429`: Too many login attempts

**Implementation**:
```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);
    
    // Find user
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 3600,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### POST `/api/auth/refresh`

**Purpose**: Refresh expired access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "dGhpc2lzYXJlZnJl..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1...",
  "expiresIn": 3600
}
```

---

## 📁 Projects API

### GET `/api/projects`

**Purpose**: List all projects accessible to the authenticated user

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)
- `role` (optional): Filter by user's role in projects

**Response** (200 OK):
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "Site Alpha - Tower Construction",
      "location": "New York, NY",
      "userRole": "project-head",
      "status": "active",
      "createdAt": "2025-01-15T10:00:00Z",
      "members": 24
    },
    {
      "id": "proj_456",
      "name": "Site Beta - Warehouse Expansion",
      "location": "Los Angeles, CA",
      "userRole": "supervisor",
      "status": "active",
      "createdAt": "2025-02-01T14:30:00Z",
      "members": 18
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "limit": 20
  }
}
```

**Implementation**:
```typescript
// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  const userId = await verifyAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const roleFilter = searchParams.get('role');
  
  const projects = await db.project.findMany({
    where: {
      members: {
        some: {
          userId,
          ...(roleFilter && { role: roleFilter }),
        },
      },
    },
    include: {
      _count: {
        select: { members: true },
      },
      members: {
        where: { userId },
        select: { role: true },
      },
    },
    skip: (page - 1) * limit,
    take: limit,
  });
  
  return NextResponse.json({
    projects: projects.map(project => ({
      id: project.id,
      name: project.name,
      location: project.location,
      userRole: project.members[0].role,
      status: project.status,
      createdAt: project.createdAt,
      members: project._count.members,
    })),
    pagination: {
      total: projects.length,
      page,
      limit,
    },
  });
}
```

---

### POST `/api/projects`

**Purpose**: Create a new project (Admin/Project Head only)

**Request Body**:
```json
{
  "name": "Site Gamma - Bridge Construction",
  "location": "San Francisco, CA",
  "description": "New bridge over Golden Gate",
  "budget": 5000000,
  "deadline": "2026-12-31"
}
```

**Response** (201 Created):
```json
{
  "id": "proj_789",
  "name": "Site Gamma - Bridge Construction",
  "createdAt": "2025-03-14T18:00:00Z"
}
```

**Errors**:
- `403`: User doesn't have permission to create projects
- `400`: Validation error

---

## 👥 Users API

### GET `/api/users`

**Purpose**: List users (Admin/Project Head only)

**Query Parameters**:
- `projectId` (optional): Filter by project membership
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response** (200 OK):
```json
{
  "users": [
    {
      "id": "usr_123",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": {
        "proj_123": "supervisor",
        "proj_456": "vendor"
      },
      "lastActive": "2025-03-14T10:30:00Z"
    }
  ]
}
```

---

### PUT `/api/users/[userId]/roles`

**Purpose**: Update user's role in a project

**Request Body**:
```json
{
  "projectId": "proj_123",
  "role": "supervisor"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "userId": "usr_123",
  "projectId": "proj_123",
  "newRole": "supervisor"
}
```

---

## ✅ Tasks API

### POST `/api/tasks`

**Purpose**: Create a new task

**Request Body**:
```json
{
  "projectId": "proj_123",
  "title": "Concrete pour - Floor 3",
  "description": "Pour concrete for third floor",
  "priority": "high",
  "deadline": "2025-03-20T16:00:00Z",
  "assignedTo": "usr_456",
  "machineRequired": "mach_789",
  "materialsNeeded": ["item_001", "item_002"]
}
```

**Response** (201 Created):
```json
{
  "id": "task_001",
  "projectId": "proj_123",
  "title": "Concrete pour - Floor 3",
  "status": "pending",
  "createdAt": "2025-03-14T18:15:00Z"
}
```

---

### PUT `/api/tasks/[taskId]/progress`

**Purpose**: Update task progress (Vendor/Supervisor)

**Request Body**:
```json
{
  "completionPercentage": 75,
  "notes": "Floor 3 pour 75% complete, minor delay due to weather",
  "photos": ["https://cdn.vendorconnect.com/photos/abc123.jpg"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "taskId": "task_001",
  "status": "in-progress",
  "completionPercentage": 75,
  "updatedAt": "2025-03-20T14:30:00Z"
}
```

---

## 📅 Scheduling API

### GET `/api/scheduling`

**Purpose**: Get schedule for a project

**Query Parameters**:
- `projectId`: Required
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date
- `view`: `day` | `week` | `month`

**Response** (200 OK):
```json
{
  "events": [
    {
      "id": "sch_001",
      "title": "Concrete pour - Floor 3",
      "start": "2025-03-20T09:00:00Z",
      "end": "2025-03-20T16:00:00Z",
      "assignedTo": {
        "id": "usr_456",
        "name": "ABC Vendor"
      },
      "machine": {
        "id": "mach_789",
        "name": "Concrete Mixer #3"
      },
      "status": "confirmed"
    }
  ]
}
```

---

### POST `/api/scheduling/[scheduleId]/conflicts`

**Purpose**: Check if a schedule has conflicts (double-booked resources)

**Response** (200 OK):
```json
{
  "hasConflicts": true,
  "conflicts": [
    {
      "type": "machine",
      "resourceId": "mach_789",
      "conflictingScheduleId": "sch_002",
      "timeRange": {
        "start": "2025-03-20T14:00:00Z",
        "end": "2025-03-20T16:00:00Z"
      }
    }
  ]
}
```

---

## 🚜 Machines API

### GET `/api/machines`

**Purpose**: List all machines in a project

**Query Parameters**:
- `projectId`: Required
- `status`: `available` | `in-use` | `maintenance`

**Response** (200 OK):
```json
{
  "machines": [
    {
      "id": "mach_001",
      "name": "Concrete Mixer #3",
      "type": "mixer",
      "status": "in-use",
      "currentTask": "task_001",
      "utilizationRate": 78,
      "lastMaintenance": "2025-02-15T10:00:00Z"
    }
  ]
}
```

---

## 📦 Warehouse API

### GET `/api/warehouse/inventory`

**Purpose**: Get inventory for a project

**Query Parameters**:
- `projectId`: Required
- `lowStock`: `true` | `false` (filter)

**Response** (200 OK):
```json
{
  "items": [
    {
      "id": "item_001",
      "name": "Cement (50kg bags)",
      "sku": "CEM-50KG",
      "quantity": 45,
      "unit": "bags",
      "minimumStock": 100,
      "location": "Warehouse A - Section 3",
      "supplier": "Acme Supplies",
      "lastUpdated": "2025-03-14T12:00:00Z"
    }
  ]
}
```

---

### POST `/api/warehouse/dispatch`

**Purpose**: Create a dispatch request

**Request Body**:
```json
{
  "projectId": "proj_123",
  "items": [
    {
      "itemId": "item_001",
      "quantity": 50
    }
  ],
  "destination": "Site Alpha - Floor 3",
  "requestedBy": "usr_456",
  "urgency": "high"
}
```

**Response** (201 Created):
```json
{
  "id": "dispatch_001",
  "status": "pending",
  "estimatedDispatchTime": "2025-03-15T08:00:00Z",
  "assignedDriver": null
}
```

---

## 🏢 Vendors API

### GET `/api/vendors/[vendorId]/performance`

**Purpose**: Get vendor performance metrics

**Response** (200 OK):
```json
{
  "vendorId": "usr_456",
  "metrics": {
    "tasksCompleted": 127,
    "onTimeCompletionRate": 92.5,
    "averageRating": 4.7,
    "totalEarnings": 125000,
    "responseTime": 45
  },
  "recentFeedback": [
    {
      "taskId": "task_100",
      "rating": 5,
      "comment": "Excellent work, finished ahead of schedule",
      "date": "2025-03-10T16:00:00Z"
    }
  ]
}
```

---

## 🔔 Alerts API

### GET `/api/alerts`

**Purpose**: Get alerts for the authenticated user

**Query Parameters**:
- `unreadOnly`: `true` | `false`
- `projectId` (optional): Filter by project

**Response** (200 OK):
```json
{
  "alerts": [
    {
      "id": "alert_001",
      "type": "warning",
      "title": "Material Shortage",
      "message": "Cement stock below minimum (45/100 bags)",
      "projectId": "proj_123",
      "isRead": false,
      "createdAt": "2025-03-14T10:00:00Z",
      "actionUrl": "/app/proj_123/warehouse"
    }
  ],
  "unreadCount": 5
}
```

---

## 📊 Reports API

### GET `/api/reports/project-summary`

**Purpose**: Generate comprehensive project report

**Query Parameters**:
- `projectId`: Required
- `startDate`: ISO 8601 date
- `endDate`: ISO 8601 date

**Response** (200 OK):
```json
{
  "projectId": "proj_123",
  "period": {
    "start": "2025-03-01T00:00:00Z",
    "end": "2025-03-14T23:59:59Z"
  },
  "metrics": {
    "tasksCompleted": 45,
    "tasksPending": 18,
    "budgetUsed": 1200000,
    "budgetTotal": 1800000,
    "vendorsActive": 12,
    "machineUtilization": 73.5,
    "inventoryTurnover": 8.2
  },
  "topVendors": [
    {
      "id": "usr_456",
      "name": "ABC Vendor",
      "tasksCompleted": 15,
      "rating": 4.8
    }
  ]
}
```

---

## 🔐 Security & Middleware

### Auth Verification Utility

```typescript
// src/lib/auth.ts
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function verifyAuth(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}
```

### RBAC Permission Check

```typescript
// src/lib/permissions.ts
type UserRole = 'admin' | 'project-head' | 'supervisor' | 'vendor' | 'warehouse' | 'driver';

const permissions = {
  'create-project': ['admin', 'project-head'],
  'create-task': ['admin', 'project-head', 'supervisor'],
  'manage-inventory': ['admin', 'project-head', 'warehouse'],
  'view-reports': ['admin', 'project-head', 'supervisor'],
  'update-task-progress': ['admin', 'project-head', 'supervisor', 'vendor'],
};

export function hasPermission(userRole: UserRole, action: keyof typeof permissions): boolean {
  return permissions[action]?.includes(userRole) ?? false;
}
```

---

## ⚡ Performance Optimizations

### Caching Strategy

```typescript
// Use Redis for frequently accessed data
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData(key: string, ttl: number, fetchFn: () => Promise<any>) {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

### Rate Limiting

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

---

## 🧪 Testing

### API Route Test Example

```typescript
// __tests__/api/projects.test.ts
import { POST } from '@/app/api/projects/route';
import { NextRequest } from 'next/server';

describe('POST /api/projects', () => {
  it('creates a new project', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
      body: JSON.stringify({
        name: 'Test Project',
        location: 'Test Location',
      }),
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.name).toBe('Test Project');
  });
  
  it('returns 403 for unauthorized users', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer vendor-token',
      },
      body: JSON.stringify({
        name: 'Test Project',
      }),
    });
    
    const response = await POST(request);
    expect(response.status).toBe(403);
  });
});
```

---

## 📚 Related Documents

- [Data Models](./models.md) - Database schema
- [Dashboard Specifications](./dashboards.md) - Frontend integration
- [Security Plan](./plan.md#security-architecture) - Auth details

---

**Last Updated**: 2025-12-14  
**Version**: 1.0  
**Status**: 🟡 Planning Phase
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
