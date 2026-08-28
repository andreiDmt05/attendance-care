import { Schema, model, Document, Types } from "mongoose";
import { AttendanceStatus } from "../types";

export interface IAttendance extends Document {
  employeeId: Types.ObjectId;
  date: string;
  clockIn: Date | null;
  clockOut: Date | null;
  totalHours: number;
  status: AttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: String, required: true },
    clockIn: { type: Date, default: null },
    clockOut: { type: Date, default: null },
    totalHours: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "INCOMPLETE"],
      default: "INCOMPLETE",
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export default model<IAttendance>("Attendance", attendanceSchema);
