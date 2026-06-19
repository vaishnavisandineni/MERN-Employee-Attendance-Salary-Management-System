# Risk Map

### 1. Duplicate Attendance Exploit
- **Top Risk:** Employees or API bugs submit 'Present' multiple times for the same day.
- **Who gets hurt:** The Business / Company.
- **Financial/Operational Impact:** Severe financial loss due to overpayment of daily wages.
- **Where bug is likely to occur:** `/api/attendance/mark` due to missing DB-level unique constraints on `(user_id, date)`.

### 2. Orphaned Data Crashing Payroll
- **Top Risk:** Admin deletes an employee, but their old attendance records remain and return `null` for `.populate("user")`.
- **Who gets hurt:** Payroll Operators / The Entire Workforce.
- **Financial/Operational Impact:** The entire Admin Dashboard and Salary module crashes, preventing payroll processing for everyone.
- **Where bug is likely to occur:** `/api/auth/delete` not cascading deletes to Attendance/Leave/Salary collections.

### 3. Missing Attendance Data Loss
- **Top Risk:** An employee marks attendance, but network fails or DB connection drops, and UI says 'Success' but DB is empty.
- **Who gets hurt:** Construction Workers.
- **Financial/Operational Impact:** Unpaid wages. Extreme distress for workers living paycheck to paycheck.
- **Where bug is likely to occur:** Frontend state not verifying actual `201 Created` status or offline queue failing.

### 4. Huge Date Range in Leave Requests
- **Top Risk:** Submitting a leave from today until year 9999.
- **Who gets hurt:** Business / Admin.
- **Financial/Operational Impact:** Pollutes the database and skews all dashboard 'Approved Leaves' aggregations permanently.
- **Where bug is likely to occur:** `/api/leave/apply` lacking input validation for sensible date ranges.

### 5. Salary Calculation Race Condition
- **Top Risk:** Admin calculates monthly salary at the exact same moment a supervisor approves an old leave request.
- **Who gets hurt:** Construction Worker.
- **Financial/Operational Impact:** Underpayment because the leave wasn't counted in the snapshot used for payroll.
- **Where bug is likely to occur:** `/api/salary/calculate` not locking rows or checking for recent updates.
