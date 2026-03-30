"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"
import axios from "axios"
import AssessmentCard from "@/components/results/AssessmentCard"
import { isIndividualDashboardUser, normalizeDashboardUser } from "@/lib/dashboard-user"

interface Assessment {
  patient_id: string
  assessment_id: string
  assessment_status: string
  test_name: string
  test_duration: number
  amount_paid: number
  total_questions: number
  test_id: number
}

interface AssessmentItem {
  assessment_id: string
  test_name: string
  amount_paid: number
  test_duration: number
  total_questions: number
  status: string
  progressPercentage: number
  test_id: number
}

const fetchAssignedTests = async (patientId: string): Promise<AssessmentItem[]> => {
  try {
    const response = await axios.get<{ message: string; data: Assessment[] }>(
      `/api/external/patient/assessments?patient_id=${encodeURIComponent(patientId)}`,
    )

    if (response.data?.data && Array.isArray(response.data.data)) {
      return response.data.data.map((assessment) => {
        const normalizedStatus = (assessment.assessment_status || "").toLowerCase()
        return {
          assessment_id: assessment.assessment_id,
          test_name: assessment.test_name,
          amount_paid: assessment.amount_paid,
          test_duration: assessment.test_duration,
          total_questions: assessment.total_questions,
          status: assessment.assessment_status,
          progressPercentage: normalizedStatus === "completed" ? 100 : 0,
          test_id: assessment.test_id,
        }
      })
    }
    return []
  } catch (error) {
    console.error("[v0] Error fetching assigned tests:", error)
    return []
  }
}

interface AssignedTestsViewProps {
  onStartAssessment?: () => void
  patientId?: string
}

export default function AssignedTestsView({ patientId }: AssignedTestsViewProps) {
  const router = useRouter()
  const [assessments, setAssessments] = useState<AssessmentItem[]>([])
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
      const tests = await fetchAssignedTests(resolvedPatientId)
      setAssessments(tests)
      setIsLoading(false)
    }
    loadTests()
  }, [resolvedPatientId])

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
        <h2 className="tenxt-2xl md:text-3xl font-bold text-foreground mb-2">My Assessments</h2>
        <p className="text-muted-foreground">
          You have{" "}
          {assessments.filter((t) => {
            const status = (t.status || "").toLowerCase()
            return status === "pending" || status === "in progress"
          }).length}{" "}
          assessment(s) waiting to be completed
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
              assessmentId={item.assessment_id}
              title={item.test_name}
              questions={item.total_questions}
              duration={item.test_duration}
              amountPaid={item.amount_paid}
              status={item.status}
              progressPercentage={item.progressPercentage}
              onContinue={() => router.push(`/assessment/${item.test_id}/${item.assessment_id}`)}
              onViewResults={() => router.push(`/dashboard?view=results&assessmentId=${encodeURIComponent(item.assessment_id)}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
