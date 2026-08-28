import { Request, Response } from "express";
import WorkSchedule from "../models/WorkSchedule";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export const getSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  if (req.user!.role === "EMPLOYEE" && req.user!.userId !== employeeId) {
    throw new AppError("You can only view your own schedule", 403);
  }

  let schedule = await WorkSchedule.findOne({ employeeId });

  if (!schedule) {
    schedule = await WorkSchedule.create({ employeeId });
  }

  res.json({ schedule });
});

export const updateSchedule = asyncHandler(async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  let schedule = await WorkSchedule.findOne({ employeeId });

  if (!schedule) {
    schedule = new WorkSchedule({ employeeId });
  }

  for (const day of DAYS) {
    if (typeof req.body[day] === "string") {
      (schedule as any)[day] = req.body[day];
    }
  }

  await schedule.save();

  res.json({ schedule });
});
