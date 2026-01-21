"use client"

import { useState, useEffect } from "react"
import { LogOut, Home, Users, Calendar, Menu, X, ClipboardList, Award, Pill } from "lucide-react"
import { useRouter } from "next/navigation"
import PatientInfo from "./patient-info"
import TestSelection from "./test-selection"
import ThemeSelector from "./theme-selector"
import AssignedTestsView from "./assigned-tests-view"
import TestResultsView from "./test-results-view"
import { Card } from "@/components/ui/card"

export default function HospitalDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedTests, setSelectedTests] = useState<any[]>([])
  const [activeNav, setActiveNav] = useState("dashboard")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handleNavigation = (nav: string) => {
    setActiveNav(nav)
    if (isMobile) setSidebarOpen(false)
  }

  // const navigateToTestSelection = () => {
  //   router.push("/test-selection")
  // }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="flex h-screen bg-background">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={closeSidebar} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen z-40 ${
          sidebarOpen ? "w-64" : "-translate-x-full md:translate-x-0"
        } md:w-64 bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border shadow-lg`}
      >
        <div className="h-full flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-center h-12 bg-sidebar-primary rounded-lg">
              <span className="text-2xl font-bold text-sidebar-primary-foreground">+</span>
            </div>
            <p className="text-sm font-semibold text-sidebar-primary mt-3 text-center">MediCare</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-2">
            {[
              { icon: Home, label: "Dashboard", id: "dashboard" },
              // { icon: Pill, label: "Select Tests", id: "test-selection", onClick: navigateToTestSelection },
              { icon: Users, label: "Patients", id: "patients" },
              { icon: Calendar, label: "Appointments", id: "appointments" },
              { icon: ClipboardList, label: "My Assessments", id: "assessments" },
              { icon: Award, label: "Test Results", id: "results" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                 {
                    handleNavigation(item.id)
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-sidebar-border">
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors">
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Header */}
        <header className="sticky top-0 bg-card border-b border-border px-4 md:px-6 py-4 md:py-6 shadow-sm z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">MediCare Hospital</h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">H</span>
                    </div>
                    <span className="text-sm font-bold text-primary font-mono">H001</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">Patient Test Management System</p>
              </div>
            </div>
            {/* <div className="flex items-center gap-4 flex-shrink-0">
              <ThemeSelector />
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">10:30 AM</p>
                <p className="text-sm text-muted-foreground">19/08/2023</p>
              </div>
            </div> */}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {activeNav === "dashboard" && (
            <div className="space-y-6">
              <PatientInfo />
              <TestSelection onTestsChange={setSelectedTests} />
            </div>
          )}

          {activeNav === "assessments" && <AssignedTestsView onStartAssessment={() => handleNavigation("dashboard")} />}

          {activeNav === "results" && <TestResultsView />}

          {activeNav === "patients" && (
            <Card className="p-8 border border-border text-center">
              <p className="text-muted-foreground">Patients Content - Coming Soon</p>
            </Card>
          )}

          {activeNav === "appointments" && (
            <Card className="p-8 border border-border text-center">
              <p className="text-muted-foreground">Appointments Content - Coming Soon</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
