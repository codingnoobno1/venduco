<<<<<<< HEAD
# 📋 Project Manager Dashboard

*Manage projects, teams, and budget*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 1 (High) |
| **Access** | Own projects + assigned team |
| **Route** | `/dashboard/pm` |
| **API Prefix** | `/api/projects/*` |

---

## 🎯 Purpose

Plan, execute, and monitor construction projects with team coordination and budget oversight.

---

## ✨ Features

### 1. Project Management
- Create new projects
- Update project status and progress
- Set milestones and deadlines
- Track deliverables
- Archive completed projects

### 2. Budget Tracking
- Monitor budget vs. actual spending
- Category-wise allocation
- Cost forecasting
- Overrun alerts
- Payment tracking

### 3. Team Management
- Assign supervisors to projects
- Assign vendors/suppliers
- Track team availability
- View team performance
- Send team notifications

### 4. Daily Reports Approval
- Review submitted reports
- Approve/reject with comments
- View photos and attachments
- Track report submission rates
- Generate report summaries

### 5. Machine Allocation
- Check machine availability
- Assign machines to projects
- View utilization reports
- Track maintenance schedules
- Request new equipment

### 6. AI Reports & Predictions
- View AI-generated insights
- Delay predictions
- Resource optimization suggestions
- Risk analysis
- Progress forecasting

### 7. Geo-Fencing Alerts
- Receive boundary breach alerts
- Monitor field staff locations
- Track machine movements
- Set custom alert zones

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ PM DASHBOARD - Welcome, Rajesh Kumar                    │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📁 My Projects│ 📝 Reports   │ 👥 Team      │ 💰 Budget │
│ Active: 3    │ Pending: 7   │ Members: 15  │ 78% used  │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🏗️ Project: Metro CP-303                              │
│  ├── Progress: ████████░░ 80%                          │
│  ├── Milestone: Foundation (In Progress)               │
│  ├── Budget: ₹45L / ₹50L                               │
│  └── Team: 5 Supervisors, 8 Vendors                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📊 Today's Overview                                    │
│  • 7 Daily reports pending approval                     │
│  • 2 Machines need maintenance                          │
│  • Milestone "Slab Casting" due in 3 days              │
│  • Budget utilization: 78%                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🤖 AI Insights                                         │
│  ⚠️ Predicted delay: 2 days for Block B                │
│  💡 Suggestion: Allocate TC-03 to speed up work        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/my` | GET | My projects |
| `/api/projects` | POST | Create project |
| `/api/projects/{id}/members` | POST | Assign team |
| `/api/reports/project/{id}` | GET | Project reports |
| `/api/reports/{id}` | PUT | Approve/reject |
| `/api/machines/availability` | GET | Check machines |
| `/api/machines/{id}/assign` | POST | Assign machine |
| `/api/announcements` | POST | Project announcements |

---

## 🔐 Permissions

```typescript
const PM_PERMISSIONS = [
  'projects:read:own', 'projects:write:own',
  'members:read', 'members:assign',
  'machines:read', 'machines:assign',
  'reports:read', 'reports:approve',
  'milestones:read', 'milestones:write',
  'budget:read', 'budget:track',
  'locations:read',
  'geofence:read', 'geofence:alerts',
  'announcements:read', 'announcements:write:project',
  'ai:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick report approval from notifications
- Team location overview
- Budget alerts
- Milestone reminders
- Machine availability check

---

## 🚫 Restrictions

- Cannot approve/reject user registrations
- Cannot delete other PM's projects
- Cannot access audit logs
- Cannot modify platform settings

---

*Last Updated: December 2024*
=======
# 📋 Project Manager Dashboard

*Manage projects, teams, and budget*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 1 (High) |
| **Access** | Own projects + assigned team |
| **Route** | `/dashboard/pm` |
| **API Prefix** | `/api/projects/*` |

---

## 🎯 Purpose

Plan, execute, and monitor construction projects with team coordination and budget oversight.

---

## ✨ Features

### 1. Project Management
- Create new projects
- Update project status and progress
- Set milestones and deadlines
- Track deliverables
- Archive completed projects

### 2. Budget Tracking
- Monitor budget vs. actual spending
- Category-wise allocation
- Cost forecasting
- Overrun alerts
- Payment tracking

### 3. Team Management
- Assign supervisors to projects
- Assign vendors/suppliers
- Track team availability
- View team performance
- Send team notifications

### 4. Daily Reports Approval
- Review submitted reports
- Approve/reject with comments
- View photos and attachments
- Track report submission rates
- Generate report summaries

### 5. Machine Allocation
- Check machine availability
- Assign machines to projects
- View utilization reports
- Track maintenance schedules
- Request new equipment

### 6. AI Reports & Predictions
- View AI-generated insights
- Delay predictions
- Resource optimization suggestions
- Risk analysis
- Progress forecasting

### 7. Geo-Fencing Alerts
- Receive boundary breach alerts
- Monitor field staff locations
- Track machine movements
- Set custom alert zones

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ PM DASHBOARD - Welcome, Rajesh Kumar                    │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📁 My Projects│ 📝 Reports   │ 👥 Team      │ 💰 Budget │
│ Active: 3    │ Pending: 7   │ Members: 15  │ 78% used  │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  🏗️ Project: Metro CP-303                              │
│  ├── Progress: ████████░░ 80%                          │
│  ├── Milestone: Foundation (In Progress)               │
│  ├── Budget: ₹45L / ₹50L                               │
│  └── Team: 5 Supervisors, 8 Vendors                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📊 Today's Overview                                    │
│  • 7 Daily reports pending approval                     │
│  • 2 Machines need maintenance                          │
│  • Milestone "Slab Casting" due in 3 days              │
│  • Budget utilization: 78%                              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🤖 AI Insights                                         │
│  ⚠️ Predicted delay: 2 days for Block B                │
│  💡 Suggestion: Allocate TC-03 to speed up work        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/projects/my` | GET | My projects |
| `/api/projects` | POST | Create project |
| `/api/projects/{id}/members` | POST | Assign team |
| `/api/reports/project/{id}` | GET | Project reports |
| `/api/reports/{id}` | PUT | Approve/reject |
| `/api/machines/availability` | GET | Check machines |
| `/api/machines/{id}/assign` | POST | Assign machine |
| `/api/announcements` | POST | Project announcements |

---

## 🔐 Permissions

```typescript
const PM_PERMISSIONS = [
  'projects:read:own', 'projects:write:own',
  'members:read', 'members:assign',
  'machines:read', 'machines:assign',
  'reports:read', 'reports:approve',
  'milestones:read', 'milestones:write',
  'budget:read', 'budget:track',
  'locations:read',
  'geofence:read', 'geofence:alerts',
  'announcements:read', 'announcements:write:project',
  'ai:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick report approval from notifications
- Team location overview
- Budget alerts
- Milestone reminders
- Machine availability check

---

## 🚫 Restrictions

- Cannot approve/reject user registrations
- Cannot delete other PM's projects
- Cannot access audit logs
- Cannot modify platform settings

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
