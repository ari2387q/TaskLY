"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Plus, Zap, CheckCircle2, Power, Target, ListTodo,
  ChevronDown, ChevronUp, Loader2, Flag, Calendar, Clock, X, Layers
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Skill, Milestone, Task } from "@/lib/types"
import { skillsApi, milestoneApi, taskApi } from "@/lib/api"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import Link from "next/link"

// ── Milestone List ───────────────────────────────────────────────────────────
function MilestonePanel({ skillId }: { skillId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    milestoneApi.getBySkill(skillId)
      .then(setMilestones)
      .finally(() => setLoading(false))
  }, [skillId])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const m = await milestoneApi.create(skillId, newTitle.trim())
      setMilestones((prev) => [...prev, m])
      setNewTitle("")
      setShowAdd(false)
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (id: string) => {
    const updated = await milestoneApi.toggle(id)
    setMilestones((prev) => prev.map((m) => m._id === id ? updated : m))
  }

  if (loading) return <div className="py-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>

  const completed = milestones.filter((m) => m.isCompleted).length

  return (
    <div className="space-y-2">
      {milestones.length > 0 && (
        <div className="w-full bg-muted rounded-full h-1.5 mb-3">
          <div
            className="h-1.5 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${(completed / milestones.length) * 100}%` }}
          />
        </div>
      )}
      {milestones.map((m) => (
        <motion.div
          key={m._id}
          layout
          className={cn(
            "flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all",
            m.isCompleted ? "bg-muted/40 border-border/40" : "bg-card border-border"
          )}
        >
          <button
            onClick={() => handleToggle(m._id)}
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
              m.isCompleted ? "bg-primary border-primary" : "border-muted-foreground hover:border-primary"
            )}
          >
            {m.isCompleted && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
          </button>
          <span className={cn("text-sm flex-1", m.isCompleted && "line-through text-muted-foreground")}>
            {m.title}
          </span>
          {m.targetDate && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(m.targetDate).toLocaleDateString()}
            </span>
          )}
        </motion.div>
      ))}

      {showAdd ? (
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="Milestone title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-sm rounded-xl"
            autoFocus
          />
          <Button size="sm" className="h-8 rounded-xl px-3" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
          <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mt-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add milestone
        </button>
      )}
    </div>
  )
}

// ── Task Kanban ──────────────────────────────────────────────────────────────
const PRIORITY_COLORS = {
  low: "text-sky-500 bg-sky-500/10 border-sky-500/20",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  high: "text-rose-500 bg-rose-500/10 border-rose-500/20",
}

const STATUS_COLUMNS = [
  { key: "todo" as const, label: "To Do", color: "border-muted-foreground/30" },
  { key: "in_progress" as const, label: "In Progress", color: "border-amber-500/40" },
  { key: "completed" as const, label: "Done", color: "border-emerald-500/40" },
]

