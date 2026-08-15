import { create } from "zustand"
import { workspaceApi } from "@/lib/api"
import type { Workspace } from "@/lib/types"

const ACTIVE_WORKSPACE_KEY = "activeWorkspaceId"

interface WorkspaceStore {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  fetchWorkspaces: () => Promise<void>
  setActiveWorkspace: (workspace: Workspace) => void
  addWorkspace: (workspace: Workspace) => void
  reset: () => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true })
    try {
      const workspaces = await workspaceApi.getAll()
      set({ workspaces })

      // Restore previously selected workspace, or default to first
      const savedId = typeof window !== "undefined"
        ? localStorage.getItem(ACTIVE_WORKSPACE_KEY)
        : null

      const restored = workspaces.find((w) => w._id === savedId)
      const active = restored ?? workspaces[0] ?? null
      set({ activeWorkspace: active })
    } catch (err) {
      console.error("Failed to fetch workspaces", err)
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveWorkspace: (workspace) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, workspace._id)
    }
    set({ activeWorkspace: workspace })
  },

  addWorkspace: (workspace) => {
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
      activeWorkspace: state.activeWorkspace ?? workspace,
    }))
  },

  reset: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
    }
    set({ workspaces: [], activeWorkspace: null })
  },
}))
