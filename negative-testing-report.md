# Negative Testing Audit

I attacked the HRMS API simulating a broken frontend and malicious input to see if the backend protects the payroll data.

### 1. The Fat-Finger Float
**Endpoint:** `PUT /api/auth/update/123`
**Payload:**
```json
{
  "baseSalary": -1500.50
}
```
**Response:**
```json
// Status: 200 OK
{
  "message": "User updated successfully",
  "user": { "baseSalary": -1500.50 }
}
```
**Result:** FAIL. The API accepted a negative salary. This will cause the payroll system to deduct money from the worker instead of paying them.

### 2. The Time Traveler (Leave API)
**Endpoint:** `POST /api/leave/apply`
**Payload:**
```json
{
  "startDate": "2023-01-01",
  "endDate": "9999-12-31",
  "reason": "Sick"
}
```
**Response:**
```json
// Status: 201 Created
{
  "message": "Leave requested successfully"
}
```
**Result:** FAIL. The system accepted an 8000-year leave request. This corrupts dashboard aggregations and breaks UI rendering.

### 3. The Double Submit (Idempotency check)
**Endpoint:** `POST /api/attendance/mark`
**Payload:**
Sent the exact same valid "Present" payload 3 times in 50ms using a script.
**Response:**
All 3 requests returned `201 Created`.
**Result:** FAIL. The worker now has 3 attendance records for the exact same day, inflating their monthly pay by 3x.

### 4. The Object Injector (Auth Bypass)
**Endpoint:** `POST /api/auth/login`
**Payload:**
```json
{
  "email": {"$gt": ""},
  "password": "pass"
}
```
**Response:**
```json
// Status: 400 Bad Request
{
  "message": "Invalid credentials"
}
```
**Result:** PASS. Mongoose/Express successfully rejected the NoSQL injection attempt.

## Conclusion
The backend currently relies entirely on the React frontend to send clean data. If the frontend freezes, or someone bypasses it to hit the API directly, the payroll breaks immediately. We need strict schema validation (Joi/Zod) on all POST/PUT routes.
