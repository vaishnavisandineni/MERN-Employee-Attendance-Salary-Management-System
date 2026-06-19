# Risk Identification

## ATTENDANCE → SALARY FLOW RISK
- If attendance is incorrectly marked or missed, salary is automatically wrong. There's no manual adjustment mechanism.

## DUPLICATE ATTENDANCE RISK
- Same employee may be able to mark attendance multiple times if API doesn't properly lock the current date range.

## DELETED EMPLOYEE RISK
- Employee removed from the system but their attendance and salary history remains as orphaned records, potentially crashing dashboard aggregations.

## INVALID DATA RISK
- No validation on extreme values (e.g., submitting leave for 999 days, or huge salary base numbers in DB).

## CONCURRENCY RISK
- Admin approving a leave while employee is marking attendance on the same day could lead to conflicting states.
