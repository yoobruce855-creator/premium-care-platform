# Premium Care Platform - API Documentation

## 🚀 Quick Start

### Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Authentication API

### POST /api/auth/register
Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "010-1234-5678"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "guardian",
    "subscription": {
      "plan": "free",
      "status": "active"
    }
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

### POST /api/auth/login
Login user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token"
}
```

**Demo Account:**
```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

### POST /api/auth/refresh
Refresh access token

**Request:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "token": "new_jwt_access_token"
}
```

### GET /api/auth/me
Get current user info (Protected)

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "010-1234-5678",
  "role": "guardian",
  "settings": { ... }
}
```

### PUT /api/auth/profile
Update user profile (Protected)

**Request:**
```json
{
  "name": "Jane Doe",
  "phone": "010-9876-5432",
  "settings": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}
```

### POST /api/auth/change-password
Change password (Protected)

**Request:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## 👥 Patients API

### GET /api/patients
Get all patients for current user (Protected)

**Response:**
```json
[
  {
    "id": "patient-uuid",
    "name": "어르신",
    "age": 75,
    "gender": "female",
    "status": "normal",
    "guardians": ["user-uuid"],
    "medicalInfo": { ... },
    "location": { ... }
  }
]
```

### GET /api/patients/:patientId
Get specific patient (Protected, requires patient access)

**Response:**
```json
{
  "id": "patient-uuid",
  "name": "어르신",
  "age": 75,
  "gender": "female",
  "status": "normal",
  "medicalInfo": {
    "bloodType": "A+",
    "allergies": [],
    "medications": [],
    "conditions": []
  },
  "guardians": ["user-uuid"],
  "location": {
    "address": "서울시 강남구",
    "coordinates": { "lat": 37.5, "lng": 127.0 }
  },
  "emergencyContacts": []
}
```

### POST /api/patients
Create new patient (Protected)

**Request:**
```json
{
  "name": "어르신",
  "age": 75,
  "gender": "female",
  "medicalInfo": {
    "bloodType": "A+",
    "allergies": ["penicillin"],
    "medications": ["aspirin"],
    "conditions": ["hypertension"]
  },
  "location": {
    "address": "서울시 강남구",
    "coordinates": { "lat": 37.5, "lng": 127.0 }
  },
  "emergencyContacts": [
    {
      "name": "보호자",
      "phone": "010-1234-5678",
      "relationship": "daughter"
    }
  ]
}
```

### PUT /api/patients/:patientId
Update patient (Protected, requires patient access)

**Request:**
```json
{
  "name": "Updated Name",
  "age": 76,
  "medicalInfo": { ... }
}
```

### DELETE /api/patients/:patientId
Delete patient (Protected, requires patient access)

### POST /api/patients/:patientId/guardians
Add guardian to patient (Protected, requires patient access)

**Request:**
```json
{
  "guardianEmail": "guardian@example.com"
}
```

### DELETE /api/patients/:patientId/guardians/:guardianId
Remove guardian from patient (Protected, requires patient access)

---

## 📊 Vitals API

### GET /api/vitals/:patientId
Get vital signs for patient (Protected, requires patient access)

**Query Parameters:**
- `limit`: Number of records (default: 100)
- `startTime`: Start timestamp
- `endTime`: End timestamp

**Response:**
```json
[
  {
    "timestamp": 1703001234567,
    "heartRate": 72,
    "respiratoryRate": 16,
    "temperature": 36.5,
    "bloodPressure": {
      "systolic": 120,
      "diastolic": 80
    },
    "oxygenSaturation": 98,
    "activity": "normal",
    "movement": { "x": 0.1, "y": 0.2, "z": 0.3 },
    "confidence": 0.95,
    "source": "sensor"
  }
]
```

### GET /api/vitals/:patientId/latest
Get latest vital signs (Protected, requires patient access)

**Response:**
```json
{
  "timestamp": 1703001234567,
  "heartRate": 72,
  "respiratoryRate": 16,
  "activity": "normal",
  "confidence": 0.95,
  "source": "sensor"
}
```

