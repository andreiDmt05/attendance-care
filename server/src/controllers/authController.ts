import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/AppError";

const isProduction = process.env.NODE_ENV === "production";

// In production the client and server live on different domains (e.g. two
// separate Vercel projects), so the cookie must be "sameSite: none" to be
// sent on cross-site requests. That requires "secure: true" as well, which
// is fine since production is always served over HTTPS. Locally, both run
// on http://localhost on different ports, so "lax" + non-secure works.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("This account has been deactivated", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  res.cookie("token", token, cookieOptions);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

export const logout = (req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out successfully" });
};

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user!.userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (name) user.name = name;

  if (email && email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw new AppError("An account with this email already exists", 409);
    }
    user.email = email.toLowerCase();
  }

  await user.save();

  res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });
});