function TaskPanel({ skillId }: { skillId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState("")
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    taskApi.getBySkill(skillId).then(setTasks).finally(() => setLoading(false))
  }, [skillId])

  const handleAdd = async () => {
    if (!newTitle.trim()) return
    setAdding(true)
    try {
      const t = await taskApi.create(skillId, newTitle.trim())
      setTasks((prev) => [t, ...prev])
      setNewTitle("")
      setShowAdd(false)
    } finally {
      setAdding(false)
    }
  }

  const handleStatusChange = async (id: string, status: Task["status"]) => {
    setTasks((prev) => prev.map((t) => t._id === id ? { ...t, status } : t))
    await taskApi.update(id, { status })
  }

  if (loading) return <div className="py-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STATUS_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key)
          return (
            <div key={col.key} className={cn("rounded-2xl border-2 p-3 space-y-2 min-h-[100px] bg-muted/20", col.color)}>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
                <span>{col.label}</span>
                <span className="bg-muted rounded-full px-2 py-0.5 text-[10px]">{colTasks.length}</span>
              </p>
              <AnimatePresence>
                {colTasks.map((task) => (
                  <motion.div
                    key={task._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative bg-card rounded-xl border border-border p-3 text-xs shadow-sm hover:shadow-md transition-all"
                  >
                    <p className="font-semibold text-foreground leading-snug mb-2">{task.title}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <Badge className={cn("text-[9px] px-1.5 py-0 h-4 border font-bold", PRIORITY_COLORS[task.priority])}>
                        {task.priority}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {/* Status cycle buttons */}
                    <div className="flex gap-1 flex-wrap">
                      {STATUS_COLUMNS.filter((s) => s.key !== col.key).map((s) => (
                        <button
                          key={s.key}
                          onClick={() => handleStatusChange(task._id, s.key)}
                          className="text-[9px] px-2 py-0.5 rounded-md bg-muted hover:bg-primary hover:text-primary-foreground transition-colors font-medium"
                        >
                          → {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {colTasks.length === 0 && (
                <p className="text-[10px] text-muted-foreground text-center py-4 italic">No tasks</p>
              )}
            </div>
          )
        })}
      </div>

      {showAdd ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Task title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-sm rounded-xl"
            autoFocus
          />
          <Button size="sm" className="h-8 rounded-xl px-3" onClick={handleAdd} disabled={adding}>
            {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
          <button onClick={() => setShowAdd(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Add task
        </button>
      )}
    </div>
  )
}

// ── Skill Card ───────────────────────────────────────────────────────────────
type ActiveTab = "milestones" | "tasks"

function SkillCard({
  skill,
  onToggle,
  onPractice,
  loading,
}: {
  skill: Skill
  onToggle: (id: string) => void
  onPractice: (id: string) => void
  loading: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>("milestones")

  const practicedToday =
    skill.lastPracticed &&
    new Date(skill.lastPracticed).toDateString() === new Date().toDateString()

  return (
    <motion.div layout transition={{ duration: 0.3 }}>
      <Card
        className={cn(
          "rounded-3xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
          !skill.isActive && "opacity-60",
          expanded ? "shadow-xl" : "hover:shadow-lg"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 border",
                  practicedToday ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600" : "bg-muted border-border"
                )}
              >
                {skill.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                  {skill.name}
                  {practicedToday && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                </CardTitle>
                <Badge
                  variant={skill.isActive ? "default" : "secondary"}
                  className="text-[10px] h-4 px-2 mt-0.5"
                >
                  {skill.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full shrink-0"
              onClick={() => onToggle(skill.id)}
              title={skill.isActive ? "Deactivate" : "Activate"}
            >
              <Power className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {/* Streak */}
          <div className="flex items-center gap-3 bg-muted/40 px-4 py-3 rounded-2xl">
            <Zap className="h-5 w-5 text-amber-500 animate-pulse shrink-0" />
            <span className="text-2xl font-black">{skill.currentStreak}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">day streak</span>
          </div>

          {/* Practice Button */}
          <Button
            className="w-full rounded-full font-bold h-10"
            disabled={!skill.isActive || !!practicedToday || loading}
            onClick={() => onPractice(skill.id)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {practicedToday ? "Practiced Today ✓" : "Mark Practiced"}
          </Button>

          {/* Expand / Collapse */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
          >
            <span className="font-semibold uppercase tracking-wider">Milestones & Tasks</span>
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                {/* Tabs */}
                <div className="flex gap-1 mb-3 bg-muted rounded-xl p-1">
                  {([
                    { key: "milestones" as const, label: "Milestones", icon: Target },
                    { key: "tasks" as const, label: "Tasks", icon: ListTodo },
                  ]).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all",
                        activeTab === tab.key
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "milestones" ? (
                  <MilestonePanel skillId={skill.id} />
                ) : (
                  <TaskPanel skillId={skill.id} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function SkillsPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const fetchSkills = useCallback(async () => {
    if (!activeWorkspace) return
    setLoading(true)
    try {
      const data = await skillsApi.getAll(activeWorkspace._id)
      setSkills(data)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace?._id])

  useEffect(() => { fetchSkills() }, [fetchSkills])

  const handleAddSkill = async () => {
    if (!newSkill.trim() || !activeWorkspace) return
    setLoading(true)
    try {
      const created = await skillsApi.create(newSkill.trim(), activeWorkspace._id)
      setSkills((prev) => [created, ...prev])
      setNewSkill("")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkPracticed = async (id: string) => {
    const prev = [...skills]
    setSkills((s) => s.map((sk) =>
      sk.id === id ? { ...sk, currentStreak: (sk.currentStreak ?? 0) + 1, lastPracticed: new Date().toISOString() } : sk
    ))
    try {
      const updated = await skillsApi.markPracticed(id)
      if (updated) setSkills((s) => s.map((sk) => sk.id === id ? { ...sk, ...updated } : sk))
    } catch {
      setSkills(prev)
    }
  }

  const handleToggleActive = async (id: string) => {
    await skillsApi.toggleActive(id)
    await fetchSkills()
  }

  // ── No workspace selected ─────────────────────────────────────────────────
  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
          <Layers className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Create or select a workspace first to manage skills
          </p>
        </div>
        <Link href="/workspaces">
          <Button className="rounded-full px-6 font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Go to Workspaces
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {activeWorkspace.name}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Skills</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track what you practice daily</p>
        </div>
        <Badge variant="outline" className="text-xs h-6 px-3 self-start sm:self-auto">
          {skills.length} skill{skills.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Add skill */}
      <div className="flex gap-3 max-w-md">
        <Input
          placeholder="New skill name..."
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
          className="rounded-full px-5 h-11 border-border"
        />
        <Button
          onClick={handleAddSkill}
          disabled={loading || !newSkill.trim()}
          className="rounded-full px-5 h-11 font-bold shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
          Add
        </Button>
      </div>

      {/* Skills grid */}
      {loading && skills.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl h-52 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center">
            <Zap className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-bold text-lg">No skills yet</h3>
            <p className="text-sm text-muted-foreground">Add your first skill to start tracking</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onToggle={handleToggleActive}
              onPractice={handleMarkPracticed}
              loading={loading}
            />
          ))}
        </div>
      )}
    </div>
  )
}