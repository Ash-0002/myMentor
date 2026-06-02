"use client"

import { useState, useEffect, ReactNode } from "react"
import {
  Bell,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react"
import { useRouter } from "next/navigation"
import type { IndividualDashboardUser } from "@/lib/dashboard-user"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "assessments", label: "My Assessments", icon: ClipboardList },
  { id: "results", label: "Test Results", icon: FileText },
  { id: "profile", label: "Profile Settings", icon: Settings },
]

interface PatientPortalShellProps {
  user: IndividualDashboardUser
  activeNav: string
  onNavigate: (id: string) => void
  children: ReactNode
}

export default function PatientPortalShell({
  user,
  activeNav,
  onNavigate,
  children,
}: PatientPortalShellProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleNav = (id: string) => {
    onNavigate(id)
    if (isMobile) setSidebarOpen(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict"
    document.cookie = "session=; path=/; max-age=0; SameSite=Strict"
    router.push("/login")
  }

  const firstName = user.first_name || "Patient"
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-fuchsia-50/20">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed md:sticky top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800/50 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-200 shadow-2xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="border-b border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white shadow-lg shadow-violet-500/40">
              +
            </div>
            <div>
              <p className="font-bold text-white">MyMentor</p>
              <p className="text-[10px] text-slate-400">Patient Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = activeNav === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 px-4 py-4 shadow-sm backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-900 md:text-2xl">
                  Welcome back, {firstName} 👋
                </h1>
                <p className="text-xs text-slate-500 md:text-sm">Track your assessments and health insights</p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 md:gap-4">
              <span className="hidden rounded-lg border border-violet-200 bg-violet-50 px-2 py-1 font-mono text-xs font-semibold text-violet-700 sm:inline">
                {user.patient_id}
              </span>
              <button
                type="button"
                className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
              </button>
              <div className="hidden text-right sm:block">
                <p className="text-xs font-medium text-slate-500">{user.role_name || "Individual Patient"}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-md">
                {firstName[0]?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
