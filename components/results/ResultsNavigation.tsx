"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, ClipboardList, Award } from "lucide-react"

export default function ResultsNavigation() {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
    { id: "assessments", label: "My Assessments", icon: ClipboardList, href: "/dashboard?view=assessments" },
    { id: "results", label: "Test Results", icon: Award, href: "/test-results" },
  ]

  const isActive = (href: string) => {
    if (href === "/test-results") return pathname.startsWith("/test-results")
    if (href.includes("view=assessments")) return pathname.startsWith("/dashboard")
    return pathname === href
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border border-border rounded-xl bg-card/60 backdrop-blur-sm">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={isActive(item.href) ? "default" : "ghost"}
          size="sm"
          className="gap-2 rounded-lg"
          onClick={() => router.push(item.href)}
        >
          <item.icon className="w-4 h-4" />
          {item.label}
        </Button>
      ))}
    </div>
  )
}
