import express from "express";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import skillsRoutes from "./modules/skills/skills.routes";
import logsRoutes from "./modules/logs/logs.routes";
import aiRoutes from "./modules/ai/ai.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import workspaceRoutes from "./modules/workspaces/workspace.routes";
import milestoneRoutes from "./modules/milestones/milestone.routes";
import taskRoutes from "./modules/tasks/task.routes";
import passport from "./config/passport";

const app = express();
app.set("trust proxy", 1);
const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Normalize URLs by removing trailing slashes
      const normalizedOrigin = origin?.replace(/\/$/, "");
      const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ""));

      if (!origin || normalizedAllowed.includes(normalizedOrigin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/milestones", milestoneRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "OK" });
});

app.get("/", (_req, res) => {
  res.send("TaskLY API is running!");
});

export default app;
