import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

export const getEmployees = asyncHandler(async (req: Request, res: Response) => {
  const employees = await User.find().sort({ createdAt: -1 });
  res.json({ employees });
});

export const getEmployeeById = asyncHandler(async (req: Request, res: Response) => {
  const employee = await User.findById(req.params.id);

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  res.json({ employee });
});

export const createEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Name, email and password are required", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: role === "ADMIN" ? "ADMIN" : "EMPLOYEE",
  });

  res.status(201).json({
    employee: {
      id: employee._id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      isActive: employee.isActive,
      createdAt: employee.createdAt,
    },
  });
});

export const updateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role, isActive } = req.body;

  const employee = await User.findById(req.params.id);

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  if (name) employee.name = name;
  if (email) employee.email = email.toLowerCase();
  if (role) employee.role = role;
  if (typeof isActive === "boolean") employee.isActive = isActive;

  await employee.save();

  res.json({ employee });
});

export const deactivateEmployee = asyncHandler(async (req: Request, res: Response) => {
  const employee = await User.findById(req.params.id);

  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  employee.isActive = false;
  await employee.save();

  res.json({ message: "Employee deactivated", employee });
});
