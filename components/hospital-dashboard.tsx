"use client"

import { useState, useEffect } from "react"
import { LogOut, Home, Users, Calendar, Menu, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import PatientInfo from "./patient-info"
import TestResultsView from "./test-results-view"
import PatientPortalShell from "@/components/dashboard/patient-portal-shell"
import PatientDashboardHome from "@/components/dashboard/patient-dashboard-home"
import PatientAssessmentsPage from "@/components/dashboard/patient-assessments-page"
import PatientBillingView from "@/components/dashboard/patient-billing-view"
import ProfileCard from "@/components/dashboard/profile-card"
import { Card } from "@/components/ui/card"
import {
  DashboardUser,
  DashboardUserType,
  getDashboardUserType,
  isAdminDashboardUser,
  isIndividualDashboardUser,
  normalizeDashboardUser,
} from "@/lib/dashboard-user"

function AdminDashboard({
  user,
  activeNav,
  onNavigate,
  navItems,
  sidebarOpen,
  setSidebarOpen,
  isMobile,
  onLogout,
}: {
  user: DashboardUser
  activeNav: string
  onNavigate: (nav: string) => void
  navItems: { icon: typeof Home; label: string; id: string }[]
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  isMobile: boolean
  onLogout: () => void
}) {
  const headerTitle =
    isAdminDashboardUser(user) ? user.hospital_name : "MyMentor Dashboard"
  const headerId = isAdminDashboardUser(user) ? user.hospital_id : "-"

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside
        className={`fixed md:relative left-0 top-0 z-40 h-screen ${
          sidebarOpen ? "w-64" : "-translate-x-full md:translate-x-0"
        } md:w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-all`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border p-6">
            <div className="flex h-12 items-center justify-center rounded-lg bg-sidebar-primary">
              <span className="text-2xl font-bold text-sidebar-primary-foreground">+</span>
            </div>
            <p className="mt-3 text-center text-sm font-semibold text-sidebar-primary">MediCare</p>
          </div>
          <nav className="flex-1 space-y-2 px-3 py-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  if (isMobile) setSidebarOpen(false)
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  activeNav === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="border-t border-sidebar-border p-3">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground hover:bg-sidebar-accent/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-4 shadow-sm md:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-2 hover:bg-muted md:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-2xl font-bold">{headerTitle}</h1>
              <p className="text-sm text-muted-foreground">Hospital Admin Dashboard · {headerId}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeNav === "dashboard" && <PatientInfo user={user} userType="admin" />}
          {activeNav === "patients" && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Patients — Coming Soon</p>
            </Card>
          )}
          {activeNav === "appointments" && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Appointments — Coming Soon</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

export default function HospitalDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeNav, setActiveNav] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [userType, setUserType] = useState<DashboardUserType | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const view = searchParams.get("view")
    if (view) setActiveNav(view)
  }, [searchParams])

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }
    try {
      const normalized = normalizeDashboardUser(JSON.parse(storedUser))
      if (!normalized) {
        router.push("/login")
        return
      }
      setUser(normalized)
      setUserType(getDashboardUserType(normalized))
    } catch {
      router.push("/login")
    }
  }, [router])

  const handleNavigation = (nav: string) => {
    setActiveNav(nav)
    router.push(`/dashboard?view=${nav}`, { scroll: false })
  }

  const handleLogout = () => {
    localStorage.clear()
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Strict"
    document.cookie = "session=; path=/; max-age=0; SameSite=Strict"
    router.push("/login")
  }

  if (!user || !userType) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />
      </div>
    )
  }

  if (userType === "admin") {
    const navItems = [
      { icon: Home, label: "Dashboard", id: "dashboard" },
      { icon: Users, label: "Patients", id: "patients" },
      { icon: Calendar, label: "Appointments", id: "appointments" },
    ]
    return (
      <AdminDashboard
        user={user}
        activeNav={activeNav}
        onNavigate={handleNavigation}
        navItems={navItems}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        isMobile={isMobile}
        onLogout={handleLogout}
      />
    )
  }

  if (!isIndividualDashboardUser(user)) return null

  const patient = user

  return (
    <PatientPortalShell user={patient} activeNav={activeNav} onNavigate={handleNavigation}>
      {activeNav === "dashboard" && (
        <PatientDashboardHome user={patient} onNavigate={handleNavigation} />
      )}
      {activeNav === "assessments" && (
        <PatientAssessmentsPage
          user={patient}
          onViewResults={(id) =>
            router.push(`/dashboard?view=results&assessmentId=${encodeURIComponent(id)}`)
          }
        />
      )}
      {activeNav === "billing" && <PatientBillingView />}
      {activeNav === "results" && <TestResultsView />}
      {activeNav === "profile" && (
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Profile Settings</h2>
          <ProfileCard user={patient} />
        </div>
      )}
    </PatientPortalShell>
  )
}
