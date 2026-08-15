import { Request, Response } from "express"
import { getDashboardData } from "./dashboard.service"

export const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workspaceId = req.query.workspaceId ? req.query.workspaceId.toString() : undefined;
    const data = await getDashboardData(req.user._id.toString(), workspaceId);
    res.json(data);
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({ message: "Failed to load dashboard" });
  }
};
