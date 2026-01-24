"use client"
import { Suspense } from "react"
import HospitalDashboard from "@/components/hospital-dashboard"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <HospitalDashboard />
      </Suspense>
    </main>
  )
}
