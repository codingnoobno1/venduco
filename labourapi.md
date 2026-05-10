# Labour Mobile App API Specification

This document outlines the APIs for the Labour Mobile App.

## Base URL
`/api/mobile/labour`

## Endpoints

### 1. Quick Labour Register
**POST** `/api/mobile/labour/register`

Register a new labourer.

**Request Body:**
```json
{
  "name": "Raju Kumar",
  "phone": "9876543210",
  "city": "Thane",
  "skills": ["HELPER", "CIVIL"],
  "experience": 2
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "labourId": "lab_123"
}
```

---

### 2. Labour Login (OTP)
**POST** `/api/mobile/labour/login`

Login using phone number and OTP.

**Request Body:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token",
  "labour": {
    "id": "lab_123",
    "name": "Raju Kumar"
  }
}
```

---

### 3. Get Nearby Jobs
**GET** `/api/mobile/labour/jobs`

Fetch jobs based on location and skills.

**Query Parameters:**
- `city` (string): The city to search in.
- `skill` (string): Filter by skill.
- `radius` (number): Radius in km.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "jobId": "job_001",
      "title": "Need 15 Helpers",
      "vendorName": "ABC Infra",
      "location": "Thane Metro Line 4",
      "salaryPerDay": 850,
      "duration": "2 months",
      "accommodation": true
    }
  ]
}
```

---

### 4. Apply To Work
**POST** `/api/mobile/labour/apply`

Apply for a specific job.

**Request Body:**
```json
{
  "jobId": "job_001",
  "labourId": "lab_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully"
}
```

---

### 5. Team Join API
**POST** `/api/mobile/labour/team/join`

Join a labour team.

**Request Body:**
```json
{
  "teamId": "team_001",
  "labourId": "lab_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Joined team successfully"
}
```

---

### 6. Leave Team / Exit API
**POST** `/api/mobile/labour/team/exit`

Leave the current team.

**Request Body:**
```json
{
  "teamId": "team_001",
  "labourId": "lab_123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Exited team successfully"
}
```

---

### 7. Labour Availability API
**PUT** `/api/mobile/labour/availability`

Update labour availability status.

**Request Body:**
```json
{
  "available": true,
  "city": "Mumbai",
  "skills": ["WELDING"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Availability updated"
}
```
