# System Flow & Employee Lifecycle

## 1. Onboarding
- **Input:** Admin inputs employee details (Name, Email, Password, Base Salary, Role).
- **Output:** New User document in MongoDB.
- **API/Screen:** `/api/auth/register` | Admin 'Create Employee' Screen.
- **Failure Impact:** Employee cannot log in or be tracked; they essentially "don't exist" in the payroll system.

## 2. Attendance
- **Input:** Employee clicks "Mark Attendance".
- **Output:** Attendance document created for today's date.
- **API/Screen:** `/api/attendance/mark` | Employee Dashboard.
- **Failure Impact:** A lost day of pay for a daily wage worker. Severe human impact.

## 3. Overtime
- **Input:** Supervisor/Employee logs extra hours worked.
- **Output:** Overtime record (or modified attendance record).
- **API/Screen:** `/api/attendance/overtime` (Planned feature).
- **Failure Impact:** Unpaid extra labor.

## 4. Leave
- **Input:** Employee selects start/end dates and submits reason.
- **Output:** Leave document with 'Pending' status.
- **API/Screen:** `/api/leave/apply` | Leave Management Screen.
- **Failure Impact:** Denied legitimate time off or unpaid sick days if the system rejects valid requests.

## 5. Salary Calculation
- **Input:** Admin navigates to Salary Module. System aggregates 'Present' + 'Approved Leaves'.
- **Output:** Final payable amount generated for the month.
- **API/Screen:** `/api/salary/calculate` | Salary Overview Screen.
- **Failure Impact:** Gross miscalculation of the entire workforce's pay. If the aggregation fails, nobody gets paid.

## 6. Payslip & Payroll Export
- **Input:** Final calculated salaries.
- **Output:** Exportable list or payslips for bank transfer.
- **API/Screen:** Admin Dashboard Export (Feature).
- **Failure Impact:** Delays in actual bank transfers.
