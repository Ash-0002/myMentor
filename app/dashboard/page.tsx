"use client"

import { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import HospitalDashboard from "@/components/hospital-dashboard"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("isLoggedIn")
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading dashboard...</div>}>
        <HospitalDashboard />
      </Suspense>
    </main>
  )
}
