const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");

describe("Smoke Tests", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("App starts and returns 404 for unknown route", async () => {
    const res = await request(app).get("/random-unknown-path");
    expect(res.statusCode).toBe(404);
  });

  it("API is reachable: Login endpoint exists", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    // Even if it fails auth, it shouldn't be 404
    expect(res.statusCode).not.toBe(404);
  });

  it("Salary endpoints are reachable", async () => {
    const res = await request(app).get("/api/salary/all");
    // Should return 401 Unauthorized since we didn't pass token, proving it's alive and protected
    expect(res.statusCode).toBe(401);
  });
});
