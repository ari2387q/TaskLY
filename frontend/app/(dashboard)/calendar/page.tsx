"use client"

import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { taskApi, milestoneApi } from "@/lib/api"
import type { Task, Milestone } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar as CalendarIcon, Clock, Target, Layers, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns"

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspaceStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  useEffect(() => {
    if (!activeWorkspace) {
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all([
      taskApi.getWorkspace(activeWorkspace._id),
      milestoneApi.getWorkspace(activeWorkspace._id)
    ])
    .then(([t, m]) => {
      setTasks(t.filter(task => task.dueDate))
      setMilestones(m.filter(mile => mile.targetDate))
    })
    .finally(() => setLoading(false))
  }, [activeWorkspace])

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const today = () => setCurrentMonth(new Date())

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
          <Layers className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Select a workspace to view its calendar
          </p>
        </div>
      </div>
    )
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Start with empty cells to pad the first row until the day of the week the month starts on
  const startDay = startOfMonth(currentMonth).getDay()
  const paddingDays = Array(startDay).fill(null)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {activeWorkspace.name}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Deadlines and targets for your workspace
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={today}>Today</Button>
          <div className="flex items-center bg-card border rounded-lg overflow-hidden h-9">
            <Button variant="ghost" size="icon" className="h-full rounded-none px-2" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="px-4 font-semibold text-sm min-w-[120px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button variant="ghost" size="icon" className="h-full rounded-none px-2" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border border-border/60 shadow-lg overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-wider border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,auto)] bg-muted/20">
          {paddingDays.map((_, i) => (
            <div key={`pad-${i}`} className="border-r border-b border-border/50 bg-muted/10" />
          ))}
          
          {daysInMonth.map((day) => {
            const dayTasks = tasks.filter(t => isSameDay(new Date(t.dueDate!), day))
            const dayMilestones = milestones.filter(m => isSameDay(new Date(m.targetDate!), day))
            const isCurrToday = isToday(day)
            
            return (
              <div 
                key={day.toString()} 
                className={cn(
                  "border-r border-b border-border/50 p-2 transition-colors relative min-h-[120px]",
                  isCurrToday ? "bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full",
                    isCurrToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                </div>
                
                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                  {dayMilestones.map(m => (
                    <div key={m._id} className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md p-1.5 font-medium flex items-start gap-1">
                      {m.isCompleted ? <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5 text-emerald-500" /> : <Target className="h-3 w-3 shrink-0 mt-0.5 text-emerald-500" />}
                      <span className="line-clamp-2 leading-tight">{m.title}</span>
                    </div>
                  ))}
                  
                  {dayTasks.map(t => (
                    <div key={t._id} className={cn(
                      "text-[10px] border rounded-md p-1.5 font-medium flex flex-col gap-0.5",
                      t.status === "completed"
                        ? "bg-muted text-muted-foreground border-border"
                        : t.priority === "high"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          : t.priority === "medium"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20"
                    )}>
                      <span className="flex items-start gap-1">
                        {t.status === "completed" ? <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" /> : <Clock className="h-3 w-3 shrink-0 mt-0.5" />}
                        <span className={cn("line-clamp-2 leading-tight", t.status === "completed" && "line-through")}>{t.title}</span>
                      </span>
                      {t.assignee && (
                        <span className="text-[9px] opacity-75 pl-4 truncate">
                          👤 {t.assignee.name || t.assignee.email}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground bg-card p-4 rounded-2xl border">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500/20 border border-emerald-500/40" />
          <span>Milestone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-rose-500/20 border border-rose-500/40" />
          <span>High Priority Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500/20 border border-amber-500/40" />
          <span>Medium Priority Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-sky-500/20 border border-sky-500/40" />
          <span>Low Priority Task</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span>👤</span>
          <span>Assigned member</span>
        </div>
      </div>
    </div>
  )
}
