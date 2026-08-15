import mongoose, { Document, Schema } from "mongoose";

export interface ILog extends Document {
  user: mongoose.Types.ObjectId;
  skill: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  practicedAt: Date;
  notes?: string;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const logSchema = new Schema<ILog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true,
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      index: true,
    },
    practicedAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    notes: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      min: 1,
    },
  },
  { timestamps: true }
);

logSchema.index(
  { user: 1, skill: 1, practicedAt: 1 },
  { unique: true }
);

export default mongoose.model<ILog>("Log", logSchema);