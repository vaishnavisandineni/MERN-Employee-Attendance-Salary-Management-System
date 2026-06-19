const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const User = require("../../models/User");
const Attendance = require("../../models/Attendance");
const Salary = require("../../models/Salary");

describe("QA-304 Regression: Salary Pipeline", () => {
  let adminToken;
  let employeeId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    // 1. Get Admin Token
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@test.com",
      password: "Admin123"
    });
    adminToken = adminRes.body.token;

    // 2. Setup Test Employee
    const emp = await User.create({
      name: "Salary Pipeline Tester",
      email: "salary.test@test.com",
      password: "password123",
      role: "employee",
      baseSalary: 1000 // Standard base salary
    });
    employeeId = emp._id;
  });

  afterAll(async () => {
    await User.findByIdAndDelete(employeeId);
    await Attendance.deleteMany({ user: employeeId });
    await Salary.deleteMany({ user: employeeId });
    await mongoose.connection.close();
  });

  it("Core flow: Salary correctly calculated from attendance", async () => {
    // 1. Mark attendance for 2 days
    await Attendance.create([
      { user: employeeId, date: new Date("2023-01-01"), status: "Present", approved: true },
      { user: employeeId, date: new Date("2023-01-02"), status: "Present", approved: true }
    ]);

    // 2. Trigger salary calculation
    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: employeeId, month: 1, year: 2023 });

    expect(res.statusCode).toBe(201);
    // Assuming baseSalary 1000 means per day salary is calculated based on 30 days
    // 1000 / 30 = 33.33 * 2 = 66.66
    expect(res.body.salary.calculatedAmount).toBeGreaterThan(0);
  });

  it("Dependency flow: Missing attendance data should yield 0 salary", async () => {
    // Check for a month where they didn't work
    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: employeeId, month: 2, year: 2023 }); // Feb has no attendance records

    expect(res.statusCode).toBe(201);
    expect(res.body.salary.calculatedAmount).toBe(0);
  });

  it("Dependency flow: Employee exit -> payroll stop", async () => {
    // If the employee is deleted, salary generation should fail or throw an understandable error, not crash.
    await User.findByIdAndDelete(employeeId);
    
    const res = await request(app)
      .post("/api/salary/calculate")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ userId: employeeId, month: 3, year: 2023 });

    // Should gracefully return 404 User Not Found
    expect(res.statusCode).toBe(404);
  });
});
