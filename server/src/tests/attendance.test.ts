import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import User from "../models/User";
import { connectTestDb, closeTestDb, clearTestDb } from "./testDb";

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearTestDb);

const loginAsEmployee = async () => {
  const password = await bcrypt.hash("Password123!", 10);
  await User.create({
    name: "Employee One",
    email: "employee@attendancecare.com",
    password,
    role: "EMPLOYEE",
    isActive: true,
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: "employee@attendancecare.com", password: "Password123!" });

  return loginRes.headers["set-cookie"];
};

describe("attendance clock-in/clock-out", () => {
  it("allows an employee to clock in", async () => {
    const cookie = await loginAsEmployee();

    const res = await request(app).post("/api/attendance/clock-in").set("Cookie", cookie);

    expect(res.status).toBe(201);
    expect(res.body.record.status).toBe("INCOMPLETE");
    expect(res.body.record.clockIn).not.toBeNull();
  });

  it("prevents a duplicate clock-in on the same day", async () => {
    const cookie = await loginAsEmployee();

    await request(app).post("/api/attendance/clock-in").set("Cookie", cookie);
    const res = await request(app).post("/api/attendance/clock-in").set("Cookie", cookie);

    expect(res.status).toBe(409);
  });

  it("prevents clocking out before clocking in", async () => {
    const cookie = await loginAsEmployee();

    const res = await request(app).post("/api/attendance/clock-out").set("Cookie", cookie);

    expect(res.status).toBe(400);
  });

  it("allows clocking out after clocking in and calculates total hours", async () => {
    const cookie = await loginAsEmployee();

    await request(app).post("/api/attendance/clock-in").set("Cookie", cookie);
    const res = await request(app).post("/api/attendance/clock-out").set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.record.status).toBe("PRESENT");
    expect(res.body.record.clockOut).not.toBeNull();
    expect(res.body.record.totalHours).toBeGreaterThanOrEqual(0);
  });
});
