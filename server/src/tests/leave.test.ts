import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import User from "../models/User";
import { connectTestDb, closeTestDb, clearTestDb } from "./testDb";

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearTestDb);

const loginAs = async (role: "ADMIN" | "EMPLOYEE", email: string) => {
  const password = await bcrypt.hash("Password123!", 10);
  await User.create({
    name: "Test User",
    email,
    password,
    role,
    isActive: true,
  });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email, password: "Password123!" });

  return loginRes.headers["set-cookie"];
};

describe("leave requests", () => {
  it("allows an employee to create a leave request", async () => {
    const cookie = await loginAs("EMPLOYEE", "employee@attendancecare.com");

    const res = await request(app)
      .post("/api/leaves")
      .set("Cookie", cookie)
      .send({ startDate: "2026-09-01", endDate: "2026-09-03", reason: "Family trip" });

    expect(res.status).toBe(201);
    expect(res.body.leave.status).toBe("PENDING");
  });

  it("rejects a leave request with an invalid date range", async () => {
    const cookie = await loginAs("EMPLOYEE", "employee@attendancecare.com");

    const res = await request(app)
      .post("/api/leaves")
      .set("Cookie", cookie)
      .send({ startDate: "2026-09-05", endDate: "2026-09-01", reason: "Invalid range" });

    expect(res.status).toBe(400);
  });

  it("allows an admin to approve a leave request", async () => {
    const employeeCookie = await loginAs("EMPLOYEE", "employee@attendancecare.com");

    const createRes = await request(app)
      .post("/api/leaves")
      .set("Cookie", employeeCookie)
      .send({ startDate: "2026-09-01", endDate: "2026-09-03", reason: "Family trip" });

    const adminCookie = await loginAs("ADMIN", "admin@attendancecare.com");

    const res = await request(app)
      .patch(`/api/leaves/${createRes.body.leave._id}`)
      .set("Cookie", adminCookie)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.leave.status).toBe("APPROVED");
  });

  it("blocks an employee from approving leave requests", async () => {
    const employeeCookie = await loginAs("EMPLOYEE", "employee@attendancecare.com");

    const createRes = await request(app)
      .post("/api/leaves")
      .set("Cookie", employeeCookie)
      .send({ startDate: "2026-09-01", endDate: "2026-09-03", reason: "Family trip" });

    const res = await request(app)
      .patch(`/api/leaves/${createRes.body.leave._id}`)
      .set("Cookie", employeeCookie)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(403);
  });
});
