# Bug-1: Network Drops Cause Duplicate Overtime Pay

**Severity:** Critical (Direct wage theft/inflation)

**Steps to reproduce:**
1. Login as Site Manager on a throttled 3G connection (simulate in DevTools).
2. Enter 4 hours of overtime for a worker.
3. Because the network is slow, the UI hangs.
4. Tap 'Submit' two more times before the first request finishes.

**Expected behavior:** 
The backend sees 3 identical requests for the same shift, rejects the duplicates, and logs exactly 4 hours.

**Actual behavior:** 
The API blindly accepts all 3 requests. The worker gets 12 hours of overtime logged for a single day.

**Impact:**
- **Who loses money:** The company.
- **Why this happens in the real world:** Construction site managers have terrible cell reception and frequently double-tap unresponsive buttons.

**Root cause guess:**
No idempotency key on the API route and no strict database constraint preventing duplicate `[user, date, type]` combinations.
