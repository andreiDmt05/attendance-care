import { Schema, model, Document, Types } from "mongoose";
import { LeaveStatus } from "../types";

export interface ILeaveRequest extends Document {
  employeeId: Types.ObjectId;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
}

const leaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

export default model<ILeaveRequest>("LeaveRequest", leaveRequestSchema);
