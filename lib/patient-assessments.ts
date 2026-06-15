import { apiClient } from "@/lib/api-client"

export interface PatientAssessment {
  patient_id: string
  assessment_id: string
  assessment_status: string
  completed_questions: number
  test_id?: number
  test: string
  test_duration?: number
  amount_paid?: number
  total_questions: number
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
  const response = await apiClient.post("/api/patient/assessments", {
    patient_id: patientId,
  })

  const rows = response.data?.data
  if (!Array.isArray(rows)) return []

  return rows.map((row: Record<string, unknown>) => ({
    patient_id: String(row.user_id ?? row.patient_id ?? ""),
    assessment_id: String(row.assessment_id ?? ""),
    assessment_status: String(row.assessment_status ?? ""),
    completed_questions: Number(row.completed_questions ?? 0),
    test_id: row.test_id ? Number(row.test_id) : undefined,
    test: String(row.test_name ?? row.test ?? ""),
    test_duration: row.test_duration ? Number(row.test_duration) : undefined,
    amount_paid: row.amount_paid ? Number(row.amount_paid) : undefined,
    total_questions: Number(row.total_questions ?? 0),
  }))
}
