import type { Skill, Log, DashboardData, StatsData, User, Workspace, Milestone, Task } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = "ApiError"
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")
  const headers: HeadersInit = { "Content-Type": "application/json", ...options.headers }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE_URL}${url}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }))
    throw new ApiError(res.status, err.message || "Request failed")
  }
  return res.json()
}

/* ========== Auth API ========== */
export const authApi = {
  login: async (email: string, password: string) => {
    const data = await fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })
    if (data.token) localStorage.setItem("token", data.token)
    return data
  },
  register: async (email: string, password: string, name?: string) => {
    const data = await fetchWithAuth("/auth/register", { method: "POST", body: JSON.stringify({ email, password, name }) })
    if (data.token) localStorage.setItem("token", data.token)
    return data
  },
  logout: () => localStorage.removeItem("token"),
  getProfile: async (): Promise<{ user: User }> => fetchWithAuth("/auth/profile"),
}

/* ========== Skills API ========== */
export const skillsApi = {
  getAll: async (workspaceId: string): Promise<Skill[]> => {
    const res = await fetchWithAuth(`/skills?workspaceId=${workspaceId}`)
    if (Array.isArray(res)) return res
    if ("skills" in res) return res.skills as Skill[]
    return []
  },
  toggleActive: async (id: string): Promise<Skill> => {
    return fetchWithAuth(`/skills/${id}/toggle`, { method: "PATCH" }) as Promise<Skill>
  },
  create: async (name: string, workspaceId: string): Promise<Skill> => {
    const res = await fetchWithAuth("/skills", { method: "POST", body: JSON.stringify({ name, workspaceId }) })
    const payload = res as any
    const backendSkill = payload.skill ?? payload
    return backendSkill as Skill
  },
  markPracticed: async (id: string): Promise<Skill> =>
    fetchWithAuth(`/skills/${id}/practice`, { method: "POST", body: JSON.stringify({}) }) as Promise<Skill>,
}

