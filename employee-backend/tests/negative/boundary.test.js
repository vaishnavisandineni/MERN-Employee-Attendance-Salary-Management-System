// negative/boundary.test.js
const request = require("supertest");
const app = require("../../server");

describe("Negative Testing: Boundary and Type Checks", () => {
  it("should reject negative base salary", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad Employee",
      email: "bad@test.com",
      password: "123",
      role: "employee",
      baseSalary: -500 // Boundary check
    });
    // Expected to fail validation
    expect(res.statusCode).toBe(400);
  });

  it("should sanitize XSS inputs in leave reason", async () => {
    const res = await request(app).post("/api/leave/apply").send({
      startDate: "2023-10-01",
      endDate: "2023-10-02",
      reason: "<script>alert(1)</script>"
    });
    // Reason should be sanitized or rejected
    expect(res.body.reason).not.toContain("<script>");
  });
});
