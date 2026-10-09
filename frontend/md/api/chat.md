<<<<<<< HEAD
# 💬 Chat APIs

Project chat and messaging.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat/{projectId}` | GET | Bearer | Get messages |
| `/api/chat/{projectId}` | POST | Bearer | Send message |
| `/api/chat/{projectId}/read` | POST | Bearer | Mark as read |
| `/api/chat/{projectId}/announcements` | GET | Bearer | Get pinned |
| `/api/chat/{projectId}/announcements` | POST | Bearer | Pin announcement |
| `/api/chat/{projectId}/announcements/{id}` | DELETE | Bearer | Unpin |

---

## POST /api/chat/{projectId}

Send a message with optional @mentions.

**Request:**
```json
{
  "message": "Concrete pour completed @supervisor",
  "attachments": ["photo_url"],
  "mentions": ["supervisor"],
  "replyTo": "msg_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_789",
    "timestamp": "2024-12-14T14:30:00Z"
  }
}
```

---

## GET /api/chat/{projectId}

Get chat messages.

**Query Params:**
- `?limit=50`
- `?before=msg_456` (pagination)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_789",
        "senderName": "Rajesh",
        "senderRole": "SUPERVISOR",
        "message": "Concrete pour completed",
        "readBy": ["user_1", "user_2"],
        "timestamp": "2024-12-14T14:30:00Z"
      }
    ],
    "hasMore": true
  }
}
```

---

## POST /api/chat/{projectId}/read

Mark messages as read (read receipts).

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## POST /api/chat/{projectId}/announcements

Pin an announcement.

**Request:**
```json
{
  "text": "Site inspection tomorrow at 9 AM",
  "expiresAt": "2024-12-16"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ann_123",
    "text": "Site inspection tomorrow at 9 AM",
    "pinnedByName": "PM Name",
    "expiresAt": "2024-12-16T00:00:00Z"
  }
}
```
=======
# 💬 Chat APIs

Project chat and messaging.

## Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/chat/{projectId}` | GET | Bearer | Get messages |
| `/api/chat/{projectId}` | POST | Bearer | Send message |
| `/api/chat/{projectId}/read` | POST | Bearer | Mark as read |
| `/api/chat/{projectId}/announcements` | GET | Bearer | Get pinned |
| `/api/chat/{projectId}/announcements` | POST | Bearer | Pin announcement |
| `/api/chat/{projectId}/announcements/{id}` | DELETE | Bearer | Unpin |

---

## POST /api/chat/{projectId}

Send a message with optional @mentions.

**Request:**
```json
{
  "message": "Concrete pour completed @supervisor",
  "attachments": ["photo_url"],
  "mentions": ["supervisor"],
  "replyTo": "msg_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_789",
    "timestamp": "2024-12-14T14:30:00Z"
  }
}
```

---

## GET /api/chat/{projectId}

Get chat messages.

**Query Params:**
- `?limit=50`
- `?before=msg_456` (pagination)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "messageId": "msg_789",
        "senderName": "Rajesh",
        "senderRole": "SUPERVISOR",
        "message": "Concrete pour completed",
        "readBy": ["user_1", "user_2"],
        "timestamp": "2024-12-14T14:30:00Z"
      }
    ],
    "hasMore": true
  }
}
```

---

## POST /api/chat/{projectId}/read

Mark messages as read (read receipts).

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

## POST /api/chat/{projectId}/announcements

Pin an announcement.

**Request:**
```json
{
  "text": "Site inspection tomorrow at 9 AM",
  "expiresAt": "2024-12-16"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "ann_123",
    "text": "Site inspection tomorrow at 9 AM",
    "pinnedByName": "PM Name",
    "expiresAt": "2024-12-16T00:00:00Z"
  }
}
```
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
