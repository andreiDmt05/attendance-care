import { Schema, model, Document, Types } from "mongoose";

export interface IWorkSchedule extends Document {
  employeeId: Types.ObjectId;
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

const daySchema = { type: String, default: "OFF" };

const workScheduleSchema = new Schema<IWorkSchedule>(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    monday: daySchema,
    tuesday: daySchema,
    wednesday: daySchema,
    thursday: daySchema,
    friday: daySchema,
    saturday: daySchema,
    sunday: daySchema,
  },
  { timestamps: true }
);

export default model<IWorkSchedule>("WorkSchedule", workScheduleSchema);
