<<<<<<< HEAD
# 🎯 Bidding Feature Documentation

*Project bidding workflow for Vendors & Supervisors*

---

## 📋 Overview

The bidding feature allows **Vendors** and **Supervisors** to express interest in projects by submitting proposals with pricing, resources, and timelines.

### Key Features
- ✅ Submit bids on open projects
- ✅ Contact info hidden until bid approved
- ✅ Auto-add to project team on approval
- ✅ Notifications at each stage
- ✅ Bid history tracking

---

## 🔄 Bidding Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     BIDDING WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. PM/Admin Creates Project (status: PLANNING/ACTIVE)   │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. Project appears in "Open for Bidding" list           │   │
│  │    Visible to: Vendors, Supervisors, Company Reps       │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. Vendor/Supervisor Submits Bid                         │   │
│  │    • Proposed amount                                     │   │
│  │    • Timeline (start/end dates)                          │   │
│  │    • Machines offered                                    │   │
│  │    • Manpower available                                  │   │
│  │    • Proposal description                                │   │
│  │    • Past experience                                     │   │
│  │    ⚠️ Contact info (email/phone) HIDDEN at this stage   │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. PM Receives Notification                              │   │
│  │    "New bid from [Vendor Name] for [Project]"            │   │
│  │    PM can see all bids (contact info masked)             │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                    ┌──────────┴──────────┐                      │
│                    ▼                     ▼                      │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ 5a. APPROVE Bid     │    │ 5b. REJECT Bid      │            │
│  │                     │    │                     │            │
│  │ • Contact VISIBLE   │    │ • Contact remains   │            │
│  │ • Auto-added to     │    │   hidden            │            │
│  │   project team      │    │ • Rejection reason  │            │
│  │ • Notification sent │    │   provided          │            │
│  │   "🎉 Bid Approved" │    │ • Notification sent │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Contact Visibility Rules

| Bid Status | PM/Admin Can See | Bidder Can See |
|------------|------------------|----------------|
| SUBMITTED | ❌ Masked (***@***.com) | ✅ Own info |
| UNDER_REVIEW | ❌ Masked | ✅ Own info |
| **APPROVED** | ✅ **Full contact visible** | ✅ Own info |
| REJECTED | ❌ Masked | ✅ Own info |
| WITHDRAWN | ❌ Masked | ✅ Own info |

### Why?
- **Privacy**: Vendors don't want contact exposed before selection
- **Spam Prevention**: Prevents unsolicited contact
- **Trust**: Information revealed only after formal approval

---

## 🔌 API Endpoints

### Bidding APIs

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/bids/open` | GET | Vendor/Supervisor | List projects open for bidding |
| `/api/bids/my` | GET | Vendor/Supervisor | Get my submitted bids |
| `/api/projects/{id}/bids` | GET | PM/Admin | View all bids for project |
| `/api/projects/{id}/bids` | POST | Vendor/Supervisor | Submit new bid |
| `/api/bids/{bidId}` | GET | Any | Get single bid details |
| `/api/bids/{bidId}` | PUT | PM/Admin | Approve/Reject bid |

### Request Examples

#### Submit Bid
```json
POST /api/projects/{projectId}/bids
Authorization: Bearer <token>

{
  "proposedAmount": 250000,
  "timeline": {
    "startDate": "2024-12-20",
    "endDate": "2025-01-15",
    "durationDays": 26
  },
  "machinesOffered": [
    { "machineType": "TOWER_CRANE", "quantity": 1, "dailyRate": 5000 }
  ],
  "manpowerOffered": 10,
  "proposal": "We have 5 years experience in similar projects...",
  "relevantExperience": "Completed Metro CP-301, CP-302",
  "pastProjects": ["Metro CP-301", "Highway NH-48"]
}
```

#### Approve Bid
```json
PUT /api/bids/{bidId}
Authorization: Bearer <token>

{
  "action": "APPROVE",
  "reviewNotes": "Best price and timeline. Approved."
}
```

#### Reject Bid
```json
PUT /api/bids/{bidId}
Authorization: Bearer <token>

