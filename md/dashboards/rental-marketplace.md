<<<<<<< HEAD
# 🏪 Machine Rental Marketplace

*Vendor-PM rental workflow for equipment sharing*

---

## 📋 Overview

The Machine Rental Marketplace allows **Vendors** to list idle machines for rent and **PMs** to request and rent machines for their projects.

### Key Features
- ✅ Vendors list machines with rates (daily/weekly/monthly)
- ✅ PMs browse available machines
- ✅ Request → Approve → Assign → Track workflow
- ✅ Contact visibility on approval
- ✅ Usage tracking by Supervisors
- ✅ Rental completion & cost tracking

---

## 🔄 Rental Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MACHINE RENTAL MARKETPLACE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VENDOR: List Machine for Rent                             │ │
│  │ • Select machine from fleet                               │ │
│  │ • Set daily/weekly/monthly rates                          │ │
│  │ • Specify location & availability dates                   │ │
│  └─────────────────────────┬─────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│           Machine Status: AVAILABLE (Listed)                    │
│                            │                                    │
│             ┌──────────────┴──────────────┐                    │
│             ▼                              │                    │
│  ┌─────────────────────────┐              │                    │
│  │ PM: Browse Available    │              │                    │
│  │ Machines                │              │                    │
│  │ • Filter by type/loc    │              │                    │
│  │ • View rates            │              │                    │
│  │ • Contact: MASKED       │              │                    │
│  └───────────┬─────────────┘              │                    │
│              │                             │                    │
│              ▼                             │                    │
│  ┌─────────────────────────┐              │                    │
│  │ PM: Request Rental      │              │                    │
│  │ • Select project        │              │                    │
│  │ • Specify dates         │              │                    │
│  │ • Propose rate          │              │                    │
│  └───────────┬─────────────┘              │                    │
│              │                             │                    │
│              ▼                             │                    │
│       Status: REQUESTED                    │                    │
│   🔔 Vendor notified                       │                    │
│              │                             │                    │
│              ▼                             │                    │
│  ┌─────────────────────────┐              │                    │
│  │ VENDOR: Review Request  │              │                    │
│  └──────┬──────────┬───────┘              │                    │
│         │          │                       │                    │
│         ▼          ▼                       │                    │
│    ✅ APPROVE   ❌ REJECT                  │                    │
│         │          │                       │                    │
│         │          └───► CANCELLED ────────┘                   │
│         │               🔔 PM notified                          │
│         ▼                                                       │
│   Status: APPROVED                                              │
│   Contact: VISIBLE                                              │
│   🔔 PM notified                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────┐                                   │
│  │ PM: Assign to Project   │                                   │
│  │ • Assign to supervisor  │                                   │
│  │ • Confirm start date    │                                   │
│  └───────────┬─────────────┘                                   │
│              │                                                  │
│              ▼                                                  │
│       Status: ASSIGNED                                          │
│   🔔 Vendor & Supervisor notified                               │
│              │                                                  │
│              ▼                                                  │
│       Status: IN_USE                                            │
│   Supervisor logs hours daily                                   │
│              │                                                  │
│              ▼                                                  │
│       Status: COMPLETED                                         │
│   🔔 All parties notified                                       │
│   Final cost calculated                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Contact Visibility

| Status | Vendor Contact Visible to PM |
|--------|:----------------------------:|
| AVAILABLE | ❌ Masked |
| REQUESTED | ❌ Masked |
| **APPROVED** | ✅ **VISIBLE** |
| ASSIGNED | ✅ VISIBLE |
| IN_USE | ✅ VISIBLE |
| COMPLETED | ✅ VISIBLE |

---

