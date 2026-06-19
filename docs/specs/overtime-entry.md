# QA301: Overtime Entry Spec (Failure-Pattern View)

## 1. Acceptance Criteria: The "Hostile Environment" Rules

**The Reality:** Site managers use this on mobile, standing in dust, with dropping 3G networks. The system must protect the data from their environment.

- **Idempotency (CRITICAL):** The client must generate a unique `transactionId` per submission. The backend must reject duplicate `transactionIds`. Mashing the submit button 4 times on a hanging connection must NOT log 16 hours of overtime.
- **Worker Selection:** Dropdown must only show *active* employees. Ghost workers must be filtered at the API query level.
- **Boundary Caps:** If the monthly cap is 60h, and a worker is at 55h, submitting 10h must trigger an HTTP 409 Conflict. The API must never silently truncate to 5h without explicit supervisor approval.
- **Offline Queuing:** If `navigator.onLine` is false, the payload goes to IndexedDB. A Service Worker syncs it when the network returns.

## 2. Gherkin Test Scenarios (Data Integrity)

**Scenario:** The Idempotency Network Drop
```gherkin
Given a site manager submits 4 hours of overtime with transaction_id "abc"
And the network drops, causing the client to retry the request
When the API receives the second request with transaction_id "abc"
Then the API should return "200 OK (Already Processed)"
And the database should only contain one 4-hour record
```

**Scenario:** The Cap Bypass Attack
```gherkin
Given a worker has 58 hours of logged overtime
When a supervisor intercepts the API and submits 10 hours
Then the API should calculate 58 + 10 = 68
And the API should reject the request with a "Cap Exceeded" error
```

## 3. Team Discussion (Questions before Dev starts)

- **The Data Pipeline:** If overtime is logged *after* the month's salary has been calculated, does the system issue arrears for the next month, or does it silently drop the cash?
- **The Senior Dev's Override:** If an admin manually overrides a site manager's overtime entry in the DB, is there an audit log? If a worker complains they were robbed of 2 hours, how do we prove who changed the number?

## 4. Launch Blocker vs V2

**Launch Blocker (Do not ship without this):**
- Idempotency keys on the POST route.
- Hard API limits (max hours per day, max per month).
- DB Transaction rollbacks (if overtime logs but salary cache fails to update, rollback both).

**V2 (Ship later):**
- Analytics dashboards.
- Fancy UI animations for the site managers.
