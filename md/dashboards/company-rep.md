<<<<<<< HEAD
# 🏢 Company Representative Dashboard

*Corporate overview for multiple vendors/employees*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Company staff + assigned projects |
| **Route** | `/dashboard/company` |
| **API Prefix** | `/api/company/*` |

---

## 🎯 Purpose

Manage company employees, oversee multiple vendor accounts, and maintain corporate compliance.

---

## ✨ Features

### 1. Employee Management
- View all staff under company
- Assign roles to employees
- Track employee performance
- Manage access levels
- Onboard new staff

### 2. Project Assignment Overview
- All projects company is working on
- Resource allocation across projects
- Revenue by project
- Timeline tracking

### 3. Fleet Management (Aggregate)
- All machines owned by company
- Machine utilization across projects
- Maintenance schedules
- Fleet performance metrics

### 4. Document Management
- Corporate compliance documents
- Insurance and certifications
- Tax documents
- Contract management

### 5. Financial Overview
- Revenue across all projects
- Payment tracking
- Invoice management
- Expense reports

### 6. Reporting & Analytics
- Company-wide performance
- Employee productivity
- Machine utilization
- Project profitability

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ COMPANY DASHBOARD - XYZ Construction Pvt Ltd            │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 👥 Employees │ 📁 Projects  │ 🏗️ Machines  │ 💰 Revenue│
│ Total: 25    │ Active: 5    │ Fleet: 15    │ ₹12L/mo   │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  📊 Company Overview                                    │
│  ├── Active Projects: 5                                 │
│  ├── Employees on Field: 18                             │
│  ├── Machines Deployed: 12                              │
│  └── Monthly Revenue: ₹12,00,000                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  👥 Employee Distribution                               │
│  ┌───────────────┬──────────┬─────────────────────┐    │
│  │ Role          │ Count    │ On Project          │    │
│  ├───────────────┼──────────┼─────────────────────┤    │
│  │ Supervisors   │ 8        │ CP-303, CP-304      │    │
│  │ Operators     │ 12       │ Various             │    │
│  │ Vendors       │ 5        │ Equipment supply    │    │
│  └───────────────┴──────────┴─────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📈 Performance This Month                              │
│  • Projects Completed: 2                                │
│  • Reports Submitted: 156                               │
│  • Machine Uptime: 94%                                  │
│  • On-time Delivery: 89%                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/company/employees` | GET | List employees |
| `/api/company/projects` | GET | Company projects |
| `/api/company/machines` | GET | Company fleet |
| `/api/company/reports` | GET | Aggregate reports |
| `/api/company/documents` | GET/POST | Company docs |

---

## 🔐 Permissions

```typescript
const COMPANY_REP_PERMISSIONS = [
  'company:read', 'company:write',
  'employees:read', 'employees:assign',
  'projects:read:company',
  'machines:read:company',
  'reports:read:company', 'reports:export',
  'documents:read', 'documents:upload',
  'milestones:read',
  'budget:read:company',
  'announcements:read',
  'chat:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Employee location overview
- Quick performance check
- Project status updates
- Document upload
- Push notifications

---

## 🚫 Restrictions

- Cannot create projects
- Cannot approve user registrations
- Cannot modify project assignments (only view)
- Cannot access audit logs
- Cannot access other companies' data

---

## 💼 Corporate Features

### Compliance Tracking
- Document expiry alerts
- Certification renewals
- Insurance status
- Regulatory compliance

### HR Integration
- Employee onboarding
- Attendance tracking
- Leave management
- Performance reviews

---

*Last Updated: December 2024*
=======
# 🏢 Company Representative Dashboard

*Corporate overview for multiple vendors/employees*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 2 (Medium) |
| **Access** | Company staff + assigned projects |
| **Route** | `/dashboard/company` |
| **API Prefix** | `/api/company/*` |

---

## 🎯 Purpose

Manage company employees, oversee multiple vendor accounts, and maintain corporate compliance.

---

## ✨ Features

### 1. Employee Management
- View all staff under company
- Assign roles to employees
- Track employee performance
- Manage access levels
- Onboard new staff

### 2. Project Assignment Overview
- All projects company is working on
- Resource allocation across projects
- Revenue by project
- Timeline tracking

### 3. Fleet Management (Aggregate)
- All machines owned by company
- Machine utilization across projects
- Maintenance schedules
- Fleet performance metrics

### 4. Document Management
- Corporate compliance documents
- Insurance and certifications
- Tax documents
- Contract management

### 5. Financial Overview
- Revenue across all projects
- Payment tracking
- Invoice management
- Expense reports

### 6. Reporting & Analytics
- Company-wide performance
- Employee productivity
- Machine utilization
- Project profitability

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ COMPANY DASHBOARD - XYZ Construction Pvt Ltd            │
├──────────────┬──────────────┬──────────────┬───────────┤
│ 👥 Employees │ 📁 Projects  │ 🏗️ Machines  │ 💰 Revenue│
│ Total: 25    │ Active: 5    │ Fleet: 15    │ ₹12L/mo   │
├──────────────┴──────────────┴──────────────┴───────────┤
│                                                         │
│  📊 Company Overview                                    │
│  ├── Active Projects: 5                                 │
│  ├── Employees on Field: 18                             │
│  ├── Machines Deployed: 12                              │
│  └── Monthly Revenue: ₹12,00,000                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  👥 Employee Distribution                               │
│  ┌───────────────┬──────────┬─────────────────────┐    │
│  │ Role          │ Count    │ On Project          │    │
│  ├───────────────┼──────────┼─────────────────────┤    │
│  │ Supervisors   │ 8        │ CP-303, CP-304      │    │
│  │ Operators     │ 12       │ Various             │    │
│  │ Vendors       │ 5        │ Equipment supply    │    │
│  └───────────────┴──────────┴─────────────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📈 Performance This Month                              │
│  • Projects Completed: 2                                │
│  • Reports Submitted: 156                               │
│  • Machine Uptime: 94%                                  │
│  • On-time Delivery: 89%                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/company/employees` | GET | List employees |
| `/api/company/projects` | GET | Company projects |
| `/api/company/machines` | GET | Company fleet |
| `/api/company/reports` | GET | Aggregate reports |
| `/api/company/documents` | GET/POST | Company docs |

---

## 🔐 Permissions

```typescript
const COMPANY_REP_PERMISSIONS = [
  'company:read', 'company:write',
  'employees:read', 'employees:assign',
  'projects:read:company',
  'machines:read:company',
  'reports:read:company', 'reports:export',
  'documents:read', 'documents:upload',
  'milestones:read',
  'budget:read:company',
  'announcements:read',
  'chat:read',
]
```

---

## 📱 Mobile (MAUI) Features

- Employee location overview
- Quick performance check
- Project status updates
- Document upload
- Push notifications

---

## 🚫 Restrictions

- Cannot create projects
- Cannot approve user registrations
- Cannot modify project assignments (only view)
- Cannot access audit logs
- Cannot access other companies' data

---

## 💼 Corporate Features

### Compliance Tracking
- Document expiry alerts
- Certification renewals
- Insurance status
- Regulatory compliance

### HR Integration
- Employee onboarding
- Attendance tracking
- Leave management
- Performance reviews

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
