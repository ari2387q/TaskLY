import Workspace, { IWorkspace } from "./workspace.model";
import User from "../auth/user.model";

export const createWorkspace = async (
  name: string,
  description: string | undefined,
  ownerId: string
) => {
  const workspace = await Workspace.create({
    name,
    description,
    owner: ownerId,
    members: [{ user: ownerId, role: "admin" }],
  });
  return workspace;
};

export const getUserWorkspaces = async (userId: string) => {
  const workspaces = await Workspace.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  }).populate("owner", "email").populate("members.user", "email");
  return workspaces;
};

export const getWorkspaceById = async (workspaceId: string, userId: string) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  }).populate("owner", "email").populate("members.user", "email");

  if (!workspace) throw new Error("Workspace not found or access denied");
  return workspace;
};

export const addMember = async (
  workspaceId: string,
  email: string,
  role: "admin" | "member",
  requestorId: string
) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [
      { owner: requestorId },
      { members: { $elemMatch: { user: requestorId, role: "admin" } } },
    ],
  });

  if (!workspace) {
    throw new Error("Workspace not found or unauthorized to manage members");
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) throw new Error("User with this email not found");

  const alreadyMember = workspace.members.some(
    (m) => m.user.toString() === userToAdd._id.toString()
  );
  if (alreadyMember) throw new Error("User is already a member of this workspace");

  workspace.members.push({ user: userToAdd._id as any, role });
  await workspace.save();

  return workspace;
};

export const updateWorkspace = async (
  workspaceId: string,
  updates: { name?: string; description?: string },
  requestorId: string
) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [
      { owner: requestorId },
      { members: { $elemMatch: { user: requestorId, role: "admin" } } },
    ],
  });

  if (!workspace) throw new Error("Workspace not found or unauthorized to update");

  if (updates.name) workspace.name = updates.name;
  if (updates.description !== undefined) workspace.description = updates.description;

  await workspace.save();
  return workspace;
};

export const removeMember = async (
  workspaceId: string,
  memberId: string,
  requestorId: string
) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
  });

  if (!workspace) throw new Error("Workspace not found");

  const isOwner = workspace.owner.toString() === requestorId;
  const isAdmin = workspace.members.some((m) => m.user.toString() === requestorId && m.role === "admin");
  const isSelf = memberId === requestorId;

  if (!isOwner && !isAdmin && !isSelf) {
    throw new Error("Unauthorized to remove member");
  }

  if (workspace.owner.toString() === memberId) {
    throw new Error("Cannot remove the owner of the workspace");
  }

  workspace.members = workspace.members.filter((m) => m.user.toString() !== memberId);
  await workspace.save();
  return workspace;
};
