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
- **Lifecycle**: Create, update, and archive projects.
- **Tracking**: Monitor milestones, deadlines, and deliverables.
- **Status**: Visual progress indicators (Gantt-like views).

### 2. Budget Tracking
- **Financials**: Monitor budget vs. actual spending.
- **Analysis**: Category-wise allocation and cost forecasting.
- **Alerts**: Automated overrun notifications and payment tracking.

### 3. Team Management
- **Staffing**: Assign supervisors and vendors/suppliers.
- **Coordination**: Track availability, view performance, and send notifications.

### 4. Daily Reports Approval
- **Workflow**: Review, approve, or reject daily reports with comments.
- **Attachments**: View photos and documents directly in the workflow.
- **Metrics**: Track submission rates and generate summaries.

### 5. Machine Allocation
- **Inventory**: Check real-time machine availability.
- **Assignment**: Link machines to specific projects and tasks.
- **Maintenance**: Track schedules and request new equipment.

### 6. AI & Predictive Insights
- **Delays**: AI-generated predictions for potential project delays.
- **Optimization**: Suggestions for resource reallocation to speed up work.

### 7. Geo-Fencing & Monitoring
- **Alerts**: Receive real-time boundary breach notifications.
- **Tracking**: Monitor field staff and machine movements via GPS.

---

## 📊 Dashboard Preview

```text
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
| `/api/projects/my` | GET | List PM's projects |
| `/api/projects` | POST | Create a new project |
| `/api/projects/{id}/members` | POST | Assign members to project |
| `/api/reports/project/{id}` | GET | Fetch reports for a project |
| `/api/reports/{id}` | PUT | Approve or reject a report |
| `/api/machines/availability` | GET | Check equipment availability |
| `/api/machines/{id}/assign` | POST | Assign equipment to project |

---

## 🔐 Permissions Reference

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
]
```

---

## 📱 Mobile (MAUI) Capabilities

- **On-the-go Approvals**: Quick report approval from push notifications.
- **Field Monitoring**: Real-time team location overview and geofencing.
- **Alerts**: Push notifications for budget thresholds and milestone deadlines.

---

## 🚫 Access Restrictions

- Cannot manage platform-level user registrations.
- Cannot view or edit projects created by other PMs without invitation.
- No access to system-wide audit logs or platform settings.
