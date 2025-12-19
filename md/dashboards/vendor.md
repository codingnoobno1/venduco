<<<<<<< HEAD
# 🚚 Vendor Dashboard

*Manage machines and material supply*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Own machines + assigned projects |
| **Route** | `/dashboard/vendor` |
| **API Prefix** | `/api/machines/*` |

---

## 🎯 Purpose

Manage equipment fleet, track assignments, submit work progress, and maintain machine health.

---

## ✨ Features

### 1. Machine Management
- Add new machines to registry
- Update machine specifications
- Track machine status
- Set maintenance schedules
- View utilization reports

### 2. Project Assignments
- View assigned projects
- Check assignment duration
- Track machine allocation
- View project contacts

### 3. Machine Status Updates
- Update operational status
- Report location
- Log operating hours
- Flag maintenance needs
- Submit inspection reports

### 4. Work Reports
- Submit daily usage reports
- Log materials delivered
- Report work completed
- Upload delivery receipts
- Track payment status

### 5. Maintenance Records
- Schedule maintenance
- Log repairs done
- Track parts replaced
- Upload service reports
- View maintenance history

### 6. Notifications
- Assignment alerts
- Project updates
- PM requests
- Payment notifications
- Maintenance reminders

### 7. Document Management
- Business registration docs
- Insurance certificates
- Machine certifications
- Compliance documents

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ VENDOR DASHBOARD - ABC Equipment Suppliers              │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 🏗️ Machines  │ 📁 Projects  │ 💰 Earnings  │ 🔧 Maint  │
│ Total: 8     │ Active: 3    │ ₹2.5L/month  │ Due: 1    │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🚜 My Machine Fleet                                    │
│  ┌───────────┬───────────┬─────────┬─────────────────┐ │
│  │ Code      │ Type      │ Status  │ Assignment      │ │
│  ├───────────┼───────────┼─────────┼─────────────────┤ │
│  │ TC-05     │ Crane     │ 🟢 Active│ CP-303         │ │
│  │ TC-06     │ Crane     │ 🟢 Active│ CP-304         │ │
│  │ EX-01     │ Excavator │ 🟡 Idle │ Available       │ │
│  │ LO-02     │ Loader    │ 🔴 Maint│ Under repair    │ │
│  └───────────┴───────────┴─────────┴─────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📊 This Month's Summary                                │
│  • Operating Hours: 320 hrs                             │
│  • Projects Served: 3                                   │
│  • Maintenance Done: 2                                  │
│  • Earnings: ₹2,50,000                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [➕ Add Machine]  [📝 Submit Report]  [🔧 Log Maint]   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/machines` | GET | My machines |
| `/api/machines` | POST | Add machine |
| `/api/machines/{id}` | PUT | Update machine |
| `/api/machines/{id}/assignments` | GET | View assignments |
| `/api/reports/daily` | POST | Submit usage report |
| `/api/location/update` | POST | Update machine location |

---

## 🔐 Permissions

```typescript
const VENDOR_PERMISSIONS = [
  'machines:read:own', 'machines:write:own',
  'machines:status:update',
  'projects:read:assigned',
  'reports:read:own', 'reports:write',
  'locations:read:own', 'locations:write',
  'maintenance:read:own', 'maintenance:write',
  'documents:read:own', 'documents:upload',
  'chat:read', 'chat:write',
  'announcements:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick machine status update
- GPS-based location reporting
- Camera for inspection photos
- Maintenance logging on-site
- Push notifications for assignments

---

## 🚫 Restrictions

- Cannot create projects
- Cannot assign machines to projects (PM does this)
- Cannot approve reports
- Cannot view other vendors' machines
- Cannot access budget information
- Cannot create announcements

---

## 💼 Business Features

### Revenue Tracking
- Monthly earnings summary
- Payment history
- Invoice generation (future)
- Outstanding payments

### Fleet Analytics
- Utilization rates
- Idle time tracking
- Maintenance costs
- Popular machine types

---

*Last Updated: December 2024*
=======
# 🚚 Vendor Dashboard

*Manage machines and material supply*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Own machines + assigned projects |
| **Route** | `/dashboard/vendor` |
| **API Prefix** | `/api/machines/*` |

---

## 🎯 Purpose

Manage equipment fleet, track assignments, submit work progress, and maintain machine health.

---

## ✨ Features

### 1. Machine Management
- Add new machines to registry
- Update machine specifications
- Track machine status
- Set maintenance schedules
- View utilization reports

### 2. Project Assignments
- View assigned projects
- Check assignment duration
- Track machine allocation
- View project contacts

### 3. Machine Status Updates
- Update operational status
- Report location
- Log operating hours
- Flag maintenance needs
- Submit inspection reports

### 4. Work Reports
- Submit daily usage reports
- Log materials delivered
- Report work completed
- Upload delivery receipts
- Track payment status

### 5. Maintenance Records
- Schedule maintenance
- Log repairs done
- Track parts replaced
- Upload service reports
- View maintenance history

### 6. Notifications
- Assignment alerts
- Project updates
- PM requests
- Payment notifications
- Maintenance reminders

### 7. Document Management
- Business registration docs
- Insurance certificates
- Machine certifications
- Compliance documents

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ VENDOR DASHBOARD - ABC Equipment Suppliers              │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 🏗️ Machines  │ 📁 Projects  │ 💰 Earnings  │ 🔧 Maint  │
│ Total: 8     │ Active: 3    │ ₹2.5L/month  │ Due: 1    │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🚜 My Machine Fleet                                    │
│  ┌───────────┬───────────┬─────────┬─────────────────┐ │
│  │ Code      │ Type      │ Status  │ Assignment      │ │
│  ├───────────┼───────────┼─────────┼─────────────────┤ │
│  │ TC-05     │ Crane     │ 🟢 Active│ CP-303         │ │
│  │ TC-06     │ Crane     │ 🟢 Active│ CP-304         │ │
│  │ EX-01     │ Excavator │ 🟡 Idle │ Available       │ │
│  │ LO-02     │ Loader    │ 🔴 Maint│ Under repair    │ │
│  └───────────┴───────────┴─────────┴─────────────────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📊 This Month's Summary                                │
│  • Operating Hours: 320 hrs                             │
│  • Projects Served: 3                                   │
│  • Maintenance Done: 2                                  │
│  • Earnings: ₹2,50,000                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [➕ Add Machine]  [📝 Submit Report]  [🔧 Log Maint]   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/machines` | GET | My machines |
| `/api/machines` | POST | Add machine |
| `/api/machines/{id}` | PUT | Update machine |
| `/api/machines/{id}/assignments` | GET | View assignments |
| `/api/reports/daily` | POST | Submit usage report |
| `/api/location/update` | POST | Update machine location |

---

## 🔐 Permissions

```typescript
const VENDOR_PERMISSIONS = [
  'machines:read:own', 'machines:write:own',
  'machines:status:update',
  'projects:read:assigned',
  'reports:read:own', 'reports:write',
  'locations:read:own', 'locations:write',
  'maintenance:read:own', 'maintenance:write',
  'documents:read:own', 'documents:upload',
  'chat:read', 'chat:write',
  'announcements:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick machine status update
- GPS-based location reporting
- Camera for inspection photos
- Maintenance logging on-site
- Push notifications for assignments

---

## 🚫 Restrictions

- Cannot create projects
- Cannot assign machines to projects (PM does this)
- Cannot approve reports
- Cannot view other vendors' machines
- Cannot access budget information
- Cannot create announcements

---

## 💼 Business Features

### Revenue Tracking
- Monthly earnings summary
- Payment history
- Invoice generation (future)
- Outstanding payments

### Fleet Analytics
- Utilization rates
- Idle time tracking
- Maintenance costs
- Popular machine types

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
