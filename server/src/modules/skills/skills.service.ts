import Skill, { ISkill } from "./skill.model";
import Log from "../logs/log.model";
import Workspace from "../workspaces/workspace.model";

interface CreateSkillInput {
  name: string;
  workspaceId: string;
  userId: string;
}

const verifyWorkspaceAccess = async (workspaceId: string, userId: string) => {
  const workspace = await Workspace.findOne({
    _id: workspaceId,
    $or: [{ owner: userId }, { "members.user": userId }],
  });
  if (!workspace) throw new Error("Workspace not found or access denied");
  return workspace;
};

export const createSkill = async ({ name, workspaceId, userId }: CreateSkillInput) => {
  await verifyWorkspaceAccess(workspaceId, userId);

  const existingSkill = await Skill.findOne({ name, workspace: workspaceId });
  if (existingSkill) throw new Error("Skill already exists in this workspace");

  const skill = await Skill.create({
    name,
    workspace: workspaceId,
    user: userId,
  });

  return transformSkill(skill);
};

export const getWorkspaceSkills = async (workspaceId: string, userId: string) => {
  await verifyWorkspaceAccess(workspaceId, userId);
  const skills = await Skill.find({ workspace: workspaceId });
  return skills.map(transformSkill);
};

export const markSkillPracticed = async (skillId: string, userId: string) => {
  const skill = await Skill.findById(skillId);
  if (!skill) throw new Error("Skill not found");

  await verifyWorkspaceAccess(skill.workspace.toString(), userId);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // prevent duplicate log same day
  const existingLog = await Log.findOne({
    user: userId,
    skill: skillId,
    practicedAt: { $gte: today },
  });

  if (existingLog) {
    return transformSkill(skill); // already practiced today
  }

  // update streak
  if (skill.lastpracticed) {
    const last = new Date(skill.lastpracticed);
    last.setHours(0, 0, 0, 0);

    const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      skill.streak += 1;
    } else {
      // not consecutive, start a new streak at 1
      skill.streak = 1;
    }
  } else {
    // first practice -> streak is 1
    skill.streak = 1;
  }

  skill.lastpracticed = new Date();
  await skill.save();
  return transformSkill(skill);
};

export const toggleSkillActive = async (skillId: string, userId: string) => {
  const skill = await Skill.findById(skillId);
  if (!skill) throw new Error("Skill not found");

  await verifyWorkspaceAccess(skill.workspace.toString(), userId);

  skill.isActive = !skill.isActive;
  await skill.save();

  return transformSkill(skill);
};

// Helper to transform Mongo document to frontend-friendly object
const transformSkill = (skill: ISkill) => {
  let currentStreak = skill.streak;
  if (skill.lastpracticed) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const last = new Date(skill.lastpracticed);
    last.setHours(0, 0, 0, 0);
    const diff = (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1) {
      currentStreak = 0;
    }
  }

  return {
    id: skill._id.toString(),
    name: skill.name,
    workspaceId: skill.workspace.toString(),
    isActive: skill.isActive,
    currentStreak: currentStreak,
    longestStreak: skill.streak,
    lastPracticed: skill.lastpracticed ? skill.lastpracticed.toISOString() : null,
    totalPractices: skill.streak,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
  };
};