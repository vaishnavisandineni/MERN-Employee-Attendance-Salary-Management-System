# Bug-2: Deactivated Employee Crashes Payroll Screen

**Severity:** High (Blocks core business process)

**Steps to reproduce:**
1. Ensure a worker has active attendance records for the month.
2. Delete the worker's user profile from the database (simulating a termination/abrupt exit).
3. Try to load the Admin Salary/Payroll dashboard to process wages for the rest of the company.

**Expected behavior:** 
The system skips the deleted worker or shows them as "Terminated", but successfully generates payroll for the 49 other active workers.

**Actual behavior:** 
The entire screen throws a 500 Server Error. The backend attempts to look up the base salary of a `null` user object and crashes.

**Impact:**
- **Who loses time/money:** Everyone. Payroll is blocked for the entire company because one worker left.

**Root cause guess:**
Missing foreign key cascade logic. Deleting a User leaves orphaned Attendance records. When the salary controller runs `.populate('user')`, it gets null and crashes when calling `user.baseSalary`.
