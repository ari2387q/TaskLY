"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { fetchWorkspaces, reset: resetWorkspaces } = useWorkspaceStore()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { user } = await authApi.getProfile()
        setUser(user)
        // Load workspaces once user is confirmed
        await fetchWorkspaces()
      } catch {
        localStorage.removeItem("token")
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { user } = await authApi.login(email, password)
    setUser(user)
    await fetchWorkspaces()
    router.push("/dashboard")
  }

  const register = async (email: string, password: string, name?: string) => {
    await authApi.register(email, password, name)
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    resetWorkspaces()
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}