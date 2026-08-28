import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "./db";
import User from "../models/User";
import Attendance from "../models/Attendance";
import LeaveRequest from "../models/LeaveRequest";
import WorkSchedule from "../models/WorkSchedule";

const EMPLOYEES = [
  { name: "Sarah Johnson", email: "sarah.johnson@attendancecare.com" },
  { name: "Michael Chen", email: "michael.chen@attendancecare.com" },
  { name: "Emily Davis", email: "emily.davis@attendancecare.com" },
  { name: "James Wilson", email: "james.wilson@attendancecare.com" },
];

const DEFAULT_PASSWORD = "Employee123!";

const toDateString = (date: Date) => date.toISOString().split("T")[0];

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Attendance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    WorkSchedule.deleteMany({}),
  ]);

  console.log("Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await User.create({
    name: "Admin User",
    email: "admin@attendancecare.com",
    password: adminPassword,
    role: "ADMIN",
    isActive: true,
  });

  console.log("Creating employees...");
  const employeePassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const employees = await User.insertMany(
    EMPLOYEES.map((emp) => ({
      ...emp,
      password: employeePassword,
      role: "EMPLOYEE",
      isActive: true,
    }))
  );

  console.log("Creating work schedules...");
  await WorkSchedule.insertMany(
    employees.map((emp) => ({
      employeeId: emp._id,
      monday: "09:00-17:00",
      tuesday: "09:00-17:00",
      wednesday: "09:00-17:00",
      thursday: "09:00-17:00",
      friday: "09:00-17:00",
      saturday: "OFF",
      sunday: "OFF",
    }))
  );

  console.log("Creating attendance records...");
  const attendanceRecords = [];

  for (let dayOffset = 10; dayOffset >= 1; dayOffset--) {
    const day = new Date();
    day.setDate(day.getDate() - dayOffset);
    const dayOfWeek = day.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const dateStr = toDateString(day);

    for (const emp of employees) {
      const skipRoll = Math.random();

      if (skipRoll < 0.1) continue;

      const clockIn = new Date(day);
      clockIn.setHours(9, Math.floor(Math.random() * 20), 0, 0);

      if (skipRoll < 0.15) {
        attendanceRecords.push({
          employeeId: emp._id,
          date: dateStr,
          clockIn,
          clockOut: null,
          totalHours: 0,
          status: "INCOMPLETE",
        });
        continue;
      }

      const clockOut = new Date(day);
      clockOut.setHours(17, Math.floor(Math.random() * 30), 0, 0);
      const totalHours = Math.round(((clockOut.getTime() - clockIn.getTime()) / 3600000) * 100) / 100;

      attendanceRecords.push({
        employeeId: emp._id,
        date: dateStr,
        clockIn,
        clockOut,
        totalHours,
        status: "PRESENT",
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);

  console.log("Creating leave requests...");
  const today = new Date();
  const inFiveDays = new Date();
  inFiveDays.setDate(today.getDate() + 5);
  const inSevenDays = new Date();
  inSevenDays.setDate(today.getDate() + 7);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(today.getDate() - 14);
  const twelveDaysAgo = new Date();
  twelveDaysAgo.setDate(today.getDate() - 12);

  await LeaveRequest.insertMany([
    {
      employeeId: employees[0]._id,
      startDate: toDateString(inFiveDays),
      endDate: toDateString(inSevenDays),
      reason: "Family vacation",
      status: "PENDING",
    },
    {
      employeeId: employees[1]._id,
      startDate: toDateString(twoWeeksAgo),
      endDate: toDateString(twelveDaysAgo),
      reason: "Medical appointment",
      status: "APPROVED",
    },
    {
      employeeId: employees[2]._id,
      startDate: toDateString(inFiveDays),
      endDate: toDateString(inFiveDays),
      reason: "Personal matters",
      status: "REJECTED",
    },
    {
      employeeId: employees[3]._id,
      startDate: toDateString(inSevenDays),
      endDate: toDateString(inSevenDays),
      reason: "Doctor's appointment",
      status: "PENDING",
    },
  ]);

  console.log("Seed complete.");
  console.log("Admin login: admin@attendancecare.com / Admin123!");
  console.log(`Employee login (any of the 4): ${employees[0].email} / ${DEFAULT_PASSWORD}`);

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
