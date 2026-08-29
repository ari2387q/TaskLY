"use client"

import type React from "react"
import { useState } from "react"
import { Sidebar, BurgerButton } from "./sidebar"
import { AuthGuard } from "@/components/auth-guard"
import Link from "next/link"
import { Rocket } from "lucide-react"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Static Sidebar */}
        <aside className={`hidden md:block fixed h-full inset-y-0 z-50 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
          <Sidebar onOpenChange={setIsSidebarOpen} isOpen={isSidebarOpen} isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
        </aside>

        {/* Mobile: Pass open state to sidebar for drawer */}
        <div className="md:hidden">
          <Sidebar onOpenChange={setIsSidebarOpen} isOpen={isSidebarOpen} isCollapsed={false} />
        </div>

        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 border-b border-border bg-background/80 backdrop-blur-md flex items-center px-4 justify-between">
          <BurgerButton onClick={() => setIsSidebarOpen(true)} />
          <Link href="/dashboard" className="flex items-center gap-2 font-extrabold text-lg text-foreground">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Rocket className="h-4 w-4" />
            </div>
            <span>Task<span className="text-primary">LY</span></span>
          </Link>
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 pt-14 md:pt-0 pb-12 md:pb-0 ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}`}>
          <div className="container mx-auto p-4 md:p-8 max-w-6xl animate-fade-in-slide-up">{children}</div>
        </main>
      </div>
    </AuthGuard>
  )
}