{
  "action": "REJECT",
  "rejectionReason": "Budget exceeds allocation"
}
```

---

## 📊 Dashboard Widgets

### Vendor/Supervisor Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 BIDDING SECTION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📢 Open Projects for Bidding (5)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Metro CP-305 | Delhi | Budget: ₹50L | Deadline: Jan  │   │
│  │ [📝 Submit Bid]                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Highway NH-52 | Mumbai | Budget: ₹80L | Dec 20      │   │
│  │ [📝 Submit Bid]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 My Active Bids                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Metro CP-303 | ₹25L | 🟡 Under Review               │   │
│  │ Highway NH-48 | ₹35L | 🟢 Approved ✓                │   │
│  │ Bridge BR-12 | ₹18L | 🔴 Rejected                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PM Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 PENDING BIDS                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project: Metro CP-303 (3 bids)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. ABC Equipments | ₹25L | 20 days | 2 Cranes       │   │
│  │    Contact: ***@***.com | **********                │   │
│  │    [✅ Approve] [❌ Reject] [👁️ View Details]        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2. XYZ Suppliers | ₹28L | 18 days | 3 Cranes        │   │
│  │    Contact: ***@***.com | **********                │   │
│  │    [✅ Approve] [❌ Reject] [👁️ View Details]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  After approval, contact info becomes visible:              │
│  ✅ Approved Bid: abc@company.com | +91-9876543210          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications

| Event | Trigger | Recipients |
|-------|---------|------------|
| New Bid Submitted | Vendor/Supervisor submits | PM, Admin |
| Bid Approved | PM approves | Bidder |
| Bid Rejected | PM rejects | Bidder |
| New Project Open | PM creates project | All Vendors/Supervisors |

---

## 📊 Bid Model Schema

```typescript
interface IBid {
  // Project
  projectId: string
  projectName: string
  
  // Bidder (contact hidden until approved)
  bidderId: string
  bidderType: 'VENDOR' | 'SUPERVISOR' | 'COMPANY'
  bidderName: string
  bidderEmail: string        // ⚠️ Masked until APPROVED
  bidderPhone?: string       // ⚠️ Masked until APPROVED
  companyName?: string
  
  // Bid Details
  proposedAmount: number
  timeline: { startDate, endDate, durationDays }
  machinesOffered?: []
  manpowerOffered?: number
  proposal?: string
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  contactVisible: boolean    // true only when APPROVED
  
