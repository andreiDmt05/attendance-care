import { Request, Response } from "express";
import User from "../models/User";
import Attendance from "../models/Attendance";
import LeaveRequest from "../models/LeaveRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { getTodayDateString } from "../services/attendanceService";

export const getAdminDashboard = asyncHandler(async (req: Request, res: Response) => {
  const today = getTodayDateString();
  const monthPrefix = today.slice(0, 7);

  const [totalEmployees, todayRecords, onLeaveToday, pendingLeaves, monthRecords] =
    await Promise.all([
      User.countDocuments({ role: "EMPLOYEE", isActive: true }),
      Attendance.find({ date: today }).populate("employeeId", "name email"),
      LeaveRequest.countDocuments({
        status: "APPROVED",
        startDate: { $lte: today },
        endDate: { $gte: today },
      }),
      LeaveRequest.find({ status: "PENDING" }).populate("employeeId", "name email"),
      Attendance.find({ date: { $regex: `^${monthPrefix}` } }),
    ]);

  const presentToday = todayRecords.filter(
    (r) => r.status === "PRESENT" || r.status === "INCOMPLETE"
  ).length;
  const absentToday = Math.max(totalEmployees - presentToday - onLeaveToday, 0);
  const totalHoursThisMonth = monthRecords.reduce((sum, r) => sum + r.totalHours, 0);

  const recentAttendance = await Attendance.find()
    .populate("employeeId", "name email")
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    stats: {
      totalEmployees,
      presentToday,
      absentToday,
      onLeaveToday,
      totalHoursThisMonth: Math.round(totalHoursThisMonth * 100) / 100,
    },
    recentAttendance,
    pendingLeaves,
  });
});

export const getEmployeeDashboard = asyncHandler(async (req: Request, res: Response) => {
  const employeeId = req.user!.userId;
  const today = getTodayDateString();
  const monthPrefix = today.slice(0, 7);

  const [todayRecord, monthRecords, recentAttendance, leaves] = await Promise.all([
    Attendance.findOne({ employeeId, date: today }),
    Attendance.find({ employeeId, date: { $regex: `^${monthPrefix}` } }),
    Attendance.find({ employeeId }).sort({ date: -1 }).limit(10),
    LeaveRequest.find({ employeeId }).sort({ createdAt: -1 }).limit(5),
  ]);

  const monthlyHours = monthRecords.reduce((sum, r) => sum + r.totalHours, 0);

  res.json({
    todayRecord,
    monthlyHours: Math.round(monthlyHours * 100) / 100,
    recentAttendance,
    leaves,
  });
});