/* ========== Workspace API ========== */
export const workspaceApi = {
  getAll: async (): Promise<Workspace[]> => {
    const res = await fetchWithAuth("/workspaces")
    return res.workspaces ?? []
  },
  create: async (name: string, description?: string): Promise<Workspace> => {
    const res = await fetchWithAuth("/workspaces", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
    return res.workspace
  },
  getById: async (id: string): Promise<Workspace> => {
    const res = await fetchWithAuth(`/workspaces/${id}`)
    return res.workspace
  },
  addMember: async (id: string, email: string, role: "admin" | "member" = "member"): Promise<Workspace> => {
    const res = await fetchWithAuth(`/workspaces/${id}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    })
    return res.workspace
  },
  update: async (id: string, updates: { name?: string; description?: string }): Promise<Workspace> => {
    const res = await fetchWithAuth(`/workspaces/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
    return res.workspace
  },
  removeMember: async (id: string, memberId: string): Promise<Workspace> => {
    const res = await fetchWithAuth(`/workspaces/${id}/members/${memberId}`, {
      method: "DELETE",
    })
    return res.workspace
  },
}

/* ========== Milestone API ========== */
export const milestoneApi = {
  getBySkill: async (skillId: string): Promise<Milestone[]> => {
    const res = await fetchWithAuth(`/milestones/skill/${skillId}`)
    return res.milestones ?? []
  },
  getWorkspace: async (workspaceId: string): Promise<Milestone[]> => {
    const res = await fetchWithAuth(`/milestones?workspaceId=${workspaceId}`)
    return res.milestones ?? []
  },
  create: async (skillId: string, title: string, description?: string, targetDate?: string): Promise<Milestone> => {
    const res = await fetchWithAuth("/milestones", {
      method: "POST",
      body: JSON.stringify({ skillId, title, description, targetDate }),
    })
    return res.milestone
  },
  toggle: async (id: string): Promise<Milestone> => {
    const res = await fetchWithAuth(`/milestones/${id}/toggle`, { method: "PATCH" })
    return res.milestone
  },
}

/* ========== Task API ========== */
export const taskApi = {
  getBySkill: async (skillId: string): Promise<Task[]> => {
    const res = await fetchWithAuth(`/tasks/skill/${skillId}`)
    return res.tasks ?? []
  },
  getWorkspace: async (workspaceId: string): Promise<Task[]> => {
    const res = await fetchWithAuth(`/tasks?workspaceId=${workspaceId}`)
    return res.tasks ?? []
  },
  create: async (
    skillId: string,
    title: string,
    opts?: { description?: string; priority?: "low" | "medium" | "high"; dueDate?: string; duration?: number }
  ): Promise<Task> => {
    const res = await fetchWithAuth("/tasks", {
      method: "POST",
      body: JSON.stringify({ skillId, title, ...opts }),
    })
    return res.task
  },
  update: async (
    id: string,
    updates: { title?: string; description?: string; status?: Task["status"]; priority?: Task["priority"]; dueDate?: string; duration?: number }
  ): Promise<Task> => {
    const res = await fetchWithAuth(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
    return res.task
  },
}

/* ========== Logs API ========== */
export const logsApi = {
  getAll: async (start?: string, end?: string): Promise<Log[]> => {
    const params = new URLSearchParams()
    if (start) params.append("startDate", start)
    if (end) params.append("endDate", end)
    const query = params.toString() ? `?${params.toString()}` : ""

    const res = await fetchWithAuth(`/logs${query}`)
    const raw = res.logs ?? []
    // Normalize backend log shape to frontend `Log` type
    return (Array.isArray(raw) ? raw : []).map((backendLog: any) => {
      const id = backendLog._id ?? backendLog.id ?? ""
      const skillId = backendLog.skill?.toString?.() ?? backendLog.skillId ?? ""
      const skillName = backendLog.skill?.name ?? backendLog.skillName ?? ""
      const date = backendLog.practicedAt ?? backendLog.date ?? ""
      const notes = backendLog.notes ?? null
      const createdAt = backendLog.createdAt ?? new Date().toISOString()
      return {
        id,
        skillId,
        skillName,
        date,
        notes,
        createdAt,
      } as Log
    })
  },

  create: async (skillId: string, practicedAt: string, notes?: string): Promise<Log> => {
    const body = { skillId, practicedAt, notes }
    const res = await fetchWithAuth("/logs", {
      method: "POST",
      body: JSON.stringify(body),
    })
   
    const payload = res as any
    const backendLog =
      payload.log ?? (Array.isArray(payload.logs) ? payload.logs[0] : null) ??
      (payload && (payload._id || payload.id) ? payload : null)

    if (!backendLog) throw new ApiError(500, "Unexpected response from logs.create")

    const id = backendLog._id ?? backendLog.id ?? ""
    const skillIdResp = backendLog.skill?.toString?.() ?? backendLog.skillId ?? ""
    const skillName = backendLog.skillName ?? backendLog.skill?.name ?? ""
    const date = backendLog.practicedAt ?? backendLog.date
    const notesResp = backendLog.notes ?? null
    const createdAt = backendLog.createdAt ?? new Date().toISOString()

    return {
      id,
      skillId: skillIdResp,
      skillName,
      date,
      notes: notesResp,
      createdAt,
    }
  },
getGrouped: async (): Promise<Record<string, Record<string, Log[]>>> => {
  const res = await fetchWithAuth("/logs/grouped")
  const grouped = res.grouped ?? {}

  const normalized: Record<string, Record<string, Log[]>> = {}

  Object.entries(grouped).forEach(([date, skills]: any) => {
    normalized[date] = {}

    Object.entries(skills).forEach(([skillName, logs]: any) => {
      normalized[date][skillName] = (logs as any[]).map((backendLog) => {
        const id = backendLog._id ?? backendLog.id ?? ""
        const skillId =
          backendLog.skill?.toString?.() ??
          backendLog.skillId ??
          ""
        const createdAt =
          backendLog.createdAt ?? new Date().toISOString()

        return {
          id,
          skillId,
          skillName,
          date: backendLog.practicedAt,
          notes: backendLog.notes ?? null,
          createdAt,
        } as Log
      })
    })
  })

  return normalized
},

update: async (
  logId: string,
  updates: { notes?: string; practicedAt?: string; duration?: number }
): Promise<Log> => {
  const res = await fetchWithAuth(`/logs/${logId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })

  const backendLog = res.log ?? res

  if (!backendLog) {
    throw new ApiError(500, "Unexpected response from logs.update")
  }

  return {
    id: backendLog._id ?? backendLog.id,
    skillId:
      backendLog.skill?.toString?.() ??
      backendLog.skillId ??
      "",
    skillName:
      backendLog.skillName ??
      backendLog.skill?.name ??
      "",
    date: backendLog.practicedAt,
    notes: backendLog.notes ?? null,
    createdAt:
      backendLog.createdAt ?? new Date().toISOString(),
  }
},

remove: async (logId: string): Promise<void> => {
  await fetchWithAuth(`/logs/${logId}`, {
    method: "DELETE",
  })
},

}
export const aiApi = {
  send: async (prompt: string) =>
    fetchWithAuth("/ai", {
      method: "POST",
      body: JSON.stringify({ prompt }),
    }),

  getHistory: async () => {
    const res = await fetchWithAuth("/ai/history");
    return res;
  },
};


export const dashboardApi = {
  get: async (workspaceId?: string): Promise<DashboardData> => {
    const url = workspaceId ? `/dashboard?workspaceId=${workspaceId}` : "/dashboard"
    return fetchWithAuth(url)
  },
}