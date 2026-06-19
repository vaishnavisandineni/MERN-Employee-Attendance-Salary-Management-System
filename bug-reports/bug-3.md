# Bug-3: Salary Changes Do Not Update Pending Payslips

**Severity:** Critical (Direct wage loss to worker)

**Steps to reproduce:**
1. Worker has a base salary of ₹1000/day. They work 20 days.
2. Mid-month, HR updates their base salary to ₹1500/day.
3. At the end of the month, Admin generates the payroll.

**Expected behavior:** 
The payroll calculation uses the new ₹1500 rate (or correctly prorates the split).

**Actual behavior:** 
The payslip uses the old, cached ₹1000 rate. The worker gets ₹20,000 instead of ₹30,000. The HR UI shows "Update Successful" but the downstream financial data drifted silently.

**Impact:**
- **Who loses money:** The worker. They get ₹10,000 less this month and don't know why. Trust is broken.

**Root cause guess:**
Data propagation failure. The `User` table and the `Salary` calculation logic are detached. Changing a base salary does not flag existing attendance/pending payslips as "dirty" to force a recalculation.
