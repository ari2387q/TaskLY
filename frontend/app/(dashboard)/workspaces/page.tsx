"use client"

import { useState, useEffect } from "react"
import { Plus, Users, Layers, Settings, Trash2, Crown, UserCheck, ChevronRight, X, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { workspaceApi } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import type { Workspace } from "@/lib/types"
import { cn } from "@/lib/utils"

function CreateWorkspaceDialog({ onClose, onCreate }: { onClose: () => void; onCreate: (ws: Workspace) => void }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError("")
    try {
      const ws = await workspaceApi.create(name.trim(), description.trim() || undefined)
      onCreate(ws)
      onClose()
    } catch (err: any) {
      setError(err.message ?? "Failed to create workspace")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="border border-border/60 shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">New Workspace</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Create a learning domain or track</CardDescription>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Name <span className="text-destructive">*</span></label>
                <Input
                  placeholder="e.g. Software Engineering, Language Learning..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                <Input
                  placeholder="What will you learn in this workspace?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl font-bold" disabled={loading || !name.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function InviteMemberDialog({ workspace, onClose }: { workspace: Workspace; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<"admin" | "member">("member")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      await workspaceApi.addMember(workspace._id, email.trim(), role)
      setSuccess(`${email} has been added as ${role}`)
      setEmail("")
    } catch (err: any) {
      setError(err.message ?? "Failed to add member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-md"
      >
        <Card className="border border-border/60 shadow-2xl shadow-black/40 rounded-3xl overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-secondary/10 border border-secondary/20">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Invite Member</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Add someone to <span className="font-semibold text-foreground">{workspace.name}</span></CardDescription>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Email address</label>
                <Input placeholder="colleague@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">Role</label>
                <div className="flex gap-2">
                  {(["member", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-xl text-sm font-semibold border transition-all",
                        role === r
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      )}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-emerald-500">{success}</p>}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Done</Button>
                <Button type="submit" className="flex-1 rounded-xl font-bold" disabled={loading || !email.trim()}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
                  Invite
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function WorkspaceCard({
  workspace,
  isActive,
  onActivate,
  onInvite,
  currentUserEmail,
}: {
  workspace: Workspace
  isActive: boolean
  onActivate: () => void
  onInvite: () => void
  currentUserEmail: string
}) {
  const isOwner = workspace.owner?.email === currentUserEmail

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          "rounded-3xl border transition-all duration-300 cursor-pointer group hover:shadow-xl hover:-translate-y-1",
          isActive
            ? "border-primary/50 shadow-lg shadow-primary/10 bg-gradient-to-br from-primary/5 to-transparent"
            : "border-border hover:border-primary/30"
        )}
        onClick={onActivate}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              {/* Workspace avatar */}
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transition-all",
                isActive ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30" : "bg-muted border-border group-hover:border-primary/40"
              )}>
                {workspace.name[0].toUpperCase()}
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {workspace.name}
                  {isActive && (
                    <Badge className="text-[10px] px-2 py-0 h-4 bg-primary/15 text-primary border border-primary/30 font-bold">
                      Active
                    </Badge>
                  )}
                </CardTitle>
                {workspace.description && (
                  <CardDescription className="text-xs mt-0.5 line-clamp-1">{workspace.description}</CardDescription>
                )}
              </div>
            </div>
            {isActive && <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {workspace.members?.length ?? 1} member{(workspace.members?.length ?? 1) !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1">
                {isOwner ? (
                  <><Crown className="h-3.5 w-3.5 text-amber-500" /> Owner</>
                ) : (
                  <><UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Member</>
                )}
              </span>
            </div>
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs rounded-full px-3 text-muted-foreground hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); onInvite() }}
              >
                <Users className="h-3 w-3 mr-1.5" />
                Invite
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function WorkspacesPage() {
  const { workspaces, activeWorkspace, setActiveWorkspace, addWorkspace, fetchWorkspaces } = useWorkspaceStore()
  const { user } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [inviteTarget, setInviteTarget] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchWorkspaces().finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-2xl bg-primary/10 border border-primary/20">
              <Layers className="h-6 w-6 text-primary" />
            </span>
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Organize your learning into focused domains
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="rounded-full px-5 h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
      </div>

      {/* Stats row */}
      {workspaces.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total", value: workspaces.length, icon: Layers },
            { label: "Members total", value: workspaces.reduce((a, w) => a + (w.members?.length ?? 1), 0), icon: Users },
            { label: "Active", value: activeWorkspace?.name ?? "—", icon: Settings, isText: true },
          ].map((stat) => (
            <Card key={stat.label} className="rounded-2xl border border-border/60">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-muted">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className={cn("font-black text-foreground", stat.isText ? "text-sm" : "text-xl")}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Workspaces grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl border border-border/40 animate-pulse h-40" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
            <Layers className="h-10 w-10 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">No workspaces yet</h2>
            <p className="text-sm text-muted-foreground mt-1">Create your first workspace to start organizing your skills</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="rounded-full px-6 font-bold mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws._id}
                workspace={ws}
                isActive={activeWorkspace?._id === ws._id}
                onActivate={() => setActiveWorkspace(ws)}
                onInvite={() => setInviteTarget(ws)}
                currentUserEmail={user?.email ?? ""}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <AnimatePresence>
        {showCreate && (
          <CreateWorkspaceDialog
            onClose={() => setShowCreate(false)}
            onCreate={(ws) => addWorkspace(ws)}
          />
        )}
        {inviteTarget && (
          <InviteMemberDialog workspace={inviteTarget} onClose={() => setInviteTarget(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