### POST /api/vitals/:patientId
Submit vital signs (Protected, requires patient access)

**Request:**
```json
{
  "heartRate": 72,
  "respiratoryRate": 16,
  "temperature": 36.5,
  "activity": "normal",
  "source": "smartphone"
}
```

### GET /api/vitals/:patientId/statistics
Get vital statistics (Protected, requires patient access)

**Query Parameters:**
- `period`: Time period (1h, 24h, 7d, 30d)

**Response:**
```json
{
  "period": "24h",
  "count": 100,
  "heartRate": {
    "min": 60,
    "max": 85,
    "avg": 72
  },
  "respiratoryRate": {
    "min": 12,
    "max": 20,
    "avg": 16
  }
}
```

---

## 🚨 Alerts API

### GET /api/alerts/:patientId
Get alerts for patient (Protected, requires patient access)

**Query Parameters:**
- `limit`: Number of alerts (default: 50)
- `status`: Filter by status (pending, acknowledged, resolved)
- `severity`: Filter by severity (low, medium, high, critical)

**Response:**
```json
[
  {
    "id": "alert-uuid",
    "type": "fall",
    "severity": "high",
    "status": "pending",
    "message": "Fall detected",
    "data": { ... },
    "timestamp": 1703001234567,
    "acknowledgedBy": null,
    "acknowledgedAt": null,
    "resolvedAt": null,
    "notificationsSent": {
      "email": false,
      "push": false,
      "sms": false
    }
  }
]
```

### POST /api/alerts/:patientId
Create new alert (Protected, requires patient access)

**Request:**
```json
{
  "type": "fall",
  "severity": "high",
  "message": "Fall detected",
  "data": {
    "location": "bedroom",
    "confidence": 0.95
  }
}
```

### PUT /api/alerts/:patientId/:alertId/acknowledge
Acknowledge alert (Protected, requires patient access)

**Response:**
```json
{
  "id": "alert-uuid",
  "status": "acknowledged",
  "acknowledgedBy": "user-uuid",
  "acknowledgedAt": 1703001234567,
  ...
}
```

### PUT /api/alerts/:patientId/:alertId/resolve
Resolve alert (Protected, requires patient access)

**Response:**
```json
{
  "id": "alert-uuid",
  "status": "resolved",
  "resolvedAt": 1703001234567,
  ...
}
```

### GET /api/alerts/:patientId/statistics
Get alert statistics (Protected, requires patient access)

**Query Parameters:**
- `period`: Time period (24h, 7d, 30d)

**Response:**
```json
{
  "period": "7d",
  "total": 15,
  "byType": {
    "fall": 5,
    "apnea": 3,
    "abnormal_heart_rate": 7
  },
  "bySeverity": {
    "low": 3,
    "medium": 7,
    "high": 4,
    "critical": 1
  },
  "byStatus": {
    "pending": 2,
    "acknowledged": 5,
    "resolved": 8
  },
  "averageResponseTime": 120
}
```

---

## 🔧 System API

### GET /health
Health check endpoint (Public)

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "firebase": "connected",
  "version": "1.0.0"
}
```

### GET /api
API information (Public)

**Response:**
```json
{
  "name": "Premium Care Platform API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "patients": "/api/patients",
    "vitals": "/api/vitals",
    "alerts": "/api/alerts"
  }
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": ["Email is required", "Password must be at least 6 characters"]
}
```

### 401 Unauthorized
```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions",
  "required": ["admin"],
  "current": "guardian"
}
```

### 404 Not Found
```json
{
  "error": "Patient not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Too many requests",
  "retryAfter": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "error": "Service not available in demo mode",
  "message": "Please configure Firebase to enable this feature"
}
```

---

## 📝 Notes

- All timestamps are in milliseconds (Unix epoch)
- All protected endpoints require valid JWT token
- Demo mode is active when Firebase is not configured
- Rate limit: 100 requests per minute per IP
- Maximum request body size: 10MB
