"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AssignedTestsView from "@/components/assigned-tests-view"

export default function AssessmentsPage() {
  const router = useRouter()

  useEffect(() => {
    const paymentStatus = localStorage.getItem("paymentStatus")
    console.log("[v0] Assessments page loaded, payment status:", paymentStatus)
  }, [])

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <AssignedTestsView />
      </div>
    </main>
  )
}
