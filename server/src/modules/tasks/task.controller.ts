import { Request, Response } from "express";
import * as taskService from "./task.service";

export const createTask = async (req: Request, res: Response) => {
  try {
    const { skillId, title, description, priority, dueDate, duration, assigneeId } = req.body;
    const userId = (req as any).user._id;

    if (!skillId || !title) {
      return res.status(400).json({ message: "Skill ID and Title are required" });
    }

    const task = await taskService.createTask(
      skillId,
      title,
      description,
      priority || "medium",
      dueDate ? new Date(dueDate) : undefined,
      duration ? Number(duration) : undefined,
      userId,
      assigneeId || undefined
    );

    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.params;
    const userId = (req as any).user._id;

    if (!skillId) {
      return res.status(400).json({ message: "Skill ID is required" });
    }

    const tasks = await taskService.getSkillTasks(skillId, userId);
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const getWorkspaceTasks = async (req: Request, res: Response) => {
  try {
    const { workspaceId } = req.query;
    const userId = (req as any).user._id;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId query parameter is required" });
    }

    const tasks = await taskService.getWorkspaceTasks(workspaceId as string, userId);
    res.status(200).json({ success: true, tasks });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user._id;
    const { title, description, status, priority, dueDate, duration, assigneeId } = req.body;

    const task = await taskService.updateTask(
      id,
      {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        duration: duration ? Number(duration) : undefined,
        assigneeId: assigneeId !== undefined ? (assigneeId || null) : undefined,
      },
      userId
    );

    res.status(200).json({ success: true, task });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