  // Review
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
```

---

## 🔗 Connection to Other Features

### On Bid Approval:
1. ✅ Bidder auto-added to `ProjectMember` collection
2. ✅ `contactVisible` set to `true`
3. ✅ Notification sent to bidder
4. ✅ Bidder appears in PM's team list
5. ✅ Bidder can now submit daily reports

### Integration Points:
- **Project Dashboard**: Shows bid count
- **Vendor Dashboard**: Shows bidding opportunities
- **Notifications**: Real-time bid updates
- **Audit Log**: Tracks bid actions

---

*Last Updated: December 2024*
=======
# 🎯 Bidding Feature Documentation

*Project bidding workflow for Vendors & Supervisors*

---

## 📋 Overview

The bidding feature allows **Vendors** and **Supervisors** to express interest in projects by submitting proposals with pricing, resources, and timelines.

### Key Features
- ✅ Submit bids on open projects
- ✅ Contact info hidden until bid approved
- ✅ Auto-add to project team on approval
- ✅ Notifications at each stage
- ✅ Bid history tracking

---

## 🔄 Bidding Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                     BIDDING WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. PM/Admin Creates Project (status: PLANNING/ACTIVE)   │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 2. Project appears in "Open for Bidding" list           │   │
│  │    Visible to: Vendors, Supervisors, Company Reps       │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 3. Vendor/Supervisor Submits Bid                         │   │
│  │    • Proposed amount                                     │   │
│  │    • Timeline (start/end dates)                          │   │
│  │    • Machines offered                                    │   │
│  │    • Manpower available                                  │   │
│  │    • Proposal description                                │   │
│  │    • Past experience                                     │   │
│  │    ⚠️ Contact info (email/phone) HIDDEN at this stage   │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                               ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 4. PM Receives Notification                              │   │
│  │    "New bid from [Vendor Name] for [Project]"            │   │
│  │    PM can see all bids (contact info masked)             │   │
│  └────────────────────────────┬────────────────────────────┘   │
│                               │                                 │
│                    ┌──────────┴──────────┐                      │
│                    ▼                     ▼                      │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │ 5a. APPROVE Bid     │    │ 5b. REJECT Bid      │            │
│  │                     │    │                     │            │
│  │ • Contact VISIBLE   │    │ • Contact remains   │            │
│  │ • Auto-added to     │    │   hidden            │            │
│  │   project team      │    │ • Rejection reason  │            │
│  │ • Notification sent │    │   provided          │            │
│  │   "🎉 Bid Approved" │    │ • Notification sent │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Contact Visibility Rules

| Bid Status | PM/Admin Can See | Bidder Can See |
|------------|------------------|----------------|
| SUBMITTED | ❌ Masked (***@***.com) | ✅ Own info |
| UNDER_REVIEW | ❌ Masked | ✅ Own info |
| **APPROVED** | ✅ **Full contact visible** | ✅ Own info |
| REJECTED | ❌ Masked | ✅ Own info |
| WITHDRAWN | ❌ Masked | ✅ Own info |

### Why?
- **Privacy**: Vendors don't want contact exposed before selection
- **Spam Prevention**: Prevents unsolicited contact
- **Trust**: Information revealed only after formal approval

---

## 🔌 API Endpoints

### Bidding APIs

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/bids/open` | GET | Vendor/Supervisor | List projects open for bidding |
| `/api/bids/my` | GET | Vendor/Supervisor | Get my submitted bids |
| `/api/projects/{id}/bids` | GET | PM/Admin | View all bids for project |
| `/api/projects/{id}/bids` | POST | Vendor/Supervisor | Submit new bid |
| `/api/bids/{bidId}` | GET | Any | Get single bid details |
| `/api/bids/{bidId}` | PUT | PM/Admin | Approve/Reject bid |

### Request Examples

#### Submit Bid
```json
POST /api/projects/{projectId}/bids
Authorization: Bearer <token>

{
  "proposedAmount": 250000,
  "timeline": {
    "startDate": "2024-12-20",
    "endDate": "2025-01-15",
    "durationDays": 26
  },
  "machinesOffered": [
    { "machineType": "TOWER_CRANE", "quantity": 1, "dailyRate": 5000 }
  ],
  "manpowerOffered": 10,
  "proposal": "We have 5 years experience in similar projects...",
  "relevantExperience": "Completed Metro CP-301, CP-302",
  "pastProjects": ["Metro CP-301", "Highway NH-48"]
}
```

#### Approve Bid
```json
PUT /api/bids/{bidId}
Authorization: Bearer <token>

{
  "action": "APPROVE",
  "reviewNotes": "Best price and timeline. Approved."
}
```

#### Reject Bid
```json
PUT /api/bids/{bidId}
Authorization: Bearer <token>

{
  "action": "REJECT",
  "rejectionReason": "Budget exceeds allocation"
}
```

---

## 📊 Dashboard Widgets

### Vendor/Supervisor Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 🎯 BIDDING SECTION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📢 Open Projects for Bidding (5)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Metro CP-305 | Delhi | Budget: ₹50L | Deadline: Jan  │   │
│  │ [📝 Submit Bid]                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Highway NH-52 | Mumbai | Budget: ₹80L | Dec 20      │   │
│  │ [📝 Submit Bid]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 My Active Bids                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Metro CP-303 | ₹25L | 🟡 Under Review               │   │
│  │ Highway NH-48 | ₹35L | 🟢 Approved ✓                │   │
│  │ Bridge BR-12 | ₹18L | 🔴 Rejected                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PM Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 📋 PENDING BIDS                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Project: Metro CP-303 (3 bids)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. ABC Equipments | ₹25L | 20 days | 2 Cranes       │   │
│  │    Contact: ***@***.com | **********                │   │
│  │    [✅ Approve] [❌ Reject] [👁️ View Details]        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 2. XYZ Suppliers | ₹28L | 18 days | 3 Cranes        │   │
│  │    Contact: ***@***.com | **********                │   │
│  │    [✅ Approve] [❌ Reject] [👁️ View Details]        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  After approval, contact info becomes visible:              │
│  ✅ Approved Bid: abc@company.com | +91-9876543210          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications

| Event | Trigger | Recipients |
|-------|---------|------------|
| New Bid Submitted | Vendor/Supervisor submits | PM, Admin |
| Bid Approved | PM approves | Bidder |
| Bid Rejected | PM rejects | Bidder |
| New Project Open | PM creates project | All Vendors/Supervisors |

---

## 📊 Bid Model Schema

```typescript
interface IBid {
  // Project
  projectId: string
  projectName: string
  
  // Bidder (contact hidden until approved)
  bidderId: string
  bidderType: 'VENDOR' | 'SUPERVISOR' | 'COMPANY'
  bidderName: string
  bidderEmail: string        // ⚠️ Masked until APPROVED
  bidderPhone?: string       // ⚠️ Masked until APPROVED
  companyName?: string
  
  // Bid Details
  proposedAmount: number
  timeline: { startDate, endDate, durationDays }
  machinesOffered?: []
  manpowerOffered?: number
  proposal?: string
  
  // Status
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN'
  contactVisible: boolean    // true only when APPROVED
  
  // Review
  reviewedBy?: string
  reviewedAt?: Date
  rejectionReason?: string
}
```

---

## 🔗 Connection to Other Features

### On Bid Approval:
1. ✅ Bidder auto-added to `ProjectMember` collection
2. ✅ `contactVisible` set to `true`
3. ✅ Notification sent to bidder
4. ✅ Bidder appears in PM's team list
5. ✅ Bidder can now submit daily reports

### Integration Points:
- **Project Dashboard**: Shows bid count
- **Vendor Dashboard**: Shows bidding opportunities
- **Notifications**: Real-time bid updates
- **Audit Log**: Tracks bid actions

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
