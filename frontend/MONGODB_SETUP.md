<<<<<<< HEAD
# MongoDB Backend Setup Guide

## ✅ Setup Complete!

Your MongoDB backend is now configured with Mongoose models and API routes.

---

## 🔐 Environment Setup

**IMPORTANT:** Create a `.env.local` file in the root directory:

```bash
# Copy this content to .env.local
MONGODB_URI=mongodb://localhost:27017/sampl1/?directConnection=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 What Was Created

### 1. Database Connection (`src/lib/db.ts`)
- MongoDB connection with pooling
- Optimized for Next.js serverless functions
- Auto-reconnect on disconnect

### 2. Mongoose Models (`src/models/`)

✅ **User.ts** - Global user accounts  
✅ **Project.ts** - Construction projects  
✅ **Task.ts** - Work items with priority/status  
✅ **Vendor.ts** - Contractor profiles with ratings  
✅ **InventoryItem.ts** - Warehouse stock management  

All models include:
- TypeScript interfaces
- Enums for status/priority
- Indexes for performance
- Timestamps (createdAt/updatedAt)
- Soft deletes (deletedAt)

### 3. API Routes (`src/app/api/`)

#### `/api/projects`
- `GET` - List all projects (filter by status)
- `POST` - Create new project

#### `/api/tasks`
- `GET` - List tasks (filter by project, status, assignee)
- `POST` - Create new task

#### `/api/inventory`
- `GET` - List inventory items (filter by project, category, low stock)
- `POST` - Add new inventory item

---

## 🚀 How to Use

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

```bash
# If using MongoDB locally
mongod
```

### 2. Test API Routes

**Get All Projects:**
```bash
curl http://localhost:3000/api/projects
```

**Create a Project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delhi Metro Phase 4",
    "location": "New Delhi",
    "budget": 50000000,
    "startDate": "2024-01-01",
    "deadline": "2025-12-31",
    "createdBy": "admin123"
  }'
```

**Get Tasks for a Project:**
```bash
curl "http://localhost:3000/api/tasks?projectId=PROJECT_ID"
```

**Create a Task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "title": "Install Railway Tracks",
    "priority": "HIGH",
    "createdById": "user123"
  }'
```

**Get Low Stock Items:**
```bash
curl "http://localhost:3000/api/inventory?lowStock=true"
```

---

## 📊 Model Relationships

```
User
 ↓
 ├─→ Project (createdBy)
 ├─→ Task (createdBy, assignedTo)
 └─→ Vendor (userId)

Project
 ├─→ Task
 ├─→ Vendor
 └─→ InventoryItem

Task
 └─→ InventoryItem (materials needed)
```

---

## 🔜 Next Steps

### Additional Models to Create:
- [ ] Machine (construction equipment)
- [ ] DispatchRequest (material delivery)
- [ ] Alert (notifications)
- [ ] Schedule (calendar events)

### Additional API Routes:
- [ ] `/api/projects/[id]` - Get/Update/Delete single project
- [ ] `/api/tasks/[id]` - Get/Update/Delete single task
- [ ] `/api/vendors` - Vendor management
- [ ] `/api/users` - User management with authentication

### Features to Add:
- [ ] Authentication (NextAuth.js or JWT)
- [ ] Real-time updates (Socket.io)
- [ ] File uploads (images for tasks/progress)
- [ ] Analytics/reporting endpoints
- [ ] Bulk operations

---

## 🧪 Testing

Create a test file to verify MongoDB connection:

```typescript
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({
      success: true,
      message: 'MongoDB connected successfully!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

Visit `http://localhost:3000/api/test-db` to test connection.

---

## ✅ Status: Backend Ready!

Your MongoDB backend is set up and ready to use! 🎉
=======
# MongoDB Backend Setup Guide

## ✅ Setup Complete!

Your MongoDB backend is now configured with Mongoose models and API routes.

---

## 🔐 Environment Setup

**IMPORTANT:** Create a `.env.local` file in the root directory:

```bash
# Copy this content to .env.local
MONGODB_URI=mongodb://localhost:27017/sampl1/?directConnection=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📦 What Was Created

### 1. Database Connection (`src/lib/db.ts`)
- MongoDB connection with pooling
- Optimized for Next.js serverless functions
- Auto-reconnect on disconnect

### 2. Mongoose Models (`src/models/`)

✅ **User.ts** - Global user accounts  
✅ **Project.ts** - Construction projects  
✅ **Task.ts** - Work items with priority/status  
✅ **Vendor.ts** - Contractor profiles with ratings  
✅ **InventoryItem.ts** - Warehouse stock management  

All models include:
- TypeScript interfaces
- Enums for status/priority
- Indexes for performance
- Timestamps (createdAt/updatedAt)
- Soft deletes (deletedAt)

### 3. API Routes (`src/app/api/`)

#### `/api/projects`
- `GET` - List all projects (filter by status)
- `POST` - Create new project

#### `/api/tasks`
- `GET` - List tasks (filter by project, status, assignee)
- `POST` - Create new task

#### `/api/inventory`
- `GET` - List inventory items (filter by project, category, low stock)
- `POST` - Add new inventory item

---

## 🚀 How to Use

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

```bash
# If using MongoDB locally
mongod
```

### 2. Test API Routes

**Get All Projects:**
```bash
curl http://localhost:3000/api/projects
```

**Create a Project:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delhi Metro Phase 4",
    "location": "New Delhi",
    "budget": 50000000,
    "startDate": "2024-01-01",
    "deadline": "2025-12-31",
    "createdBy": "admin123"
  }'
```

**Get Tasks for a Project:**
```bash
curl "http://localhost:3000/api/tasks?projectId=PROJECT_ID"
```

**Create a Task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "PROJECT_ID",
    "title": "Install Railway Tracks",
    "priority": "HIGH",
    "createdById": "user123"
  }'
```

**Get Low Stock Items:**
```bash
curl "http://localhost:3000/api/inventory?lowStock=true"
```

---

## 📊 Model Relationships

```
User
 ↓
 ├─→ Project (createdBy)
 ├─→ Task (createdBy, assignedTo)
 └─→ Vendor (userId)

Project
 ├─→ Task
 ├─→ Vendor
 └─→ InventoryItem

Task
 └─→ InventoryItem (materials needed)
```

---

## 🔜 Next Steps

### Additional Models to Create:
- [ ] Machine (construction equipment)
- [ ] DispatchRequest (material delivery)
- [ ] Alert (notifications)
- [ ] Schedule (calendar events)

### Additional API Routes:
- [ ] `/api/projects/[id]` - Get/Update/Delete single project
- [ ] `/api/tasks/[id]` - Get/Update/Delete single task
- [ ] `/api/vendors` - Vendor management
- [ ] `/api/users` - User management with authentication

### Features to Add:
- [ ] Authentication (NextAuth.js or JWT)
- [ ] Real-time updates (Socket.io)
- [ ] File uploads (images for tasks/progress)
- [ ] Analytics/reporting endpoints
- [ ] Bulk operations

---

## 🧪 Testing

Create a test file to verify MongoDB connection:

```typescript
// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'

export async function GET() {
  try {
    await dbConnect()
    return NextResponse.json({
      success: true,
      message: 'MongoDB connected successfully!'
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
```

Visit `http://localhost:3000/api/test-db` to test connection.

---

## ✅ Status: Backend Ready!

Your MongoDB backend is set up and ready to use! 🎉
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
