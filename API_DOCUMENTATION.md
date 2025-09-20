# Agro Support API Documentation

This document provides comprehensive API documentation for the Agro Support application based on real implementation and payloads.

## Base URLs

- **Auth Backend**: `http://10.12.121.192:3000` (Development)
- **Production**: `https://auth-service-sih.onrender.com`

## Authentication Flow

### 1. Health Check

**Endpoint**: `GET /auth/health`

**Description**: Check if the authentication service is running

**Request**:
```http
GET /auth/health
Content-Type: application/json
```

**Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-09-20T07:51:54.000Z"
}
```

**Status Code**: `200 OK`

---

### 2. Firebase Authentication Verification

**Endpoint**: `POST /auth/verify-firebase`

**Description**: Verify Firebase ID token and create/login user

**Request**:
```http
POST /auth/verify-firebase
Content-Type: application/json

{
  "idToken": "eyJhbGciOiJSUzI1NiIs...",
  "phoneNumber": "+916350194264",
  "uid": "uJviDwrF1TZjW6Z8N8bwpXb6TqE3"
}
```

**Real Payload Example**:
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjVlNmVkNzJkNzc2YzY4ZjQyNzJkNzc2YzY4ZjQyNzJkNzc2YzY4ZjQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FtcHVzLWN1cGlkLW11bHRpdmVyc2UiLCJhdWQiOiJjYW1wdXMtY3VwaWQtbXVsdGl2ZXJzZSIsImF1dGhfdGltZSI6MTc1ODM1NDcxNCwidXNlcl9pZCI6InVKdmlEd3JGMVRaanc2WjhOOGJ3cFhiNlRxRTMiLCJzdWIiOiJ1SnZpRHdyRjFUWmp3Nlo4Tjhid3BYYjZUcUUzIiwiaWF0IjoxNzU4MzU0NzE0LCJleHAiOjE3NTgzNTgzMTQsInBob25lX251bWJlciI6Iis5MTYzNTAxOTQyNjQiLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7InBob25lIjpbIis5MTYzNTAxOTQyNjQiXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwaG9uZSJ9fQ...",
  "phoneNumber": "+916350194264",
  "uid": "uJviDwrF1TZjW6Z8N8bwpXb6TqE3"
}
```

**Response**:
```json
{
  "message": "Firebase authentication successful",
  "session": {
    "expires": "2025-09-27T07:51:54.000Z",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjbHhtZnBsMnY0Mm05dDJhbWlpbGUiLCJwaG9uZU51bWJlciI6Iis5MTYzNTAxOTQyNjQiLCJyb2xlIjoiRkFSTUVSIiwiaWF0IjoxNzU4MzU0NzE0LCJleHAiOjE3NTg5NTk1MTQsImF1ZCI6ImFncm8tZnJvbnRlbmQiLCJpc3MiOiJhZ3JvLWF1dGgtc2VydmljZSJ9.PXMijBQTkuamA_-c7UuP5059m1VER6-AgccbTfLkHsc"
  },
  "success": true,
  "user": {
    "firebaseUID": "uJviDwrF1TZjW6Z8N8bwpXb6TqE3",
    "id": "clxmfpl2v42m9t2amiile",
    "isNewUser": false,
    "name": "Test Farmer",
    "phoneNumber": "+916350194264",
    "role": "FARMER"
  }
}
```

**Status Code**: `201 Created`

**Response Headers**:
```
access-control-allow-credentials: true
connection: keep-alive
content-length: 584
content-type: application/json; charset=utf-8
date: Sat, 20 Sep 2025 07:51:54 GMT
etag: W/"248-F2sy8LYL436URzqojUqSmVoun+E"
keep-alive: timeout=5
vary: Origin
x-powered-by: Express
```

---

### 3. Complete Profile

**Endpoint**: `POST /auth/complete-profile`

**Description**: Complete user profile after initial authentication

**Request**:
```http
POST /auth/complete-profile
Content-Type: application/json
Authorization: Bearer <session_token>

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "Test Farmer",
  "village": "Test Village",
  "district": "Test District",
  "state": "Test State",
  "farmSize": 5.5,
  "cropTypes": ["wheat", "rice"],
  "language": "hindi",
  "role": "FARMER"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Profile completed successfully",
  "farmer": {
    "id": "clxmfpl2v42m9t2amiile",
    "name": "Test Farmer",
    "phoneNumber": "+916350194264",
    "village": "Test Village",
    "district": "Test District",
    "state": "Test State",
    "farmSize": 5.5,
    "cropTypes": ["wheat", "rice"],
    "language": "hindi",
    "role": "FARMER",
    "isNewUser": false
  }
}
```

**Status Code**: `200 OK`

---

## JWT Token Structure

### Session Token Payload
```json
{
  "sub": "clxmfpl2v42m9t2amiile",
  "phoneNumber": "+916350194264",
  "role": "FARMER",
  "iat": 1758354714,
  "exp": 1758959514,
  "aud": "agro-frontend",
  "iss": "agro-auth-service"
}
```

### Token Expiration
- **Session Token**: 7 days from issue
- **Refresh Token**: 30 days from issue

---

## User Roles

### FARMER
- Can access farming-related features
- Can manage crops and farm data
- Can access weather and market information

### RETAILER
- Can access retail-related features
- Can manage inventory and sales
- Can access market trends and pricing

---

## Error Responses

### Authentication Errors

**Invalid Token**:
```json
{
  "success": false,
  "message": "Invalid or expired token",
  "error": "INVALID_TOKEN"
}
```
**Status Code**: `401 Unauthorized`

**Missing Required Fields**:
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "VALIDATION_ERROR",
  "details": ["name is required", "phoneNumber is required"]
}
```
**Status Code**: `400 Bad Request`

**Server Error**:
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "INTERNAL_ERROR"
}
```
**Status Code**: `500 Internal Server Error`

---

## Rate Limiting

- **Authentication endpoints**: 10 requests per minute per IP
- **Profile endpoints**: 20 requests per minute per user
- **General endpoints**: 100 requests per minute per user

---

## Security Headers

All API responses include the following security headers:
- `access-control-allow-credentials: true`
- `vary: Origin`
- `x-powered-by: Express`

---

## Environment Variables

```env
EXPO_PUBLIC_AUTH_BACKEND_URL=http://10.12.121.192:3000
EXPO_PUBLIC_EMBEDDING_SERVICE_URL=http://localhost:5001
```

---

## Testing Credentials

**Test Phone Number**: `+916350194264`
**Test OTP**: `123456` (Development only)
**Test Firebase UID**: `uJviDwrF1TZjW6Z8N8bwpXb6TqE3`

---

## Logging Format

All API calls are logged with the following format:
```
🔍 [Component]: [Action] - [Details]
✅ [Component]: [Success Message]
❌ [Component]: [Error Message]
📱 [Component]: [Phone/SMS Related]
🎫 [Component]: [Token Related]
💾 [Component]: [Storage Related]
🌐 [Component]: [Network Related]
📤 [Component]: [Request Payload]
📥 [Component]: [Response Data]
```

Example:
```
🔍 Login: Testing backend connectivity...
✅ Login: Backend health check status: 200
🌐 Login: Making backend request to: http://10.12.121.192:3000/auth/verify-firebase
📤 Login: Request payload: {"idToken": "eyJhbGciOiJSUzI1NiIs...", "phoneNumber": "+916350194264", "uid": "uJviDwrF1TZjW6Z8N8bwpXb6TqE3"}
📥 Login: Backend response status: 201
✅ Backend verification successful
💾 Login: About to store user data
✅ Login: User data stored successfully
```