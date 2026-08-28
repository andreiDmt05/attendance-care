import { Request, Response } from "express";
import LeaveRequest from "../models/LeaveRequest";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getLeaves = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.query;

  const filter: Record<string, unknown> = {};

  if (req.user!.role === "EMPLOYEE") {
    filter.employeeId = req.user!.userId;
  }

  if (status) {
    filter.status = status;
  }

  const leaves = await LeaveRequest.find(filter)
    .populate("employeeId", "name email")
    .sort({ createdAt: -1 });

  res.json({ leaves });
});

export const createLeave = asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, reason } = req.body;

  if (!startDate || !endDate || !reason) {
    throw new AppError("Start date, end date and reason are required", 400);
  }

  if (new Date(endDate) < new Date(startDate)) {
    throw new AppError("End date cannot be before start date", 400);
  }

  const leave = await LeaveRequest.create({
    employeeId: req.user!.userId,
    startDate,
    endDate,
    reason,
    status: "PENDING",
  });

  res.status(201).json({ leave });
});

export const updateLeaveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    throw new AppError("Status must be APPROVED or REJECTED", 400);
  }

  const leave = await LeaveRequest.findById(req.params.id);

  if (!leave) {
    throw new AppError("Leave request not found", 404);
  }

  leave.status = status;
  await leave.save();

  res.json({ leave });
});
