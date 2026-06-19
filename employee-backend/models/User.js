// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["admin", "employee"],
    default: "employee",
  },

  employeeType: {
    type: String,
    enum: [

      "Site Engineer",
      "Mason",
      "Welder",
      "Electrician",
      "Safety Officer",
      "Payroll Executive",
      "HR Executive",
      "Project Coordinator",
      "Carpenter",
      "Supervisor",
      "Store Keeper",
      "Surveyor",
      "Foreman",
      "Operator",
      "Helper",
      "Technician",
      "Manager",
      "Accountant",
      "Civil Engineer",
      "QA Inspector"

    ],
    default: "Helper"
  },

  designation:{
    type:String,
    default:""
  },
  active: {
    type: Boolean,
    default: true,
  },

  

  mustChangePassword: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", userSchema);
