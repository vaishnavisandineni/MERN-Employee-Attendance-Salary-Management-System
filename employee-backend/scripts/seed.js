const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const employees = [
  {
    name: "HR Admin",
    email: "admin@test.com",
    password: "Admin123",
    role: "admin",
    employeeType: "Manager",
  },
  {
    name: "Rahul Kumar",
    email: "rahul.kumar@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Site Engineer",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Mason",
  },
  {
    name: "Arjun Singh",
    email: "arjun.singh@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Welder",
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Electrician",
  },
  {
    name: "Vikram Patel",
    email: "vikram.patel@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Safety Officer",
  },
  {
    name: "Kavya Nair",
    email: "kavya.nair@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Payroll Executive",
  },
  {
    name: "Suresh Yadav",
    email: "suresh.yadav@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "HR Executive",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Project Coordinator",
  },
  {
    name: "Ravi Teja",
    email: "ravi.teja@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Carpenter",
  },
  {
    name: "Divya Menon",
    email: "divya.menon@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Supervisor",
  },
  {
    name: "Akash Verma",
    email: "akash.verma@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Store Keeper",
  },
  {
    name: "Pooja Das",
    email: "pooja.das@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Surveyor",
  },
  {
    name: "Manoj Kumar",
    email: "manoj.kumar@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Foreman",
  },
  {
    name: "Harsha Reddy",
    email: "harsha.reddy@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Operator",
  },
  {
    name: "Lakshmi Devi",
    email: "lakshmi.devi@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Helper",
  },
  {
    name: "Rohit Jain",
    email: "rohit.jain@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Technician",
  },
  {
    name: "Meghana Rao",
    email: "meghana.rao@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Manager",
  },
  {
    name: "Satish Kumar",
    email: "satish.kumar@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Accountant",
  },
  {
    name: "Keerthi Reddy",
    email: "keerthi.reddy@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "Civil Engineer",
  },
  {
    name: "Nikhil Sharma",
    email: "nikhil.sharma@test.com",
    password: "Pass123",
    role: "employee",
    employeeType: "QA Inspector",
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany(); // clean old data

    const hashedUsers = await Promise.all(
      employees.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
        mustChangePassword: false,
      }))
    );

    await User.insertMany(hashedUsers);

    console.log("✅ Seed Data Inserted Successfully");
    process.exit();
  } catch (err) {
    console.log("❌ Seed Error:", err.message);
    process.exit(1);
  }
};

seedDB();