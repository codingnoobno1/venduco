# Features Additions: Dashboard Data Architecture, KPIs, Admin, Auth, Failures, Retention, Observability

This document supplements `features.md` with detailed, mechanical API → dashboard mappings, KPI math, admin console contracts, field-level authorization matrix, failure modes & recovery, data retention, and observability guidance.

## 9. Dashboard Data Architecture (Tab-Level API Resolution)

This section describes, tab-by-tab and role-by-role, which APIs fire when a dashboard page loads, what payloads are exchanged, what server-side aggregations are expected, and how failures are handled.

### 9.1 Project Manager Dashboard — API Binding Map

#### 9.1.1 Projects Overview Tab
Purpose: Show operational health of active projects and quick action tiles.

APIs Invoked (client sequence):
- GET `/api/projects?status=ACTIVE&page=1&limit=20` — returns base project list
- GET `/api/reports/summary?projectIds=<ids>` — last DailyReport summary per project
- GET `/api/bids/count?projectIds=<ids>` — counts by status for each project
- GET `/api/projects/statistics?projectIds=<ids>` — optional backend aggregation (budget, progress)

Backend Aggregation Logic (server-side for `/api/projects/statistics`):
- Join `Project` + latest `DailyReport` (by projectId), compute:
  - `budgetUsed` = sum(reportedCosts) or stored `budgetUsed`
  - `percentBudgetUsed` = (budgetUsed / budget) * 100
  - `daysSinceLastReport` = now - latestReport.date
  - `activeVendorsCount` = count(ProjectMember where role = VENDOR and isActive = true)
  - `openBidsCount` = count(Bid where projectId and status in [SUBMITTED, UNDER_REVIEW])

Compute (example):
- health = AT_RISK if daysSinceLastReport > 48 OR percentBudgetUsed > 90

Response Shape (project-level):
{
  "projectId": "PRJ-1021",
  "projectCode": "DL-METRO-04",
  "budget": 120000000,
  "budgetUsed": 48500000,
  "percentBudgetUsed": 40.4,
  "lastReportDate": "2025-12-18",
  "daysSinceLastReport": 11,
  "activeVendorsCount": 6,
  "openBidsCount": 3,
  "health": "ON_TRACK"
}

Failure Handling
- If `/api/reports/summary` fails: show cached values, flag `reportsUnavailable = true` in UI and display toast.
- If DPR missing > 48h → set `health = AT_RISK` client-side fallback until reports are available.

#### 9.1.2 Project Detail Tab (when PM opens a project)
APIs Invoked:
- GET `/api/projects/{projectId}` → base project document
- GET `/api/projects/{projectId}/members` → team roster
- GET `/api/projects/{projectId}/bids` → list of bids (PM view)
- GET `/api/projects/{projectId}/stats` → time-series of budget and progress

Backend Aggregation Logic:
- Compose `Project` + `ProjectMember` + `Bid` + `DailyReport` slices
- Calculate: `budgetBurnRate = delta(budgetUsed) / delta(days)` for last 7/30 days

Failure Handling:
- If `bids` endpoint times out, show project info but disable award CTA.

#### 9.1.3 Bids & Awards Tab
APIs:
- GET `/api/projects/{projectId}/bids?status=SUBMITTED` (server sorts by score if present)
- PUT `/api/bids/{bidId}` — payload `{ action: 'APPROVE'|'REJECT', reviewNotes }`

Server-side Actions on Approve:
- Validate PM permissions (project.pmId === actor OR ProjectCollaborator has MANAGE_BIDS)
- Update Bid.status → APPROVED, set `contactVisible: true`
- Upsert `ProjectMember` for bidder (role vendor or supervisor)
- Create `AuditLog` entry and `Notification`

Failure Handling:
- If DB unique constraint fails while upserting `ProjectMember`, retry once and emit `AuditLog` about race condition.

### 9.2 Vendor Dashboard — API Binding Map

#### 9.2.1 Fleet Tab
- GET `/api/machines?ownerId=<vendorId>&status=ALL` — returns machines owned by vendor
- GET `/api/machinerentals?ownerId=<vendorId>&view=vendor-requests` — active rental requests

Backend Aggregation:
- Compute `availableCount`, `assignedCount`, `maintenanceDueCount` from `Machine` and `Maintenance`

Failure Handling: show last-known cached fleet data and mark `stale: true` if fetch fails.

