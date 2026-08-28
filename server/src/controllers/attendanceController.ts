import { Request, Response } from "express";
import Attendance from "../models/Attendance";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";
import { getTodayDateString, calculateTotalHours } from "../services/attendanceService";
import { buildAttendanceCsv } from "../utils/csv";

export const getAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, date, month, status } = req.query;

  const filter: Record<string, unknown> = {};

  if (req.user!.role === "EMPLOYEE") {
    filter.employeeId = req.user!.userId;
  } else if (employeeId) {
    filter.employeeId = employeeId;
  }

  if (date) {
    filter.date = date;
  } else if (month) {
    filter.date = { $regex: `^${month}` };
  }

  if (status) {
    filter.status = status;
  }

  const records = await Attendance.find(filter)
    .populate("employeeId", "name email")
    .sort({ date: -1 });

  res.json({ records });
});

export const getAttendanceById = asyncHandler(async (req: Request, res: Response) => {
  const record = await Attendance.findById(req.params.id).populate("employeeId", "name email");

  if (!record) {
    throw new AppError("Attendance record not found", 404);
  }

  res.json({ record });
});

export const clockIn = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const today = getTodayDateString();

  const existing = await Attendance.findOne({ employeeId, date: today });

  if (existing) {
    throw new AppError("You have already clocked in today", 409);
  }

  const record = await Attendance.create({
    employeeId,
    date: today,
    clockIn: new Date(),
    status: "INCOMPLETE",
  });

  res.status(201).json({ record });
});

export const clockOut = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const today = getTodayDateString();

  const record = await Attendance.findOne({ employeeId, date: today });

  if (!record) {
    throw new AppError("You have not clocked in today", 400);
  }

  if (!record.clockIn) {
    throw new AppError("Cannot clock out before clocking in", 400);
  }

  if (record.clockOut) {
    throw new AppError("You have already clocked out today", 409);
  }

  const clockOutTime = new Date();
  record.clockOut = clockOutTime;
  record.totalHours = calculateTotalHours(record.clockIn, clockOutTime);
  record.status = "PRESENT";

  await record.save();

  res.json({ record });
});

export const updateAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { clockIn, clockOut, status } = req.body;

  const record = await Attendance.findById(req.params.id);

  if (!record) {
    throw new AppError("Attendance record not found", 404);
  }

  if (clockIn) record.clockIn = new Date(clockIn);
  if (clockOut) record.clockOut = new Date(clockOut);

  if (record.clockIn && record.clockOut) {
    if (record.clockOut < record.clockIn) {
      throw new AppError("Clock out time cannot be before clock in time", 400);
    }
    record.totalHours = calculateTotalHours(record.clockIn, record.clockOut);
    record.status = "PRESENT";
  }

  if (status) record.status = status;

  await record.save();

  res.json({ record });
});

export const exportAttendanceCsv = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId, date, month, status } = req.query;

  const filter: Record<string, unknown> = {};
  if (employeeId) filter.employeeId = employeeId;
  if (date) filter.date = date;
  else if (month) filter.date = { $regex: `^${month}` };
  if (status) filter.status = status;

  const records = await Attendance.find(filter)
    .populate("employeeId", "name email")
    .sort({ date: -1 });

  const rows = records.map((r) => {
    const employee = r.employeeId as unknown as { name: string };
    return {
      employee: employee?.name || "Unknown",
      date: r.date,
      clockIn: r.clockIn ? r.clockIn.toISOString() : "",
      clockOut: r.clockOut ? r.clockOut.toISOString() : "",
      totalHours: r.totalHours.toString(),
      status: r.status,
    };
  });

  const csv = buildAttendanceCsv(rows);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
  res.send(csv);
});
