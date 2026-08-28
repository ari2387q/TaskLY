import { useAuthStore } from "@/lib/auth-store"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"

/**
 * Returns the current user's role in the active workspace.
 * - "admin"  → workspace owner or member with role "admin"
 * - "member" → member with role "member"
 * - null     → not a member / no workspace selected
 */
export function useRole(): "admin" | "member" | null {
  const user = useAuthStore((s) => s.user)
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace)

  if (!user || !activeWorkspace) return null

  // Workspace owner is always admin
  if (activeWorkspace.owner._id === user.id) return "admin"

  const member = activeWorkspace.members.find(
    (m) => m.user._id === user.id
  )
  if (!member) return null

  return member.role // "admin" | "member"
}

/** Convenience boolean: true if the current user is an admin in the active workspace */
export function useIsAdmin(): boolean {
  return useRole() === "admin"
}
