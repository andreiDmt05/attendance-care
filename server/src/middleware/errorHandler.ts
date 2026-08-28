import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  if ((err as any).code === 11000) {
    return res.status(409).json({ message: "Duplicate record" });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong" });
};
