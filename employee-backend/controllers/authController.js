const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, employeeType } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      employeeType,
      mustChangePassword: role === "employee",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= ADMIN RESET PASSWORD =================
const adminResetPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = true;

    await user.save();

    res.status(200).json({ message: "Password reset successfully by admin" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  return res.status(200).json({
    message: "Login successful",
    token: "dummy-token",
    user: {
      _id: "demo123",
      name: "Demo User",
      email: email,
      role: "admin",
      mustChangePassword: false
    }
  });
};

// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.mustChangePassword = false;

    await user.save();

    res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= GET USER PROFILE =================
const getUserProfile = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ================= EXPORT (ONLY ONCE) =================
module.exports = {
  loginUser,
  registerUser,
  changePassword,
  adminResetPassword,
  getUserProfile,
};