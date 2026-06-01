import { apiClient } from "@/lib/api-client"

/** Shape returned in `data[]` from GET /api/user/details */
export interface PatientAssessment {
  user_id: string
  name: string
  assessment_id: string
  assessment_status: string
  completed_questions: number
  email: string
  test: string
  total_questions: number
  username: string
}

export function getAssessmentProgress(assessment: PatientAssessment): number {
  const total = assessment.total_questions || 0
  if (total === 0) return 0
  return Math.min(100, Math.round((assessment.completed_questions / total) * 100))
}

export function isCompletedAssessment(assessment: PatientAssessment): boolean {
  return assessment.assessment_status.toLowerCase() === "completed"
}

export function isPendingAssessment(assessment: PatientAssessment): boolean {
  const status = assessment.assessment_status.toLowerCase()
  return status === "pending" || status === "in progress" || status === "in_progress"
}

/** Match test name from user/details to id stored at payment (paidTests in localStorage). */
export function resolveTestIdForAssessment(testName: string): number | null {
  if (typeof window === "undefined") return null

  try {
    const raw = localStorage.getItem("paidTests")
    if (!raw) return null

    const tests = JSON.parse(raw) as Array<{
      id: number
      evaluation_fullname?: string
      evaluation_name?: string
    }>

    const normalized = testName.trim().toLowerCase()
    const match = tests.find((t) => {
      const full = (t.evaluation_fullname || "").trim().toLowerCase()
      const name = (t.evaluation_name || "").trim().toLowerCase()
      return full === normalized || name === normalized
    })

    return match?.id ?? null
  } catch {
    return null
  }
}

export async function fetchPatientAssessments(patientId: string): Promise<PatientAssessment[]> {
  const response = await apiClient.post("/api/user/details", {
    patient_id: patientId,
  })

  const data = response.data?.data
  return Array.isArray(data) ? (data as PatientAssessment[]) : []
}
