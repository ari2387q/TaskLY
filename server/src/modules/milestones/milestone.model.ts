import mongoose, { Document, Schema } from "mongoose";

export interface IMilestone extends Document {
  title: string;
  description?: string;
  skill: mongoose.Types.ObjectId;
  isCompleted: boolean;
  targetDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const milestoneSchema = new Schema<IMilestone>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    targetDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IMilestone>("Milestone", milestoneSchema);
