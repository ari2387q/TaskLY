import Milestone from "./milestone.model";
import Skill from "../skills/skill.model";
import Workspace from "../workspaces/workspace.model";

const verifySkillAccess = async (skillId: string, userId: string) => {
  const skill = await Skill.findById(skillId);
  if (!skill) throw new Error("Skill not found");

  const workspace = await Workspace.findOne({
    _id: skill.workspace,
    $or: [{ owner: userId }, { "members.user": userId }],
  });

  if (!workspace) throw new Error("Access to skill workspace denied");
  return skill;
};

export const createMilestone = async (
  skillId: string,
  title: string,
  description: string | undefined,
  targetDate: Date | undefined,
  userId: string
) => {
  await verifySkillAccess(skillId, userId);

  const milestone = await Milestone.create({
    title,
    description,
    skill: skillId,
    targetDate,
  });

  return milestone;
};

export const getSkillMilestones = async (skillId: string, userId: string) => {
  await verifySkillAccess(skillId, userId);
  return await Milestone.find({ skill: skillId }).sort({ targetDate: 1, createdAt: 1 });
};

export const getWorkspaceMilestones = async (workspaceId: string, userId: string) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });
  if (!workspace) throw new Error("Access to workspace denied");

  const skills = await Skill.find({ workspace: workspaceId });
  const skillIds = skills.map((s) => s._id);

  return await Milestone.find({ skill: { $in: skillIds } }).sort({ targetDate: 1, createdAt: 1 });
};

export const toggleMilestone = async (milestoneId: string, userId: string) => {
  const milestone = await Milestone.findById(milestoneId);
  if (!milestone) throw new Error("Milestone not found");

  await verifySkillAccess(milestone.skill.toString(), userId);

  milestone.isCompleted = !milestone.isCompleted;
  await milestone.save();

  return milestone;
};