## 🔌 API Endpoints

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/machinerentals?view=available` | GET | PM | Browse available machines |
| `/api/machinerentals?view=my-listings` | GET | Vendor | My listed machines |
| `/api/machinerentals?view=my-requests` | GET | PM | My rental requests |
| `/api/machinerentals?view=vendor-requests` | GET | Vendor | Requests for my machines |
| `/api/machinerentals` | POST | Vendor | List machine (action=LIST_FOR_RENT) |
| `/api/machinerentals` | POST | PM | Request rental (action=REQUEST_RENTAL) |
| `/api/machinerentals/{id}` | GET | Any | Get rental details |
| `/api/machinerentals/{id}` | PUT | Vendor | Approve/Reject (action=APPROVE/REJECT) |
| `/api/machinerentals/{id}` | PUT | PM | Assign/Complete (action=ASSIGN/COMPLETE) |
| `/api/machinerentals/{id}` | PATCH | Supervisor | Log usage hours |

---

## 📝 Request Examples

### Vendor: List Machine for Rent
```json
POST /api/machinerentals
{
  "action": "LIST_FOR_RENT",
  "machineId": "6762abc...",
  "dailyRate": 5000,
  "weeklyRate": 30000,
  "monthlyRate": 100000,
  "location": "Delhi NCR",
  "availableFrom": "2024-12-20",
  "availableTo": "2025-01-31"
}
```

### PM: Request Rental
```json
POST /api/machinerentals
{
  "action": "REQUEST_RENTAL",
  "rentalId": "6762xyz...",
  "projectId": "6762proj...",
  "startDate": "2024-12-22",
  "endDate": "2025-01-05",
  "proposedRate": 4500
}
```

### Vendor: Approve Rental
```json
PUT /api/machinerentals/{rentalId}
{
  "action": "APPROVE",
  "agreedRate": 4800,
  "approvalNotes": "Rate adjusted for long-term rental"
}
```

### Supervisor: Log Usage
```json
PATCH /api/machinerentals/{rentalId}
{
  "hoursUsed": 8,
  "notes": "Normal operation, no issues"
}
```

---

## 📊 Dashboard Widgets

### Vendor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🏪 RENTAL MARKETPLACE                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Idle Machines Available for Rent                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TC-05 (Tower Crane) - Not listed                    │   │
│  │ [📝 List for Rent]                                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ EX-01 (Excavator) - Listed @ ₹3000/day              │   │
│  │ Status: Available | [✏️ Edit] [❌ Remove]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📬 Incoming Rental Requests (2)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ EX-01 | Requested by: Rajesh Kumar                  │   │
│  │ Project: Metro CP-305 | 15 days | ₹3000/day         │   │
│  │ [✅ Approve] [❌ Reject]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PM Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🚜 RENT A MACHINE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Available for Rent (12 machines)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type      │ Location   │ Rate      │ Action        │   │
│  ├───────────┼────────────┼───────────┼───────────────┤   │
│  │ Crane     │ Delhi      │ ₹5000/day │ [Request]     │   │
│  │ Excavator │ Gurgaon    │ ₹3000/day │ [Request]     │   │
│  │ Loader    │ Noida      │ ₹2500/day │ [Request]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 My Rental Requests                                      │
│  • EX-03 for CP-305 - 🟢 Approved (₹4800/day)              │
│  • CR-07 for CP-304 - 🟡 Pending                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications

| Event | Recipients | Message |
|-------|------------|---------|
| Rental Request | Vendor | "📬 Rental request from [PM] for [Machine]" |
| Rental Approved | PM | "✅ Your rental request for [Machine] approved" |
| Rental Rejected | PM | "❌ Your rental request was not approved" |
| Machine Assigned | Vendor, Supervisor | "🚜 [Machine] assigned to [Project]" |
| Rental Completed | All parties | "✓ Rental period ended for [Machine]" |

---

## 💰 Cost Tracking

```typescript
interface RentalCosts {
  dailyRate: number        // ₹5000
  requestedDays: number    // 15
  estimatedCost: number    // ₹75,000 (at request)
  
