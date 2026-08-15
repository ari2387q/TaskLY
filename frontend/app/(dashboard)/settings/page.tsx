"use client"

import { useEffect, useState } from "react"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { useAuth } from "@/contexts/auth-context"
import { workspaceApi } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Settings as SettingsIcon, Users, Save, Trash2, Layers, AlertTriangle, UserMinus, Loader2, Mail, Plus, X } from "lucide-react"
import type { Workspace } from "@/lib/types"

export default function SettingsPage() {
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore()
  const { user } = useAuth()
  const { toast } = useToast()

  // Fetch full workspace data (with populated members) directly from the API
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loadingWorkspace, setLoadingWorkspace] = useState(true)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)

  // Invite member state
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member")
  const [inviting, setInviting] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  const loadWorkspace = async (id: string) => {
    setLoadingWorkspace(true)
    try {
      const ws = await workspaceApi.getById(id)
      setWorkspace(ws)
      setName(ws.name)
      setDescription(ws.description || "")
    } catch (err: any) {
      toast({ title: "Failed to load workspace", description: err.message, variant: "destructive" })
    } finally {
      setLoadingWorkspace(false)
    }
  }

  useEffect(() => {
    if (activeWorkspace?._id) {
      loadWorkspace(activeWorkspace._id)
    } else {
      setLoadingWorkspace(false)
    }
  }, [activeWorkspace?._id])

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
          <SettingsIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Select a workspace from the sidebar to view its settings.
          </p>
        </div>
      </div>
    )
  }

  if (loadingWorkspace) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workspace || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
        <p className="text-destructive font-semibold">Failed to load workspace settings.</p>
        <Button variant="outline" onClick={() => loadWorkspace(activeWorkspace._id)}>Retry</Button>
      </div>
    )
  }

  const isOwner = workspace.owner.email === user.email
  const isAdmin = isOwner || workspace.members.some(m => m.user.email === user.email && m.role === "admin")

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSaving(true)
    try {
      await workspaceApi.update(workspace._id, { name, description })
      toast({ title: "✅ Workspace updated successfully" })
      await fetchWorkspaces()
      await loadWorkspace(workspace._id)
    } catch (err: any) {
      toast({ title: "Failed to update workspace", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveMember = async (memberId: string, memberEmail: string) => {
    const isSelf = memberEmail === user.email
    const confirmed = window.confirm(
      isSelf ? "Are you sure you want to leave this workspace?" : `Remove ${memberEmail} from this workspace?`
    )
    if (!confirmed) return

    try {
      await workspaceApi.removeMember(workspace._id, memberId)
      toast({ title: isSelf ? "Left workspace" : "Member removed" })
      await fetchWorkspaces()
      await loadWorkspace(workspace._id)
    } catch (err: any) {
      toast({ title: "Failed to remove member", description: err.message, variant: "destructive" })
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      await workspaceApi.addMember(workspace._id, inviteEmail.trim(), inviteRole)
      toast({ title: `✅ ${inviteEmail} added to workspace` })
      setInviteEmail("")
      setShowInvite(false)
      await loadWorkspace(workspace._id)
    } catch (err: any) {
      toast({ title: "Failed to add member", description: err.message, variant: "destructive" })
    } finally {
      setInviting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          {workspace.name}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage workspace details and members.
        </p>
      </div>

      {/* General Settings */}
      <Card className="rounded-3xl border border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            General Settings
          </CardTitle>
          <CardDescription>Update your workspace name and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="workspace-form" onSubmit={handleUpdate} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Workspace Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                placeholder="e.g. Software Engineering"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
                placeholder="What is this workspace for?"
                className="rounded-xl"
              />
            </div>
          </form>
        </CardContent>
        {isAdmin && (
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button type="submit" form="workspace-form" disabled={saving || !name.trim()} className="rounded-xl font-bold gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Members */}
      <Card className="rounded-3xl border border-border/60 shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                Members
              </CardTitle>
              <CardDescription>People with access to this workspace.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-3">{workspace.members.length}</Badge>
              {isAdmin && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 text-xs"
                  onClick={() => setShowInvite(!showInvite)}
                >
                  {showInvite ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {showInvite ? "Cancel" : "Invite"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Invite form */}
          {showInvite && isAdmin && (
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2 p-3 rounded-2xl border bg-muted/30">
              <div className="flex items-center gap-2 flex-1 bg-card border rounded-xl px-3 h-10">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <Input
                  type="email"
                  placeholder="colleague@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="border-0 p-0 h-auto focus-visible:ring-0 text-sm bg-transparent"
                  autoFocus
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "admin" | "member")}
                className="h-10 rounded-xl border bg-card px-3 text-sm font-medium"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
              <Button type="submit" disabled={inviting || !inviteEmail.trim()} className="h-10 rounded-xl font-bold gap-2 shrink-0">
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </form>
          )}

          {/* Member list */}
          <div className="space-y-2">
            {workspace.members.map((member) => {
              const isMemberOwner = member.user.email === workspace.owner.email
              const isCurrentUser = member.user.email === user.email
              const displayEmail = member.user.email || "Unknown user"

              return (
                <div key={member.user._id} className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                      {displayEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        {displayEmail}
                        {isCurrentUser && <span className="text-[10px] text-muted-foreground font-normal bg-muted px-1.5 py-0.5 rounded-full">You</span>}
                      </p>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 mt-0.5">
                        {isMemberOwner ? "Owner" : member.role}
                      </Badge>
                    </div>
                  </div>

                  {(isAdmin || isCurrentUser) && !isMemberOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.user._id, displayEmail)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      title={isCurrentUser ? "Leave workspace" : "Remove member"}
                    >
                      {isCurrentUser ? <UserMinus className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {isAdmin && (
        <Card className="rounded-3xl border border-destructive/20 shadow-md bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription className="text-destructive/80">Irreversible and destructive actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-sm">Delete Workspace</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone. All skills, tasks, and milestones will be permanently deleted.</p>
              </div>
              <Button variant="destructive" className="rounded-xl font-bold shrink-0" disabled>
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
