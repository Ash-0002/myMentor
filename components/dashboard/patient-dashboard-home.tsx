"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import StatsCards from "@/components/dashboard/stats-cards"
import AssessmentPremiumCard from "@/components/dashboard/assessment-premium-card"
import ProfileCard from "@/components/dashboard/profile-card"
import type { IndividualDashboardUser } from "@/lib/dashboard-user"
import { computeDashboardStats } from "@/lib/dashboard-utils"
import {
  fetchPatientAssessments,
  resolveTestIdForAssessment,
  type PatientAssessment,
} from "@/lib/patient-assessments"

interface PatientDashboardHomeProps {
  user: IndividualDashboardUser
  onNavigate: (view: string) => void
}

export default function PatientDashboardHome({ user, onNavigate }: PatientDashboardHomeProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<PatientAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchPatientAssessments(user.patient_id)
        setAssessments(data)
      } catch {
        setAssessments([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.patient_id])

  const stats = computeDashboardStats(assessments)

  const handleContinue = (assessment: PatientAssessment) => {
    const testId = assessment.test_id ?? resolveTestIdForAssessment(assessment.test)
    if (!testId) {
      alert("Unable to start this assessment. Please complete payment for this test first.")
      return
    }
    const duration = assessment.test_duration ?? 30
    router.push(`/assessment/${testId}/${assessment.assessment_id}?duration=${duration}`)
  }

  return (
    <div className="space-y-8">
      <StatsCards stats={stats} />

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Purchased Assessments</h2>
            <p className="text-sm text-slate-500">Continue where you left off</p>
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-violet-200 text-violet-700"
            onClick={() => onNavigate("assessments")}
          >
            View all
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/30 p-10 text-center">
            <p className="text-slate-600">No assessments yet. Browse and purchase a test below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assessments.slice(0, 3).map((item) => (
              <AssessmentPremiumCard
                key={item.assessment_id}
                assessment={item}
                onContinue={() => handleContinue(item)}
                onViewResults={() => {
                  router.push(
                    `/dashboard?view=results&assessmentId=${encodeURIComponent(item.assessment_id)}`,
                  )
                }}
              />
            ))}
          </div>
        )}
      </section>

      <ProfileCard user={user} />
    </div>
  )
}
