import mongoose, { Document, Schema } from "mongoose";

export interface IWorkspaceMember {
  user: mongoose.Types.ObjectId;
  role: "admin" | "member";
}

export interface IWorkspace extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IWorkspace>("Workspace", workspaceSchema);
