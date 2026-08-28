import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../app";
import User from "../models/User";
import { connectTestDb, closeTestDb, clearTestDb } from "./testDb";

beforeAll(connectTestDb);
afterAll(closeTestDb);
afterEach(clearTestDb);

const createUser = async (overrides: Partial<{ role: string; isActive: boolean }> = {}) => {
  const password = await bcrypt.hash("Password123!", 10);
  return User.create({
    name: "Test User",
    email: "test@attendancecare.com",
    password,
    role: overrides.role || "EMPLOYEE",
    isActive: overrides.isActive ?? true,
  });
};

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and sets a cookie", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@attendancecare.com", password: "Password123!" });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("test@attendancecare.com");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("rejects an invalid password", async () => {
    await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@attendancecare.com", password: "WrongPassword" });

    expect(res.status).toBe(401);
  });

  it("rejects a deactivated account", async () => {
    await createUser({ isActive: false });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@attendancecare.com", password: "Password123!" });

    expect(res.status).toBe(403);
  });
});

describe("authentication middleware", () => {
  it("blocks access to protected routes without a token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("blocks employee access to admin-only routes", async () => {
    await createUser({ role: "EMPLOYEE" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@attendancecare.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app).get("/api/employees").set("Cookie", cookie);

    expect(res.status).toBe(403);
  });

  it("allows admin access to admin-only routes", async () => {
    await createUser({ role: "ADMIN" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@attendancecare.com", password: "Password123!" });

    const cookie = loginRes.headers["set-cookie"];

    const res = await request(app).get("/api/employees").set("Cookie", cookie);

    expect(res.status).toBe(200);
  });
});
