# Spec: Overtime Entry Module

## 1. What is this feature?
A mobile-friendly screen for site managers to log overtime hours for their daily wage workers at the end of a shift.

## 2. Who uses it?
Site Managers. They are usually standing on a noisy construction site, using a cheap smartphone, with spotty 3G data, at the end of a 12-hour shift.

## 3. Acceptance Criteria
- Must show only currently active employees (filter out terminated workers).
- Must enforce hard caps (e.g., max 4 hours OT per day).
- Must handle network drops gracefully (store locally if offline, sync when online).
- Must prevent duplicate submissions (Idempotency keys).

## 4. Real-World Edge Cases (Critical)
- **The "Fat Finger" Error:** Manager types `44` instead of `4` hours. The API must hard-reject any number over the daily max.
- **The "Double Submit" Error:** Network is slow, manager taps submit 3 times. If the API doesn't use an idempotency key, the worker gets 3x overtime pay.
- **The "Offline Shift" Error:** Submitting overtime when `navigator.onLine` is false.

## 5. Questions before dev starts
- If a worker hits the 60-hour monthly overtime cap, does the UI hard block the input, or allow it with a warning for HR approval?
- Does changing a worker's overtime hours recalculate their pending payslip immediately, or via a nightly cron job?

## 6. Given/When/Then Tests
**Given** a site manager submits 4 hours OT with transaction ID "abc-123"
**And** the network drops causing the phone to retry the exact same request
**When** the API receives the second payload with ID "abc-123"
**Then** it returns 200 OK but does NOT insert a second row in the DB.

## 7. Launch Blockers vs V2
**Blocker:** API idempotency keys and hard boundary limits. We do not ship without protecting the payroll.
**V2:** Analytics dashboards showing OT trends per site.
