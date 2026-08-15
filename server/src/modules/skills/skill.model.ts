import mongoose, { Document, Schema } from "mongoose";

export interface ISkill extends Document {
  name: string;
  user: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  streak: number;
  lastpracticed?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const skillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, trim: true },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    streak: { type: Number, default: 0 },

    lastpracticed: { type: Date },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Unique skill name within a workspace
skillSchema.index({ name: 1, workspace: 1 }, { unique: true });

export default mongoose.model<ISkill>("Skill", skillSchema);
