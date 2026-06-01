"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import AssessmentCard from "@/components/results/AssessmentCard"
import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"
import {
  fetchPatientAssessments,
  getAssessmentProgress,
  isPendingAssessment,
  resolveTestIdForAssessment,
  type PatientAssessment,
} from "@/lib/patient-assessments"

interface AssignedTestsViewProps {
  patientId?: string
}

export default function AssignedTestsView({ patientId }: AssignedTestsViewProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<PatientAssessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [resolvedPatientId, setResolvedPatientId] = useState<string | undefined>(patientId)

  useEffect(() => {
    if (patientId) {
      setResolvedPatientId(patientId)
      return
    }

    try {
      const storedUser = localStorage.getItem("user")
      if (!storedUser) return
      const normalized = normalizeDashboardUser(JSON.parse(storedUser))
      if (!normalized || !isIndividualDashboardUser(normalized)) return
      setResolvedPatientId(normalized.patient_id)
    } catch {
      // keep undefined and show empty state
    }
  }, [patientId])

  useEffect(() => {
    const loadTests = async () => {
      if (!resolvedPatientId) {
        setAssessments([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const data = await fetchPatientAssessments(resolvedPatientId)
        setAssessments(data)
      } catch (error) {
        console.error("[v0] Error fetching assigned tests:", error)
        setAssessments([])
      } finally {
        setIsLoading(false)
      }
    }
    loadTests()
  }, [resolvedPatientId])

  const pendingCount = assessments.filter(isPendingAssessment).length

  const handleContinue = (assessment: PatientAssessment) => {
    const testId = resolveTestIdForAssessment(assessment.test)
    if (!testId) {
      alert("Unable to start this assessment. Please complete payment for this test first.")
      return
    }
    router.push(`/assessment/${testId}/${assessment.assessment_id}`)
  }

  if (isLoading) {
    return (
      <Card className="p-8 border border-border">
        <div className="flex items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <p className="text-foreground font-medium">Loading assessments...</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">My Assessments</h2>
        <p className="text-muted-foreground">
          You have {pendingCount} assessment(s) waiting to be completed
        </p>
      </div>

      {assessments.length === 0 ? (
        <Card className="p-12 border border-border text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Assessments Yet</h2>
          <p className="text-muted-foreground mb-6">Complete a payment to access your assigned assessments</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assessments.map((item) => (
            <AssessmentCard
              key={item.assessment_id}
              title={item.test}
              questions={item.total_questions}
              completedQuestions={item.completed_questions}
              status={item.assessment_status}
              progressPercentage={getAssessmentProgress(item)}
              onContinue={() => handleContinue(item)}
              onViewResults={() =>
                router.push(`/dashboard?view=results&assessmentId=${encodeURIComponent(item.assessment_id)}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
