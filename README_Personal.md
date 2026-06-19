#  Employee Attendance & Salary Management System (MERN)

##  Project Overview

This project is a full-stack Employee Management System built using the MERN stack (MongoDB, Express, React, Node.js).  

It allows admins to manage employees, attendance, leave requests, and salary calculations, while employees can mark attendance, request leaves, and view salary records.

---

##  Project Source

- **Original Repository:** (Forked from provided assessment repo)
- **My Local Setup:** Cloned and modified for functionality completion

---

##  Setup Process Followed

### 1. Fork & Clone
```bash
git clone <repo-url>
cd MERN-Employee-Attendance-Salary-Management-System
```

### 2. Backend Setup
```bash
cd employee-backend
npm install
```

### 3. Environment Setup

Created `.env` file:
```env
PORT=8080
MONGO_URI=mongodb://127.0.0.1:27017/employee_management
JWT_SECRET=your_secret_key
```

### 4. Database Setup

Started MongoDB locally:
```bash
mongosh
```

### 5. Data Seeding

Created and executed seed script:
```bash
node scripts/seed.js
```

This inserted:
- 1 Admin user
- 20 Employees (Site Engineer, Mason, Welder, etc.)

---

##  Key Changes Made

###  Authentication
- Initially login was failing due to missing/invalid data.
- Fixed login flow using seeded MongoDB users.
- Ensured `bcrypt` password hashing compatibility.
- Added test admin credentials via seed data.

###  User Data (Seeding)
- Created `seed.js` to insert 20+ employees + 1 admin.
- Standardized roles: `admin`, `employee`.
- Assigned realistic construction/project roles like:
  - Site Engineer
  - Mason
  - Welder
  - Electrician
  - Safety Officer
  - QA Inspector, etc.

###  Attendance Module
- Added seeded attendance structure (Present/Absent/Leave).
- Linked attendance records with user IDs.
- Enabled dashboard summary calculations.

###  Leave Management
- Seeded leave requests for multiple employees.
- Status types:
  - Pending
  - Approved
  - Rejected
- Admin approval/rejection flow enabled.

###  Salary Module
- Salary records generated per employee.
- Monthly salary breakdown included:
  - Working days
  - Presents
  - Absents
- Calculated salary based on attendance.
- Admin can view salary history.

### Dashboard Fixes
- Fixed empty dashboard issue by ensuring DB relationships.
- Added proper aggregation for:
  - Present employees
  - Approved leaves
  - Unapproved attendance

---

##  Testing Credentials

### Admin Login
- **Email:** `admin@test.com`
- **Password:** `Admin123`

### Employee Login Example
- **Email:** `rahul.kumar@test.com`
- **Password:** `Pass123`

---

##  Tech Stack
- React.js (Frontend)
- Node.js (Backend)
- Express.js (API Layer)
- MongoDB (Database)
- Mongoose (ODM)
- bcryptjs (Password Hashing)
- JWT (Authentication)

---

##  Screenshots

🔹 **Login Page**
![alt text](<screenshots\Screenshot (145).png>)

🔹 **Admin Dashboard**
![alt text](<screenshots\Screenshot (137).png>)

🔹 **Manage Leave request**

![alt text](<screenshots\Screenshot (138).png>)

🔹 **Employees attendance**

![alt text](<screenshots\Screenshot (139).png>)

🔹 **Salary overview**

![alt text](<screenshots\Screenshot (140).png>)
![alt text](<screenshots\Screenshot (141).png>)

🔹 **Reset password**

![alt text](<screenshots\Screenshot (143).png>)

🔹 **Create employee**

![alt text](<screenshots\Screenshot (144).png>)

---

##  How to Run Project

### Backend
```bash
cd employee-backend
node server.js
```

### Frontend
```bash
cd employee-frontend
npm install
npm start
```

---

##  Important Notes
- MongoDB must be running locally.
- Seed script must be executed before login.
- All authentication depends on seeded users.
- Attendance/leave/salary depend on MongoDB relations.

---

##  Status

- ✔ Authentication working
- ✔ Employees seeded
- ✔ Attendance module functional
- ✔ Leave system functional
- ✔ Salary module functional
- ✔ Dashboard data connected
