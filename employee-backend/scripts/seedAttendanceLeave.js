const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
const Salary = require("../models/Salary");
require("dotenv").config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    // clear old data
    await Attendance.deleteMany();
    await Leave.deleteMany();
    await Salary.deleteMany();

    const users = await User.find({ role: "employee" });

    const attendanceData = [];
    const leaveData = [];
    const salaryData = [];

    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    users.forEach((user) => {
      // Attendance (random realistic data)
      for (let i = 1; i <= 20; i++) {
        attendanceData.push({
          user: user._id,
          date: new Date(2026, 5, i),
          status: i % 5 === 0 ? "Leave" : i % 7 === 0 ? "Absent" : "Present",
          approved: true,
        });
      }

      // Leave requests
      leaveData.push({
        user: user._id,
        fromDate: new Date(2026, 5, 10),
        toDate: new Date(2026, 5, 12),
        reason: "Personal Work",
        status: "pending",
        type: "full",
        category: "Casual Leave",
      });

      // Salary
      months.forEach((m, idx) => {
        const workingDays = 22;
        const presents = 18;
        const leaveDays = 2;
        const absents = workingDays - presents;

        const base = 50000;
        const salary = (presents / workingDays) * base;

        salaryData.push({
          user: user._id,
          month: m,
          workingDays,
          presents,
          leaveDays,
          absents,
          baseMonthlySalary: base,
          salary: Math.round(salary),
          status: "Unpaid",
        });
      });
    });

    await Attendance.insertMany(attendanceData);
    await Leave.insertMany(leaveData);
    await Salary.insertMany(salaryData);

    console.log("✅ Attendance + Leave + Salary seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

seed();