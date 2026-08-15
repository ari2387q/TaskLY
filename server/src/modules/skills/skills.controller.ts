import { Request, Response } from "express";
import * as skillsService from "./skills.service";

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, workspaceId } = req.body;
    const userId = (req as any).user._id;

    if (!name || !workspaceId) {
      return res.status(400).json({ message: "Skill name and Workspace ID are required" });
    }

    const skill = await skillsService.createSkill({ name, workspaceId, userId });

    res.status(201).json({
      success: true,
      skill,
    });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.query.workspaceId as string;
    const userId = (req as any).user._id;

    if (!workspaceId) {
      return res.status(400).json({ message: "Workspace ID is required" });
    }

    const skills = await skillsService.getWorkspaceSkills(workspaceId, userId);

    res.status(200).json({
      success: true,
      skills,
    });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const markPracticed = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const skill = await skillsService.markSkillPracticed(id, userId);
    res.status(200).json(skill);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const toggleSkill = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const skill = await skillsService.toggleSkillActive(id, userId);
    res.status(200).json(skill);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
