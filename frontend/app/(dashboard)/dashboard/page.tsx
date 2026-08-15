"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Rocket, Trophy, Calendar, Plus, Zap, Target, CheckCircle2, ListTodo, Layers, Clock } from "lucide-react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

import { dashboardApi, skillsApi } from "@/lib/api"
import type { DashboardData, Skill } from "@/lib/types"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"

const COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow/Gold
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f97316"  // Orange
]

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const { activeWorkspace } = useWorkspaceStore()

  useEffect(() => {
    const wsId = activeWorkspace?._id
    const fetches: Promise<any>[] = [dashboardApi.get(wsId)]
    if (wsId) fetches.push(skillsApi.getAll(wsId))

    Promise.all(fetches)
      .then(([dbData, skillsData]) => {
        setData(dbData)
        setSkills(skillsData ?? [])
      })
      .catch((err) => {
        console.error("Dashboard page load failed", err)
      })
      .finally(() => setLoading(false))
  }, [activeWorkspace?._id])

  if (loading) return <DashboardSkeleton />
  if (!data) return <p className="text-red-500">Failed to load dashboard</p>

  const taskChartData = [
    { name: "To Do", value: data.totalTasks - data.completedTasks - data.inProgressTasks, color: "#94a3b8" },
    { name: "In Progress", value: data.inProgressTasks, color: "#f59e0b" },
    { name: "Completed", value: data.completedTasks, color: "#10b981" },
  ].filter(d => d.value > 0)

  const milestoneProgress = data.totalMilestones > 0 
    ? Math.round((data.completedMilestones / data.totalMilestones) * 100) 
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {activeWorkspace?.name ?? "Overview"}
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Project overview and progress tracking.</p>
        </div>
        <div className="text-xs font-semibold bg-accent text-accent-foreground px-4 py-2 rounded-full border border-primary/20 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-amber-500" />
          {data.activeStreak} Day Streak
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tasks"
          value={data.totalTasks}
          icon={ListTodo}
          description={`${data.completedTasks} completed`}
          cardClass="bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg border-none"
        />
        <StatCard
          title="Milestones"
          value={`${milestoneProgress}%`}
          icon={Target}
          description={`${data.completedMilestones} of ${data.totalMilestones} done`}
          cardClass="bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg border-none"
        />
        <StatCard
          title="Upcoming"
          value={data.upcomingTasks}
          icon={Clock}
          description="Due in next 7 days"
          cardClass="bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg border-none"
        />
        <StatCard
          title="Total Skills"
          value={data.totalSkills}
          icon={Rocket}
          description="Active learning areas"
          cardClass="bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-lg border-none"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Task Distribution Chart */}
        <Card className="col-span-full lg:col-span-4 border border-border dark:border-primary/20 dark:bg-black/40 backdrop-blur-md hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-primary" />
              <span>Task Status Distribution</span>
            </CardTitle>
            <CardDescription>Visual breakdown of your workspace tasks</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px] flex flex-col md:flex-row items-center justify-center gap-4">
            {taskChartData.length > 0 ? (
              <>
                <div className="w-full md:w-1/2 h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={taskChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                        isAnimationActive={true}
                      >
                        {taskChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-extrabold text-foreground">{data.totalTasks}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mt-0.5">
                      Tasks
                    </span>
                  </div>
                </div>

                {/* Custom Legend */}
                <div className="w-full md:w-1/2 max-h-[220px] overflow-y-auto space-y-3 pr-2">
                  {taskChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="font-semibold">{entry.name}</span>
                      </div>
                      <span className="text-muted-foreground font-bold">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <ListTodo className="h-10 w-10 text-muted-foreground animate-pulse" />
                <div>
                  <p className="font-medium text-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add tasks to your skills to track progress here.
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <Link href="/skills">Manage Skills</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-full lg:col-span-3 border border-border dark:border-primary/20 dark:bg-black/40 backdrop-blur-md hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get things done faster.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button asChild variant="outline" className="justify-start gap-3 h-14 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/skills">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <ListTodo className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">Manage Tasks</div>
                  <div className="text-[10px] text-muted-foreground">Update your progress</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start gap-3 h-14 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
              <Link href="/calendar">
                <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-bold text-sm">View Calendar</div>
                  <div className="text-[10px] text-muted-foreground">Check upcoming deadlines</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Motivation Bottom Card */}
      <Card className="border border-border dark:border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 dark:from-primary/10 dark:to-transparent backdrop-blur-md rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-2">
          <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Daily Boost</span>
          <CardTitle className="text-xl font-bold">Motivation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl bg-background/50 dark:bg-black/50 p-6 border border-border dark:border-primary/10">
            <blockquote className="text-lg font-medium italic text-foreground/90">
              "{data.motivation}"
            </blockquote>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-popover border border-border p-3 rounded-2xl shadow-xl text-xs space-y-1">
        <p className="font-extrabold text-foreground">{data.name}</p>
        <p className="text-muted-foreground">
          Count: <span className="font-bold text-primary">{data.value}</span>
        </p>
      </div>
    )
  }
  return null
}

function StatCard({ title, value, icon: Icon, description, cardClass, iconClass }: any) {
  return (
    <Card className={`hover:-translate-y-1.5 hover:scale-[1.03] transition-all duration-300 ease-out cursor-pointer group ${cardClass ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider opacity-90">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-white/20 text-white shrink-0 group-hover:scale-110 transition-transform duration-300">
          <Icon className={`h-4 w-4 ${iconClass ?? ""}`} />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="text-4xl font-extrabold tracking-tight">{value}</div>
        <p className="text-[11px] opacity-80 mt-1">{description}</p>
      </CardContent>
    </Card>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-72 rounded-3xl" />
        <Skeleton className="lg:col-span-3 h-72 rounded-3xl" />
      </div>
    </div>
  )
}
