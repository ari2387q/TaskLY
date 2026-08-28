"use client"

import { useAuth } from "@/contexts/auth-context"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"

/**
 * Returns the current user's role in the active workspace.
 * - "admin"  → workspace owner or member with role "admin"
 * - "member" → member with role "member"
 * - null     → not a member / no workspace selected
 */
export function useRole(): "admin" | "member" | null {
  const { user } = useAuth()
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)

  if (!user || !activeWorkspace) return null

  const userId = ((user as any)._id || user.id)?.toString()
  if (!userId) return null

  // Check if owner
  const owner = activeWorkspace.owner as any
  const ownerId = (typeof owner === "object" ? (owner?._id || owner?.id) : owner)?.toString()

  if (ownerId && ownerId === userId) return "admin"

  // Check members array
  const member = activeWorkspace.members?.find((m: any) => {
    const memberUserId = (typeof m.user === "object"
      ? (m.user?._id || m.user?.id)
      : m.user)?.toString()
    return memberUserId === userId
  })

  if (!member) return null

  return member.role // "admin" | "member"
}

/** Convenience boolean: true if the current user is an admin in the active workspace */
export function useIsAdmin(): boolean {
  return useRole() === "admin"
}