  agreedRate: number       // ₹4800 (negotiated)
  actualDays: number       // 14 (actual usage)
  actualCost: number       // ₹67,200 (at completion)
  
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
}
```

---

## 🔗 Integration Points

| Feature | Connection |
|---------|------------|
| Machine Model | `machineId` links to Machine |
| Project Model | `projectId` for assignment |
| Notifications | Automatic at each status change |
| Usage Tracking | `operationalLogs[]` for supervisor logging |
| Financials | `estimatedCost`, `actualCost`, `paymentStatus` |

---

*Last Updated: December 2024*
=======
# 🏪 Machine Rental Marketplace

*Vendor-PM rental workflow for equipment sharing*

---

## 📋 Overview

The Machine Rental Marketplace allows **Vendors** to list idle machines for rent and **PMs** to request and rent machines for their projects.

### Key Features
- ✅ Vendors list machines with rates (daily/weekly/monthly)
- ✅ PMs browse available machines
- ✅ Request → Approve → Assign → Track workflow
- ✅ Contact visibility on approval
- ✅ Usage tracking by Supervisors
- ✅ Rental completion & cost tracking

---

## 🔄 Rental Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    MACHINE RENTAL MARKETPLACE                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ VENDOR: List Machine for Rent                             │ │
│  │ • Select machine from fleet                               │ │
│  │ • Set daily/weekly/monthly rates                          │ │
│  │ • Specify location & availability dates                   │ │
│  └─────────────────────────┬─────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│           Machine Status: AVAILABLE (Listed)                    │
│                            │                                    │
│             ┌──────────────┴──────────────┐                    │
│             ▼                              │                    │
│  ┌─────────────────────────┐              │                    │
│  │ PM: Browse Available    │              │                    │
│  │ Machines                │              │                    │
│  │ • Filter by type/loc    │              │                    │
│  │ • View rates            │              │                    │
│  │ • Contact: MASKED       │              │                    │
│  └───────────┬─────────────┘              │                    │
│              │                             │                    │
│              ▼                             │                    │
│  ┌─────────────────────────┐              │                    │
│  │ PM: Request Rental      │              │                    │
│  │ • Select project        │              │                    │
│  │ • Specify dates         │              │                    │
│  │ • Propose rate          │              │                    │
│  └───────────┬─────────────┘              │                    │
│              │                             │                    │
│              ▼                             │                    │
│       Status: REQUESTED                    │                    │
│   🔔 Vendor notified                       │                    │
│              │                             │                    │
│              ▼                             │                    │
│  ┌─────────────────────────┐              │                    │
│  │ VENDOR: Review Request  │              │                    │
│  └──────┬──────────┬───────┘              │                    │
│         │          │                       │                    │
│         ▼          ▼                       │                    │
│    ✅ APPROVE   ❌ REJECT                  │                    │
│         │          │                       │                    │
│         │          └───► CANCELLED ────────┘                   │
│         │               🔔 PM notified                          │
│         ▼                                                       │
│   Status: APPROVED                                              │
│   Contact: VISIBLE                                              │
│   🔔 PM notified                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────┐                                   │
│  │ PM: Assign to Project   │                                   │
│  │ • Assign to supervisor  │                                   │
│  │ • Confirm start date    │                                   │
│  └───────────┬─────────────┘                                   │
│              │                                                  │
│              ▼                                                  │
│       Status: ASSIGNED                                          │
│   🔔 Vendor & Supervisor notified                               │
│              │                                                  │
│              ▼                                                  │
│       Status: IN_USE                                            │
│   Supervisor logs hours daily                                   │
│              │                                                  │
│              ▼                                                  │
│       Status: COMPLETED                                         │
│   🔔 All parties notified                                       │
│   Final cost calculated                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📞 Contact Visibility

| Status | Vendor Contact Visible to PM |
|--------|:----------------------------:|
| AVAILABLE | ❌ Masked |
| REQUESTED | ❌ Masked |
| **APPROVED** | ✅ **VISIBLE** |
| ASSIGNED | ✅ VISIBLE |
| IN_USE | ✅ VISIBLE |
| COMPLETED | ✅ VISIBLE |

---

## 🔌 API Endpoints

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/machinerentals?view=available` | GET | PM | Browse available machines |
| `/api/machinerentals?view=my-listings` | GET | Vendor | My listed machines |
| `/api/machinerentals?view=my-requests` | GET | PM | My rental requests |
| `/api/machinerentals?view=vendor-requests` | GET | Vendor | Requests for my machines |
| `/api/machinerentals` | POST | Vendor | List machine (action=LIST_FOR_RENT) |
| `/api/machinerentals` | POST | PM | Request rental (action=REQUEST_RENTAL) |
| `/api/machinerentals/{id}` | GET | Any | Get rental details |
| `/api/machinerentals/{id}` | PUT | Vendor | Approve/Reject (action=APPROVE/REJECT) |
| `/api/machinerentals/{id}` | PUT | PM | Assign/Complete (action=ASSIGN/COMPLETE) |
| `/api/machinerentals/{id}` | PATCH | Supervisor | Log usage hours |