#### 9.2.2 Earnings / Payments Tab
- GET `/api/vendor/billing/summary?vendorId=<id>&period=monthly`
- GET `/api/invoices?vendorId=<id>&status=UNPAID`

Aggregation:
- `earningsToDate = sum(Invoice.paidAmount)`
- `pendingReceivables = sum(Invoice.total - Invoice.paidAmount where status != PAID)`

### 9.3 Supervisor Dashboard — API Binding Map
- Quick Entry POST `/api/reports/daily` (idempotent with `idempotencyKey` header)
- GET `/api/reports/mine?projectId={projectId}&limit=7` for history
- GET `/api/tasks/assigned?userId={supervisorId}`

Idempotency: supervisors POST must accept `Idempotency-Key` header and reject duplicates gracefully.

### 9.4 Admin Dashboard — API Binding Map
- GET `/api/admin/users/pending?page=1` (verification queue)
- GET `/api/audit?entityType=&dateRange=` (audit search)
- POST `/api/admin/users/{id}/action` (approve / suspend / blacklist)

Admin aggregations must be paginated and facetable (by role, region, createdAt) for UI performance.


## 10. Analytics, KPIs & Derived Metrics Engine

The analytics engine is a rules-and-aggregation layer (DB aggregation pipelines or a lightweight analytics service). Below are canonical KPI definitions (mathematical), their inputs and update cadence.

### 10.1 Project Health Score (PHS)
Inputs:
- Budget Overrun % = max(0, (budgetUsed - budget) / budget * 100)
- Delayed DPR Days = average days since last DPR across last 7 days exceeding target cadence
- Machine Idle % = (idleMachineHours / totalMachineHours) * 100 for assigned machines

PHS formula (0–100, higher is better):
PHS = 100 - (BudgetOverrun% * 0.4) - (DelayedDPRDays * 0.3) - (MachineIdle% * 0.3)

Normalization: clamp PHS to [0,100]. Compute daily using materialized aggregation and store in `ProjectMetrics`.

### 10.2 Vendor Reliability Index (VRI)
Inputs:
- On-Time Delivery % (OTD) = deliveredOnTime / totalDeliveries
- Bid Accuracy % (BA) = (awardedBids / submittedBids)
- Machine Availability % (MA) = availableMachineHours / totalMachineHours

VRI = (OTD * 0.5) + (BA * 0.3) + (MA * 0.2)
Scale to 0–100.

### 10.3 Supervisor Compliance Score (SCS)
Inputs:
- DPR Submission Consistency = submissionsOnTime / expectedSubmissions
- Photo Completeness Ratio = submittedPhotos / requiredPhotos
- Approval Rejection Frequency = rejections / reviews (lower is better)

SCS = (DPRConsistency * 0.5) + (PhotoCompleteness * 0.3) + ((1 - RejectionFrequency) * 0.2)

### 10.4 Implementation Notes
- Run metrics pipeline nightly; keep short-term rollups (7-day, 30-day) in Redis for fast UI access.
- Persist raw aggregates into `AnalyticsSnapshot` with TTL for long-term trend analysis.


## 11. Dashboard APIs per Role (Contract Matrix)

### 11.1 Vendor Dashboard — API Matrix
| Tab | API | Derived From |
| --- | --- | --- |
| Fleet | GET `/api/machines?ownerId=` | `Machine` |
| Earnings | GET `/api/vendor/billing/summary?vendorId=` | `Invoice`, `Bid` |
| Invitations | GET `/api/bids/invited` | `BidInvitation` |
| Rentals | GET `/api/machinerentals?view=vendor-requests` | `MachineRental` |

### 11.2 Supervisor Dashboard — API Matrix
| Tab | API |
| --- | --- |
| Daily Entry | POST `/api/reports/daily` |
| History | GET `/api/reports/mine?projectId=` |
| Tasks | GET `/api/tasks/assigned?userId=` |

### 11.3 Admin Dashboard — API Matrix (minimal)
| Tab | API |
| --- | --- |
| User Verification | GET `/api/admin/users/pending` |
| User Actions | PUT `/api/admin/users/{id}/approve` , `/suspend` |
| Audit Search | GET `/api/audit?entityType=&dateRange=` |


## 12. Admin Console Architecture

