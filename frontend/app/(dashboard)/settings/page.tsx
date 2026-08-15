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
import { Settings as SettingsIcon, Users, Save, Trash2, Layers, AlertTriangle, UserMinus } from "lucide-react"

export default function SettingsPage() {
  const { activeWorkspace, fetchWorkspaces } = useWorkspaceStore()
  const { user } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name)
      setDescription(activeWorkspace.description || "")
    }
  }, [activeWorkspace])

  if (!activeWorkspace || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center">
          <SettingsIcon className="h-10 w-10 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">No workspace selected</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Select a workspace to view its settings
          </p>
        </div>
      </div>
    )
  }

  const isOwner = activeWorkspace.owner.email === user.email
  const isAdmin = isOwner || activeWorkspace.members.some(m => m.user.email === user.email && m.role === "admin")

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      await workspaceApi.update(activeWorkspace._id, { name, description })
      toast({ title: "Workspace updated successfully" })
      await fetchWorkspaces() // Refresh store
    } catch (err: any) {
      toast({ title: "Failed to update workspace", description: err.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      await workspaceApi.removeMember(activeWorkspace._id, memberId)
      toast({ title: "Member removed" })
      await fetchWorkspaces()
    } catch (err: any) {
      toast({ title: "Failed to remove member", description: err.message, variant: "destructive" })
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            {activeWorkspace.name}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your workspace details and members.
          </p>
        </div>
      </div>

      {/* General Settings */}
      <Card className="rounded-3xl border border-border/60 shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            General Settings
          </CardTitle>
          <CardDescription>Update your workspace details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="workspace-form" onSubmit={handleUpdate} className="space-y-4 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Workspace Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!isAdmin}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold">Description</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!isAdmin}
                className="rounded-xl"
              />
            </div>
          </form>
        </CardContent>
        {isAdmin && (
          <CardFooter className="bg-muted/30 border-t px-6 py-4">
            <Button type="submit" form="workspace-form" disabled={loading || !name.trim()} className="rounded-xl font-bold">
              <Save className="h-4 w-4 mr-2" />
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
            <Badge variant="secondary" className="rounded-full px-3">{activeWorkspace.members.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeWorkspace.members.map((member) => {
              const isMemberOwner = member.user.email === activeWorkspace.owner.email
              const isCurrentUser = member.user.email === user.email
              
              return (
                <div key={member.user._id} className="flex items-center justify-between p-3 rounded-2xl border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {member.user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {member.user.email} {isCurrentUser && <span className="text-muted-foreground font-normal">(You)</span>}
                      </p>
                      <div className="flex gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {isMemberOwner ? "Owner" : member.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Remove Button */}
                  {(isAdmin || isCurrentUser) && !isMemberOwner && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Delete Workspace</p>
                <p className="text-xs text-muted-foreground">This action cannot be undone. All data will be lost.</p>
              </div>
              <Button variant="destructive" className="rounded-xl font-bold" disabled>
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
