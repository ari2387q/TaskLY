import { Request, Response } from "express";
import * as milestoneService from "./milestone.service";

export const createMilestone = async (req: Request, res: Response) => {
  try {
    const { skillId, title, description, targetDate } = req.body;
    const userId = (req as any).user._id;

    if (!skillId || !title) {
      return res.status(400).json({ message: "Skill ID and Title are required" });
    }

    const milestone = await milestoneService.createMilestone(
      skillId,
      title,
      description,
      targetDate ? new Date(targetDate) : undefined,
      userId
    );

    res.status(201).json({ success: true, milestone });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getMilestones = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params;
    const userId = (req as any).user._id;

    if (!skillId) {
      return res.status(400).json({ message: "Skill ID is required" });
    }

    const milestones = await milestoneService.getSkillMilestones(skillId, userId);
    res.status(200).json({ success: true, milestones });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getWorkspaceMilestones = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;
    const userId = (req as any).user._id;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId query parameter is required" });
    }

    const milestones = await milestoneService.getWorkspaceMilestones(workspaceId as string, userId);
    res.status(200).json({ success: true, milestones });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const toggleMilestone = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const milestone = await milestoneService.toggleMilestone(id, userId);
    res.status(200).json({ success: true, milestone });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
