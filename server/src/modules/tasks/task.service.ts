import Task from "./task.model";
import Skill from "../skills/skill.model";
import Workspace from "../workspaces/workspace.model";

// ── Helpers ──────────────────────────────────────────────────────────────────

const getWorkspaceForSkill = async (skillId: string, userId: string) => {
  const skill = await Skill.findById(skillId);
  if (!skill) throw new Error("Skill not found");

  const workspace = await Workspace.findOne({
    _id: skill.workspace,
    $or: [{ owner: userId }, { "members.user": userId }],
  });

  if (!workspace) throw new Error("Access to skill workspace denied");
  return { skill, workspace };
};

const isAdminOfWorkspace = (workspace: any, userId: string): boolean => {
  const isOwner = workspace.owner.toString() === userId.toString();
  const isAdmin = workspace.members.some(
    (m: any) => m.user.toString() === userId.toString() && m.role === "admin"
  );
  return isOwner || isAdmin;
};

// ── Service Functions ────────────────────────────────────────────────────────

export const createTask = async (
  skillId: string,
  title: string,
  description: string | undefined,
  priority: "low" | "medium" | "high",
  dueDate: Date | undefined,
  duration: number | undefined,
  userId: string,
  assigneeId?: string
) => {
  const { workspace } = await getWorkspaceForSkill(skillId, userId);

  if (!isAdminOfWorkspace(workspace, userId)) {
    throw new Error("Only admins can create tasks");
  }

  const task = await Task.create({
    title,
    description,
    skill: skillId,
    priority,
    dueDate,
    duration,
    user: userId,
    assignee: assigneeId || undefined,
  });

  return Task.findById((task as any)._id).populate("assignee", "email name");
};

export const getSkillTasks = async (skillId: string, userId: string) => {
  await getWorkspaceForSkill(skillId, userId);
  const tasks = await Task.find({ skill: skillId })
    .populate("assignee", "email name")
    .sort({ createdAt: -1 });
  return tasks;
};

export const getWorkspaceTasks = async (workspaceId: string, userId: string) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });
  if (!workspace) throw new Error("Access to workspace denied");

  const skills = await Skill.find({ workspace: workspaceId });
  const skillIds = skills.map((s) => s._id);

  const tasks = await Task.find({ skill: { $in: skillIds } })
    .populate("assignee", "email name")
    .sort({ dueDate: 1, createdAt: -1 });
  return tasks;
};

export const updateTask = async (
  taskId: string,
  updates: {
    title?: string;
    description?: string;
    status?: "todo" | "in_progress" | "completed";
    priority?: "low" | "medium" | "high";
    dueDate?: Date;
    duration?: number;
    assigneeId?: string | null;
  },
  userId: string
) => {
  const task = await Task.findById(taskId);
  if (!task) throw new Error("Task not found");

  const { workspace } = await getWorkspaceForSkill(task.skill.toString(), userId);
  const admin = isAdminOfWorkspace(workspace, userId);

  // Status changes (crossing off) are admin-only
  if (updates.status !== undefined && !admin) {
    throw new Error("Only admins can change task status");
  }

  // Editing task fields is admin-only
  if (
    (updates.title !== undefined ||
      updates.description !== undefined ||
      updates.priority !== undefined ||
      updates.dueDate !== undefined ||
      updates.duration !== undefined ||
      updates.assigneeId !== undefined) &&
    !admin
  ) {
    throw new Error("Only admins can edit tasks");
  }

  if (updates.title !== undefined) task.title = updates.title;
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.status !== undefined) task.status = updates.status;
  if (updates.priority !== undefined) task.priority = updates.priority;
  if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
  if (updates.duration !== undefined) task.duration = updates.duration;
  if (updates.assigneeId !== undefined) {
    (task as any).assignee = updates.assigneeId || null;
  }

  await task.save();
  return Task.findById(task._id).populate("assignee", "email name");
};
