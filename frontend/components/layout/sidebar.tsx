"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Rocket, ClipboardList, BarChart3, LogOut,
  Sun, Moon, Menu, X, Layers, ChevronDown, Plus, Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useWorkspaceStore } from "@/lib/stores/workspace-store"
import { motion, AnimatePresence } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Workspaces", href: "/workspaces", icon: Layers },
  { name: "Skills", href: "/skills", icon: Rocket },
  { name: "Logs", href: "/logs", icon: ClipboardList },
  { name: "AI Model", href: "/ai", icon: BarChart3 },
]

interface SidebarProps {
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

function WorkspaceDropdown({ isCollapsed }: { isCollapsed?: boolean }) {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaceStore()
  const [open, setOpen] = useState(false)

  if (isCollapsed) {
    return (
      <div className="flex justify-center px-2 py-3 border-b border-sidebar-border">
        <div
          className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center cursor-pointer"
          title={activeWorkspace?.name ?? "No workspace"}
          onClick={() => setOpen(!open)}
        >
          <span className="text-xs font-black text-primary">
            {activeWorkspace?.name?.[0]?.toUpperCase() ?? "?"}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="relative px-3 py-3 border-b border-sidebar-border">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-sidebar-accent/60 hover:bg-sidebar-accent border border-sidebar-border hover:border-primary/30 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-primary">
              {activeWorkspace?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <span className="text-sm font-semibold text-foreground truncate">
            {activeWorkspace?.name ?? "Select workspace"}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl border border-sidebar-border bg-card shadow-xl shadow-black/20 overflow-hidden"
          >
            <div className="max-h-52 overflow-y-auto">
              {workspaces.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground text-center">No workspaces yet</p>
              ) : (
                workspaces.map((ws) => (
                  <button
                    key={ws._id}
                    onClick={() => { setActiveWorkspace(ws); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-sidebar-accent transition-colors"
                  >
                    <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-black text-primary">
                        {ws.name[0].toUpperCase()}
                      </span>
                    </div>
                    <span className="flex-1 font-medium truncate">{ws.name}</span>
                    {activeWorkspace?._id === ws._id && (
                      <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
            <div className="border-t border-sidebar-border">
              <Link
                href="/workspaces"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New workspace</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavContent({ onClose, isCollapsed, onToggleCollapse }: {
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="flex h-full flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-hidden">
      {/* Logo */}
      <div className={`flex h-16 items-center ${isCollapsed ? "justify-center" : "justify-between px-6"} border-b border-sidebar-border shrink-0`}>
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md hover:scale-105 transition-transform"
            title="Expand Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 font-extrabold text-xl text-foreground hover:scale-105 transition-transform duration-200"
              onClick={onClose}
            >
              <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <Rocket className="h-5 w-5 animate-pulse" />
              </div>
              <span className="tracking-tight">
                Skill<span className="text-primary">Tracker</span>
              </span>
            </Link>
            <button
              onClick={onToggleCollapse}
              className="hidden md:block p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Collapse Sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            {onClose && (
              <button
                className="md:hidden p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                onClick={onClose}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Workspace Switcher */}
      <WorkspaceDropdown isCollapsed={isCollapsed} />

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 py-3 text-sm font-semibold rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                isCollapsed ? "justify-center px-0 mx-2" : "px-5",
                isActive
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/10 border-b border-white/10"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300", isActive ? "scale-110" : "")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Theme Toggler */}
      <div className={`px-4 py-4 border-t border-sidebar-border flex items-center ${isCollapsed ? "justify-center" : "justify-between px-6"}`}>
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {mounted && theme === "dark" ? "Dark Mode" : "Light Mode"}
          </span>
        )}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-full h-9 w-9 bg-muted hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-all duration-300 active:scale-90"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: "6s" }} />
            ) : (
              <Moon className="h-4 w-4 text-secondary" />
            )}
          </Button>
        )}
      </div>

      {/* User Info + Logout */}
      <div className={`p-4 border-t border-sidebar-border ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {!isCollapsed && (
          <div className="mb-4 px-3 overflow-hidden">
            <p className="text-sm font-bold text-foreground truncate">{user?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            "transition-all duration-300 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-full shrink-0",
            isCollapsed ? "p-2 h-10 w-10 justify-center" : "w-full justify-start gap-4 px-5 py-3 text-sm font-semibold"
          )}
          onClick={logout}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen = false, onOpenChange, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const close = () => onOpenChange?.(false)

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex h-full flex-col">
        <NavContent isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />
      </div>

      {/* Mobile: Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={close} />
      )}

      {/* Mobile: Slide-in Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent onClose={close} isCollapsed={false} />
      </div>
    </>
  )
}

export function BurgerButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground text-foreground transition-all duration-200 active:scale-90"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
