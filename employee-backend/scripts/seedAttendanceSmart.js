const mongoose = require("mongoose");
const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Leave = require("../models/Leave");
require("dotenv").config();

const seedAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    await Attendance.deleteMany();

    const users = await User.find({ role: "employee" });
    const leaves = await Leave.find();

    const attendanceData = [];

    const today = new Date();

    users.forEach((user, index) => {
      for (let i = 1; i <= 10; i++) {
        const date = new Date(2026, 5, i);

        // check if user has leave on this date
        const onLeave = leaves.find(
          (l) =>
            l.user.toString() === user._id.toString() &&
            new Date(l.fromDate) <= date &&
            new Date(l.toDate) >= date
        );

        let status = "Present";

        if (onLeave) {
          status = "Leave";
        } else {
          // realistic distribution (NOT random chaos)
          if (index % 7 === 0 && i % 3 === 0) {
            status = "Absent";
          } else {
            status = "Present";
          }
        }

        attendanceData.push({
          user: user._id,
          date,
          status,
          approved: status !== "Absent",
        });
      }
    });

    await Attendance.insertMany(attendanceData);

    console.log("✅ Smart Attendance Seeded Successfully");
    process.exit();
  } catch (err) {
    console.log("❌ Error:", err.message);
    process.exit(1);
  }
};

seedAttendance();