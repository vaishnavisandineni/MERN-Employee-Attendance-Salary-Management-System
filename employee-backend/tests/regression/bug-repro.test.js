const request = require("supertest");
const app = require("../../server"); // Assuming Express app export
const mongoose = require("mongoose");
const Attendance = require("../../models/Attendance");
const User = require("../../models/User");

describe("Bug Repro: Admin Dashboard Crash on Deleted Employee", () => {
  let adminToken;
  let testEmployeeId;

  beforeAll(async () => {
    // Setup connection
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Authenticate as Admin
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "Admin123"
    });
    adminToken = adminRes.body.token;

    // 2. Create test employee
    const user = await User.create({
      name: "Test Delete User",
      email: "test.delete@test.com",
      password: "Pass123",
      role: "employee",
      baseSalary: 1000
    });
    testEmployeeId = user._id;

    // 3. Mark attendance for test employee
    await Attendance.create({
      user: testEmployeeId,
      date: new Date(),
      status: "Present",
      approved: false
    });
  });

  afterAll(async () => {
    await Attendance.deleteMany({ user: testEmployeeId });
    await User.findByIdAndDelete(testEmployeeId);
    await mongoose.connection.close();
  });

  it("should fail BEFORE fix: Getting dashboard overview with orphaned attendance throws error", async () => {
    // Delete the user BUT leave their attendance record (simulating the bug)
    await User.findByIdAndDelete(testEmployeeId);

    // Hit the dashboard overview API
    const res = await request(app)
      .get("/api/attendance/today")
      .set("Authorization", `Bearer ${adminToken}`);

    // BEFORE FIX: The API throws a 500 error because map() fails on a null populated user
    // Expected output in failing state: 500 Server Error
    expect(res.statusCode).toBe(500); 
    expect(res.body.message).toContain("Server error");
  });

  // it("should pass AFTER fix: Getting dashboard ignores null users", async () => {
  //   const res = await request(app)
  //     .get("/api/attendance/today")
  //     .set("Authorization", `Bearer ${adminToken}`);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty("present");
  //   // The null user should have been filtered out
  // });
});
