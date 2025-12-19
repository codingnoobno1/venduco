<<<<<<< HEAD
# 👷 Supervisor Dashboard

*Field-level execution, reporting, and real-time updates*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Assigned projects & machines |
| **Route** | `/dashboard/supervisor` |
| **API Prefix** | `/api/reports/*`, `/api/location/*` |

---

## 🎯 Purpose

Execute field operations, submit daily reports, and track work progress in real-time.

---

## ✨ Features

### 1. Assigned Projects View
- List of projects under supervision
- Current tasks and milestones
- Project timeline
- Team members on project

### 2. Task Management & WorkLogs
- Clock in/out functionality
- Automatic hour tracking
- Task progress updates
- Break time logging
- Location-tagged entries

### 3. Machine Status
- View assigned machines
- Check machine location
- Report machine issues
- Request maintenance
- Update operation status

### 4. Daily Reports Submission
- Submit work completed
- Upload site photos
- Log materials used
- Report manpower count
- Flag issues/blockers

### 5. Notifications & Alerts
- Task assignment alerts
- PM messages
- Milestone reminders
- Safety announcements
- Weather alerts

### 6. Geo-Tracking
- Automatic location updates
- Site check-in/check-out
- Movement history
- Geo-fence compliance

### 7. Document Upload
- Site inspection reports
- Safety compliance docs
- Progress photos
- Issue documentation

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ SUPERVISOR DASHBOARD - Good Morning, Ramesh!           │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📍 Status    │ ⏱️ Hours     │ 📝 Reports   │ 🏗️ Machine│
│ On Site      │ Today: 4.5h  │ Pending: 1   │ TC-05     │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🏗️ Current Project: Metro CP-303                      │
│  ├── Today's Task: Slab casting Block A, Level 3       │
│  ├── Target: Complete formwork by EOD                  │
│  └── Machine: Tower Crane TC-05 (Assigned)             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ⏱️ Today's Timeline                                    │
│  ✅ 06:00 - Clock In (Site A)                          │
│  ✅ 06:15 - Started formwork                           │
│  🔄 09:30 - Break (30 min)                             │
│  📍 Now - Continuing work                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [📝 Submit Daily Report]  [📷 Take Photo]              │
│  [🔧 Report Issue]         [⏹️ Clock Out]               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/my` | GET | Assigned projects |
| `/api/reports/daily` | POST | Submit report |
| `/api/location/update` | POST | Update location |
| `/api/machines/{id}` | GET | Machine details |
| `/api/chat/{projectId}` | GET/POST | Project chat |
| `/api/announcements` | GET | View announcements |

---

## 🔐 Permissions

```typescript
const SUPERVISOR_PERMISSIONS = [
  'projects:read:assigned',
  'tasks:read', 'tasks:update:assigned',
  'machines:read:assigned', 'machines:status:update',
  'reports:read:own', 'reports:write',
  'locations:read:own', 'locations:write',
  'worklog:read:own', 'worklog:write',
  'chat:read', 'chat:write',
  'announcements:read',
  'documents:upload',
]
```

---

## 📱 Mobile (MAUI) Features

- **Primary Platform** - Optimized for mobile use
- Quick clock in/out with GPS
- Camera integration for photos
- Offline report drafts
- Push notifications
- Location background updates

---

## 🚫 Restrictions

- Cannot create projects
- Cannot assign team members
- Cannot approve reports
- Cannot access budget information
- Cannot modify machine assignments
- Cannot create announcements

---

## 📍 Location Requirements

- GPS must be enabled
- Location updates every 5 minutes when on-site
- Automatic geo-fence check-in
- Battery-optimized tracking

---

*Last Updated: December 2024*
=======
# 👷 Supervisor Dashboard

*Field-level execution, reporting, and real-time updates*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Assigned projects & machines |
| **Route** | `/dashboard/supervisor` |
| **API Prefix** | `/api/reports/*`, `/api/location/*` |

---

## 🎯 Purpose

Execute field operations, submit daily reports, and track work progress in real-time.

---

## ✨ Features

### 1. Assigned Projects View
- List of projects under supervision
- Current tasks and milestones
- Project timeline
- Team members on project

### 2. Task Management & WorkLogs
- Clock in/out functionality
- Automatic hour tracking
- Task progress updates
- Break time logging
- Location-tagged entries

### 3. Machine Status
- View assigned machines
- Check machine location
- Report machine issues
- Request maintenance
- Update operation status

### 4. Daily Reports Submission
- Submit work completed
- Upload site photos
- Log materials used
- Report manpower count
- Flag issues/blockers

### 5. Notifications & Alerts
- Task assignment alerts
- PM messages
- Milestone reminders
- Safety announcements
- Weather alerts

### 6. Geo-Tracking
- Automatic location updates
- Site check-in/check-out
- Movement history
- Geo-fence compliance

### 7. Document Upload
- Site inspection reports
- Safety compliance docs
- Progress photos
- Issue documentation

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ SUPERVISOR DASHBOARD - Good Morning, Ramesh!           │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📍 Status    │ ⏱️ Hours     │ 📝 Reports   │ 🏗️ Machine│
│ On Site      │ Today: 4.5h  │ Pending: 1   │ TC-05     │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🏗️ Current Project: Metro CP-303                      │
│  ├── Today's Task: Slab casting Block A, Level 3       │
│  ├── Target: Complete formwork by EOD                  │
│  └── Machine: Tower Crane TC-05 (Assigned)             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  ⏱️ Today's Timeline                                    │
│  ✅ 06:00 - Clock In (Site A)                          │
│  ✅ 06:15 - Started formwork                           │
│  🔄 09:30 - Break (30 min)                             │
│  📍 Now - Continuing work                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [📝 Submit Daily Report]  [📷 Take Photo]              │
│  [🔧 Report Issue]         [⏹️ Clock Out]               │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/my` | GET | Assigned projects |
| `/api/reports/daily` | POST | Submit report |
| `/api/location/update` | POST | Update location |
| `/api/machines/{id}` | GET | Machine details |
| `/api/chat/{projectId}` | GET/POST | Project chat |
| `/api/announcements` | GET | View announcements |

---

## 🔐 Permissions

```typescript
const SUPERVISOR_PERMISSIONS = [
  'projects:read:assigned',
  'tasks:read', 'tasks:update:assigned',
  'machines:read:assigned', 'machines:status:update',
  'reports:read:own', 'reports:write',
  'locations:read:own', 'locations:write',
  'worklog:read:own', 'worklog:write',
  'chat:read', 'chat:write',
  'announcements:read',
  'documents:upload',
]
```

---

## 📱 Mobile (MAUI) Features

- **Primary Platform** - Optimized for mobile use
- Quick clock in/out with GPS
- Camera integration for photos
- Offline report drafts
- Push notifications
- Location background updates

---

## 🚫 Restrictions

- Cannot create projects
- Cannot assign team members
- Cannot approve reports
- Cannot access budget information
- Cannot modify machine assignments
- Cannot create announcements

---

## 📍 Location Requirements

- GPS must be enabled
- Location updates every 5 minutes when on-site
- Automatic geo-fence check-in
- Battery-optimized tracking

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
