export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface WorkspaceMember {
  user: {
    _id: string
    email: string
  }
  role: "admin" | "member"
}

export interface Workspace {
  _id: string
  name: string
  description?: string
  owner: {
    _id: string
    email: string
  }
  members: WorkspaceMember[]
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: string
  name: string
  workspaceId: string
  isActive: boolean
  currentStreak: number
  longestStreak: number
  lastPracticed?: string
  totalPractices: number
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  _id: string
  title: string
  description?: string
  skill: string
  isCompleted: boolean
  targetDate?: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  _id: string
  title: string
  description?: string
  skill: string
  status: "todo" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate?: string
  duration?: number
  user: string
  createdAt: string
  updatedAt: string
}

export interface Log {
  id: string
  skillId: string
  skillName: string
  date: string
  notes: string | null
  createdAt: string
}

export interface DashboardData {
  totalSkills: number
  practicedToday: number
  daysTracked: number
  activeStreak: number
  motivation: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  upcomingTasks: number
  totalMilestones: number
  completedMilestones: number
}

export interface StatsData {
  totalPractices: number
  activeStreaks: number
  longestStreak: number
  skillStats: {
    skillId: string
    skillName: string
    totalPractices: number
    currentStreak: number
  }[]
  dailyActivity: {
    date: string
    count: number
  }[]
}
