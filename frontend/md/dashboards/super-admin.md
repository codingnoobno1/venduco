<<<<<<< HEAD
# 🛡️ Super Admin Dashboard

*Full platform control and oversight*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 0 (Highest) |
| **Access** | All features |
| **Route** | `/admin` or `/verify` |
| **API Prefix** | `/api/admin/*` |

---

## 🎯 Purpose

Complete control over users, projects, machines, and platform settings.

---

## ✨ Features

### 1. User Management
- View all registered users
- Approve/reject new registrations (PM, Vendor, Supervisor)
- Change user roles
- Deactivate/reactivate accounts
- View user documents and verification status

### 2. Project Oversight
- View all projects across platform
- Monitor progress and milestones
- Track budget consumption
- Override project settings
- Archive/delete projects

### 3. Machine Registry
- Add/update/delete machines
- View machine availability
- Review maintenance logs
- Track machine utilization rates
- Manage machine assignments

### 4. Geo-Fencing & Location
- Create/manage geo-fences for sites
- View live location of machines
- View supervisor locations
- Configure entry/exit alerts
- View location history

### 5. Reports & Analytics
- View AI-generated summaries
- Trend analytics dashboards
- Export CSV/Excel reports
- Cross-project comparisons
- Budget utilization reports

### 6. Notifications & Announcements
- Create global announcements
- Send push notifications
- Manage notification templates
- View notification delivery status

### 7. Audit Logs
- Track all API changes
- View user action history
- Export audit trails
- Monitor security events

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ SUPER ADMIN DASHBOARD                                   │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📊 Users     │ 📁 Projects  │ 🏗️ Machines  │ 📍 Alerts │
│ Pending: 5   │ Active: 12   │ Available: 8 │ Today: 3  │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  📈 Platform Overview                                   │
│  ├── Total Users: 156                                   │
│  ├── Active Projects: 12                                │
│  ├── Machines Online: 24                                │
│  └── Reports Today: 18                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🔔 Recent Activity                                     │
│  • User "Rajesh" submitted verification documents       │
│  • Project CP-303 milestone "Foundation" completed      │
│  • Machine TC-05 left geo-fence boundary               │
│  • Daily report pending approval (5)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/{id}` | PUT | Approve/reject/update |
| `/api/admin/users/{id}` | DELETE | Delete user |
| `/api/projects` | GET/POST | All projects |
| `/api/machines` | GET/POST | All machines |
| `/api/location/project/{id}` | GET | Project locations |
| `/api/announcements` | POST | Global announcements |

---

## 🔐 Permissions

```typescript
const SUPER_ADMIN_PERMISSIONS = [
  'users:read', 'users:write', 'users:delete', 'users:approve',
  'projects:read', 'projects:write', 'projects:delete',
  'machines:read', 'machines:write', 'machines:delete',
  'reports:read', 'reports:approve', 'reports:export',
  'locations:read', 'locations:history',
  'geofence:read', 'geofence:write',
  'announcements:read', 'announcements:write',
  'audit:read', 'audit:export',
  'settings:read', 'settings:write',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick user approval from notifications
- Live location monitoring
- Push notification management
- Emergency alerts handling

---

*Last Updated: December 2024*
=======
# 🛡️ Super Admin Dashboard

*Full platform control and oversight*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 0 (Highest) |
| **Access** | All features |
| **Route** | `/admin` or `/verify` |
| **API Prefix** | `/api/admin/*` |

---

## 🎯 Purpose

Complete control over users, projects, machines, and platform settings.

---

## ✨ Features

### 1. User Management
- View all registered users
- Approve/reject new registrations (PM, Vendor, Supervisor)
- Change user roles
- Deactivate/reactivate accounts
- View user documents and verification status

### 2. Project Oversight
- View all projects across platform
- Monitor progress and milestones
- Track budget consumption
- Override project settings
- Archive/delete projects

### 3. Machine Registry
- Add/update/delete machines
- View machine availability
- Review maintenance logs
- Track machine utilization rates
- Manage machine assignments

### 4. Geo-Fencing & Location
- Create/manage geo-fences for sites
- View live location of machines
- View supervisor locations
- Configure entry/exit alerts
- View location history

### 5. Reports & Analytics
- View AI-generated summaries
- Trend analytics dashboards
- Export CSV/Excel reports
- Cross-project comparisons
- Budget utilization reports

### 6. Notifications & Announcements
- Create global announcements
- Send push notifications
- Manage notification templates
- View notification delivery status

### 7. Audit Logs
- Track all API changes
- View user action history
- Export audit trails
- Monitor security events

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ SUPER ADMIN DASHBOARD                                   │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 📊 Users     │ 📁 Projects  │ 🏗️ Machines  │ 📍 Alerts │
│ Pending: 5   │ Active: 12   │ Available: 8 │ Today: 3  │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  📈 Platform Overview                                   │
│  ├── Total Users: 156                                   │
│  ├── Active Projects: 12                                │
│  ├── Machines Online: 24                                │
│  └── Reports Today: 18                                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🔔 Recent Activity                                     │
│  • User "Rajesh" submitted verification documents       │
│  • Project CP-303 milestone "Foundation" completed      │
│  • Machine TC-05 left geo-fence boundary               │
│  • Daily report pending approval (5)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/{id}` | PUT | Approve/reject/update |
| `/api/admin/users/{id}` | DELETE | Delete user |
| `/api/projects` | GET/POST | All projects |
| `/api/machines` | GET/POST | All machines |
| `/api/location/project/{id}` | GET | Project locations |
| `/api/announcements` | POST | Global announcements |

---

## 🔐 Permissions

```typescript
const SUPER_ADMIN_PERMISSIONS = [
  'users:read', 'users:write', 'users:delete', 'users:approve',
  'projects:read', 'projects:write', 'projects:delete',
  'machines:read', 'machines:write', 'machines:delete',
  'reports:read', 'reports:approve', 'reports:export',
  'locations:read', 'locations:history',
  'geofence:read', 'geofence:write',
  'announcements:read', 'announcements:write',
  'audit:read', 'audit:export',
  'settings:read', 'settings:write',
]
```

---

## 📱 Mobile (MAUI) Features

- Quick user approval from notifications
- Live location monitoring
- Push notification management
- Emergency alerts handling

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
