# Vendor Extension API Specification

This document outlines the extensions for the Vendor Dashboard and APIs.

## Feature Roadmap

### 👷 Labour & Team Features
1. **Team Management**: Create teams, manage workers, assign supervisors, remove workers, view active teams.
2. **Labour Hiring**: Create job openings, urgent hiring, skill-based hiring, daily wage setup, accommodation info.
3. **Worker Applications**: View applicants, accept/reject/shortlist workers, contact applicants.
4. **Supervisor Management**: Add supervisors, assign teams, supervisor contact panel, performance history.
5. **Labour Availability Marketplace**: Browse available workers/supervisors, filter by skill, city, experience, wage.
6. **Active Workforce Tracking**: Real-time status of workers (working/idle), team deployment, worker count per project.

### 🚜 Marketplace Features
7. **Machine Rental Marketplace**: Make machines public, rental pricing, availability calendar, accept requests.
8. **Vendor Discovery**: Public profiles, ratings/reviews, service categories, active regions.
9. **Contractor Requests Feed**: New labour/machine/material requests, urgent hiring feed.

### 💰 Financial Features
10. **Worker Payments**: Payment history, pending wages, supervisor payouts.
11. **Rental Earnings**: Machine-wise and team-wise earnings, monthly revenue split.

### 📞 Communication Features
12. **Quick Contact Actions**: Call worker, WhatsApp supervisor, broadcast to team, emergency contact.
13. **Team Announcements**: Site changes, shift timings, urgent meetings, safety alerts.

### 📍 Operational Features
14. **Worker Attendance (Premium)**: Site entry/exit with geo-tagging (Check-In/Check-Out).
15. **Shift Scheduling**: Day/Night shifts, rotation management.

### 🧑‍🏭 Labour Intelligence Features
16. **Worker Skill Tags**: Categorization (Helper, Welder, Electrician, etc.).
17. **Worker Experience Profiles**: Detailed history, past projects, certifications.
18. **Blacklist / Trust System**: Reliability tracking, trust badges.

### 📦 Contractor Coordination Features
19. **Contract-Based Teams**: Project assignments, duration, completion status.
20. **Rapid Hiring**: One-click hiring for urgent needs (e.g., "Need 25 Helpers Today").

### 📊 Premium SaaS Extensions
21. **Workforce Analytics**: Utilization trends, manpower trends.
22. **Workforce Reports**: Attendance, deployment, contractor summaries.
23. **Compliance Tracking**: Safety documents, insurance, labour compliance.

---

## Detailed API Endpoints

### 1. Job Management
- **POST** `/api/vendor/jobs/create`: Create a new work opening.
- **GET** `/api/vendor/jobs`: List all jobs created by the vendor.
- **GET** `/api/vendor/jobs/{jobId}/applications`: View applicants for a job.
- **PATCH** `/api/vendor/jobs/applications/{applicationId}`: Update application status (APPROVED/REJECTED/SHORTLISTED).

### 2. Team & Supervisor Management
- **POST** `/api/vendor/teams/create`: Create a new labour team.
- **GET** `/api/vendor/teams`: List all teams.
- **PATCH** `/api/vendor/teams/{teamId}/assign-supervisor`: Assign a supervisor to a team.
- **POST** `/api/vendor/teams/{teamId}/add-worker`: Add a worker to a team.
- **DELETE** `/api/vendor/teams/{teamId}/remove-worker/{workerId}`: Remove a worker from a team.

### 3. Marketplace & Discovery
- **GET** `/api/vendor/marketplace/labour`: Browse available labourers with filters.
- **GET** `/api/vendor/marketplace/supervisors`: Browse available supervisors.
- **PATCH** `/api/vendor/machines/{machineId}/public`: Toggle machine visibility on marketplace.
- **POST** `/api/vendor/machines/{machineId}/pricing`: Update machine rental pricing.

### 4. Financials
- **GET** `/api/vendor/finance/payments`: Labour payment history and pending wages.
- **GET** `/api/vendor/finance/earnings`: Rental and team earnings analytics.

### 5. Communication & Operations
- **POST** `/api/vendor/announcements/broadcast`: Send announcement to teams.
- **GET** `/api/vendor/attendance`: View worker attendance logs (geo-tagged).
- **POST** `/api/vendor/shifts/schedule`: Create/Update shift rotations.

### 6. Analytics & Reports
- **GET** `/api/vendor/analytics/workforce`: Fetch workforce utilization data.
- **GET** `/api/vendor/reports/deployment`: Generate deployment reports.
