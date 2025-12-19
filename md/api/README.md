<<<<<<< HEAD
# 📚 API Documentation Index

All API documentation files are organized by domain.

## Files

| File | Description |
|------|-------------|
| [auth.md](./auth.md) | Login, JWT authentication |
| [registration.md](./registration.md) | Multi-step user registration |
| [projects.md](./projects.md) | Project management |
| [machines.md](./machines.md) | Machine/equipment registry |
| [chat.md](./chat.md) | Messaging, mentions, read receipts |
| [tasks.md](./tasks.md) | Task management |
| [issues.md](./issues.md) | Issue tracking, convert to task |
| [attendance.md](./attendance.md) | Daily labour attendance |
| [material-requests.md](./material-requests.md) | Material orders, vendor quotes |
| [daily-plan.md](./daily-plan.md) | Daily planning, day lock, summaries |
| [costs-billing.md](./costs-billing.md) | Cost tracking, vendor billing |
| [notifications.md](./notifications.md) | In-app notifications |
| [admin.md](./admin.md) | Admin user management |

---

## Quick Reference

### Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access

| Role | Access |
|------|--------|
| **ADMIN** | All endpoints |
| **PM** | Projects, tasks, costs, quotes |
| **VENDOR** | Own machines, bids, billing |
| **SUPERVISOR** | Assigned projects, attendance |

---

## API Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```
=======
# 📚 API Documentation Index

All API documentation files are organized by domain.

## Files

| File | Description |
|------|-------------|
| [auth.md](./auth.md) | Login, JWT authentication |
| [registration.md](./registration.md) | Multi-step user registration |
| [projects.md](./projects.md) | Project management |
| [machines.md](./machines.md) | Machine/equipment registry |
| [chat.md](./chat.md) | Messaging, mentions, read receipts |
| [tasks.md](./tasks.md) | Task management |
| [issues.md](./issues.md) | Issue tracking, convert to task |
| [attendance.md](./attendance.md) | Daily labour attendance |
| [material-requests.md](./material-requests.md) | Material orders, vendor quotes |
| [daily-plan.md](./daily-plan.md) | Daily planning, day lock, summaries |
| [costs-billing.md](./costs-billing.md) | Cost tracking, vendor billing |
| [notifications.md](./notifications.md) | In-app notifications |
| [admin.md](./admin.md) | Admin user management |

---

## Quick Reference

### Authentication

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

### Role-Based Access

| Role | Access |
|------|--------|
| **ADMIN** | All endpoints |
| **PM** | Projects, tasks, costs, quotes |
| **VENDOR** | Own machines, bids, billing |
| **SUPERVISOR** | Assigned projects, attendance |

---

## API Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
