<<<<<<< HEAD
# 👁️ Guest / Read-Only Dashboard

*Auditing and monitoring access*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 3 (Lowest) |
| **Access** | View-only, limited data |
| **Route** | `/dashboard/guest` |
| **API Prefix** | `/api/public/*` |

---

## 🎯 Purpose

Temporary access for auditors, stakeholders, or external parties to view project status and progress.

---

## ✨ Features

### 1. Project Progress View
- View project timeline
- Check milestone status
- See overall progress
- View public updates

### 2. Machine Availability
- Check equipment status
- View availability calendar
- See utilization summary

### 3. Announcements
- View public announcements
- Read project updates
- See safety notices

### 4. Report Summaries
- View aggregate statistics
- Progress reports (summary)
- Timeline adherence

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ GUEST DASHBOARD - Read Only Access                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Project Overview                                    │
│  ┌─────────────────┬──────────┬─────────────────────┐  │
│  │ Project         │ Progress │ Status              │  │
│  ├─────────────────┼──────────┼─────────────────────┤  │
│  │ Metro CP-303    │ ████░░ 80%│ On Track           │  │
│  │ Highway NH-48   │ ██░░░░ 35%│ Minor Delay        │  │
│  │ Bridge BR-12    │ ███░░░ 55%│ On Track           │  │
│  └─────────────────┴──────────┴─────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🏗️ Machine Availability Summary                        │
│  • Available: 8                                         │
│  • In Use: 12                                           │
│  • Under Maintenance: 2                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📢 Recent Announcements                                │
│  • Safety briefing scheduled for Dec 16                 │
│  • Holiday notice: Office closed Dec 25                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/public/projects` | GET | Public project info |
| `/api/public/machines/summary` | GET | Availability summary |
| `/api/public/announcements` | GET | Public announcements |

---

## 🔐 Permissions

```typescript
const GUEST_PERMISSIONS = [
  'projects:read:public',
  'machines:read:summary',
  'announcements:read:public',
]
```

---

## 🚫 Restrictions

- **Cannot modify anything**
- Cannot view detailed reports
- Cannot view locations
- Cannot view financials
- Cannot access chat
- Cannot upload documents
- Cannot see user details
- No push notifications
- No audit log access

---

## 🔑 Access Control

### Time-Limited Access
- Guests are given temporary access tokens
- Access expires after set duration (e.g., 24 hours, 7 days)
- Admin can revoke access anytime

### Audit Trail
- All guest views are logged
- IP address tracked
- Access time recorded

---

## 📱 Mobile (MAUI) Access

- Limited mobile view
- No location tracking
- No background updates
- Simple read-only interface

---

## 🎯 Use Cases

1. **External Auditors**
   - View project compliance
   - Check progress reports
   - Verify milestone completion

2. **Stakeholders/Investors**
   - Monitor project progress
   - View high-level statistics
   - Check timeline adherence

3. **Government Officials**
   - Verify project status
   - Check equipment compliance
   - Review safety measures

4. **Client Representatives**
   - Track project progress
   - View milestone updates
   - Check delivery timelines

---

*Last Updated: December 2024*
=======
# 👁️ Guest / Read-Only Dashboard

*Auditing and monitoring access*

---

## 📋 Overview

| Attribute | Value |
|-----------|-------|
| **Role Level** | 3 (Lowest) |
| **Access** | View-only, limited data |
| **Route** | `/dashboard/guest` |
| **API Prefix** | `/api/public/*` |

---

## 🎯 Purpose

Temporary access for auditors, stakeholders, or external parties to view project status and progress.

---

## ✨ Features

### 1. Project Progress View
- View project timeline
- Check milestone status
- See overall progress
- View public updates

### 2. Machine Availability
- Check equipment status
- View availability calendar
- See utilization summary

### 3. Announcements
- View public announcements
- Read project updates
- See safety notices

### 4. Report Summaries
- View aggregate statistics
- Progress reports (summary)
- Timeline adherence

---

## 📊 Dashboard Widgets

```
┌─────────────────────────────────────────────────────────┐
│ GUEST DASHBOARD - Read Only Access                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📁 Project Overview                                    │
│  ┌─────────────────┬──────────┬─────────────────────┐  │
│  │ Project         │ Progress │ Status              │  │
│  ├─────────────────┼──────────┼─────────────────────┤  │
│  │ Metro CP-303    │ ████░░ 80%│ On Track           │  │
│  │ Highway NH-48   │ ██░░░░ 35%│ Minor Delay        │  │
│  │ Bridge BR-12    │ ███░░░ 55%│ On Track           │  │
│  └─────────────────┴──────────┴─────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  🏗️ Machine Availability Summary                        │
│  • Available: 8                                         │
│  • In Use: 12                                           │
│  • Under Maintenance: 2                                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  📢 Recent Announcements                                │
│  • Safety briefing scheduled for Dec 16                 │
│  • Holiday notice: Office closed Dec 25                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Key APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/public/projects` | GET | Public project info |
| `/api/public/machines/summary` | GET | Availability summary |
| `/api/public/announcements` | GET | Public announcements |

---

## 🔐 Permissions

```typescript
const GUEST_PERMISSIONS = [
  'projects:read:public',
  'machines:read:summary',
  'announcements:read:public',
]
```

---

## 🚫 Restrictions

- **Cannot modify anything**
- Cannot view detailed reports
- Cannot view locations
- Cannot view financials
- Cannot access chat
- Cannot upload documents
- Cannot see user details
- No push notifications
- No audit log access

---

## 🔑 Access Control

### Time-Limited Access
- Guests are given temporary access tokens
- Access expires after set duration (e.g., 24 hours, 7 days)
- Admin can revoke access anytime

### Audit Trail
- All guest views are logged
- IP address tracked
- Access time recorded

---

## 📱 Mobile (MAUI) Access

- Limited mobile view
- No location tracking
- No background updates
- Simple read-only interface

---

## 🎯 Use Cases

1. **External Auditors**
   - View project compliance
   - Check progress reports
   - Verify milestone completion

2. **Stakeholders/Investors**
   - Monitor project progress
   - View high-level statistics
   - Check timeline adherence

3. **Government Officials**
   - Verify project status
   - Check equipment compliance
   - Review safety measures

4. **Client Representatives**
   - Track project progress
   - View milestone updates
   - Check delivery timelines

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
