import { Request, Response } from "express";
import * as workspaceService from "./workspace.service";

export const createWorkspace = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = (req as any).user._id;

    if (!name) {
      return res.status(400).json({ message: "Workspace name is required" });
    }

    const workspace = await workspaceService.createWorkspace(
      name,
      description,
      userId
    );
    res.status(201).json({ success: true, workspace });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getWorkspaces = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const workspaces = await workspaceService.getUserWorkspaces(userId);
    res.status(200).json({ success: true, workspaces });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const getWorkspaceById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { id } = req.params;

    const workspace = await workspaceService.getWorkspaceById(id, userId);
    res.status(200).json({ success: true, workspace });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

export const addMember = async (req: Request, res: Response) => {
  try {
    const requestorId = (req as any).user._id;
    const { id } = req.params;
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const workspace = await workspaceService.addMember(
      id,
      email,
      role || "member",
      requestorId
    );
    res.status(200).json({ success: true, workspace });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};
