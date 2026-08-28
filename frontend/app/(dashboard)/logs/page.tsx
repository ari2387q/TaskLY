"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ClipboardList, Plus } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { logsApi, skillsApi } from "@/lib/api"
import type { Log, Skill } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ADD
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedSkillId, setSelectedSkillId] = useState("")
  const [logNotes, setLogNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // EDIT
  const [editingLog, setEditingLog] = useState<Log | null>(null)
  const [editNotes, setEditNotes] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // DELETE
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)

  const { toast } = useToast()
  const { activeWorkspace } = useWorkspaceStore()

  const getSkillName = (log: Log) => {
    if (log.skillName) return log.skillName
    const found = skills.find((s) => s.id === log.skillId)
    return found ? found.name : "Unknown Skill"
  }

  /* =========================
        FILTER + DEDUPE
     ========================= */
  const visibleLogs = (() => {
    const filtered = logs.filter((log) => {
      if (log.skillName) return true
      return skills.some((s) => s.id === log.skillId)
    })

    const dayKey = (d?: string) => {
      if (!d) return ""
      const dt = new Date(d)
      if (isNaN(dt.getTime())) return ""
      return dt.toISOString().split("T")[0]
    }

    const groups: Record<string, Log[]> = {}
    for (const lg of filtered) {
      const key = `${lg.skillId}::${dayKey(lg.date)}`
      groups[key] = groups[key] || []
      groups[key].push(lg)
    }

    const result: Log[] = []
    Object.values(groups).forEach((arr) => {
      const withNotes = arr.find((a) => a.notes?.trim())
      if (withNotes) result.push(withNotes)
      else result.push(arr.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0])
    })

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })()

  /* =========================
        FETCH DATA
     ========================= */
  useEffect(() => {
    async function fetchData() {
      try {
        const wsId = activeWorkspace?._id
        const [logsData, skillsData] = await Promise.all([
          logsApi.getAll(),
          wsId ? skillsApi.getAll(wsId) : Promise.resolve([]),
        ])
        setLogs(logsData)
        setSkills(skillsData.filter((s) => s.isActive))
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: error.message,
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [toast])

  /* =========================
          ADD LOG
     ========================= */
  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSkillId) return

    setIsSubmitting(true)
    try {
      await logsApi.create(selectedSkillId, new Date().toISOString(), logNotes)
      toast({ title: "Log added" })
      setIsAddDialogOpen(false)
      setSelectedSkillId("")
      setLogNotes("")
      setLogs(await logsApi.getAll())
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }
          //UPDATE LOG 
  const handleUpdateLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingLog) return

    try {
      await logsApi.update(editingLog.id, { notes: editNotes })
      toast({ title: "Log updated" })
      setIsEditDialogOpen(false)
      setEditingLog(null)
      setEditNotes("")
      setLogs(await logsApi.getAll())
    } catch (err: any) {
      toast({ variant: "destructive", title: err.message })
    }
  }
          //DELETE LOG
  const handleDeleteLog = async (logId: string) => {
  try {
    await logsApi.remove(logId)

    toast({
      title: "Log deleted",
    })

    setLogs(prev => prev.filter(l => l.id !== logId))
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "Delete failed",
      description: error.message || "Could not delete log",
    })
  }
}

  return (
    <div className="space-y-8">

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Logs</h1>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full font-bold shadow-md shadow-primary/10 hover:shadow-primary/20"><Plus className="h-4 w-4 mr-1 animate-pulse" />Add Daily</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleAddLog}>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">Add Log</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Select a skill and jot down any practice notes for today.</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">Skill</Label>
                  <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                    <SelectTrigger className="w-full rounded-xl">
                      <SelectValue placeholder="Choose a skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">Notes</Label>
                  <Textarea
                    placeholder="Describe what you worked on today (optional)..."
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="submit" disabled={isSubmitting || !selectedSkillId} className="w-full sm:w-auto rounded-full font-bold">
                  {isSubmitting ? "Saving..." : "Save Log"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* LOG LIST */}
      <Card>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : visibleLogs.map((log) => (
            <div key={log.id} className="py-3 border-b">
              <div className="flex justify-between">
                <b>{getSkillName(log)}</b>
                <span className="text-sm text-muted-foreground">
                  {new Date(log.date).toDateString()}
                </span>
              </div>

              {log.notes && <p className="mt-2">{log.notes}</p>}

              <div className="mt-4 flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-4 text-xs font-semibold rounded-full"
                  onClick={() => {
                    setEditingLog(log)
                    setEditNotes(log.notes || "")
                    setIsEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  className="h-8 px-4 text-xs font-semibold rounded-full"
                  disabled={isDeletingId === log.id}
                  onClick={() => handleDeleteLog(log.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* EDIT DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleUpdateLog}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Log</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Modify your practice session notes.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Notes</Label>
                <Textarea
                  placeholder="Describe what you worked on..."
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="min-h-[100px] rounded-xl resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="submit" className="w-full sm:w-auto rounded-full font-bold">
                Update
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
