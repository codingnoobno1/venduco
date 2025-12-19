<<<<<<< HEAD
# 🔔 Notifications APIs

In-app notifications.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/notifications` | GET | Bearer | Get notifications |
| `/api/notifications` | POST | Bearer | Mark as read |

---

## GET /api/notifications

Get user notifications.

**Query Params:**
- `?limit=20`
- `?unread=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notif_123",
      "type": "ISSUE_RAISED",
      "title": "New Issue",
      "message": "Material delay reported on CP-303",
      "link": "/pm/issues",
      "read": false,
      "createdAt": "2024-12-15T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

**Notification Types:**
- `ISSUE_RAISED`
- `ISSUE_RESOLVED`
- `MATERIAL_QUOTED`
- `MATERIAL_APPROVED`
- `ATTENDANCE_SUBMITTED`
- `DAY_LOCKED`
- `MENTION`
- `ANNOUNCEMENT`
- `TASK_ASSIGNED`
- `BID_RECEIVED`
- `RENTAL_REQUEST`
- `GENERAL`

---

## POST /api/notifications

Mark notifications as read.

**Mark single:**
```json
{
  "notificationId": "notif_123"
}
```

**Mark all:**
```json
{
  "markAllRead": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read"
}
```
=======
# 🔔 Notifications APIs

In-app notifications.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/notifications` | GET | Bearer | Get notifications |
| `/api/notifications` | POST | Bearer | Mark as read |

---

## GET /api/notifications

Get user notifications.

**Query Params:**
- `?limit=20`
- `?unread=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "notif_123",
      "type": "ISSUE_RAISED",
      "title": "New Issue",
      "message": "Material delay reported on CP-303",
      "link": "/pm/issues",
      "read": false,
      "createdAt": "2024-12-15T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

**Notification Types:**
- `ISSUE_RAISED`
- `ISSUE_RESOLVED`
- `MATERIAL_QUOTED`
- `MATERIAL_APPROVED`
- `ATTENDANCE_SUBMITTED`
- `DAY_LOCKED`
- `MENTION`
- `ANNOUNCEMENT`
- `TASK_ASSIGNED`
- `BID_RECEIVED`
- `RENTAL_REQUEST`
- `GENERAL`

---

## POST /api/notifications

Mark notifications as read.

**Mark single:**
```json
{
  "notificationId": "notif_123"
}
```

**Mark all:**
```json
{
  "markAllRead": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notifications marked as read"
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
