import Skill from "../skills/skill.model";
import Log from "../logs/log.model";
import Task from "../tasks/task.model";
import Milestone from "../milestones/milestone.model";

export const getDashboardData = async (userId: string, workspaceId?: string) => {
  // Determine the filter for skills
  const skillFilter: any = { user: userId };
  if (workspaceId) {
    skillFilter.workspace = workspaceId;
  }

  // Fetch skills matching the filter
  const skills = await Skill.find(skillFilter);
  const skillIds = skills.map((s) => s._id);

  const totalSkills = skills.length;

  // Fetch logs related to those skills (field is 'skill', not 'skillId')
  const logs = await Log.find({ user: userId, skill: { $in: skillIds } }).sort({ practicedAt: 1 });

  // Fetch tasks and milestones for those skills
  const tasks = await Task.find({ user: userId, skill: { $in: skillIds } });
  const milestones = await Milestone.find({ skill: { $in: skillIds } });

  // Calculate Tasks stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingDays = new Date(today);
  upcomingDays.setDate(today.getDate() + 7);

  const upcomingTasks = tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate >= today && dueDate <= upcomingDays;
  }).length;

  // Calculate Milestones stats
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.isCompleted).length;

  // Logs / streak stats
  const practicedToday = logs.filter((log) => {
    const logDate = new Date(log.practicedAt);
    logDate.setHours(0, 0, 0, 0);
    return logDate.getTime() === today.getTime();
  }).length;

  const uniqueDays = new Set(logs.map((log) => new Date(log.practicedAt).toDateString()));
  const daysTracked = uniqueDays.size;

  let activeStreak = 0;

  const uniqueLogDates = Array.from(
    new Set(
      logs.map((log) => {
        const d = new Date(log.practicedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    )
  ).sort((a, b) => b - a); // newest dates first

  if (uniqueLogDates.length > 0) {
    const mostRecent = uniqueLogDates[0];
    const diffToday = (today.getTime() - mostRecent) / (1000 * 60 * 60 * 24);

    if (diffToday <= 1) {
      activeStreak = 1;
      let lastTime = mostRecent;

      for (let i = 1; i < uniqueLogDates.length; i++) {
        const currentTime = uniqueLogDates[i];
        const diff = (lastTime - currentTime) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          activeStreak++;
          lastTime = currentTime;
        } else {
          break;
        }
      }
    }
  }

  let motivation = "Let's make progress today 🚀";
  if (activeStreak >= 5) motivation = "🔥 Amazing streak! Keep pushing!";
  else if (activeStreak >= 3) motivation = "You're building momentum 💪";
  else if (activeStreak >= 1) motivation = "Good start! Stay consistent 🌱";

  return {
    totalSkills,
    practicedToday,
    daysTracked,
    activeStreak,
    motivation,
    // New PM stats
    totalTasks,
    completedTasks,
    inProgressTasks,
    upcomingTasks,
    totalMilestones,
    completedMilestones,
  };
};