Admin Capabilities (server-side and guarded by `requestedRole === 'ADMIN'`):
- User Verification Queue: GET `/api/admin/users/pending`
- Manual Overrides: PUT `/api/admin/users/{id}/action` (approve, reject, suspend)
- Project Archival: PUT `/api/admin/projects/{id}/archive` (move to read-only)
- Vendor Blacklisting: POST `/api/admin/vendors/{id}/blacklist` (adds to deny-list used by discovery API)
- Audit Search & Export: GET `/api/audit` (CSV/JSON export endpoints)

Security & Controls:
- Admin actions must create `AuditLog` with `actorId`, `action`, `target`, `reason`.
- Require `2FA` or `API_KEY` for sensitive operations in prod.


## 13. Field-Level Authorization Matrix (Entity × Field × Role)

| Entity | Field | PM | Vendor | Supervisor | Admin |
| --- | ---: | :--: | :--: | :--: | :--: |
| Project | `budget` | R | - | - | R/W |
| Project | `budgetUsed` | R | - | - | R/W |
| Project | `biddingMode` | R/W | - | - | R/W |
| DPR (DailyReport) | `hoursUsed` | R/W | - | W | R |
| DPR | `approvalStatus` | R/W | - | R | R/W |
| Bid | `proposedAmount` | R | W | - | R/W |
| Bid | `contactVisible` | R | - | - | R/W |

Notes:
- `R` = read, `W` = write, `-` = no access. Implement checks both in JWT guard and server-side policy layer (e.g., `lib/permissions.ts`).


## 14. Failure Modes & Recovery Logic

### 14.1 Common Failure Scenarios & Mitigations

1) DPR Submitted Twice (client retry)
- Problem: duplicate DailyReport entries.
- Mitigation: require `Idempotency-Key` header on POST `/api/reports/daily`; server stores last key per user+day and returns 200 with existing resource if seen.

2) Machine Assigned to Two Projects Concurrently
- Problem: conflicting `MachineAssignment` rows.
- Mitigation: implement optimistic concurrency via `assignmentLock` TTL; when assigning, create a lock document or transaction; verify machine.available and atomic update; notify Admin on conflict.

3) Vendor Submits Bid after `biddingEndDate`
- Problem: late bids accepted due to clock skew.
- Mitigation: server checks `Date.now()` vs `project.biddingEndDate` and rejects; also allow admin override endpoint with audit log.

4) PM Approves DPR with incorrect `machineId`
- Mitigation: add `reference validation` in approval route — ensure `machineId` exists and assigned to project; if mismatch, reject with `400` and create a `Conflict` audit entry.

5) Race on ProjectMember Upsert during Bid Approval
- Mitigation: catch duplicate key error and convert to idempotent success; write audit entry about race and unify state in a background reconciliation job.

### 14.2 Recovery & Operational Playbook
- Provide Admin UI to surface conflicts and run automated reconciliation scripts (e.g., `npx tsx reconcile-members.ts --projectId=...`).
- Backfill jobs should run nightly to re-compute denormalized counters and re-index analytics snapshots.


## 15. Data Retention, Archival & Observability

### 15.1 Data Retention Policy (Recommended defaults)
| Data | Retention | Notes |
| --- | ---: | :--- |
| DailyReports (DPR) | 10 years | Retain full DPR; archive old data to cold storage after 2 years.
| AuditLogs | 7 years | Searchable index for 1 year, then cold archive; high-security retention.
| Bids | 5 years | Retain all bid documents for compliance; purge attachments after policy period.
| User KYC Docs | Until account deletion + 7 years | Legal compliance; encrypt at rest.

Soft Delete vs Hard Delete
- Soft delete by default (`deletedAt`) and provide admin hard-delete with export/csv before removal.

### 15.2 Observability & Monitoring
Key Signals:
- API latency (p50/p95/p99) per endpoint
- DPR submission failure rate
- Bid approval failures and DB error rates
- Budget anomaly signals (budget burn spike > expected)

Recommended Metrics & Alerts:
- `api_response_time_p95` > 1s for critical endpoints → Alert SRE
- `dpr_submission_failure_rate` > 1% over 10m → Alert on-call
- `budget_overrun_events` (projects crossing 80%, 90%) → Notify PMs

Logging & Tracing
- Structured logs (JSON): include `requestId`, `userId`, `projectId` where applicable.
- Distributed tracing for long-running aggregations (attach trace id to background jobs).

Storage & Dashboards
- Push metrics to Prometheus/Grafana and track dashboard panels for `PM Portfolio Health`, `Admin Queue`, `API Errors`.

