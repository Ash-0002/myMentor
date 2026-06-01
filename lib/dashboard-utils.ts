import {
  getAssessmentProgress,
  isCompletedAssessment,
  isPendingAssessment,
  type PatientAssessment,
} from "@/lib/patient-assessments"

export type DisplayAssessmentStatus = "Not Started" | "In Progress" | "Completed"

export interface DashboardStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  wellnessScore: number
}

export function getDisplayStatus(assessment: PatientAssessment): DisplayAssessmentStatus {
  if (isCompletedAssessment(assessment)) return "Completed"
  const progress = getAssessmentProgress(assessment)
  if (progress > 0) return "In Progress"
  return "Not Started"
}

export function inferCategory(testName: string): string {
  const name = testName.toLowerCase()
  if (name.includes("autism") || name.includes("mental") || name.includes("depression") || name.includes("anxiety")) {
    return "Mental Health"
  }
  if (name.includes("diabetes") || name.includes("cardio") || name.includes("heart")) {
    return "General Health"
  }
  return "Health Assessment"
}

export function computeDashboardStats(assessments: PatientAssessment[]): DashboardStats {
  const total = assessments.length
  const completed = assessments.filter(isCompletedAssessment).length
  const pending = assessments.filter(
    (a) => isPendingAssessment(a) && getAssessmentProgress(a) === 0,
  ).length
  const inProgress = assessments.filter(
    (a) => !isCompletedAssessment(a) && getAssessmentProgress(a) > 0,
  ).length

  const wellnessScore =
    total === 0
      ? 0
      : Math.round(
          assessments.reduce((sum, a) => sum + getAssessmentProgress(a), 0) / total,
        )

  return { total, completed, pending, inProgress, wellnessScore }
}

export function formatDisplayDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function getPaymentDates(): { purchased: string; expiry: string } {
  const paymentDate = typeof window !== "undefined" ? localStorage.getItem("paymentDate") : null
  const base = paymentDate ? new Date(paymentDate) : new Date()
  const expiry = new Date(base)
  expiry.setDate(expiry.getDate() + 30)
  return {
    purchased: formatDisplayDate(base.toISOString()),
    expiry: formatDisplayDate(expiry.toISOString()),
  }
}

export function estimateDurationMinutes(totalQuestions: number): number {
  return Math.max(10, Math.round(totalQuestions * 0.75))
}
