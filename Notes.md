# App Observations (Scratchpad)

## LOGIN FLOW
- Admin login works with seeded credentials
- JWT token is returned from backend and stored in localStorage
- Correctly redirects to dashboard after successful login

## ADMIN DASHBOARD
- Shows employee count accurately based on seeded data
- Shows salary summary and total approved leaves
- Dashboard charts and aggregations load properly

## EMPLOYEE FLOW
- Can mark attendance via dashboard button
- Can request leave (requires start date, end date, reason)
- Can view generated salary reports for past months

## ATTENDANCE
- Daily attendance marking exists (defaults to Present when clicked)
- No duplicate check observed at frontend level (needs testing if API blocks it)
- Admin can approve/reject attendance

## SALARY
- Calculated automatically from attendance (Present/Absent days)
- No manual override or edit found in admin UI

## LEAVE SYSTEM
- Employee submits leave request (Pending status initially)
- Admin sees request in Leave Management and can approve/reject
- Approved leaves factor into salary / attendance overview