---

## 📝 Request Examples

### Vendor: List Machine for Rent
```json
POST /api/machinerentals
{
  "action": "LIST_FOR_RENT",
  "machineId": "6762abc...",
  "dailyRate": 5000,
  "weeklyRate": 30000,
  "monthlyRate": 100000,
  "location": "Delhi NCR",
  "availableFrom": "2024-12-20",
  "availableTo": "2025-01-31"
}
```

### PM: Request Rental
```json
POST /api/machinerentals
{
  "action": "REQUEST_RENTAL",
  "rentalId": "6762xyz...",
  "projectId": "6762proj...",
  "startDate": "2024-12-22",
  "endDate": "2025-01-05",
  "proposedRate": 4500
}
```

### Vendor: Approve Rental
```json
PUT /api/machinerentals/{rentalId}
{
  "action": "APPROVE",
  "agreedRate": 4800,
  "approvalNotes": "Rate adjusted for long-term rental"
}
```

### Supervisor: Log Usage
```json
PATCH /api/machinerentals/{rentalId}
{
  "hoursUsed": 8,
  "notes": "Normal operation, no issues"
}
```

---

## 📊 Dashboard Widgets

### Vendor Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🏪 RENTAL MARKETPLACE                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📦 Idle Machines Available for Rent                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ TC-05 (Tower Crane) - Not listed                    │   │
│  │ [📝 List for Rent]                                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ EX-01 (Excavator) - Listed @ ₹3000/day              │   │
│  │ Status: Available | [✏️ Edit] [❌ Remove]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📬 Incoming Rental Requests (2)                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ EX-01 | Requested by: Rajesh Kumar                  │   │
│  │ Project: Metro CP-305 | 15 days | ₹3000/day         │   │
│  │ [✅ Approve] [❌ Reject]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PM Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│ 🚜 RENT A MACHINE                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔍 Available for Rent (12 machines)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Type      │ Location   │ Rate      │ Action        │   │
│  ├───────────┼────────────┼───────────┼───────────────┤   │
│  │ Crane     │ Delhi      │ ₹5000/day │ [Request]     │   │
│  │ Excavator │ Gurgaon    │ ₹3000/day │ [Request]     │   │
│  │ Loader    │ Noida      │ ₹2500/day │ [Request]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  📋 My Rental Requests                                      │
│  • EX-03 for CP-305 - 🟢 Approved (₹4800/day)              │
│  • CR-07 for CP-304 - 🟡 Pending                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔔 Notifications

| Event | Recipients | Message |
|-------|------------|---------|
| Rental Request | Vendor | "📬 Rental request from [PM] for [Machine]" |
| Rental Approved | PM | "✅ Your rental request for [Machine] approved" |
| Rental Rejected | PM | "❌ Your rental request was not approved" |
| Machine Assigned | Vendor, Supervisor | "🚜 [Machine] assigned to [Project]" |
| Rental Completed | All parties | "✓ Rental period ended for [Machine]" |

---

## 💰 Cost Tracking

```typescript
interface RentalCosts {
  dailyRate: number        // ₹5000
  requestedDays: number    // 15
  estimatedCost: number    // ₹75,000 (at request)
  
  agreedRate: number       // ₹4800 (negotiated)
  actualDays: number       // 14 (actual usage)
  actualCost: number       // ₹67,200 (at completion)
  
  paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID'
}
```

---

## 🔗 Integration Points

| Feature | Connection |
|---------|------------|
| Machine Model | `machineId` links to Machine |
| Project Model | `projectId` for assignment |
| Notifications | Automatic at each status change |
| Usage Tracking | `operationalLogs[]` for supervisor logging |
| Financials | `estimatedCost`, `actualCost`, `paymentStatus` |

---

*Last Updated: December 2024*
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
